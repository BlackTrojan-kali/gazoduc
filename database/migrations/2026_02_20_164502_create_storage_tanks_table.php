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
        Schema::create('storage_tanks', function (Blueprint $table) {
            $table->id();
            $table->string("reference_code");
            $table->unsignedBigInteger("gas_id");// La syntaxe correcte :
           $table->foreign("gas_id")->references("id")->on("gases")->onDelete("cascade");
            $table->decimal("max_capacity");
            $table->decimal("current_volume");
            $table->decimal("safe_minimum_level");
            $table->string("status");
            $table->unsignedBigInteger("agency_id");
            $table->foreign("agency_id")->references("id")->on("agencies")->onDelete("cascade");
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_tanks');
    }
};
