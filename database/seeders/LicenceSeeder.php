<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LicenceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
           $licences = [
            ['name' => 'gaz', "type"=>"Annuel",'description' => 'Uniquement pour le gaz'],
            ['name' => 'gaz et petrol', "type"=>"Annuel",'description' => 'pour le gaz et le carburant'],
            ['name' => 'petrol', "type"=>"Annuel",'description' => 'Uniquement pour le petrol'],
        ];

        foreach ($licences as $licence) {
            DB::table('licences')->insertOrIgnore([ // insertOrIgnore pour éviter les duplicatas si le seeder est lancé plusieurs fois
                'name' => $licence['name'],
                "type"=>$licence["type"],
                'description' => $licence['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
