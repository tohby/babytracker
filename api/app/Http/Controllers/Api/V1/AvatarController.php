<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UploadAvatarRequest;
use App\Http\Resources\Api\V1\UserResource;
use GdImage;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Profile photo. Without one, the app shows the initials chip.
 *
 * Uploads are re-drawn as a 512 px square JPEG. Re-drawing drops the photo's hidden metadata
 * (EXIF: GPS location, camera, time) and anything that isn't really an image. Files sit on the
 * private disk and are reached through short-lived signed links (`avatar_url`).
 */
class AvatarController extends Controller
{
    public function store(UploadAvatarRequest $request): UserResource
    {
        $user = $request->user();
        $jpeg = self::normalise($request->file('avatar'));

        // New file name each time, so the app's image cache never shows the old photo.
        $path = 'avatars/'.$user->id.'/'.Str::ulid().'.jpg';
        Storage::disk('local')->put($path, $jpeg);

        $old = $user->avatar_path;
        $user->forceFill(['avatar_path' => $path])->save();
        if ($old) {
            Storage::disk('local')->delete($old);
        }

        return new UserResource($user->load('onboardingProgress'));
    }

    public function destroy(Request $request): UserResource
    {
        $user = $request->user();
        if ($user->avatar_path) {
            Storage::disk('local')->delete($user->avatar_path);
            $user->forceFill(['avatar_path' => null])->save();
        }

        return new UserResource($user->load('onboardingProgress'));
    }

    private static function normalise(UploadedFile $file): string
    {
        $source = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));
        if (! $source instanceof GdImage) {
            throw new ApiException('invalid_image', 422);
        }

        $source = self::applyExifOrientation($source, $file);

        $width = imagesx($source);
        $height = imagesy($source);
        $side = min($width, $height);
        $size = max(1, min((int) config('nappa.avatar.size'), $side));

        $square = imagecreatetruecolor($size, $size);
        imagefill($square, 0, 0, (int) imagecolorallocate($square, 255, 255, 255)); // PNG transparency → white
        imagecopyresampled(
            $square, $source,
            0, 0, intdiv($width - $side, 2), intdiv($height - $side, 2),
            $size, $size, $side, $side,
        );

        ob_start();
        imagejpeg($square, null, 85);

        return (string) ob_get_clean();
    }

    /** Phones store "rotate me" in EXIF instead of rotating pixels; apply it before EXIF is dropped. */
    private static function applyExifOrientation(GdImage $image, UploadedFile $file): GdImage
    {
        if ($file->getMimeType() !== 'image/jpeg' || ! function_exists('exif_read_data')) {
            return $image;
        }

        $exif = @exif_read_data($file->getRealPath());
        $orientation = is_array($exif) ? (int) ($exif['Orientation'] ?? 1) : 1;

        $rotated = match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => $image,
        };

        return $rotated instanceof GdImage ? $rotated : $image;
    }
}
