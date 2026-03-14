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
        Schema::create('cash_shifts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("agency_id");
            $table->foreign("agency_id")->references("id")->on("agencies")->onDelete("cascade");
            $table->unsignedBigInteger("user_id");
            $table->foreign("user_id")->references("id")->on("users")->onDelete("cascade");
            $table->time("opening_time")->nullable();
            $table->time("closing_time")->nullable();
            $table->decimal("expected_cash",14,2)->nullable();
            $table->decimal("actual_cash_deposited",14,2)->nullable();
            $table->decimal("difference")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_shifts');
    }
};
