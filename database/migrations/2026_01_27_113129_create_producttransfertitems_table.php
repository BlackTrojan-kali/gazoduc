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
        Schema::create('producttransfertitems', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("product_id");
            $table->foreign("product_id")->on("products")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("tranfert_id");
            $table->foreign("tranfert_id")->on("producttransferts")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("move_id");
            $table->foreign("move_id")->on("product_moves")->references("id")->onDelete("cascade");
            $table->float("qty");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('producttransfertitems');
    }
};
