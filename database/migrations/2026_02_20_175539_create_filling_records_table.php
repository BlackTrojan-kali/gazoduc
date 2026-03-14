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
        Schema::create('filling_records', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("cylinder_id");
            $table->foreign("cylinder_id")->on("cylinders")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("production_batch_id");
            $table->foreign("production_batch_id")->references("id")->on("production_batches")->onDelete("cascade");
            $table->date("filled_at");
            $table->unsignedBigInteger("storage_tank_id");
            $table->foreign("storage_tank_id")->references("id")->on("storage_tanks")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('filling_records');
    }
};
