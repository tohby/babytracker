<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A sign-up waiting for its 6-digit email code. The account is only created once the code is right,
     * so unverified addresses never become accounts. Rows expire after 15 minutes and are pruned.
     */
    public function up(): void
    {
        Schema::create('pending_registrations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('email')->unique(); // lowercased
            $table->string('password_hash');
            $table->string('locale', 35)->nullable();
            $table->timestamp('consented_at');
            // HMAC-SHA256 of the code, keyed with APP_KEY. The code itself is never stored.
            $table->char('code_hash', 64);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_registrations');
    }
};
