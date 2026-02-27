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
        Schema::create('receipt_lines', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("receipt_id");
            $table->foreign("receipt_id")->references("id")->on("receipts")->onDelete("cascade");
             $table->unsignedBigInteger("product_id");
            $table->foreign("product_id")->on("products")->references("id")->onDelete("cascade");
              $table->float("quantity_accepted")->nullable();
            $table->float("quantity_rejected")->nullable();
            $table->string("service")->default("magasin");
            $table->unsignedBigInteger("boutique_id");
            $table->foreign("boutique_id")->on("boutiques")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipt_lines');
    }
};
