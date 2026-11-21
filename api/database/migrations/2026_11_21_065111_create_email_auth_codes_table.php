<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_auth_codes', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('email');
            $table->string('intent', 20);
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('locale', 35)->nullable();
            $table->timestamp('consented_at')->nullable();
            $table->char('code_hash', 64);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at')->index();
            $table->timestamps();
            $table->unique(['email', 'intent']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_auth_codes');
    }
};
