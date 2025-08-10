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
        Schema::create('bordereau_routes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("vehicule_id");
            $table->foreign("vehicule_id")->on("vehicules")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("chauffeur_id");
            $table->foreign("chauffeur_id")->on("chauffeurs")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("co_chauffeur_id")->nullable();
            $table->foreign("co_chauffeur_id")->on("chauffeurs")->references("id");
            $table->unsignedBigInteger("departure_location_id");
            $table->foreign("departure_location_id")->on("agencies")->references("id");
            $table->unsignedBigInteger("arrival_location_id");
            $table->foreign("arrival_location_id")->on("agencies")->references("id")->onDelete("cascade");
            $table->dateTime("arrival_date")->nullable();
            $table->dateTime("departure_date");
            $table->string("status");
            $table->string("types")->nullable();
            $table->Text("notes")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bordereau_routes');
    }
};
