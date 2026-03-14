<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_batch_cylinders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('production_batch_id')->constrained('production_batches')->cascadeOnDelete();
            $table->foreignId('cylinder_id')->constrained('cylinders')->cascadeOnDelete();
            
            // Pour tracer l'état pendant le remplissage (ex: pending, filled, rejected)
            $table->string('fill_status')->default('pending'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_batch_cylinders');
    }
};