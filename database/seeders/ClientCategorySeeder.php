<?php

namespace Database\Seeders;

use App\Models\ClientCategory; // Assurez-vous que le modèle existe
use Illuminate\Database\Seeder;

class ClientCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ClientCategory::updateOrCreate(
            ['name' => 'Comptoir'],
            ['description' => 'Catégorie pour les clients de passage effectuant des achats directs au comptoir.']
        );
    }
}