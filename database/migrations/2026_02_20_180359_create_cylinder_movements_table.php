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
        Schema::create('cylinder_movements', function (Blueprint $table) {
            $table->id();
            
            // La bouteille concernée
            $table->unsignedBigInteger("cylinder_id");
            $table->foreign("cylinder_id")->references("id")->on("cylinders")->onDelete("cascade");

            // --- NOUVEAU : Traçabilité du lieu et de l'acteur ---
            $table->unsignedBigInteger("agency_id"); // L'agence où l'action a été enregistrée
            $table->foreign("agency_id")->references("id")->on("agencies")->onDelete("cascade");

            $table->unsignedBigInteger("user_id"); // L'employé (magasinier/chauffeur) qui a fait le scan
            $table->foreign("user_id")->references("id")->on("users")->onDelete("cascade");

            // --- MODIFIÉ : Nullable pour les transferts inter-sites ---
            $table->unsignedBigInteger("client_id")->nullable();
            $table->foreign("client_id")->references("id")->on("clients")->onDelete("set null");

            // Type exact du mouvement (ex: Sortie_Client, Retour_Client, Transfert_Sortant, Transfert_Entrant, Maintenance)
            $table->string("movement_type"); 
            
            // --- NOUVEAU : Lien avec la comptabilité/logistique ---
            $table->string("document_reference")->nullable(); // Ex: BL-2026-001 ou BT-DLA-YDE-04
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cylinder_movements');
    }
};