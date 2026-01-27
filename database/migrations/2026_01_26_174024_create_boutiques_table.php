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
        Schema::create('boutiques', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("region_id");
            $table->unsignedBigInteger("city_id");
            $table->string("name")->unique();
            $table->string("address")->nullable();
            $table->boolean("archived")->default(false);
            $table->boolean("is_central")->default(false);
            $table->foreign("region_id")->on("regions")->references("id")->onDelete("cascade");
            $table->foreign("city_id")->on("cities")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boutiques');
    }
};
