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
        Schema::create('releves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("citerne_id");
            $table->unsignedBigInteger("stock_id");
            $table->unsignedBigInteger("user_id");
            $table->decimal("theorical_quantity");
            $table->decimal("quantity");
            $table->foreign("user_id")->on("users")->references("id")->onDelete("cascade");
            $table->foreign("citerne_id")->on("citernes")->references("id")->onDelete("cascade");
            $table->foreign("stock_id")->on("stocks")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('releves');
    }
};
