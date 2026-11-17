<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

/**
 * Phones often save photos unrotated with an EXIF "Orientation" flag instead. These build a real
 * JPEG with that flag, upload it, and check the stored avatar is the right way up.
 *
 * The test image is 200×100: left half red, right half blue. Shown upright with Orientation 6
 * (rotate 90° clockwise) it is 100×200 with red on top. Without the fix, red would be on the left.
 */
function jpegWithOrientation(int $orientation): UploadedFile
{
    $image = imagecreatetruecolor(200, 100);
    imagefilledrectangle($image, 0, 0, 99, 99, (int) imagecolorallocate($image, 255, 0, 0));
    imagefilledrectangle($image, 100, 0, 199, 99, (int) imagecolorallocate($image, 0, 0, 255));
    ob_start();
    imagejpeg($image, null, 95);
    $jpeg = (string) ob_get_clean();

    // Minimal EXIF block (APP1): big-endian TIFF header, one IFD entry: 0x0112 Orientation, SHORT.
    $tiff = 'MM'.pack('n', 42).pack('N', 8)
        .pack('n', 1)
        .pack('n', 0x0112).pack('n', 3).pack('N', 1).pack('n', $orientation).pack('n', 0)
        .pack('N', 0);
    $app1 = "Exif\0\0".$tiff;
    $segment = "\xFF\xE1".pack('n', strlen($app1) + 2).$app1;

    $path = tempnam(sys_get_temp_dir(), 'avatar').'.jpg';
    file_put_contents($path, substr($jpeg, 0, 2).$segment.substr($jpeg, 2)); // right after SOI

    return new UploadedFile($path, 'photo.jpg', 'image/jpeg', null, true);
}

/** @return array{int, int, int} */
function pixel(string $jpeg, int $x, int $y): array
{
    $image = imagecreatefromstring($jpeg);
    $rgb = imagecolorat($image, $x, $y);

    return [($rgb >> 16) & 0xFF, ($rgb >> 8) & 0xFF, $rgb & 0xFF];
}

function isRed(array $rgb): bool
{
    return $rgb[0] > 200 && $rgb[2] < 60;
}

function isBlue(array $rgb): bool
{
    return $rgb[2] > 200 && $rgb[0] < 60;
}

beforeEach(fn () => Storage::fake('local', ['serve' => true]));

test('the test image really carries the EXIF flag', function () {
    expect(exif_read_data(jpegWithOrientation(6)->getRealPath())['Orientation'])->toBe(6);
});

test('a photo flagged "rotate 90° clockwise" is stored upright', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => jpegWithOrientation(6)])->assertOk();

    $stored = Storage::disk('local')->get($user->fresh()->avatar_path);
    expect(isRed(pixel($stored, 50, 10)))->toBeTrue('top should be red')
        ->and(isBlue(pixel($stored, 50, 89)))->toBeTrue('bottom should be blue')
        ->and(exif_read_data('data://image/jpeg;base64,'.base64_encode($stored)))->not->toHaveKey('Orientation');
});

test('a photo flagged "rotate 90° anticlockwise" is stored upright', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => jpegWithOrientation(8)])->assertOk();

    $stored = Storage::disk('local')->get($user->fresh()->avatar_path);
    expect(isBlue(pixel($stored, 50, 10)))->toBeTrue('top should be blue')
        ->and(isRed(pixel($stored, 50, 89)))->toBeTrue('bottom should be red');
});

test('a photo flagged "upside down" is turned the right way', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => jpegWithOrientation(3)])->assertOk();

    // 200×100 rotated 180°: blue on the left, red on the right; the centre square shows both.
    $stored = Storage::disk('local')->get($user->fresh()->avatar_path);
    expect(isBlue(pixel($stored, 10, 50)))->toBeTrue('left should be blue')
        ->and(isRed(pixel($stored, 89, 50)))->toBeTrue('right should be red');
});

test('a photo that is already upright is left alone', function () {
    Sanctum::actingAs($user = User::factory()->create());

    $this->postJson(route('api.v1.me.avatar.store'), ['avatar' => jpegWithOrientation(1)])->assertOk();

    $stored = Storage::disk('local')->get($user->fresh()->avatar_path);
    expect(isRed(pixel($stored, 10, 50)))->toBeTrue('left should be red')
        ->and(isBlue(pixel($stored, 89, 50)))->toBeTrue('right should be blue');
});
