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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("category_id");
            $table->foreign("category_id")->on("productcategories")->references("id")->onDelete("cascade");
            $table->string("designation");
            $table->string("sku");
            $table->string("barcode")->nullable();
            $table->string("image_url")->nullable();
            $table->string("prix_achat")->nullable();
            $table->string("prix_vente");
            $table->float("tva");
            $table->string("unit");
            $table->bigInteger("stock_alert");
            $table->float("value_per_unit");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
