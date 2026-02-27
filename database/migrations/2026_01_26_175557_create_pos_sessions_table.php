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
        Schema::create('pos_sessions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("user_id");
            $table->foreign("user_id")->on("users")->references("id")->onDelete("cascade");
            $table->date("opened_at")->nullable();
            $table->date("closed_at")->nullable();
            $table->decimal("opening_balance")->nullable();
            $table->decimal("closing_balance")->nullable();
            $table->string("status");
            $table->unsignedBigInteger("boutique_id");
            $table->foreign("boutique_id")->on("boutiques")->references("id")->onDelete("cascade");
           
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_sessions');
    }
};
