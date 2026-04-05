<?php

namespace Database\Seeders;

use App\Models\ClientCategory;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(RolesTableSeeder::class);
        $this->call(UserSeeder::class);
        $this->call(LicenceSeeder::class);
        $this->call(UnitSeeder::class);
        $this->call(RegionSeederphp::class);
        $this->call(CitySeeder::class);
        $this->call(ClientCategorySeeder::class);
        $this->call(ClientSeeder::class);
    }
}
