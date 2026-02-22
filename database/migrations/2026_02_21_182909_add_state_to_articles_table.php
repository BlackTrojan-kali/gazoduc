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
        Schema::table('articles', function (Blueprint $table) {
            //
            $table->string("state")->nullable();
            $table->string("batch_number")->nullable();
            $table->unsignedBigInteger("product_inside_id")->nullable();
            $table->date("last_maintenance")->nullable();
            $table->date("estimated_maintenance_date")->nullable();
            $table->foreign("product_inside_id")->references("id")->on("articles")->onDelete("cascade");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            //
        });
    }
};
