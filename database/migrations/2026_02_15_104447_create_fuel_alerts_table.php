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
    Schema::create('fuel_alerts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('vehicule_id')->constrained()->onDelete('cascade');
        $table->foreignId('position_id')->nullable()->constrained('vehicle_positions'); // Lien vers la position GPS exacte du vol
        
        $table->string('type')->default('THEFT'); // THEFT (Vol), LEAK (Fuite), REFUEL (Remplissage suspect)
        $table->float('volume_lost'); // Quantité perdue (ex: 50 Litres)
        $table->float('level_before');
        $table->float('level_after');
        
        $table->timestamp('detected_at');
        $table->boolean('is_resolved')->default(false); // Pour le suivi admin
        $table->text('admin_notes')->nullable();
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuel_alerts');
    }
};
