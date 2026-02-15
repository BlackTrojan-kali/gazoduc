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
    Schema::table('vehicules', function (Blueprint $table) {
        // La capacité totale du réservoir (ex: 500 Litres)
        $table->float('tank_capacity')->nullable(); 
        
        // Le seuil d'alerte en % (ex: 5%). Si le niveau baisse de 5% en 2 minutes -> ALERTE
        $table->float('theft_threshold_percentage')->default(5.0); 
        
        // Le type de carburant (Diesel, Essence)
        $table->string('fuel_type')->default('diesel');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicules', function (Blueprint $table) {
            //
        });
    }
};
