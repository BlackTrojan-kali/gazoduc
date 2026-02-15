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
    Schema::create('gps_devices', function (Blueprint $table) {
        $table->id();
        $table->string('imei')->unique(); // L'identifiant unique du boîtier
        $table->string('sim_number')->nullable(); // Numéro de la puce M2M
        $table->string('model')->nullable(); // Ex: Teltonika, Coban
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gps_devices');
    }
};
