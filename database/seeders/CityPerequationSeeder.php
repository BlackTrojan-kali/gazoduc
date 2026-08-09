<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\Region; // Assurez-vous d'avoir ce modèle

class CityPerequationSeeder extends Seeder
{
    public function run(): void
    {
        // On suppose que vous avez une région "Littoral" créée
        $littoral = Region::firstOrCreate(['name' => 'Littoral']);

        // Données tirées du PDF officiel
        $cities = [
            ['name' => 'Douala', 'cost' => 0], // Douala est le dépôt = 0[cite: 1]
            ['name' => 'Edéa', 'cost' => 8223], // Coût pour Edéa[cite: 1]
            ['name' => 'Mbanga', 'cost' => 8693], // Coût pour Mbanga[cite: 1]
            ['name' => 'Kribi', 'cost' => 20557], // Coût pour Kribi[cite: 1]
        ];

        foreach ($cities as $data) {
            City::updateOrCreate(
                ['name' => $data['name']], // On cherche par nom
                [
                    'region_id' => $littoral->id,
                    'transport_cost_per_tonne' => $data['cost']
                ]
            );
        }
    }
}