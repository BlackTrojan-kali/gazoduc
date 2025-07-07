<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
         $roles = [
            ['name' => 'super_administrateur', 'description' => 'Accès complet au système'],
            ['name' => 'administrateur', 'description' => 'Gestion des utilisateurs, configurations générales'],
            ['name' => 'pdg', 'description' => 'Vue d\'ensemble et décisions stratégiques'],
            ['name' => 'direction', 'description' => 'Gestion de département, reporting'],
            ['name' => 'controleur', 'description' => 'Vérification et audit financier'],
            ['name' => 'magasin', 'description' => 'Gestion des stocks, entrées/sorties de marchandises'],
            ['name' => 'production', 'description' => 'Supervision et exécution des opérations de production'],
            ['name' => 'commercial', 'description' => 'Gestion des ventes, relations clients'],
            ['name' => 'chauffeur', 'description' => 'Gestion des livraisons et transports'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->insertOrIgnore([ // insertOrIgnore pour éviter les duplicatas si le seeder est lancé plusieurs fois
                'name' => $role['name'],
                'description' => $role['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
