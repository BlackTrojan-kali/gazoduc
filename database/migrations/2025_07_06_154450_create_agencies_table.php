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
        Schema::create('agencies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("entreprise_id");
            $table->unsignedBigInteger("licence_id");
            $table->unsignedBigInteger("region_id");
            $table->unsignedBigInteger("city_id");
            $table->string("name")->unique();
            $table->string("address")->nullable();
            $table->boolean("archived")->default(false);
            $table->foreign("entreprise_id")->on("entreprises")->references("id")->onDelete("cascade");
            $table->foreign("licence_id")->on("licences")->references("id")->onDelete("cascade");
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
        Schema::dropIfExists('agencies');
    }
};
