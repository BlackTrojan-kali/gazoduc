<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Article extends Model
{
    //
    protected $fillable = [
           "code",
           "name",
            "type",
           "unit",
            "article_id",
            "entreprise_id",
           "weight_per_unit",
    ];
    // On force Laravel à lire le poids comme un nombre décimal (float)
    protected $casts = [
        'weight_per_unit' => 'float',
    ];
    public function stock(){
        return $this->hasMany(Stock::class);
    }
    public function entreprise(){
        return $this->belongsTo(Entreprise::class,"entreprise_id");
    }
    public function article(){
        return $this->belongsTo(Article::class,"article_id");
    }
    public function prices(){
        return $this->hasMany(ArticleCategoryPrice::class);
    } 
     public function current_agency_prices()
    {
        // 1. Vérifier si un utilisateur est authentifié ET s'il a un agency_id défini
        $agencyId = Auth::check() ? Auth::user()->agency_id : null;

        // 2. Utiliser la relation de base et ajouter le filtre (scope)
        $query = $this->prices();

        if ($agencyId) {
            // Filtrer la relation pour n'inclure que les prix de l'agence en cours
            $query->where('agency_id', $agencyId);
        } else {
            // Optionnel : Si aucun ID d'agence n'est trouvé, empêcher de récupérer des données
            // en utilisant une condition non satisfiable pour ne pas renvoyer tous les prix.
            $query->where('agency_id', 0);
        }
        
        return $query;
    }

}
