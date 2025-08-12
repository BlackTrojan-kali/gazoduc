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
        Schema::create('production_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("source_citerne_id");
            $table->foreign("source_citerne_id")->on("citernes")->references("id");
            $table->unsignedBigInteger("article_id");
            $table->foreign("article_id")->on("articles")->references("id");
            $table->decimal("quantity_produced");
            $table->decimal("total_weight_produced")->nullable();
            $table->unsignedBigInteger("production_movement_id")->nullable();
            $table->foreign("production_movement_id")->on("mouvements")->references("id");
            $table->unsignedBigInteger("agency_id");
            $table->foreign("agency_id")->on("agencies")->references("id");
            $table->unsignedBigInteger("recorded_by_user_id");
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
        Schema::dropIfExists('production_histories');
    }
};
