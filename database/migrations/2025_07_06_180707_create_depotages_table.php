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
        Schema::create('depotages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("citerne_mobile_id");
            $table->unsignedBigInteger("citerne_fixe_id");
            $table->unsignedBigInteger("article_id")->nullable();
            $table->unsignedBigInteger("agency_id");
            $table->unsignedBigInteger("recorded_by_user_id");
            $table->decimal("quantity");
            $table->foreign("citerne_mobile_id")->on("vehicules")->references("id");
            $table->foreign("citerne_fixe_id")->on("citernes")->references("id");
            $table->foreign("article_id")->on("articles")->references("id");
            $table->foreign("recorded_by_user_id")->on("users")->references("id");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('depotages');
    }
};
