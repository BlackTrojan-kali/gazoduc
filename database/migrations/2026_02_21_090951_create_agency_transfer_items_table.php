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
        Schema::create('agency_transfer_items', function (Blueprint $table) {
            $table->id();
            
            // Lien vers le bordereau
            $table->foreignId('agency_transfer_slip_id')->constrained('agency_transfer_slips')->cascadeOnDelete();
            
            // Lien direct vers LA bouteille physique scannée
            $table->foreignId('cylinder_id')->constrained('cylinders')->restrictOnDelete();
            
            // État spécifique de cette bouteille lors du transport (ex: full, empty, defective)
            $table->string('cylinder_state')->default('full'); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agency_transfer_items');
    }
};