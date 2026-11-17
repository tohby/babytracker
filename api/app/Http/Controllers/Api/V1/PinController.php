<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\SetPinRequest;
use App\Models\Device;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

/**
 * A 6-digit PIN for faster sign-in on this phone, set up from Settings.
 *
 * The PIN belongs to the phone, not the account (like a SIM PIN): it only works together with the
 * device secret stored on that phone, so knowing someone's PIN is useless from another phone.
 * Five wrong PINs turn it off and the password is needed again.
 */
class PinController extends Controller
{
    public function store(SetPinRequest $request): JsonResponse
    {
        $device = $this->requireDevice($request);
        $this->confirmPassword($request);

        $device->forceFill(['pin_hash' => Hash::make($request->string('pin')), 'pin_failed_attempts' => 0])->save();

        return response()->json(['device' => ['id' => $device->id, 'pin_enabled' => true]]);
    }

    public function destroy(Request $request): Response
    {
        $this->requireDevice($request)->forceFill(['pin_hash' => null, 'pin_failed_attempts' => 0])->save();

        return response()->noContent();
    }

    private function requireDevice(Request $request): Device
    {
        // Tokens from before remembered devices existed have no device to hold a PIN.
        return $this->currentDevice($request) ?? throw new ApiException('device_required', 409);
    }
}
