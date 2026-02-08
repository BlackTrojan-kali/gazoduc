import React, { useState } from 'react';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';
import { Head } from '@inertiajs/react';

// Si Link n'est pas disponible via Inertia dans votre contexte actuel, gardez votre mock, sinon utilisez :
import { Link } from '@inertiajs/react'; 
// const Link = ({ href, className, children }) => <a href={href} className={className}>{children}</a>; // Décommentez si besoin de mocker

// Wrapper d'icône amélioré pour un style "Pro"
const IconWrapper = ({ icon, colorClass, bgClass }) => {
    const iconMap = {
        faUsers: "👥",
        faBoxOpen: "📦",
        faCalendarCheck: "📅",
        faHandHoldingUsd: "💰",
        faChartBar: "📈",
        faHandshake: "🤝",
        faClock: "⏱️",
        faWarehouse: "🏭",
    };

    return (
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgClass} ${colorClass} text-2xl transition-transform duration-300 group-hover:scale-110`}>
            {iconMap[icon] || "⭐️"}
        </div>
    );
};

const BossIndex = ({ stats, inventorySummary }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- Données par défaut ---
    const defaultStats = stats || {
        activeUsers: '0',
        completedProjects: '0',
        weeklyAppointments: '0',
        monthlyRevenue: '0F',
        growthRate: '0%',
        licenseDaysRemaining: 0, 
        totalClients: 0, 
    };

    const isLicenseCritical = defaultStats.licenseDaysRemaining > 0 && defaultStats.licenseDaysRemaining <= 30;

    const defaultInventorySummary = inventorySummary || [
        { id: 1, code: 'REF-001', name: 'Produit Alpha', stock_sum_quantity: 550, unit: 'pce' },
        { id: 2, code: 'REF-002', name: 'Composant Beta', stock_sum_quantity: 1200, unit: 'kg' },
        { id: 3, code: 'REF-003', name: 'Service Gamma', stock_sum_quantity: 80, unit: 'h' },
    ];

    // --- Filtrage ---
    const filteredInventorySummary = defaultInventorySummary.filter(article => {
        const searchLower = searchTerm.toLowerCase();
        return (
            article.code.toLowerCase().includes(searchLower) ||
            article.name.toLowerCase().includes(searchLower)
        );
    });

    // Composant Carte Statistique réutilisable pour garder le code propre
    const StatCard = ({ title, value, icon, colorClass, bgClass, subText, borderClass = "border-transparent" }) => (
        <div className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md dark:bg-gray-800 dark:ring-gray-700 ${borderClass}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {value}
                    </h3>
                    {subText && <div className="mt-2">{subText}</div>}
                </div>
                <IconWrapper icon={icon} colorClass={colorClass} bgClass={bgClass} />
            </div>
        </div>
    );

    return (
        <>
            <Head title="Tableau de Bord CEO" />

            <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors duration-500">
                <div className="mx-auto max-w-7xl p-6 lg:p-8">
                    
                    {/* --- En-tête --- */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Vue d'ensemble
                            </h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Bienvenue sur votre espace de pilotage, Monsieur.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-400">
                                ● Système Opérationnel
                            </span>
                        </div>
                    </div>

                    {/* --- Grille de Statistiques --- */}
                    <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        
                        {/* Revenus (Mise en avant) */}
                        <StatCard 
                            title="Revenus Mensuels" 
                            value={defaultStats.monthlyRevenue} 
                            icon="faHandHoldingUsd" 
                            colorClass="text-emerald-600 dark:text-emerald-400"
                            bgClass="bg-emerald-50 dark:bg-emerald-900/20"
                        />

                        {/* Clients */}
                        <StatCard 
                            title="Portefeuille Clients" 
                            value={defaultStats.totalClients.toLocaleString('fr-FR')} 
                            icon="faHandshake" 
                            colorClass="text-blue-600 dark:text-blue-400"
                            bgClass="bg-blue-50 dark:bg-blue-900/20"
                        />

                        {/* Utilisateurs Actifs */}
                        <StatCard 
                            title="Utilisateurs Actifs" 
                            value={defaultStats.activeUsers} 
                            icon="faUsers" 
                            colorClass="text-violet-600 dark:text-violet-400"
                            bgClass="bg-violet-50 dark:bg-violet-900/20"
                        />

                        {/* Licence (Avec logique d'alerte) */}
                        <div className={`group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 transition-all hover:shadow-md dark:bg-gray-800 ${isLicenseCritical ? 'ring-red-300 dark:ring-red-800' : 'ring-gray-200 dark:ring-gray-700'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Licence Logiciel</p>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <h3 className={`text-3xl font-bold tracking-tight ${isLicenseCritical ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                            {parseInt(defaultStats.licenseDaysRemaining.toLocaleString('fr-FR'),10)}
                                        </h3>
                                        <span className="text-sm font-medium text-gray-500">jours</span>
                                    </div>
                                    {isLicenseCritical && (
                                        <p className="mt-2 text-xs font-semibold text-red-600 animate-pulse">
                                            ⚠️ Renouvellement requis
                                        </p>
                                    )}
                                </div>
                                <IconWrapper 
                                    icon="faClock" 
                                    colorClass={isLicenseCritical ? 'text-red-600' : 'text-gray-400'} 
                                    bgClass={isLicenseCritical ? 'bg-red-50' : 'bg-gray-100 dark:bg-gray-700'} 
                                />
                            </div>
                            {/* Barre de progression visuelle pour la licence */}
                            <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100 dark:bg-gray-700">
                                <div 
                                    className={`h-full ${isLicenseCritical ? 'bg-red-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${Math.min(100, (defaultStats.licenseDaysRemaining / 365) * 100)}%` }}
                                ></div>
                            </div>
                        </div>

                    </div>

                    {/* --- Section Inventaire --- */}
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                        {/* Header du tableau */}
                        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="text-xl">🏭</span> Inventaire Global Consolidé
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Vue agrégée de toutes les agences.
                                </p>
                            </div>

                            {/* Barre de recherche stylisée */}
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-400">🔍</span>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Rechercher code, nom..."
                                    className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900/50 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Tableau */}
                        <div className="flow-root">
                            <div className="overflow-x-auto">
                                {filteredInventorySummary && filteredInventorySummary.length > 0 ? (
                                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <th scope="col" className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Code Ref.</th>
                                                <th scope="col" className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Désignation</th>
                                                <th scope="col" className="px-6 py-4 font-semibold text-gray-900 text-right dark:text-white">Stock Total</th>
                                                <th scope="col" className="px-6 py-4 font-semibold text-gray-900 dark:text-white">Unité</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {filteredInventorySummary.map((article) => (
                                                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                            {article.code}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                        {article.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            {article.stock_sum_quantity.toLocaleString('fr-FR')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                        {article.unit}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                                            <span className="text-2xl text-gray-400">📦</span>
                                        </div>
                                        <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Aucun résultat</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Aucun article ne correspond à "{searchTerm}".
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Footer du tableau (Pagination visuelle ou infos) */}
                        <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                             <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                                Affichage de <span className="font-medium">{filteredInventorySummary.length}</span> article(s) sur l'ensemble du réseau.
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