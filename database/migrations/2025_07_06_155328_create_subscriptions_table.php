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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("entreprise_id");
            $table->unsignedBigInteger("licence_id");
            $table->decimal("price");
            $table->unsignedInteger("nombre_agence")->nullable();
            $table->date("date_souscription");
            $table->date("date_expiration");
            $table->boolean("is_active");
            $table->foreign("entreprise_id")->on("entreprises")->references("id")->onDelete("cascade");
            $table->foreign("licence_id")->on("licences")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
