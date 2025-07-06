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
        Schema::create('entreprises', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->string("logo_path")->nullable();
            $table->string("tax_number")->nullable();
            $table->string("phone_number")->nullable();
            $table->string("email_address")->nullable();
            $table->string("address")->nullable();
            $table->boolean("archived")->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entreprises');
    }
};
