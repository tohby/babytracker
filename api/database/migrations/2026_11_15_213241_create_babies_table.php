<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('babies', function (Blueprint $table) {
            // ULIDs, not auto-increment: ids are safe to expose and can be created offline later.
            $table->ulid('id')->primary();
            $table->string('name', 100);
            $table->date('birth_date');
            // IANA zone (e.g. "Europe/London"). Days, naps and predictions are computed in the baby's zone.
            $table->string('timezone', 64);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('babies');
    }
};
