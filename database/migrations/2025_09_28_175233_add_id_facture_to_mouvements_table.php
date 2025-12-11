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
        Schema::table('mouvements', function (Blueprint $table) {
            //
            $table->unsignedBigInteger("facture_id")->nullable();
            $table->foreign("facture_id")->on("factures")->references("id")->onDelete("cascade");
          
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mouvements', function (Blueprint $table) {
            //
        });
    }
};
