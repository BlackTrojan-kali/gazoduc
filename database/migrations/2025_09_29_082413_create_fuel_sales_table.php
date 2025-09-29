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
        Schema::create('fuel_sales', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("citerne_id");
            $table->unsignedBigInteger("agency_id");
            $table->unsignedBigInteger("article_id");
            $table->unsignedBigInteger("user_id");
            $table->unsignedBigInteger("client_id");
            $table->decimal("total_price",14,2);
            $table->decimal("sub_total",14,2);
            $table->decimal("unitPrice",14,2);
            $table->decimal("quantity",14,2);
            $table->foreign("client_id")->on("clients")->references("id")->onDelete("cascade");
            $table->foreign("user_id")->on("users")->references("id")->onDelete("cascade");
            $table->foreign("agency_id")->on("agencies")->references("id")->onDelete("cascade");
            $table->foreign("article_id")->on("articles")->references("id")->onDelete("cascade");
            $table->foreign("citerne_id")->on("citernes")->references("id")->onDelete("cascade");
            $table->string("status");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuel_sales');
    }
};
