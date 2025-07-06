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
        Schema::create('citernes', function (Blueprint $table) {
            $table->id();
            $table->string("name")->unique();
            $table->string("type");
            $table->string("product_type");
            $table->decimal("capacity_liter")->nullable();
            $table->decimal("capacity_kg")->nullable();
            $table->unsignedBigInteger("current_product_id")->nullable();
            $table->foreign("current_product_id")->on("articles")->references("id");
            $table->unsignedBigInteger("agency_id")->nullable();
            $table->foreign("agency_id")->on("agencies")->references("id");
            $table->boolean("archived")->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citernes');
    }
};
