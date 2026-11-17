<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Onboarding answers that features use: feeding method (at-a-glance, feed reminders) and usual
     * wake time (seeds the first nap prediction). Both optional.
     */
    public function up(): void
    {
        Schema::table('babies', function (Blueprint $table) {
            $table->string('feeding_method', 20)->nullable()->after('timezone'); // breast_milk | formula | combination | solids (Figma 02 Baby basics)
            $table->time('usual_wake_time')->nullable()->after('feeding_method'); // local time in the baby's zone
        });
    }

    public function down(): void
    {
        Schema::table('babies', function (Blueprint $table) {
            $table->dropColumn(['feeding_method', 'usual_wake_time']);
        });
    }
};
