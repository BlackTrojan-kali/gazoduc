<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegionSeederphp extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $regions = [
            ['name' => 'Centre'],
            ['name' => 'Littoral'],
            ['name' => 'Nord'],
        ];

        foreach ($regions as $region) {
            DB::table('regions')->updateOrInsert(
                ['name' => $region['name']],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    
    }
}
