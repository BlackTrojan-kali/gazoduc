<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductCategorySeeder extends Seeder
{
    public function run(): void
    {
        // Désactiver les contraintes de clés étrangères pour nettoyer la table
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('productcategories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [
            'ALIMENTAIRE' => [
                'Épicerie Sucrée',
                'Épicerie Salée',
                'Produits Laitiers',
                'Boucherie & Charcuterie',
                'Poissonnerie',
                'Fruits & Légumes',
                'Surgelés'
            ],
            'BOISSONS' => [
                'Eaux & Jus',
                'Sodas',
                'Vins & Spiritueux',
                'Bières'
            ],
            'BOULANGERIE & PÂTISSERIE' => [
                'Pains',
                'Viennoiseries',
                'Gâteaux',
                'Traiteur (Snack)'
            ],
            'DÉTERGENTS & HYGIÈNE' => [
                'Entretien Maison',
                'Hygiène Corporelle',
                'Soins Cheveux',
                'Couches & Bébé'
            ],
            'ÉLECTROMÉNAGER' => [
                'Petit Électroménager',
                'Gros Électroménager',
                'Ustensiles de Cuisine'
            ],
            'RESTAURANT' => [
                'Entrées',
                'Plats Chauds',
                'Accompagnements',
                'Desserts Maison'
            ]
        ];

        foreach ($categories as $parentName => $subCategories) {
            // Création de la catégorie parente (Rayon)
            $parentId = DB::table('productcategories')->insertGetId([
                'name' => $parentName,
                'parent_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Création des sous-catégories
            foreach ($subCategories as $subName) {
                DB::table('productcategories')->insert([
                    'name' => $subName,
                    'parent_id' => $parentId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}