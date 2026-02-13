import React from 'react';
import RegLayout from '../../layout/RegLayout/RegLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faIndustry, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

// Composant de Jauge Circulaire Simplifié (Intégré pour éviter les dépendances externes manquantes)
const CircularGauge = ({ value, max, label, color }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const strokeDasharray = `${percentage}, 100`;
    
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    {/* Fond du cercle */}
                    <path
                        className="text-gray-200 dark:text-gray-700"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    {/* Cercle de progression */}
                    <path
                        className={`${color} transition-all duration-1000 ease-out`}
                        strokeDasharray={strokeDasharray}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {Math.round(percentage)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {value.toLocaleString()} / {max.toLocaleString()}
                    </span>
                </div>
            </div>
            <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
        </div>
    );
};

const RegCiterne = ({ stocks }) => {
    return (
        <RegLayout>
            <Head title="Stocks Citernes Régionaux" />
            
            <div className="p-6 space-y-6">
                
                {/* En-tête */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            État des Citernes Régionales
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Surveillance des niveaux de gaz vrac (Théorique vs Réel)
                        </p>
                    </div>
                </div>

                {/* Grille des Citernes */}
                {stocks && stocks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {stocks.map((stock) => {
                            const citerne = stock.citerne || {};
                            const capacity = citerne.capacity_liters || 30000; // Valeur par défaut si nulle
                            const reel = stock.quantity || 0;
                            const theo = stock.theorical_quantity || 0;
                            const diff = reel - theo;
                            
                            // Couleur de l'écart
                            let statusColor = "text-green-500";
                            let statusIcon = faCheckCircle;
                            let statusText = "Conforme";

                            if (Math.abs(diff) > (capacity * 0.05)) { // Alerte si > 5% écart
                                statusColor = "text-red-500";
                                statusIcon = faExclamationTriangle;
                                statusText = "Écart Critique";
                            } else if (Math.abs(diff) > 0) {
                                statusColor = "text-yellow-500";
                                statusIcon = faExclamationTriangle;
                                statusText = "Léger Écart";
                            }

                            return (
                                <div key={stock.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                                    
                                    {/* Header Carte */}
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-700/30">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                                                <FontAwesomeIcon icon={faIndustry} className="text-xl" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    {citerne.name || 'Citerne Inconnue'}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {stock.agency?.name || 'Agence Inconnue'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-opacity-10 ${statusColor.replace('text-', 'bg-')} ${statusColor}`}>
                                            <FontAwesomeIcon icon={statusIcon} />
                                            {statusText}
                                        </div>
                                    </div>

                                    {/* Corps Carte (Jauges) */}
                                    <div className="p-6">
                                        <div className="flex justify-around items-center mb-6">
                                            {/* Jauge Réelle */}
                                            <CircularGauge 
                                                value={reel} 
                                                max={capacity} 
                                                label="Niveau Réel (Sonde)" 
                                                color="text-blue-500" 
                                            />
                                            
                                            {/* Séparateur */}
                                            <div className="h-16 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                                            {/* Données Théoriques */}
                                            <div className="flex flex-col gap-4 text-center">
                                                <div>
                                                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Théorique</span>
                                                    <span className="text-lg font-bold text-gray-700 dark:text-gray-200">
                                                        {theo.toLocaleString()} <span className="text-xs font-normal">kg</span>
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Écart</span>
                                                    <span className={`text-lg font-bold ${diff < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                        {diff > 0 ? '+' : ''}{diff.toLocaleString()} <span className="text-xs font-normal">kg</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Info */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                                            <span>Capacité Max:</span>
                                            <span className="font-semibold">{capacity.toLocaleString()} kg</span>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <FontAwesomeIcon icon={faDatabase} className="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune donnée disponible</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Les stocks citernes n'ont pas encore été initialisés.</p>
                    </div>
                )}
            </div>
        </RegLayout>
    );
};

export default RegCiterne;