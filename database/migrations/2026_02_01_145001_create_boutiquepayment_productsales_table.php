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
        Schema::create('boutiquepayment_productsales', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("boutiquepayment_id");
            $table->foreign("boutiquepayment_id")->on("boutiquepayments")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("productsale_id");
            $table->foreign("productsale_id")->on("productsales")->references("id")->onDelete("cascade");  
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boutiquepayment_productsales');
    }
};
