<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Définition des chefs-lieux par région
        $capitals = [
            'Adamaoua'     => 'Ngaoundéré',
            'Centre'       => 'Yaoundé',
            'Est'          => 'Bertoua',
            'Extrême-Nord' => 'Maroua',
            'Littoral'     => 'Douala',
            'Nord'         => 'Garoua',
            'Nord-Ouest'   => 'Bamenda',
            'Ouest'        => 'Bafoussam',
            'Sud'          => 'Ebolowa',
            'Sud-Ouest'    => 'Buea',
        ];

        // 2. Boucle sur chaque région pour insérer son chef-lieu
        foreach ($capitals as $regionName => $cityName) {
            // On récupère l'ID de la région correspondante
            $regionId = DB::table('regions')->where('name', $regionName)->value('id');

            if ($regionId) {
                DB::table('cities')->updateOrInsert(
                    [
                        'name'      => $cityName, 
                        'region_id' => $regionId
                    ],
                    [
                        'created_at' => now(),
                        'updated_at' => now()
                    ]
                );
            }
        }
    }
}