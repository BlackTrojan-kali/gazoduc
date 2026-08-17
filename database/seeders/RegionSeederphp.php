<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeederphp extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $regions = [
            ['name' => 'Adamaoua'],
            ['name' => 'Centre'],
            ['name' => 'Est'],
            ['name' => 'Extrême-Nord'],
            ['name' => 'Littoral'],
            ['name' => 'Nord'],
            ['name' => 'Nord-Ouest'],
            ['name' => 'Ouest'],
            ['name' => 'Sud'],
            ['name' => 'Sud-Ouest'],
        ];

        foreach ($regions as $region) {
            DB::table('regions')->updateOrInsert(
                ['name' => $region['name']],
                [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}