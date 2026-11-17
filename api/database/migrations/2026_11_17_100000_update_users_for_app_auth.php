<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * App sign-up no longer asks for a name up front (onboarding asks "what should I call you?", optional),
     * and Apple/Google-only accounts (later) will have no password.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->string('password')->nullable()->change();
            // Proof of the health-data consent given at sign-up (GDPR/UK GDPR special category data).
            $table->timestamp('health_consent_at')->nullable()->after('locale');
            $table->string('privacy_policy_version', 20)->nullable()->after('health_consent_at');
            // Path on the private disk; null means the app shows the initials chip.
            $table->string('avatar_path')->nullable()->after('privacy_policy_version');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['health_consent_at', 'privacy_policy_version', 'avatar_path']);
        });
    }
};
