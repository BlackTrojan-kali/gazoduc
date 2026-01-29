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
        // On récupère les IDs des régions pour garantir la cohérence
        $regions = [
            'Centre'   => DB::table('regions')->where('name', 'Centre')->value('id'),
            'Littoral' => DB::table('regions')->where('name', 'Littoral')->value('id'),
            'Nord'     => DB::table('regions')->where('name', 'Nord')->value('id'),
        ];

        $cities = [
            ['name' => 'Yaoundé', 'region_name' => 'Centre'],
            ['name' => 'Douala',  'region_name' => 'Littoral'],
            ['name' => 'Garoua',  'region_name' => 'Nord'],
        ];

        foreach ($cities as $city) {
            $regionId = $regions[$city['region_name']];

            if ($regionId) {
                DB::table('cities')->updateOrInsert(
                    ['name' => $city['name'], 'region_id' => $regionId],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }
}