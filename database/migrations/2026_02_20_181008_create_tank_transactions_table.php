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
        Schema::create('tank_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('storage_tank_id')->constrained('storage_tanks')->cascadeOnDelete();
            $table->string('transaction_type'); // ex: 'in', 'out', 'adjustment'
            $table->decimal('volume_change', 10, 2)->nullable();
            $table->foreignId('production_batch_id')->constrained('production_batches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tank_transactions');
    }
};