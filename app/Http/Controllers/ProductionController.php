<?php

namespace App\Http\Controllers;

use App\Exports\ProductionHistoryExcelExport;
use App\Models\Agency;
use App\Models\Article;
use App\Models\Citerne;
use App\Models\Entreprise;
use App\Models\Mouvement;
use App\Models\ProductionHistory;
use App\Models\Stock;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class ProductionController extends Controller
{
    //
    public function index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type",Auth::user()->role->name)
        ->with("article")
        ->get();  
         $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","!=","matiere_premiere")->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
  
        return Inertia("Production/Prodindex",compact("stocks","articles","agencies"));
    }
       //
    public function citerne_index(){
        $stocks = Stock::where("agency_id",Auth::user()->agency_id)
        ->where("storage_type","gaz")->orWhere("storage_type","liquide")
        ->with("article","citerne")
        ->get();
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();
        $articles = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","matiere_premiere")->get();
        $articlesProd = Article::where("entreprise_id",Auth::user()->entreprise_id)->where("type","produit_fini")->get();
        $citernesMobiles = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->where("type","mobile")->with("entreprise","agency","article")->get();
         $citernesFixes = Citerne::where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->where("type","fixed")->with("entreprise","agency","article")->get();
        
        return Inertia("Production/ProdCiterne",compact("stocks","agencies","articles","articlesProd","citernesMobiles","citernesFixes"));
    }
    public function produce(Request $request){
        $request->validate([
            "cistern_id"=>"required",
            "article_id"=>"required",
            "quantity_produced"=>"numeric| required",
        ]);
        $stock_cit = Stock::where("citerne_id",$request->cistern_id)->with("citerne")->first();
        $stock_article = Stock::where("article_id",$request->article_id)->where("storage_type","production")->with("article")->first();
        $article = Article::where("id",$request->article_id)->first();
        $stock_depart_vide = Stock::where("article_id",$article->article_id)->where("storage_type","production")->with("article")->first();
     
    if($stock_cit->quantity > ($request->quantity_produced*$stock_article->article->weight_per_unit)  ){
        if($stock_depart_vide->quantity > $request->quantity_produced ){
             
        try{       
             DB::beginTransaction();
             $stock_depart_vide->quantity -= $request->quantity_produced;
             $stock_cit->quantity -= ($request->quantity_produced * $stock_article->article->weight_per_unit);
             $stock_article->quantity += $request->quantity_produced;
             $stock_cit->theorical_quantity = $stock_cit->quantity;
             $stock_depart_vide->save();
             $stock_cit->save();
             $stock_article->save();
             $produceMove = new ProductionHistory();
             $produceMove->source_citerne_id = $stock_cit->citerne_id;
             $produceMove->article_id = $request->article_id;
             $produceMove->quantity_produced = $request->quantity_produced;
             $produceMove->total_weight_produced =  ($request->quantity_produced * $stock_article->article->weight_per_unit);
             $produceMove->agency_id =  Auth::user()->agency_id;
             $produceMove->recorded_by_user_id = Auth::user()->id;
             $produceMove->save();
            DB::commit();
             return back()->with("success","production realisee avec success");
        }catch(Exception $e){
            DB::rollBack();
            return back("error","impossible de produire");
        }

                }else{
                    return  back()->with("error","quantite de bouteilles vides en stock insufisante");
                }
            }else{
                return back()->with("error","la quantite presente dans la citerne est insuffisante");
            }
    }

        public function prod_history(){
            $prodMoves = [];
            $articles = [];
            $agencies = [];
            $citernes = [];
            if(Auth::user()->role->name  != "direction"){
                $prodMoves = ProductionHistory::where("agency_id",Auth::user()->agency_id)->orderBy("created_at","desc")->with("citerne","article","agency","user")->paginate(15);
                $citernes = Citerne::where("agency_id",Auth::user()->agency_id)->get();
                $articles = Article::where("type","!=","matiere_premiere")->get();
                $agencies =Agency::where("id",Auth::user()->agency_id)->get();
            }    
                return Inertia("Production/ProdMoves",compact("prodMoves","articles","citernes","agencies"));
            } 

    public function delete($idProd){
        
        $prodMove = ProductionHistory::where("id",$idProd)->first();
        $stock_article =  Stock::where("article_id",$prodMove->article_id)->where("storage_type","production")->first();
        $article = Article::findOrFail($prodMove->article_id);
        $stock_depart_vide = Stock::where("article_id",$article->article_id)->where("storage_type","production")->first();
        $stock_citerne = Stock::where("citerne_id",$prodMove->source_citerne_id)->first();
        
        if($stock_article->quantity >= $prodMove->quantity_produced){
            try{
                DB::beginTransaction();
                $stock_article->quantity -= $prodMove->quantity_produced;
                $stock_article->save();
                $stock_depart_vide->quantity += $prodMove->quantity_produced;
                $stock_depart_vide->save();
                $stock_citerne->quantity += $prodMove->total_weight_produced;
                $stock_citerne->theorical_quantity = $stock_citerne->quantity;
                $stock_citerne->save();
                $prodMove->delete();
                DB::commit();
                return back()->with("warning","la production a ete supprimee");
            }catch(Exception $e){
                DB::rollBack();
                return back()->with("error","suppresion impossible veillez reessayer");
            }
        }else{
            return back()->with("error","alerte stock negative");
        }
        
    }
    

    public function export(Request $request)
    {

        $agencyId = $request->agency_id;
        $articleId = $request->article_id;
        $citerneId = $request->citerne_id;
        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $format = $request->format;
        $fileName = 'historique_productions_' . now()->format('Ymd_His');

        // Préparation de la requête pour les données (commune aux deux formats)
        $query = ProductionHistory::query()
            ->with(['agency', 'article', 'citerne', 'user']);

        if ($agencyId) {
            $query->where('agency_id', $agencyId);
        }
        if ($articleId) {
            $query->where('article_id', $articleId);
        }
        if ($citerneId) {
            $query->where('source_citerne_id', $citerneId);
        }
        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $prodMoves = $query->get(); // Récupère les données une seule fois
        if ($format === "pdf=") {
            
            // Pour Dompdf, nous passons les données directement à la vue
            $data = [
                'prodMoves' => $prodMoves,
                'filters' => [
                    'agency_id' => $agencyId,
                    'article_id' => $articleId,
                    'citerne_id' => $citerneId,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ]
            ];
            // Si vous voulez les noms des filtres dans le PDF sans faire de requêtes dans la vue
            // $data['filters']['agency_name'] = $agencyId ? Agency::find($agencyId)->name : null;
            // ... et ainsi de suite pour article et citerne

            $pdf = Pdf::loadView('PDF.ProductionPDFView', $data);

            return $pdf->download($fileName . '.pdf');

        } else { 
           return Excel::download(
                new ProductionHistoryExcelExport($agencyId, $articleId, $citerneId, $startDate, $endDate),
                $fileName . '.xlsx'
            );
        }
    }
}
