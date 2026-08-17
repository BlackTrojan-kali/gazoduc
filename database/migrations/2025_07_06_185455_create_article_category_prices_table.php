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
        Schema::create('article_category_prices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("article_id");
            $table->unsignedBigInteger("client_category_id");
            $table->unsignedBigInteger("agency_id");
            $table->foreign("agency_id")->on("agencies")->references("id");
            $table->foreign("article_id")->on("articles")->references("id");
            $table->foreign("client_category_id")->on("client_categories")->references("id");
            $table->decimal("price");
            $table->decimal("consigne_price")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_category_prices');
    }
};
