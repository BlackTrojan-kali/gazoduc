<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('releves_index', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pistolet_id');
            $table->unsignedBigInteger('agency_id'); // La station
            $table->unsignedBigInteger('user_id'); // Le pompiste ou chef de piste
            
            // Les données brutes saisies
            $table->decimal('index_ouverture', 12, 2);
            $table->decimal('index_fermeture', 12, 2);
            $table->decimal('volume_test', 10, 2)->default(0); // Carburant tiré pour étalonnage (remis en cuve)

            // --- LES CHAMPS FIGÉS (Pour des rapports inaltérables) ---
            
            // Calculé : (fermeture - ouverture) - volume_test
            $table->decimal('volume_vendu', 10, 2); 
            
            // Le prix de l'article au moment exact de la saisie
            $table->decimal('prix_unitaire', 10, 2); 
            
            // Calculé : volume_vendu * prix_unitaire
            $table->decimal('montant_total', 12, 2); 

            // ---------------------------------------------------------

            $table->timestamp('date_saisie');
            // Un statut pour différencier une saisie en cours d'un quart clôturé
            $table->enum('status', ['brouillon', 'valide'])->default('brouillon'); 

            $table->foreign('pistolet_id')->on('pistolets')->references('id')->onDelete('restrict');
            $table->foreign('agency_id')->on('agencies')->references('id')->onDelete('cascade');
            $table->foreign('user_id')->on('users')->references('id');
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('releves_index');
    }
};