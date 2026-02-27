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
            $table->string("reference")->nullable();
            $table->string("status");//(Enum: 'draft' [brouillon], 'sent' [envoyé], 'partial' [partiellement reçu], 'received' [réceptionné], 'cancelled' [annulé])
            $table->date("order_date")->nullable();
            $table->date("expected_delivery_date")->nullable();
            $table->decimal("total_amount")->default(0.00);
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
        Schema::dropIfExists('purchase_orders');
    }
};
