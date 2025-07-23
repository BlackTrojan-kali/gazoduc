<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientCategory;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    //
    public function index(){
        $clients= Client::with("category")->paginate(15); 
        $clientCategories= ClientCategory::all(); 
        return inertia("Clients/Clients",compact("clients", "clientCategories"));
    }
    public function store(Request $request){
        $request->validate([
            "client_category_id"=>"required",
            "client_type"=>"required",
            "name"=>"string | required",
            "phone_number"=>"string | required",
            "email_address"=>"string | required",
            "address"=>"string | required",
            "NUI"=>"string | required",
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
}
