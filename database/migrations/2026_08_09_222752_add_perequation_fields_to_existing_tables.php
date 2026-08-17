<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Ajout du coût de transport dans la table cities
        Schema::table('cities', function (Blueprint $table) {
            // Le coût officiel en FCFA/Tonne selon la CSPH (ex: 8223 pour Edéa)
            $table->decimal('transport_cost_per_tonne', 10, 2)->default(0)->after('name');
        });

        // 2. Transformation du poids en format décimal pour les calculs
        Schema::table('articles', function (Blueprint $table) {
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