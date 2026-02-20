import React, { useState, useMemo } from 'react';
// Assurez-vous que le chemin est bon selon votre structure
import { Head, Link } from '@inertiajs/react';
import TrackingMap from '@/Components/TrackingMap'; // Votre composant carte
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSatellite, 
    faSearch, 
    faTruck, 
    faGasPump, 
    faTachometerAlt, 
    faExclamationTriangle,
    faWifi,
    faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import DirLayout from '../../layout/DirLayout/DirLayout';

const Dashboard = ({ fleet, recentAlerts }) => {
    // --- États ---
    const [selectedTruckId, setSelectedTruckId] = useState(null);
    const [filterName, setFilterName] = useState('');

    // --- Filtrage de la liste (Recherche) ---
    const filteredFleet = useMemo(() => {
        if (!filterName) return fleet;
        return fleet.filter(truck => 
            truck.name.toLowerCase().includes(filterName.toLowerCase()) || 
            (truck.position && truck.position.speed.toString().includes(filterName))
        );
    }, [fleet, filterName]);

    return (
        <>
            <Head title="Tableau de Bord - Tracking" />
            
            {/* Conteneur Principal (Pleine hauteur pour la carte) */}
            <div className="h-[calc(100vh-theme(spacing.16))] bg-slate-50 dark:bg-slate-900 relative p-4 lg:p-6 flex flex-col overflow-hidden">
                
                {/* Fond texturé (Identique à Citernes) */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* En-tête Flottant */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-indigo-200 shadow-lg">
                                <FontAwesomeIcon icon={faSatellite} />
                            </span>
                            Suivi de Flotte Temps Réel
                        </h1>
                    </div>

                    {/* Stats Rapides */}
                    <div className="flex gap-4 text-xs font-medium">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {fleet.filter(v => v.status === 'MOVING').length} En route
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-800">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            {fleet.reduce((acc, v) => acc + v.alerts_count, 0)} Alertes
                        </div>
                    </div>
                </div>

                {/* Contenu Principal (Split View) */}
                <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden relative z-10">
                    
                    {/* COLONNE GAUCHE : LISTE & FILTRES */}
                    <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                        
                        {/* Barre de Recherche */}
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative group">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher un véhicule..." 
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Liste Scrollable */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                            {filteredFleet.map((truck) => {
                                // Calcul sécurisé
                                const fuelPercentage = truck.tank_capacity > 0 
                                    ? (truck.fuel_level / truck.tank_capacity) * 100 
                                    : 0;
                                const safeWidth = Math.min(Math.max(fuelPercentage, 0), 100);
                                const isSelected = selectedTruckId === truck.id;

                                return (
                                    <div 
                                        key={truck.id} 
                                        onClick={() => setSelectedTruckId(truck.id)}
                                        className={`p-3 border rounded-xl cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                                            isSelected
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-500'
                                        }`}
                                    >
                                        {/* Status Dot */}
                                        <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
                                            truck.status === 'MOVING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                            truck.status === 'OFFLINE' ? 'bg-slate-400' : 'bg-amber-500'
                                        }`}></div>

                                        {/* Info Véhicule */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 ${isSelected ? 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/50' : ''}`}>
                                                <FontAwesomeIcon icon={faTruck} size="sm" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{truck.name}</h3>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faWifi} className="scale-75" />
                                                    {truck.position?.updated_at || 'Jamais'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Métriques */}
                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            {/* Carburant */}
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                                <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                                                    <span className="flex items-center gap-1"><FontAwesomeIcon icon={faGasPump} /> Fuel</span>
                                                    <span className="font-bold text-slate-700 dark:text-slate-200">{Math.round(truck.fuel_level)}L</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                                                    <div 
                                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                                            safeWidth < 15 ? 'bg-red-500' : safeWidth < 40 ? 'bg-amber-400' : 'bg-emerald-500'
                                                        }`} 
                                                        style={{ width: `${safeWidth}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Vitesse */}
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center">
                                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faTachometerAlt} /> Vitesse
                                                </span>
                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    {Math.round(truck.position?.speed || 0)} <span className="text-[9px] font-normal text-slate-400">km/h</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Alerte Badge (Si actif) */}
                                        {truck.alerts_count > 0 && (
                                            <div className="mt-2 text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded border border-red-100 dark:border-red-800 flex items-center gap-1 font-bold animate-pulse">
                                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                                {truck.alerts_count} Anomalie(s) détectée(s)
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            
                            {filteredFleet.length === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    <p className="text-sm">Aucun véhicule trouvé</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLONNE DROITE : CARTE INTERACTIVE */}
                    <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner relative z-0">
                        <TrackingMap vehicles={fleet} />
                        
                        {/* Overlay Légende Flottant */}
                        <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur text-xs p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                            <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Légende</h4>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-slate-600 dark:text-slate-400">En déplacement</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Moteur à l'arrêt</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                    <span className="text-slate-600 dark:text-slate-400">Hors ligne (-10min)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                                    <span className="text-red-600 dark:text-red-400 font-bold">Alerte Critique</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

// Application du Layout
Dashboard.layout = page => <DirLayout children={page} />;

export default Dashboard;