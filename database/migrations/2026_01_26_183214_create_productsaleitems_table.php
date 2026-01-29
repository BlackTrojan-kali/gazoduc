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
        Schema::create('productsaleitems', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("product_id");
            $table->foreign("product_id")->on("products")->references("id")->onDelete("cascade"); 
            $table->unsignedBigInteger("sale_id");
            $table->foreign("sale_id")->on("productsales")->references("id")->onDelete("cascade");
            $table->float("qty");
            $table->float("unit_price");
            $table->integer("discount");
            $table->float("sub_total");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productsaleitems');
    }
};
