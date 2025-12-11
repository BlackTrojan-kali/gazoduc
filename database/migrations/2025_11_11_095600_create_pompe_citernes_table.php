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
        Schema::create('pompe_citernes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("pompe_id");
            $table->unsignedBigInteger("citerne_id");
            $table->foreign("pompe_id")->on("pompes")->references("id")->onDelete("cascade");
            $table->foreign("citerne_id")->on("citernes")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pompe_citernes');
    }
};
