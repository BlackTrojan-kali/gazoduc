<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productstocks', function (Blueprint $table) {
            $table->unique(['product_id', 'boutique_id', 'service'], 'stock_unique_index');
        });
    }

    public function down(): void
    {
        Schema::table('productstocks', function (Blueprint $table) {
            $table->dropUnique('stock_unique_index');
        });
    }
};