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
        Schema::create('article_maintenances', function (Blueprint $table) {
            $table->id();
            
            // Clés étrangères
            $table->foreignId('article_id')->constrained('articles')->onDelete('cascade');
            $table->foreignId('agency_id')->constrained('agencies')->onDelete('cascade');
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->onDelete('set null');

            // Informations sur l'intervention
            $table->string('type'); // ex: 'epreuve', 'peinture', 'reparation_vanne'
            $table->string('status')->default('en_cours'); // ex: 'en_cours', 'terminee', 'rejetee'
            
            // Dates
            $table->date('start_date');
            $table->date('end_date')->nullable(); // Remplie uniquement quand la maintenance est terminée
            
            // Informations prestataire et facturation
            $table->string('provider')->nullable(); // Nom du prestataire ou service interne
            $table->decimal('cost', 10, 2)->nullable(); // 10 chiffres au total, dont 2 après la virgule
            
            // Notes supplémentaires
            $table->text('observations')->nullable(); 

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('article_maintenances');
    }
};