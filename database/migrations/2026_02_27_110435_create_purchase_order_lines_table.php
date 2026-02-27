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
        Schema::create('purchase_order_lines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("purchase_order_id");
           $table->foreign("purchase_order_id")->references("id")->on("purchase_orders");
            $table->unsignedBigInteger("product_id");
            $table->foreign("product_id")->on("products")->references("id")->onDelete("cascade");
            $table->float("quantity_ordered");
            $table->float("quantity_recieved");
            $table->float("unit_price");
            $table->float("subtotal");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_lines');
    }
};
 