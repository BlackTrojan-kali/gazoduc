import React, { useState } from 'react';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faBoxOpen, 
    faCalendarCheck, 
    faHandHoldingUsd, 
    faChartLine, 
    faHandshake, 
    faClock, 
    faWarehouse, 
    faSearch, 
    faExclamationTriangle,
    faFileInvoiceDollar
} from '@fortawesome/free-solid-svg-icons';

// Mapping des chaînes vers les objets d'icônes réels
const iconList = {
    faUsers: faUsers,
    faBoxOpen: faBoxOpen,
    faCalendarCheck: faCalendarCheck,
    faHandHoldingUsd: faHandHoldingUsd,
    faChartBar: faChartLine, // Préférence pour ChartLine souvent plus esthétique
    faHandshake: faHandshake,
    faClock: faClock,
    faWarehouse: faWarehouse,
    faFileInvoiceDollar: faFileInvoiceDollar
};

// --- Composants UI Réutilisables ---

const IconWrapper = ({ iconName, colorClass, bgClass }) => {
    const iconObj = iconList[iconName] || faBoxOpen; // Fallback icon

    return (
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgClass} ${colorClass} transition-all duration-300 group-hover:scale-110 shadow-sm`}>
            <FontAwesomeIcon icon={iconObj} className="text-xl" />
        </div>
    );
};

const StatCard = ({ title, value, icon, colorClass, bgClass, subText, isCritical = false }) => (
    <div className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-gray-700 ${isCritical ? 'ring-red-200 dark:ring-red-900/50' : 'ring-gray-200'}`}>
        <div className="flex justify-between items-start">
            <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[10px]">{title}</p>
                <h3 className={`mt-2 text-2xl font-bold tracking-tight ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {value}
                </h3>
                {subText && <div className="mt-1">{subText}</div>}
            </div>
            <IconWrapper iconName={icon} colorClass={colorClass} bgClass={bgClass} />
        </div>
        
        {/* Effet décoratif subtil en arrière-plan */}
        <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-gray-50 dark:bg-gray-700/50 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
    </div>
);

// --- Composant Principal ---

const BossIndex = ({ stats, inventorySummary }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- Données par défaut ---
    const defaultStats = stats || {
        activeUsers: '0',
        completedProjects: '0',
        weeklyAppointments: '0',
        monthlyRevenue: '0 F',
        growthRate: '0%',
        licenseDaysRemaining: 0, 
        totalClients: 0, 
    };

    const isLicenseCritical = defaultStats.licenseDaysRemaining > 0 && defaultStats.licenseDaysRemaining <= 30;

    const defaultInventorySummary = inventorySummary || [];

    // --- Filtrage ---
    const filteredInventorySummary = defaultInventorySummary.filter(article => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (article.code?.toLowerCase() || '').includes(searchLower) ||
            (article.name?.toLowerCase() || '').includes(searchLower)
        );
    });

    return (
        <>
            <Head title="Tableau de Bord CEO" />

            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
                <div className="mx-auto max-w-7xl p-6 lg:p-8 space-y-8">
                    
                    {/* --- En-tête --- */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Vue d'ensemble
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Bienvenue sur votre espace de pilotage, Monsieur.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Système Opérationnel
                            </span>
                        </div>
                    </div>

                    {/* --- Grille de Statistiques --- */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        
                        {/* Revenus */}
                        <StatCard 
                            title="Revenus Mensuels" 
                            value={defaultStats.monthlyRevenue} 
                            icon="faHandHoldingUsd" 
                            colorClass="text-emerald-600 dark:text-emerald-400"
                            bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                            subText={
                                <span className={`text-xs font-medium ${defaultStats.growthRate.includes('+') ? 'text-emerald-600' : 'text-gray-500'}`}>
                                   {defaultStats.growthRate !== '0%' && (
                                       <>
                                        <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                                        {defaultStats.growthRate} vs m-1
                                       </>
                                   )}
                                </span>
                            }
                        />

                        {/* Clients */}
                        <StatCard 
                            title="Portefeuille Clients" 
                            value={defaultStats.totalClients.toLocaleString('fr-FR')} 
                            icon="faHandshake" 
                            colorClass="text-blue-600 dark:text-blue-400"
                            bgClass="bg-blue-50 dark:bg-blue-900/20"
                        />

                        {/* Factures / Projets */}
                        <StatCard 
                            title="Factures Traitées" 
                            value={defaultStats.completedProjects} 
                            icon="faFileInvoiceDollar" 
                            colorClass="text-violet-600 dark:text-violet-400"
                            bgClass="bg-violet-50 dark:bg-violet-900/20"
                        />

                        {/* Licence */}
                        <div className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 transition-all hover:shadow-md dark:bg-gray-800 ${isLicenseCritical ? 'ring-red-300 dark:ring-red-900/50 bg-red-50/30' : 'ring-gray-200 dark:ring-gray-700'}`}>
                            <div className="flex justify-between items-start">
                                <div className="relative z-10">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide text-[10px]">Licence Logiciel</p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <h3 className={`text-2xl font-bold tracking-tight ${isLicenseCritical ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                            {parseInt(defaultStats.licenseDaysRemaining, 10).toLocaleString('fr-FR')}
                                        </h3>
                                        <span className="text-sm font-medium text-gray-500">jours</span>
                                    </div>
                                    {isLicenseCritical && (
                                        <p className="mt-2 text-xs font-semibold text-red-600 animate-pulse flex items-center gap-1">
                                            <FontAwesomeIcon icon={faExclamationTriangle} /> Renouvellement requis
                                        </p>
                                    )}
                                </div>
                                <IconWrapper 
                                    iconName="faClock" 
                                    colorClass={isLicenseCritical ? 'text-red-600' : 'text-gray-400'} 
                                    bgClass={isLicenseCritical ? 'bg-white' : 'bg-gray-100 dark:bg-gray-700'} 
                                />
                            </div>
                            {/* Barre de progression */}
                            <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gray-100 dark:bg-gray-700">
                                <div 
                                    className={`h-full transition-all duration-1000 ${isLicenseCritical ? 'bg-red-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${Math.min(100, (defaultStats.licenseDaysRemaining / 365) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                    </div>

                    {/* --- Section Inventaire --- */}
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 overflow-hidden">
                        
                        {/* Header du tableau */}
                        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                                    <FontAwesomeIcon icon={faWarehouse} className="text-gray-400" />
                                    Inventaire Global Consolidé
                                </h3>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Vue agrégée du stock sur l'ensemble du réseau.
                                </p>
                            </div>

                            {/* Barre de recherche */}
                            <div className="relative w-full sm:w-72">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Rechercher (Code, Nom)..."
                                    className="block w-full rounded-lg border-0 py-2 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Tableau */}
                        <div className="overflow-x-auto">
                            {filteredInventorySummary && filteredInventorySummary.length > 0 ? (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-300">Code Ref.</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-300">Désignation</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-300">Stock Total</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-300">Unité</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {filteredInventorySummary.map((article) => (
                                            <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600">
                                                        {article.code}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{article.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {article.stock_sum_quantity.toLocaleString('fr-FR')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {article.unit}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800 mb-3">
                                        <FontAwesomeIcon icon={faBoxOpen} className="text-3xl text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Aucun résultat trouvé</h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Essayez de modifier votre terme de recherche "{searchTerm}".
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer du tableau */}
                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                             <p className="text-xs text-gray-500 dark:text-gray-400">
                                Affichage de <span className="font-medium text-gray-900 dark:text-white">{filteredInventorySummary.length}</span> article(s).
                             </p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

BossIndex.layout = page => <CEOLayout children={page} />;
export default BossIndex;