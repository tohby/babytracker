<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_auth_codes', function (Blueprint $table) {
            $table->string('scope', 26)->default('');
            $table->unique(['email', 'intent', 'scope']);
            $table->dropUnique(['email', 'intent']);
        });
    }

    public function down(): void
    {
        DB::table('email_auth_codes')->where('scope', '<>', '')->delete();

        Schema::table('email_auth_codes', function (Blueprint $table) {
            $table->unique(['email', 'intent']);
            $table->dropUnique(['email', 'intent', 'scope']);
            $table->dropColumn('scope');
        });
    }
};
