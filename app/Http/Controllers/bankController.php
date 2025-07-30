<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use Illuminate\Http\Request;

class bankController extends Controller
{
    //
    public function index(){
        $banks = Bank::paginate(15);
        return inertia("Direction/Banks",compact("banks"));        
    }
    public function store(Request $request){
        $request->validate([
            "name"=>"required | string |unique:banks,name",
            "account_number"=>"nullable |string",
        ]);
        $bank = new Bank();
        $bank->name = $request->name;
        $bank->account_number = $request->account_number;
        $bank->save();
        return back()->with("success","bank created successfully");
    }

    public function update(Request $request,$idBank){
        $request->validate([
            "name"=>"required | string ",
            "account_number"=>"nullable |string",
        ]);
        $bank =  Bank::findOrFail($idBank);
        $bank->name = $request->name;
        $bank->account_number = $request->account_number;
        $bank->save();
        return back()->with("info","bank updated successfully");
    }
    public function archive($idBank){
        $bank =  Bank::findOrFail($idBank);
        $bank->archived = !$bank->archived;
        $bank->save();
        return back()->with("info","bank updated successfully");
    }
}
