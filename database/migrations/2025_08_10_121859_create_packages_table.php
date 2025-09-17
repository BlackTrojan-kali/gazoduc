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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("bordereau_route_id");
            $table->unsignedBigInteger("article_id");
            $table->unsignedBigInteger("departure_agency_id");
            $table->unsignedBigInteger("arrival_agency_id");
            $table->decimal("qty",14,2);
            $table->string("status");
            $table->string("note")->nullable();
            $table->foreign("bordereau_route_id")->on("bordereau_routes")->references("id")->onDelete("cascade");
            $table->foreign("departure_agency_id")->on("agencies")->references("id")->onDelete("cascade");
            $table->foreign("arrival_agency_id")->on("agencies")->references("id")->onDelete("cascade");
            $table->foreign("article_id")->on("articles")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
