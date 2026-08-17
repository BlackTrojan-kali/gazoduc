<?php

namespace App\Http\Controllers;

use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EntrepriseController extends Controller
{
    //
    public function store(Request $request){

     $request->validate([
         'name' => 'required  | string | max:255 | unique:entreprises,name', // 'name' doit être unique dans la colonne 'name'
            'code' => 'required | string  | max:50 | unique:entreprises,code', // 'code' doit être unique dans la colonne 'code'
            'logo_path' => 'nullable | image | mimes:jpeg,png,jpg,gif,svg,webp | max:2048', // Fichier image, max 2MB, formats spécifiés
           'tax_number' => 'required | string | max:255 | unique:entreprises,tax_number', // 'tax_number' doit être unique
            'phone_number' => 'nullable | string| max:20',
            'email_address' => 'nullable | email | max:255 | unique:entreprises,email_address', // 'email_address' doit être unique et un email valide
            'address' => 'nullable | string | max:500', // Nom du champ 'address' côté client
        ]);
       // 2. Gestion du téléchargement du logo (si présent)
        if ($request->hasFile('logo_path')) {
            // Stocke le fichier dans 'public/logos' et obtient le chemin de stockage
           
        $image_name = time().'.'.$request->logo_path->extension();  
        $request->logo_path->move(public_path('images/clients'), $image_name);
        } else {
            // Si aucun fichier n'est uploadé et qu'un logo est requis (si votre validation l'exige),
            // vous devriez gérer ce cas. Ici, 'nullable' le rend facultatif.
            $image_name = null; // S'assurer qu'il est null si non fourni
        }

        // 3. Création de l'entreprise
        
        Entreprise::create([
            "name"=>$request->name,
            "code"=>$request->code,
            "logo_path"=>$image_name,
            "tax_number"=>$request->tax_number,
            "phone_number"=>$request->phone_number,
            "email_address"=>$request->email_address,
            "address"=>$request->address,
        ]);

        // 4. Redirection avec un message de succès
        return back()->with('success', 'Entreprise créée avec succès, monsieur!');
    }
    public function edit(Request $request,$idCom){
        
             $request->validate([       
            'name' => 'required  | string | max:255 ', // 'name' doit être unique dans la colonne 'name'
            'code' => 'required | string  | max:50 ', // 'code' doit être unique dans la colonne 'code'
            'logo_path' => 'nullable | image | mimes:jpeg,png,jpg,gif,svg,webp | max:2048', // Fichier image, max 2MB, formats spécifiés
            'tax_number' => 'required | string | max:255 | ', // 'tax_number' doit être unique
            'phone_number' => 'nullable | string| max:20',
            'email_address' => 'nullable | email | max:255 ', // 'email_address' doit être unique et un email valide
            'address' => 'nullable | string | max:500', 
            ]);
            $company = Entreprise::where("id",$idCom)->first();
             // 2. Gestion du téléchargement du logo (si présent)
        if ($request->hasFile('logo_path')) {
            // Stocke le fichier dans 'public/logos' et obtient le chemin de stockage
         
        $image_name =$request->logo_path->extension();  
        $request->logo_path->move(public_path('images/clients'), $image_name);
        } else {
            // Si aucun fichier n'est uploadé et qu'un logo est requis (si votre validation l'exige),
            // vous devriez gérer ce cas. Ici, 'nullable' le rend facultatif.
            $image_name = $company->logo_path; // S'assurer qu'il est null si non fourni
        }
        $company->name = $request->name;
        $company->code = $request->code;
        $company->logo_path = $image_name;
        $company->tax_number = $request->tax_number;
        $company->phone_number = $request->phone_number;
        $company->address = $request->address;
        $company->save();
        return back()->with("info","entreprise updated successfully");        
            
    }
    public function artchive($idCom){
         $entreprise = Entreprise::where("id",$idCom)->first();
         $entreprise->archived = !$entreprise->archived;
         $entreprise->save();
        return back()->with('success', 'Entreprise desactivee avec succès, monsieur!');
    }
}
