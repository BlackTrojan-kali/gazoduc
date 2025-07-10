<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Entreprise;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    //coes controllers
    public function index_ceo(){
        $role = Role::where("name","pdg")->first();
        $ceos = User::where("role_id",$role->id)->with("entreprise.agency","role")->orderBy("created_at","desc")->paginate(15);
        $roles = Role::where("name","pdg")->get();
       
        $entreprises = Entreprise::all();
        return Inertia("Ceo",compact("roles","ceos","entreprises"));
    }
    
    public function store_ceo(Request $request){
        $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|unique:users,email",
            "password" =>"required| string|min:4|confirmed",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4|unique:users,code",
            "role_id"=>"required",
            "entreprise_id"=>"required",
        ]);
       User::create([
        "first_name"=>$request->first_name,
        "last_name"=>$request->last_name,
        "email"=>$request->email,
        "password"=>Hash::make($request->password),
        "phone_number"=>$request->phone_number,
        "code"=>$request->code,
        "role_id"=>$request->role_id,
        "entreprise_id"=>$request->entreprise_id,
       ]);
       return back()->with("success","ceo created successfully");
    }
    public function update_ceo(Request $request ,$idceo){
            $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4",
            "role_id"=>"required",
            "entreprise_id"=>"required",
        ]);
        $user = User::where('id',$idceo)->first();
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->code = $request->code;
        $user->password = $user->password;
        $user->role_id = $request->role_id;
        $user->entreprise_id = $request->entreprise_id;
        $user->save();
        return back()->with("info","user updated succesfully");
        
    }
    public function archive_ceo($idceo){
        $ceo = User::where("id",$idceo)->fist();
        $ceo->archived = !$ceo->archived;
        $ceo->save();
        return back()->with("warning","user archived successfully");
    }
     //Direction controllers
    public function index_direction(){
        $role = Role::where("name","direction")->first();
        $ceos = User::where("role_id",$role->id)->with("entreprise.agency","role")->orderBy("created_at","desc")->paginate(15);
        $roles = Role::where("name","direction")->get();
        $entreprises = Entreprise::all();
        return Inertia("Direction",compact("roles","ceos","entreprises"));
    }
    
    public function store_direction(Request $request){
        $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|unique:users,email",
            "password" =>"required| string|min:4|confirmed",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4|unique:users,code",
            "role_id"=>"required",
            "entreprise_id"=>"required",
        ]);
       User::create([
        "first_name"=>$request->first_name,
        "last_name"=>$request->last_name,
        "email"=>$request->email,
        "password"=>Hash::make($request->password),
        "phone_number"=>$request->phone_number,
        "code"=>$request->code,
        "role_id"=>$request->role_id,
        "entreprise_id"=>$request->entreprise_id,
       ]);
       return back()->with("success","ceo created successfully");
    }
    public function update_direction(Request $request ,$idceo){
            $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4",
            "role_id"=>"required",
            "entreprise_id"=>"required",
        ]);
        $user = User::where('id',$idceo)->first();
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->code = $request->code;
        $user->password = $user->password;
        $user->role_id = $request->role_id;
        $user->entreprise_id = $request->entreprise_id;
        $user->save();
        return back()->with("info","user updated succesfully");
        
    }
    public function archive_direction($idceo){
        $ceo = User::where("id",$idceo)->first();
        $ceo->archived = !$ceo->archived;
        $ceo->save();
        return back()->with("warning","user archived successfully");
    }
      //Regional controllers
    public function index_regional(){
        
        $role = Role::where("name","controleur")->first();
        if(Auth::user()->role->name === "super_administrateur"){

        $ceos = User::where("role_id",$role->id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::with("entreprise")->get();
        $entreprises = Entreprise::all();
        }else if(Auth::user()->role->name ==="direction"){

        $ceos = User::where("role_id",$role->id)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }else if(Auth::user()->role->name === "regional"){

        $ceos = User::where("role_id",$role->id)->where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }
        $roles = Role::where("name","controleur")->get();
        return Inertia("Regional",compact("roles","ceos","entreprises","agencies"));
    }
    
    public function store_regional(Request $request){
        $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|unique:users,email",
            "password" =>"required| string|min:4|confirmed",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4|unique:users,code",
            "role_id"=>"required",
            "agency_id"=>"required",
            "entreprise_id"=>"required",
        ]);
       User::create([
        "first_name"=>$request->first_name,
        "last_name"=>$request->last_name,
        "email"=>$request->email,
        "agency_id"=>$request->agency_id,
        "password"=>Hash::make($request->password),
        "phone_number"=>$request->phone_number,
        "code"=>$request->code,
        "role_id"=>$request->role_id,
        "entreprise_id"=>$request->entreprise_id,
       ]);
       return back()->with("success","ceo created successfully");
    }
    public function update_regional(Request $request ,$idceo){
            $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|",
            "agency_id"=>"required",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4",
            "role_id"=>"required",
            "entreprise_id"=>"required",
        ]);
        $user = User::where('id',$idceo)->first();
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->code = $request->code;
        $user->password = $user->password;
        $user->role_id = $request->role_id;
        $user->agency_id =$request->agency_id;
        $user->entreprise_id = $request->entreprise_id;
        $user->save();
        return back()->with("info","user updated succesfully");
        
    }
    public function archive_regional($idceo){
        $ceo = User::where("id",$idceo)->first();
        $ceo->archived = !$ceo->archived;
        $ceo->save();
        return back()->with("warning","user archived successfully");
    }
 
       //Magasin controllers
    public function index_magasin(){
        $role = Role::where("name","magasin")->first();
         if(Auth::user()->role->name === "super_administrateur"){

        $ceos = User::where("role_id",$role->id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::with("entreprise")->get();
        $entreprises = Entreprise::all();
        }else if(Auth::user()->role->name ==="direction"){

        $ceos = User::where("role_id",$role->id)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }else if(Auth::user()->role->name === "regional"){

        $ceos = User::where("role_id",$role->id)->where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        } $roles = Role::where("name","magasin")->get();
        return Inertia("Magasin",compact("roles","ceos","entreprises","agencies"));
    }
    
    public function store_magasin(Request $request){
        $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|unique:users,email",
            "password" =>"required| string|min:4|confirmed",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4|unique:users,code",
            "role_id"=>"required",
            "agency_id"=>"required",
            "entreprise_id"=>"required",
        ]);
       User::create([
        "first_name"=>$request->first_name,
        "last_name"=>$request->last_name,
        "email"=>$request->email,
        "agency_id"=>$request->agency_id,
        "password"=>Hash::make($request->password),
        "phone_number"=>$request->phone_number,
        "code"=>$request->code,
        "role_id"=>$request->role_id,
        "entreprise_id"=>$request->entreprise_id,
       ]);
       return back()->with("success","ceo created successfully");
    }
    public function update_magasin(Request $request ,$idceo){
            $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|",
            "agency_id"=>"required",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4",
            "role_id"=>"required",
            "entreprise_id"=>"required",
        ]);
        $user = User::where('id',$idceo)->first();
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->code = $request->code;
        $user->password = $user->password;
        $user->role_id = $request->role_id;
        $user->agency_id =$request->agency_id;
        $user->entreprise_id = $request->entreprise_id;
        $user->save();
        return back()->with("info","user updated succesfully");
        
    }
    public function archive_magasin($idceo){
        $ceo = User::where("id",$idceo)->first();
        $ceo->archived = !$ceo->archived;
        $ceo->save();
        return back()->with("warning","user archived successfully");
    }

           //Production controllers
    public function index_production(){
        $role = Role::where("name","production")->first();
         if(Auth::user()->role->name === "super_administrateur"){

        $ceos = User::where("role_id",$role->id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::with("entreprise")->get();
        $entreprises = Entreprise::all();
        }else if(Auth::user()->role->name ==="direction"){

        $ceos = User::where("role_id",$role->id)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }else if(Auth::user()->role->name === "regional"){

        $ceos = User::where("role_id",$role->id)->where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }
        $roles = Role::where("name","production")->get();
        return Inertia("Production",compact("roles","ceos","entreprises","agencies"));
    }
    
    public function store_production(Request $request){
        $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|unique:users,email",
            "password" =>"required| string|min:4|confirmed",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4|unique:users,code",
            "role_id"=>"required",
            "agency_id"=>"required",
            "entreprise_id"=>"required",
        ]);
       User::create([
        "first_name"=>$request->first_name,
        "last_name"=>$request->last_name,
        "email"=>$request->email,
        "agency_id"=>$request->agency_id,
        "password"=>Hash::make($request->password),
        "phone_number"=>$request->phone_number,
        "code"=>$request->code,
        "role_id"=>$request->role_id,
        "entreprise_id"=>$request->entreprise_id,
       ]);
       return back()->with("success","ceo created successfully");
    }
    public function update_production(Request $request ,$idceo){
            $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|",
            "agency_id"=>"required",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4",
            "role_id"=>"required",
            "entreprise_id"=>"required",
        ]);
        $user = User::where('id',$idceo)->first();
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->code = $request->code;
        $user->password = $user->password;
        $user->role_id = $request->role_id;
        $user->agency_id =$request->agency_id;
        $user->entreprise_id = $request->entreprise_id;
        $user->save();
        return back()->with("info","user updated succesfully");
        
    }
    public function archive_production($idceo){
        $ceo = User::where("id",$idceo)->first();
        $ceo->archived = !$ceo->archived;
        $ceo->save();
        return back()->with("warning","user archived successfully");
    }


        //Commercial controllers
    public function index_commercial(){
        $role = Role::where("name","commercial")->first();
        if(Auth::user()->role->name === "super_administrateur"){

        $ceos = User::where("role_id",$role->id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::with("entreprise")->get();
        $entreprises = Entreprise::all();
        }else if(Auth::user()->role->name ==="direction"){

        $ceos = User::where("role_id",$role->id)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }else if(Auth::user()->role->name === "regional"){

        $ceos = User::where("role_id",$role->id)->where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("id",Auth::user()->agency_id)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }
         $roles = Role::where("name","commercial")->get();
        return Inertia("Commercial",compact("roles","ceos","entreprises","agencies"));
    }
    
    public function store_commercial(Request $request){
        $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|unique:users,email",
            "password" =>"required| string|min:4|confirmed",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4|unique:users,code",
            "role_id"=>"required",
            "agency_id"=>"required",
            "entreprise_id"=>"required",
        ]);
       User::create([
        "first_name"=>$request->first_name,
        "last_name"=>$request->last_name,
        "email"=>$request->email,
        "agency_id"=>$request->agency_id,
        "password"=>Hash::make($request->password),
        "phone_number"=>$request->phone_number,
        "code"=>$request->code,
        "role_id"=>$request->role_id,
        "entreprise_id"=>$request->entreprise_id,
       ]);
       return back()->with("success","ceo created successfully");
    }
    public function update_commercial(Request $request ,$idceo){
            $request->validate([
            "first_name" =>"required| string|min:2",
            "last_name" =>"nullable| string|min:2",
            "email" =>"required| string|min:2|",
            "agency_id"=>"required",
            "phone_number" =>"nullable|string |min:2",
            "code"=>"required|string|min:4",
            "role_id"=>"required",
            "entreprise_id"=>"required",
        ]);
        $user = User::where('id',$idceo)->first();
        $user->first_name = $request->first_name;
        $user->last_name = $request->last_name;
        $user->email = $request->email;
        $user->phone_number = $request->phone_number;
        $user->code = $request->code;
        $user->password = $user->password;
        $user->role_id = $request->role_id;
        $user->agency_id =$request->agency_id;
        $user->entreprise_id = $request->entreprise_id;
        $user->save();
        return back()->with("info","user updated succesfully");
        
    }
    public function archive_commercial($idceo){
        $ceo = User::where("id",$idceo)->first();
        $ceo->archived = !$ceo->archived;
        $ceo->save();
        return back()->with("warning","user archived successfully");
    }
}
