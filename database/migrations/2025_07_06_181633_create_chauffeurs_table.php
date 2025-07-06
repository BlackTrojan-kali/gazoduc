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
        Schema::create('chauffeurs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id")->unique();
            $table->foreign("user_id")->on("users")->references("id")->onDelete("CASCADE");
            $table->string("licence_number");
            $table->date("licence_expiry")->nullable();
            $table->string("phone_number")->nullable();
            $table->string("address")->nullable();
            $table->boolean("archived");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chauffeurs');
    }
};
