<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreBabyRequest;
use App\Http\Requests\Api\V1\UpdateBabyRequest;
use App\Http\Resources\Api\V1\BabyResource;
use App\Models\Baby;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class BabyController extends Controller
{
    /**
     * Babies the signed-in user can see, oldest link first.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $babies = $request->user()->babies()->orderBy('baby_user.created_at')->get();

        return BabyResource::collection($babies);
    }

    /**
     * Add a baby; the creator becomes its owner.
     */
    public function store(StoreBabyRequest $request): JsonResponse
    {
        $baby = DB::transaction(function () use ($request) {
            $baby = Baby::create($request->validated());
            $baby->users()->attach($request->user(), ['role' => Baby::ROLE_OWNER]);

            return $baby;
        });

        $baby = $request->user()->babies()->whereKey($baby->id)->firstOrFail();

        return (new BabyResource($baby))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, Baby $baby): BabyResource
    {
        Gate::authorize('view', $baby);

        return new BabyResource($request->user()->babies()->whereKey($baby->id)->firstOrFail());
    }

    public function update(UpdateBabyRequest $request, Baby $baby): BabyResource
    {
        Gate::authorize('update', $baby);

        $baby->update($request->validated());

        return new BabyResource($request->user()->babies()->whereKey($baby->id)->firstOrFail());
    }

    /**
     * Soft delete, so a mistaken tap can be undone later.
     */
    public function destroy(Baby $baby): Response
    {
        Gate::authorize('delete', $baby);

        $baby->delete();

        return response()->noContent();
    }
}
