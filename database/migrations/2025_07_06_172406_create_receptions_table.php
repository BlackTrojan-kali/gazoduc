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
        Schema::create('receptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("citerne_mobile_id");
            $table->unsignedBigInteger("article_id")->nullable();
            $table->decimal("theorical_quantity")->nullable();
            $table->decimal("received_quantity");
            $table->unsignedBigInteger("destination_agency_id")->nullable();
            $table->unsignedBigInteger("recorded_id_user");
            $table->string("origin")->nullable();
            $table->foreign("citerne_mobile_id")->on("vehicules")->references("id");
            $table->foreign("article_id")->on("articles")->references("id");
            $table->foreign("destination_agency_id")->on("agencies")->references("id");
            $table->foreign("recorded_id_user")->on("users")->references("id");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receptions');
    }
};
