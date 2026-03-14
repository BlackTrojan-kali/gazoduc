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
        Schema::create('agency_transfer_slips', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            
            // Agences d'origine et de destination
            $table->foreignId('source_agency_id')->constrained('agencies')->restrictOnDelete();
            $table->foreignId('destination_agency_id')->constrained('agencies')->restrictOnDelete();
            
            // Transport
            $table->foreignId('vehicule_id')->nullable()->constrained('vehicules')->nullOnDelete();
            
            // Si vos chauffeurs sont dans la table users, gardez 'users'. 
            // Si vous avez une table 'drivers', remplacez 'users' par 'drivers'.
            $table->foreignId('driver_id')->nullable()->constrained('chauffeurs')->nullOnDelete(); 
            
            $table->string('status')->default('pending'); // ex: pending, in_transit, delivered, cancelled
            
            $table->timestamp('departure_date')->nullable();
            $table->timestamp('arrival_date')->nullable();
            
            // Utilisateur ayant créé le bordereau
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agency_transfer_slips');
    }
};