<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $units = [
            // Unités de masse
            ['name' => 'Kilogramme (kg)'],
            ['name' => 'Gramme (g)'],
            ['name' => 'Milligramme (mg)'],
            ['name' => 'Tonne (t)'],

            // Unités de volume / Liquide
            ['name' => 'Litre (l)'],
            ['name' => 'Millilitre (ml)'],
            ['name' => 'Centilitre (cl)'],
            ['name' => 'Mètre cube (m³)'],

            // Unités de longueur
            ['name' => 'Mètre (m)'],
            ['name' => 'Centimètre (cm)'],
            ['name' => 'Millimètre (mm)'],
            ['name' => 'Kilomètre (km)'],

            // Unités de quantité / Conditionnement
            ['name' => 'Unité (u)'],
            ['name' => 'Pièce (pcs)'],
            ['name' => 'Douzaine'],
            ['name' => 'Carton'],
            ['name' => 'Paquet'],
            ['name' => 'Boîte'],
            ['name' => 'Palette'],

            // Unités de surface
            ['name' => 'Mètre carré (m²)'],
            ['name' => 'Hectare (ha)'],

            // Autres
            ['name' => 'Heure (h)'],
            ['name' => 'Jour (j)'],
        ];

        foreach ($units as $unit) {
            Unit::updateOrCreate(['name' => $unit['name']], $unit);
        }
    
    }
}
