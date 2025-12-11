<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
          if(!Auth::user()){
            return redirect("/login");
        }else{
            if(Auth::user()->role->name !== "direction" && Auth::user()->role->name !== "super_administrateur"){
               
            return redirect()->route("login")->with("warning","vous n'etes pas authorize a acceder a cette ");
            }
        }
        return $next($request);
    }
}
