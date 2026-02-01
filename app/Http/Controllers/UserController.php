<?php

namespace App\Http\Controllers;

use App\Models\Agency;
use App\Models\Role;
use App\Models\User;
use App\Models\Boutique;
use App\Models\Counter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Entreprise;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
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
            "modif_days"=>"required | numeric"
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
        $user->modif_days = $request->modif_days;
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
            "modif_days"=>"required | numeric"
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
        $user->modif_days = $request->modif_days;
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

        $ceos = User::where("role_id",$role->id)->where("boutique_id",null)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::with("entreprise")->get();
        $entreprises = Entreprise::all();
        }else if(Auth::user()->role->name ==="direction"){

        $ceos = User::where("role_id",$role->id)->where("boutique_id",null)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }else if(Auth::user()->role->name === "regional"){

        $ceos = User::where("role_id",$role->id)->where("boutique_id",null)->where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
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
            "modif_days"=>"required | numeric"
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
        $user->modif_days = $request->modif_days;
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
            "modif_days"=>"required | numeric"
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
        $user->modif_days = $request->modif_days;
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

        $ceos = User::where("role_id",$role->id)->where("boutique_id",null)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::with("entreprise")->get();
        $entreprises = Entreprise::all();
        }else if(Auth::user()->role->name ==="direction"){

        $ceos = User::where("role_id",$role->id)->where("boutique_id",null)->where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
        $agencies = Agency::where("entreprise_id",Auth::user()->entreprise_id)->with("entreprise")->get();
        $entreprises = Entreprise::where("id",Auth::user()->entreprise_id)->get();

        }else if(Auth::user()->role->name === "regional"){

        $ceos = User::where("role_id",$role->id)->where("boutique_id",null)->where("entreprise_id",Auth::user()->entreprise_id)->where("agency_id",Auth::user()->agency_id)->with("entreprise","agency","role")->orderBy("created_at","desc")->paginate(15);
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
            "modif_days"=>"required | numeric"
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
        $user->modif_days = $request->modif_days;
        $user->save();
        return back()->with("info","user updated succesfully");
        
    }
    public function archive_commercial($idceo){
        $ceo = User::where("id",$idceo)->first();
        $ceo->archived = !$ceo->archived;
        $ceo->save();
        return back()->with("warning","user archived successfully");
    }

    public function index_boutique(Request $request)
    {
        // 1. Chargement des utilisateurs avec toutes les relations nécessaires
        // On charge 'boutique' et 'counter' pour l'affichage
        $users = User::where('is_boutique', true)
            ->with(['role', 'agency', 'counter', 'boutique']) 
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // 2. Données pour les formulaires (Modale)
        $roles = Role::whereIn('name', ['magasin', 'commercial'])->get(['id', 'name']);
        $agencies = Agency::orderBy('name')->get(['id', 'name']);
        $boutiques = Boutique::orderBy('name')->with("counters")->get(['id', 'name',]); // Nouveau
        $counters = Counter::orderBy('name')->get(['id', 'name',"boutique_id"]);

        return Inertia::render('DirBoutique/Users/UserBoutiqueIndex', [
            'users'     => $users,
            'roles'     => $roles,
            'agencies'  => $agencies,
            'boutiques' => $boutiques,
            'counters'  => $counters,
            'filters'   => $request->only(['search']),
        ]);
    }

    /**
     * CRÉER : store_boutique
     */
   /**
     * CRÉER : store_boutique
     */
    public function store_boutique(Request $request)
    {
        $commercialRole = Role::where('name', 'commercial')->firstOrFail();
        $allowedRoles = Role::whereIn('name', ['magasin', 'commercial'])->pluck('id');
            
        $validated = $request->validate([
            'first_name'   => ['required', 'string', 'max:255'],
            'last_name'    => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'code'         => ['required', 'string', 'max:50'],
            'agency_id'    => ['nullable'], // Peut être null pour un user boutique
            'boutique_id'  => ['required', 'exists:boutiques,id'],
            'role_id'      => ['required', Rule::in($allowedRoles)],
            'password'     => ['required', 'confirmed', 'min:4'],
            
            // Règle : Si Commercial, Caisse OBLIGATOIRE
            'counter_id'   => [
                'nullable', 
                'exists:counters,id',
                function ($attribute, $value, $fail) use ($request, $commercialRole) {
                    if ((int)$request->role_id === $commercialRole->id && empty($value)) {
                        $fail('Un utilisateur "Commercial" doit obligatoirement avoir une caisse.');
                    }
                },
            ],
        ]);

        // 1. Assignation automatique de l'entreprise de l'admin connecté
        $validated['entreprise_id'] = Auth::user()->entreprise_id;

        // 2. Configuration spécifique boutique
        $validated['is_boutique'] = true;
        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->back()->with('success', 'Utilisateur boutique créé avec succès.');
    }

    /**
     * MODIFIER : update_boutique
     */
    public function update_boutique(Request $request, User $user)
    {
        $commercialRole = Role::where('name', 'commercial')->firstOrFail();
        $allowedRoles = Role::whereIn('name', ['magasin', 'commercial'])->pluck('id');

        $validated = $request->validate([
            'first_name'   => ['required', 'string', 'max:255'],
            'last_name'    => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'code'         => ['required', 'string', 'max:50'],
            'agency_id'    => ['nullable'],
            'boutique_id'  => ['required', 'exists:boutiques,id'],
            'role_id'      => ['required', Rule::in($allowedRoles)],
            
            'counter_id'   => [
                'nullable', 
                'exists:counters,id',
                function ($attribute, $value, $fail) use ($request, $commercialRole) {
                    if ((int)$request->role_id === $commercialRole->id && empty($value)) {
                        $fail('Un utilisateur "Commercial" doit obligatoirement avoir une caisse.');
                    }
                },
            ],

            'password'     => ['nullable', 'confirmed', 'min:4'],
        ]);

        // 1. On force l'entreprise (sécurité : empêche de déplacer un user vers une autre entreprise)
        $validated['entreprise_id'] = Auth::user()->entreprise_id;

        // 2. Gestion du mot de passe
        if ($request->filled('password')) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $validated['is_boutique'] = true;

        $user->update($validated);

        return redirect()->back()->with('success', 'Utilisateur mis à jour avec succès.');
    }

    /**
     * ARCHIVER : destroy_boutique
     */
    public function destroy_boutique(User $user)
    {
        if (!$user->is_boutique) {
            return redirect()->back()->with('error', 'Action non autorisée.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Utilisateur archivé avec succès.');
    }
}
