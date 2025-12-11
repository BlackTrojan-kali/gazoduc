<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    //
    protected $fillable=[
     "name",
    "code", // Champ pour le code de l'entreprise
    "logo_path", // Pour le fichier du logo_path (objet File)
    "tax_number",
    "phone_number",
    "email_address",
    "address",
    ];
    public function agency(){
        return $this->hasMany(Agency::class);
    }
    public function subscription(){
        return $this->hasOne(Subscription::class);
    }
}
