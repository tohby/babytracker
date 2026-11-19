<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Api\ApiException;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\BabyEventResource;
use App\Models\Baby;
use App\Models\BabyEvent;
use App\Rules\EventPayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class BabyEventController extends Controller
{
    public function index(Request $request, Baby $baby): JsonResponse
    {
        Gate::authorize('view', $baby);

        $input = $request->validate([
            'after' => ['sometimes', 'integer', 'min:0'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);
        $after = (int) ($input['after'] ?? 0);
        $limit = (int) ($input['limit'] ?? 100);
        $events = BabyEvent::query()->with('author')->where('baby_id', $baby->id)
            ->where('change_number', '>', $after)
            ->orderBy('change_number')->limit($limit + 1)->get();
        $hasMore = $events->count() > $limit;
        $page = $events->take($limit);

        return response()->json([
            'data' => BabyEventResource::collection($page)->resolve(),
            'next_cursor' => $page->last()?->change_number ?? $after,
            'has_more' => $hasMore,
        ]);
    }

    public function upsert(Request $request, Baby $baby, string $id): JsonResponse
    {
        Gate::authorize('view', $baby);

        $input = $request->validate([
            'mutation_id' => ['required', 'uuid'],
            'type' => ['required', 'string', Rule::in(['feed', 'sleep', 'nappy', 'nursing', 'pumping', 'solids', 'medicine', 'growth', 'bath', 'tummy', 'activity'])],
            'occurred_at' => ['required', 'date'],
            'ended_at' => ['present', 'nullable', 'date', 'after_or_equal:occurred_at'],
            'payload' => ['present', 'array', new EventPayload],
            'note' => ['present', 'nullable', 'string', 'max:10000'],
            'deleted' => ['required', 'boolean'],
        ]);

        $snapshot = DB::transaction(function () use ($baby, $id, $input, $request): array {
            $lockedBaby = Baby::query()->whereKey($baby->id)->lockForUpdate()->firstOrFail();

            $receipt = DB::table('baby_event_mutations')
                ->where('baby_id', $baby->id)->where('mutation_id', $input['mutation_id'])->first();
            if ($receipt !== null) {
                if ($receipt->event_id !== $id) {
                    throw new ApiException('mutation_id_conflict', 409);
                }

                return json_decode($receipt->response, true, flags: JSON_THROW_ON_ERROR);
            }

            $event = BabyEvent::query()->whereKey($id)->first();
            if ($event !== null && $event->baby_id !== $baby->id) {
                throw new ApiException('event_id_conflict', 409);
            }

            $nextNumber = $lockedBaby->event_change_number + 1;
            $lockedBaby->event_change_number = $nextNumber;
            $lockedBaby->save();

            $event ??= new BabyEvent(['id' => $id, 'baby_id' => $baby->id, 'logged_by' => $request->user()->id]);
            $event->fill([
                'type' => $input['type'],
                'occurred_at' => Carbon::parse($input['occurred_at'])->utc(),
                'ended_at' => $input['ended_at'] === null ? null : Carbon::parse($input['ended_at'])->utc(),
                'payload' => (object) $input['payload'],
                'note' => $input['note'],
                'deleted_at' => $input['deleted'] ? now() : null,
                'change_number' => $nextNumber,
            ]);
            $event->save();
            $event->load('author');
            $snapshot = (new BabyEventResource($event))->resolve();

            DB::table('baby_event_mutations')->insert([
                'baby_id' => $baby->id,
                'mutation_id' => $input['mutation_id'],
                'event_id' => $id,
                'response' => json_encode($snapshot, JSON_THROW_ON_ERROR),
                'created_at' => now(),
            ]);

            return $snapshot;
        });

        return response()->json(['data' => $snapshot]);
    }
}
