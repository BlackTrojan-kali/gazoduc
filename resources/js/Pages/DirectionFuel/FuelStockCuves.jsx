import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Filter, Droplets, Warehouse, Info } from 'lucide-react';
import DirFuelLayout from '../../layout/DirFuelLayout/DirFuelLayout';

const FuelStockCuves = ({ cuves, agencies }) => {
    const [selectedAgency, setSelectedAgency] = useState('all');

    // Filtrage des cuves côté frontend
    const filteredCuves = selectedAgency === 'all' 
        ? cuves 
        : cuves.filter(cuve => cuve.agency_id.toString() === selectedAgency.toString());

    return (
        <div className="p-6">
            <Head title="Gestion des Stocks - Cuves" />

            {/* En-tête et Filtre */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">État des Cuves</h1>
                    <p className="text-sm text-gray-500">Visualisation en temps réel des stocks réels et théoriques</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <Filter size={18} className="text-gray-400" />
                    <select 
                        className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200"
                        value={selectedAgency}
                        onChange={(e) => setSelectedAgency(e.target.value)}
                    >
                        <option value="all">Toutes les agences</option>
                        {agencies.map(agency => (
                            <option key={agency.id} value={agency.id}>{agency.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grille des Cuves */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCuves.map((cuve) => {
                    // Calcul des pourcentages pour les jauges
                    const realPercent = Math.min((cuve.stock?.quantity / cuve.capacity_liter) * 100, 100) || 0;
                    const theoPercent = Math.min((cuve.stock?.theorical_quantity / cuve.capacity_liter) * 100, 100) || 0;

                    return (
                        <div key={cuve.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-5">
                                {/* Header de la Card */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                            <Droplets className="text-blue-600 dark:text-blue-400" size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white uppercase text-sm">{cuve.name}</h4>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Warehouse size={12} />
                                                <span>{cuve.agency?.name || 'Agence inconnue'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                        ID: {cuve.id}
                                    </span>
                                </div>

                                {/* Infos Capacité */}
                                <div className="grid grid-cols-2 gap-4 mb-6 py-3 border-y border-gray-50 dark:border-gray-700">
                                    <div>
                                        <p className="text-[10px] uppercase text-gray-400 font-medium">Capacité Max</p>
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{cuve.capacity_liter} L</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase text-gray-400 font-medium">Produit</p>
                                        <p className="text-sm font-bold text-blue-500">{cuve.article?.name || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Jauge Stock Réel (Bleue) */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-blue-600 font-semibold uppercase">Stock Réel</span>
                                        <span className="font-bold">{cuve.stock?.quantity} L</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-blue-500 h-3 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                            style={{ width: `${realPercent}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Jauge Stock Théorique (Violette) */}
                                <div className="mb-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-purple-600 font-semibold uppercase">Stock Théorique</span>
                                        <span className="font-bold">{cuve.stock?.theorical_quantity} L</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                                        <div 
                                            className="bg-purple-500 h-3 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                            style={{ width: `${theoPercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                {realPercent <= 10 && (
                                    <div className="mt-4 flex items-center gap-2 text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                        <Info size={14} />
                                        NIVEAU CRITIQUE : RÉAPPROVISIONNEMENT REQUIS
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredCuves.length === 0 && (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-inner border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500">Aucune cuve trouvée pour cette sélection, monsieur.</p>
                </div>
            )}
        </div>
    );
};

FuelStockCuves.layout = page => <DirFuelLayout children={page} />;
export default FuelStockCuves;