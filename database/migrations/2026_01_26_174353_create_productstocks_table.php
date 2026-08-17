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
        Schema::create('productstocks', function (Blueprint $table) {
            $table->id();  
            $table->unsignedBigInteger("product_id");
            $table->foreign("product_id")->on("products")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("boutique_id");
            $table->foreign("boutique_id")->on("boutiques")->references("id")->onDelete("cascade");
            $table->decimal("available_qty",14,2);
            $table->string("service");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productstocks');
    }
};
