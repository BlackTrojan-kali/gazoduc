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
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("purchase_order_id");
            $table->foreign("purchase_order_id")->references("id")->on("purchase_orders");
            $table->string("reference")->nullable();
            $table->dateTime("received_at")->nullable();
            $table->string("status");//(Enum: 'pending' [en cours d'inspection], 'validated' [stock mis à jour])
            
            $table->unsignedBigInteger("boutique_id");
$table->foreign("boutique_id")->references("id")->on("boutiques")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receipts');
    }
};
