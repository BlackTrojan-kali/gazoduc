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
        Schema::create('boutiquepayments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("counter_id")->nullable();
            $table->foreign("counter_id")->on("counters")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("user_id");
            $table->foreign("user_id")->on("users")->references("id")->onDelete("cascade");
            $table->float("amount");
            $table->string("label")->nullable();
            $table->float("label_amount")->default(0);
            $table->string("reference")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boutiquepayments');
    }
};
