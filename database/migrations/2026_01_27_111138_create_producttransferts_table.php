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
        Schema::create('producttransferts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("boutique_departure_id");
            $table->foreign("boutique_departure_id")->on("boutiques")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("boutique_arrival_id");
            $table->foreign("boutique_departure_id")->on("boutiques")->references("id")->onDelete("cascade");
            $table->dateTime("departure_date");
            $table->dateTime("arrival_date");
            $table->string("status")->default("pending");// pending, cancelled ,finished 
            $table->unsignedBigInteger("user_emitting_id");
            $table->foreign("user_emitting_id")->on("users")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("user_receiving_id");
            $table->foreign("user_receiving_id")->on("users")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producttransferts');
    }
};
