<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //  // Récupérer l'ID du rôle 'super_administrateur'
        $superAdminRoleId = DB::table('roles')->where('name', 'super_administrateur')->value('id');

        // Créer l'utilisateur super administrateur si le rôle existe
        if ($superAdminRoleId) {
            DB::table('users')->insertOrIgnore([
                'first_name' => 'Super Admin',
                'last_name' => 'ikarooteam',
                'email' => 'super@example.com', // Utilisez une adresse email sécurisée et unique
                'password' => Hash::make('secret'), // Changez ceci pour un mot de passe fort en production!
                'role_id' => $superAdminRoleId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $this->command->info('Le rôle "super_administrateur" n\'a pas été trouvé. Assurez-vous d\'exécuter le RolesTableSeeder en premier.');
        }
    }
}
