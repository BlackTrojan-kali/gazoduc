<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. On ajoute le coût de transport par tonne directement dans la ville
        Schema::table('cities', function (Blueprint $table) {
            // Permet de stocker le tarif de la grille CSPH (ex: 14096.00 pour Akonolinga)
            $table->decimal('transport_cost_per_tonne', 10, 2)->default(0)->after('name');
        });

        // 2. On s'assure que le poids de l'article est numérique pour le calcul
        Schema::table('articles', function (Blueprint $table) {
            // Changement de string à decimal (assurez-vous d'avoir le package doctrine/dbal installé si vous modifiez une colonne)
            $table->decimal('weight_per_unit', 8, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('cities', function (Blueprint $table) {
            $table->dropColumn('transport_cost_per_tonne');
        });

        Schema::table('articles', function (Blueprint $table) {
            $table->string('weight_per_unit')->nullable()->change();
        });
    }
};