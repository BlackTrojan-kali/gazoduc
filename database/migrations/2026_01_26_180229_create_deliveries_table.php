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
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id(); 
            $table->unsignedBigInteger("sale_id");
            $table->foreign("sale_id")->on("productsales")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("vehicle_id");
            $table->foreign("vehicle_id")->on("chauffeurs")->references("id")->onDelete("cascade");
           $table->string("status");
           $table->dateTime("delivery_date");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
