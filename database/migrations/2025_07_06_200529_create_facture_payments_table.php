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
        Schema::create('facture_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("payment_id");
            $table->foreign("payment_id")->on("payments")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("facture_id");
            $table->foreign("facture_id")->on("factures")->references("id")->onDelete("cascade");
            $table->decimal("amount")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facture_payments');
    }
};
