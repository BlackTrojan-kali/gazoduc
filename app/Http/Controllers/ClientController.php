<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientController extends Controller
{
    //
    public function index(){
        $clients= Client::with("category")->paginate(100); 
        $clientCategories= ClientCategory::all(); 
        return inertia("Clients/Clients",compact("clients", "clientCategories"));
    }
    public function store(Request $request){
        $request->validate([
            "client_category_id"=>"required",
            "client_type"=>"required",
            "name"=>"string | required",
            "phone_number"=>"string |nullable",
            "email_address"=>"string  |nullable",
            "address"=>"string  |nullable",
            "NUI"=>"string  |nullable",
        ]);

        $client = new Client();
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

    public function update(Request $request,$idCli){
        $request->validate([
            "client_category_id"=>"required",
            "client_type"=>"required",
            "name"=>"string | required",
            "phone_number"=>"string | required",
            "email_address"=>"string | required",
            "address"=>"string | required",
            "NUI"=>"string | required",
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
        // 1. Validation de la requête pour s'assurer qu'un fichier est présent et valide.
        $request->validate([
            'import_file' => 'required|mimes:csv,txt|max:2048', // Accepte les fichiers .csv et .txt jusqu'à 2 Mo
        ]);

        $file = $request->file('import_file');
        $filePath = $file->getRealPath();

        // 2. Initialisation des compteurs et du gestionnaire de fichier.
        $importedCount = 0;
        $restoredCount = 0; // Nouveau compteur pour les clients restaurés
        $failedCount = 0;
        $errors = [];

        // 3. Définition de la transaction pour garantir l'atomicité de l'opération.
        DB::beginTransaction();

        try {
            if (($handle = fopen($filePath, 'r')) !== false) {
                // Lecture des en-têtes (première ligne)
                $headers = fgetcsv($handle, 1000, ',');

                // Nettoyage des en-têtes (supprime les espaces superflus et les caractères invisibles)
                $headers = array_map('trim', $headers);

                // Vérification des en-têtes attendus
                $expectedHeaders = ["Nom", "Type de Client", "Catégorie", "Téléphone", "Email", "Adresse", "NUI"];
                if (array_diff($expectedHeaders, $headers) || array_diff($headers, $expectedHeaders)) {
                    throw new \Exception("Les en-têtes du fichier CSV ne correspondent pas au format attendu. En-têtes attendus : " . implode(", ", $expectedHeaders) . ". En-têtes trouvés : " . implode(", ", $headers));
                }

                // Variable pour suivre le numéro de ligne pour les messages d'erreur
                $lineNumber = 1; // Commence à 1 pour les en-têtes

                // Boucle sur chaque ligne du fichier CSV
                while (($data = fgetcsv($handle, 1000, ',')) !== false) {
                    $lineNumber++; // Incrémente le numéro de ligne pour la ligne de données actuelle
                    
                    // Assurez-vous que le nombre de colonnes correspond aux en-têtes
                    if (count($headers) !== count($data)) {
                        $errors[] = "Erreur à la ligne {$lineNumber}: Le nombre de colonnes ne correspond pas aux en-têtes. Ligne ignorée.";
                        $failedCount++;
                        continue;
                    }

                    $row = array_combine($headers, $data);

                    try {
                        // Nettoyage des données de la ligne
                        foreach ($row as $key => $value) {
                            $row[$key] = trim($value);
                        }

                        // Validation minimale des champs clés pour l'identification
                        if (empty($row['Email']) && empty($row['NUI'])) {
                            throw new \Exception("L'adresse e-mail ou le NUI est requis pour identifier ou créer un client.");
                        }

                        // 4. Trouver ou créer la catégorie de client
                        $categoryName = $row['Catégorie'];
                        if (empty($categoryName)) {
                            // Si la catégorie est vide, vous pouvez choisir de la définir à 'Général' ou ignorer/échouer la ligne
                            $categoryName = 'Général'; // Exemple : assigner une catégorie par défaut
                            // Ou lancer une exception si une catégorie est obligatoire:
                            // throw new \Exception("Le nom de la catégorie ne peut pas être vide.");
                        }
                        $clientCategory = ClientCategory::firstOrCreate(['name' => $categoryName]);

                        // 5. Rechercher le client (actif ou soft-deleted) par Email ou NUI
                        $client = Client::withTrashed() // Inclut les clients soft-deleted
                                        ->where(function($query) use ($row) {
                                            if (!empty($row['Email'])) {
                                                $query->orWhere('email_address', $row['Email']);
                                            }
                                            if (!empty($row['NUI'])) {
                                                $query->orWhere('NUI', $row['NUI']);
                                            }
                                        })
                                        ->first();

                        if ($client) {
                            // Si le client existe et est soft-deleted, le restaurer
                            if ($client->trashed()) {
                                $client->restore();
                                $restoredCount++;
                                $statusMessage = "restauré et mis à jour";
                            } else {
                                $statusMessage = "mis à jour";
                            }
                            // Mettre à jour les informations du client existant
                            $client->client_category_id = $clientCategory->id;
                            $client->client_type = $row['Type de Client'];
                            $client->name = $row['Nom'];
                            $client->phone_number = $row['Téléphone'];
                            $client->email_address = $row['Email'];
                            $client->address= $row['Adresse'];
                            $client->NUI = $row['NUI'];
                            $client->save();
                        } else {
                            // Si le client n'existe pas, en créer un nouveau
                            $client = new Client();
                            $client->client_category_id = $clientCategory->id;
                            $client->client_type = $row['Type de Client'];
                            $client->name = $row['Nom'];
                            $client->phone_number = $row['Téléphone'];
                            $client->email_address = $row['Email'];
                            $client->address= $row['Adresse'];
                            $client->NUI = $row['NUI'];
                            $client->save();
                            $importedCount++;
                            $statusMessage = "importé";
                        }

                    } catch (\Exception $e) {
                        // En cas d'erreur sur une ligne, on la logue et on continue
                        $failedCount++;
                        $errors[] = "Erreur à la ligne {$lineNumber}: " . $e->getMessage();
                        continue;
                    }
                }
                fclose($handle);
            }

            // Si aucune erreur majeure, on valide la transaction
            DB::commit();

            // 6. Envoi de la réponse de succès ou de succès partiel
            $messageParts = [];
            if ($importedCount > 0) {
                $messageParts[] = "$importedCount clients créés";
            }
            if ($restoredCount > 0) {
                $messageParts[] = "$restoredCount clients restaurés";
            }
            if ($failedCount > 0) {
                $messageParts[] = "$failedCount échecs";
            }

            $finalMessage = implode(', ', $messageParts) ?: "Aucune opération d'importation ou de restauration effectuée.";

            if ($failedCount > 0) {
                return back()->with('error', $finalMessage . " Détails: " . implode(" | ", $errors));
            }

            return back()->with('success', $finalMessage);

        } catch (\Exception $e) {
            // En cas d'erreur fatale, on annule la transaction
            DB::rollBack();
            return back()->with('error', "Une erreur fatale est survenue lors de l'importation: " . $e->getMessage());
        }
    }
}
