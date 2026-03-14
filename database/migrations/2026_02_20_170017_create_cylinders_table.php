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
        Schema::create('cylinders', function (Blueprint $table) {
            $table->id();
            
            // Identification (Contrainte unique ajoutée pour la sécurité de l'ERP)
            $table->string("serial_number")->unique();
            $table->string("barcode")->unique();
            
            // Format de la bouteille (Ex: B50)
            $table->unsignedBigInteger("cylinder_type_id");
            $table->foreign("cylinder_type_id")->references("id")->on("cylinder_types")->onDelete("cascade");

            // --- NOUVEAU : GESTION MULTI-SITE ---
            // Localisation actuelle de la bouteille (Peut être null si elle est chez le client ou en transit)
            $table->unsignedBigInteger("current_agency_id")->nullable();
            $table->foreign("current_agency_id")->references("id")->on("agencies")->onDelete("set null");

            // --- NOUVEAU : SÉCURITÉ INDUSTRIELLE ---
            // Gaz exclusif affecté à cette bouteille (Ex: Oxygène Médical)
            $table->unsignedBigInteger("gas_id")->nullable();
            $table->foreign("gas_id")->references("id")->on("gases")->onDelete("set null");
            
            // Caractéristiques et Statut
            $table->float("tare_weight");
            $table->date("last_test_date");
            $table->string("status"); // Vide_Usine, Pleine_Agence, Chez_Client, En_Transit...
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cylinders');
    }
};