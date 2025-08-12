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
        Schema::create('mouvements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("article_id");
            $table->unsignedBigInteger("agency_id");
            $table->unsignedBigInteger("entreprise_id");
            $table->unsignedBigInteger("recorded_by_user_id");
            $table->string("movement_type");
            $table->decimal("quantity");
            $table->decimal("stock")->nullable();
            $table->string("qualification")->nullable();
            $table->string("source_location")->nullable();
            $table->string("destination_location")->nullable();
            $table->string("description")->nullable();
            $table->string("related_document_type")->nullable();
            $table->foreign("agency_id")->on("agencies")->references("id");
            $table->foreign("entreprise_id")->on("entreprises")->references("id");
            $table->foreign("article_id")->on("articles")->references("id")->onDelete("cascade");
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
        Schema::dropIfExists('mouvements');
    }
};
