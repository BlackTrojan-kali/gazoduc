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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("supplier_id");
            $table->foreign("supplier_id")->references("id")->on("suppliers")->onDelete("cascade");
            $table->unsignedBigInteger("agency_id");
            $table->foreign("agency_id")->references("id")->on("agencies")->onDelete("cascade");
            $table->date("order_date");
            $table->date("expected_delivery-date")->nullable();
            $table->string("status")->nullable();
            $table->float("total_amount")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
