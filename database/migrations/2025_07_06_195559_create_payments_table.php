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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->foreign("user_id")->on("users")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("agency_id");
            $table->foreign("agency_id")->on("agencies")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("bank_id");
            $table->foreign("bank_id")->on("banks")->references("id")->onDelete("cascade");
            $table->unsignedBigInteger("client_id");
            $table->foreign("client_id")->on("clients")->references("id")->onDelete("cascade");
            $table->decimal("amout",14,2); //somme versee
            $table->string("type");//consigne,gpl,accessoire,carburant
            $table->text("notes")->nullable();
            $table->decimal("amout_notes",14,2)->nullable();//somme prelevee dans le commentaire
            $table->string("bordereau")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
