<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('citerne_readings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("citerne_id");
            $table->unsignedBigInteger("agency_id");
            $table->unsignedBigInteger("stock_id");
            $table->unsignedBigInteger("user_id");
            $table->decimal("theorical_quantity");
            $table->decimal("measured_quantity");
            $table->decimal("difference");
            $table->dateTime("reading_date")->default(DB::raw("CURRENT_TIMESTAMP"));
            $table->foreign("stock_id")->on("stocks")->references("id");
            $table->foreign("user_id")->on("users")->references("id");
            $table->foreign("citerne_id")->on("citernes")->references("id");
            $table->foreign("agency_id")->on("agencies")->references("id")->onDelete("cascade");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citerne_readings');
    }
};
