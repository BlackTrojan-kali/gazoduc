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
        Schema::create('productsales', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("boutique_id");
            $table->foreign("boutique_id")->on("boutiques")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("user_id");
            $table->foreign("user_id")->on("users")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("customer_id");
            $table->foreign("customer_id")->on("customers")->references("id")->onDelete("cascade");
            $table->string("facture_code");
            $table->bigInteger("total_ht");
            $table->bigInteger("total_tva")->nullable();
            $table->bigInteger("total_ttc");
            $table->bigInteger("received_amount")->nullable();
            $table->string("payment_mode");
            $table->string("status");
            $table->string("sync_status");
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productsales');
    }
};
