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
        Schema::create('facture_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("facture_id");
            $table->foreign("facture_id")->on("factures")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("article_id");
            $table->foreign("article_id")->on("articles")->references("id")->onDelete("cascade");
            $table->decimal("quantity",14,2);
            $table->decimal("unit_price",14,2);
            $table->decimal("subtotal",14,2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facture_items');
    }
};
