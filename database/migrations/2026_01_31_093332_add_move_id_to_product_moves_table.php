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
        Schema::table('product_moves', function (Blueprint $table) {
            //
                   $table->unsignedBigInteger("move_id")->nullable();
                   $table->foreign("move_id")->on("product_moves")->references("id")->onDelete("cascade");
      
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_moves', function (Blueprint $table) {
            //
        });
    }
};
