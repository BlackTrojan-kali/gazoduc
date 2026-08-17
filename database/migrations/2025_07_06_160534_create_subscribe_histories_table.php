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
        Schema::create('subscribe_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("subs_id");
            $table->decimal("old_price")->nullable();
            $table->decimal("new_price")->nullable();
            $table->unsignedInteger("old_number_of_agencies")->nullable();
            $table->unsignedInteger("new_number_of_agencies")->nullable();
            $table->string("licence_name_at_time");
            $table->string("action_type");
            $table->foreign("subs_id")->on("subscriptions")->references("id")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscribe_histories');
    }
};
