<?php

namespace App\Http\Controllers;

use App\Exports\ClientsExport;
use App\Models\Agency;
use App\Models\Client;
use App\Models\ClientCategory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class ClientController extends Controller
{
    //
    public function index(){
        $clients= Client::with("category","agency")->paginate(350);
        $agencies = Agency::all();

        if(Auth::user()->role->name !=="direction"){
        $clients= Client::where("agency_id",Auth::user()->agency_id)->with("category","agency")->paginate(150);
            
        }
        $clientCategories= ClientCategory::all(); 
        return inertia("Clients/Clients",compact("clients", "clientCategories","agencies"));
    }
    public function store(Request $request){
        $request->validate([
            "client_category_id"=>"required",
            "client_type"=>"required",
            "agency_id"=>"required",
            "name"=>"string | required",
            "phone_number"=>"string |nullable",
            "email_address"=>"string  |nullable",
            "address"=>"string  |nullable",
            "NUI"=>"string  |nullable",
        ]);

        $client = new Client();
        $client->client_category_id = $request->client_category_id;
        $client->agency_id = $request->agency_id;
        $client->client_type = $request->client_type;
        $client->name = $request->name;
        $client->phone_number = $request->phone_number;
        $client->email_address =  $request->email_address;
        $client->address= $request->address;
        $client->NUI = $request->NUI;
        $client->save();
        return back()->with("success","client cree avec success");        

    }

    public function update(Request $request,$idCli){
        $request->validate([
            "client_category_id"=>"required",
            "client_type"=>"required",
            "name"=>"string | required",
            "phone_number"=>"string | nullable",
            "email_address"=>"string | nullable",
            "address"=>"string | nullable",
            "NUI"=>"string | nullable",
        ]);

        $client =  Client::findOrFail($idCli);
        $client->client_category_id = $request->client_category_id;
        $client->client_type = $request->client_type;
        $client->name = $request->name;
        $client->phone_number = $request->phone_number;
        $client->email_address =  $request->email_address;
        $client->address= $request->address;
        $client->NUI = $request->NUI;
        $client->save();
        return back()->with("success","client cree avec success");        

    }
    public function destroy($idCli){
        $client = Client::findOrFail($idCli);
        $client->delete();
        return back()->with("warning","client deleted successfully");
    }
public function import(Request $request)
    {
        $request->validate([
            'import_file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        $importedCount = 0;
        $skippedCount = 0;
        $failedCount = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            // 1. Lecture du fichier
            $array = Excel::toArray(new \stdClass(), $request->file('import_file'));

            if (empty($array) || empty($array[0])) {
                throw new \Exception("Le fichier est vide ou illisible.");
            }

            // On récupère la première feuille
            $sheet = $array[0];
            
            // On vérifie qu'il y a des données (plus que juste l'entête)
            if (count($sheet) < 2) {
                throw new \Exception("Le fichier ne contient aucune donnée client.");
            }

            // On boucle sur les lignes
            foreach ($sheet as $index => $row) {
                // 2. IGNORER LA LIGNE D'ENTÊTE (Ligne 0)
                // Votre dump montre que l'index 0 contient "Nom", "Type de Client", etc.
                if ($index === 0) {
                    continue; 
                }

                // Numéro de ligne Excel (Index + 1 car l'index commence à 0)
                $excelLine = $index + 1;

                try {
                    // 3. MAPPING DES COLONNES (Basé sur votre dump)
                    // 0 => Nom
                    // 1 => Type de Client
                    // 2 => Catégorie
                    // 3 => Agence
                    // 4 => Téléphone
                    // 5 => Email
                    // 6 => Adresse
                    // 7 => NUI
                    
                    $nomRaw      = $row[0] ?? null;
                    $typeRaw     = $row[1] ?? null;
                    $catRaw      = $row[2] ?? null;
                    $agenceRaw   = $row[3] ?? null;
                    $telRaw      = $row[4] ?? null;
                    $emailRaw    = $row[5] ?? null; // Peut être null
                    $adresseRaw  = $row[6] ?? null;
                    $nuiRaw      = $row[7] ?? null; // Peut être null

                    // Nettoyage basique
                    $nom = trim($nomRaw);
                    $agenceName = trim($agenceRaw);
                    
                    // Si la ligne est vide (cas fréquent en fin de fichier Excel), on saute
                    if (empty($nom) && empty($agenceName)) {
                        continue;
                    }

                    // --- VÉRIFICATION AGENCE (OBLIGATOIRE) ---
                    if (empty($agenceName)) {
                        throw new \Exception("Le nom de l'agence est manquant.");
                    }
                    
                    $agency = Agency::where("name", $agenceName)->first();
                    if (!$agency) {
                        throw new \Exception("L'agence '$agenceName' n'existe pas dans la base.");
                    }

                    // --- VÉRIFICATION DUBLON (Nom + Agence) ---
                    $exists = Client::withTrashed()
                        ->where('name', $nom)
                        ->where('agency_id', $agency->id)
                        ->exists();

                    if ($exists) {
                        $skippedCount++;
                        continue;
                    }

                    // --- GESTION CATÉGORIE ---
                    $catName = !empty($catRaw) ? trim($catRaw) : 'client comptoir';
                    $category = ClientCategory::firstOrCreate(['name' => $catName]);

                    // --- GESTION DES VALEURS NULLES (Email / NUI) ---
                    // Important pour éviter l'erreur "Duplicate entry for key NUI" si on insère ""
                    $finalNui = !empty($nuiRaw) ? trim($nuiRaw) : null;
                    $finalEmail = !empty($emailRaw) ? trim($emailRaw) : null;
                    $finalPhone = !empty($telRaw) ? trim($telRaw) : null;

                    // --- CRÉATION DU CLIENT ---
                    Client::create([
                        'client_category_id' => $category->id,
                        'agency_id'          => $agency->id,
                        'name'               => $nom,
                        'client_type'        => $typeRaw,
                        'phone_number'       => $finalPhone,
                        'email_address'      => $finalEmail,
                        'address'            => $adresseRaw,
                        'NUI'                => $finalNui,
                        'archived'           => 0
                    ]);

                    $importedCount++;

                } catch (\Exception $e) {
                    $failedCount++;
                    $errors[] = "Ligne Excel $excelLine : " . $e->getMessage();
                }
            }

            DB::commit();

            // --- RETOUR ---
            $msg = [];
            if ($importedCount > 0) $msg[] = "$importedCount importés";
            if ($skippedCount > 0) $msg[] = "$skippedCount doublons ignorés";
            
            $finalMessage = implode(', ', $msg);

            if ($failedCount > 0) {
                return back()->with('warning', $finalMessage . ". $failedCount échecs.")->with('errors_details', $errors);
            }

            return back()->with('success', $finalMessage ?: "Aucun client importé.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', "Erreur : " . $e->getMessage());
        }
    }
    /**
     * Fonction pour exporter les clients en Excel
**/
    public function export()
    {
        // Bonne pratique : Ajouter la date et l'heure au nom du fichier
        $fileName = 'clients_ikarootech_' . Carbon::now()->format('d-m-Y_His') . '.xlsx';

        return Excel::download(new ClientsExport, $fileName);
    }
    
    
    }
