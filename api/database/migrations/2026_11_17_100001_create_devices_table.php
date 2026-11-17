<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A phone the user has signed in on. The phone keeps the id and a random secret in its secure storage,
     * which is what lets it sign back in with only a password (or PIN) and no email.
     */
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // SHA-256 of the device secret. The secret itself is never stored.
            $table->char('secret_hash', 64)->unique();
            $table->string('platform', 10)->nullable(); // ios | android
            // Bcrypt hash of the optional 6-digit PIN set from Settings. Never stored in plain text.
            $table->string('pin_hash')->nullable();
            $table->unsignedTinyInteger('pin_failed_attempts')->default(0);
            $table->timestamp('last_used_at')->nullable()->index();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
