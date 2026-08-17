<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. On récupère l'ID de la catégorie "Comptoir"
        $comptoirCategoryId = DB::table('client_categories')
            ->where('name', 'Comptoir')
            ->value('id');

        // Sécurité : Si la catégorie "Comptoir" n'existe pas, on arrête tout
        if (!$comptoirCategoryId) {
            $this->command->error("La catégorie 'Comptoir' est introuvable. Lancez ClientCategorySeeder d'abord !");
            return;
        }

        // 2. On récupère toutes les agences existantes
        $agencies = DB::table('agencies')->get();

        // Sécurité : S'il n'y a pas d'agences, on prévient l'utilisateur
        if ($agencies->isEmpty()) {
            $this->command->info("Aucune agence trouvée dans la base de données. Aucun client n'a été créé.");
            return;
        }

        // 3. On boucle sur chaque agence pour lui attribuer un "Client divers"
        foreach ($agencies as $agency) {
            DB::table('clients')->updateOrInsert(
                [
                    // Critères pour éviter les doublons dans une même agence
                    'agency_id' => $agency->id,
                    'name'      => 'Client divers' 
                ],
                [
                    // Données à insérer ou mettre à jour
                    'client_category_id' => $comptoirCategoryId,
                    'client_type'        => 'Comptoir', // Facultatif, modifiez selon votre logique
                    'archived'           => 0,
                    'created_at'         => now(),
                    'updated_at'         => now()
                ]
            );
        }

        $this->command->info("Le 'Client divers' a été ajouté avec succès pour toutes les agences !");
    }
}