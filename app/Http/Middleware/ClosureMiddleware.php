<?php

namespace App\Http\Middleware;

use App\Models\Closure as ModelsClosure;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ClosureMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if(Auth::user()->role->name != "direction" && Auth::user()->role->name != "pdg" && Auth::user()->role->name != "administrateur" && Auth::user()->role->name != "super_administrateur"){
            
            $closure = ModelsClosure::where("agency_id",Auth::user()->agency_id)->first();
         // dd($closure);
            if($closure){
            if(Carbon::parse($closure->ending_date)->lessThan(Carbon::now())){
            return redirect()->route("login")->with("warning","periode de cloture de compte terminee");
            }
        }
    }
        return $next($request);
    }
}
