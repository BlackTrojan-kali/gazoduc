<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up()
{
    Schema::create('vehicle_positions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('vehicule_id')->constrained()->onDelete('cascade');
        $table->foreignId('gps_device_id')->constrained(); // Pour savoir quel boîtier a envoyé l'info
        
        // Données GPS
        $table->decimal('latitude', 10, 7); // Précision GPS
        $table->decimal('longitude', 10, 7);
        $table->float('speed')->default(0); // Vitesse en km/h
        $table->float('heading')->default(0); // Direction (0-360°)
        
        // Données Sonde Ultrason (CRUCIAL pour Ikarootech)
        $table->float('fuel_level')->nullable(); // En litres ou pourcentage
        $table->float('fuel_variance')->nullable(); // Pour détecter une chute brutale (vol)

        $table->timestamp('captured_at'); // L'heure exacte du relevé GPS
        $table->timestamps();
        
        // Indexation pour la performance (très important pour le tracking)
        $table->index(['vehicule_id', 'captured_at']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_positions');
    }
};
