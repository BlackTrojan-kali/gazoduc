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
            $table->unsignedBigInteger("chauffeur_id");
            $table->unsignedBigInteger("co_chauffeur_id")->nullable();
            $table->unsignedBigInteger("departure_location_id");
            $table->unsignedBigInteger("arrival_location_id");
            
            $table->date("departure_date");
            $table->date("arrival_date")->nullable(); // Rendre nullable, car la date d'arrivée n'est pas connue au début du trajet
            $table->string("status");
            
            // Foreign Keys
            $table->foreign("vehicule_id")->on("vehicules")->references("id")->onDelete("cascade");
            $table->foreign("chauffeur_id")->on("chauffeurs")->references("id")->onDelete("cascade");
            $table->foreign("co_chauffeur_id")->on("chauffeurs")->references("id");
            $table->foreign("departure_location_id")->on("agencies")->references("id");
            $table->foreign("arrival_location_id")->on("agencies")->references("id")->onDelete("cascade");
            
            $table->timestamps();
            
            // Ajout d'index pour les requêtes de recherche fréquentes
            $table->index('status');
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