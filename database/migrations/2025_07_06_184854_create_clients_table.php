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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("client_category_id");
            $table->foreign("client_category_id")->on("client_categories")->references("id");
            $table->string("client_type")->nullable();
            $table->string("name");
            $table->string("phone_number")->nullable();
            $table->string("email_address")->nullable();
            $table->string("address")->nullable();
            $table->string("NUI")->unique()->nullable();
            $table->boolean("archived")->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
