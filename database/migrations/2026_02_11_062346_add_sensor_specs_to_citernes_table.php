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
        Schema::table('citernes', function (Blueprint $table) {
            //
            // Token unique pour sécuriser l'envoi depuis l'ESP32
        $table->string('sensor_token')->unique()->nullable()->after('name'); 
        
        // Dimensions nécessaires pour le calcul du volume (Cylindre vertical)
        $table->integer('total_height_cm')->nullable()->comment('Hauteur totale de la cuve');
        $table->integer('diameter_cm')->nullable()->comment('Diamètre de la cuve');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citernes', function (Blueprint $table) {
            //
        });
    }
};
