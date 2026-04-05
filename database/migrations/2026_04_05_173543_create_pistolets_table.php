<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // On renomme ou on adapte ta table pivot pour en faire une vraie entité
        Schema::create('pistolets', function (Blueprint $table) {
            $table->id();
            $table->string("name"); // Ex: "Pistolet 1 - Super", "Pistolet 2 - Gazole"
            
            // Les clés étrangères (ta logique d'origine est parfaite)
            $table->unsignedBigInteger("pompe_id");
            $table->unsignedBigInteger("citerne_id");
            
            // L'information cruciale pour la prochaine saisie d'index
            $table->decimal("current_index", 12, 2)->default(0);
            
            $table->boolean("is_active")->default(true);

            $table->foreign("pompe_id")->on("pompes")->references("id")->onDelete("cascade");
            // Attention au cascade ici : si on supprime la citerne, 
            // on perd l'historique des index du pistolet. Un restrict est souvent plus sûr dans un ERP.
            $table->foreign("citerne_id")->on("citernes")->references("id")->onDelete("restrict"); 
            
            $table->timestamps();
            
            // Optionnel : s'assurer qu'un pistolet n'est pas créé en double
            $table->unique(['pompe_id', 'name']); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pistolets');
    }
};