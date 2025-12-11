<?php

namespace App\Http\Middleware;

use App\Models\Licence;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $entreId = $request->user()->entreprise_id ?? 0;
        $sub = Subscription::where("entreprise_id",$entreId)->with("licence")->first();
        $licence = $sub->licence->name ?? "";
        return [
            ...parent::share($request),
            
         
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'first_name' => $request->user()->first_name,
                    'last_name' => $request->user()->last_name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role->name ?? null, 
                    "agency"=>$request->user()->agency ?? null,
                    "entreprice"=>$request->user()->entreprise ?? null,
                    "modif_days"=>$request->user()->modif_days,
                    "notifications" => $request->user()->unreadNotifications()->latest()->limit(20)->get(),
                    "licence"=>$licence
                ] : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'info' => fn () => $request->session()->get('info'),
                'warning' => fn () => $request->session()->get('warning'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
