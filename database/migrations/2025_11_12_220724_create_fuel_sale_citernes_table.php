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
        Schema::create('fuel_sale_citernes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("fuel_sale_id");
            $table->foreign("fuel_sale_id")->on("fuel_sales")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("citerne_id");
            $table->foreign("citerne_id")->on("citernes")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuel_sale_citernes');
    }
};
