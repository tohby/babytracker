<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('babies', function (Blueprint $table) {
            $table->unsignedBigInteger('event_change_number')->default(0);
        });

        Schema::create('baby_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUlid('baby_id')->constrained('babies');
            $table->string('type', 32);
            $table->dateTime('occurred_at', 6);
            $table->dateTime('ended_at', 6)->nullable();
            $table->json('payload');
            $table->text('note')->nullable();
            $table->dateTime('deleted_at', 6)->nullable();
            $table->unsignedBigInteger('change_number');
            $table->foreignId('logged_by')->constrained('users');
            $table->timestamps(6);
            $table->unique(['baby_id', 'change_number']);
        });

        Schema::create('baby_event_mutations', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('baby_id')->constrained('babies');
            $table->uuid('mutation_id');
            $table->uuid('event_id');
            $table->json('response');
            $table->timestamp('created_at');
            $table->unique(['baby_id', 'mutation_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('baby_event_mutations');
        Schema::dropIfExists('baby_events');
        Schema::table('babies', function (Blueprint $table) {
            $table->dropColumn('event_change_number');
        });
    }
};
