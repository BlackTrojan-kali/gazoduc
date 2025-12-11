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
        Schema::table('fuel_sales', function (Blueprint $table) {
            //
            
            $table->unsignedBigInteger("pompe_id");
            $table->foreign("pompe_id")->on("pompes")->references("id")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fuel_sales', function (Blueprint $table) {
            //
        });
    }
};
