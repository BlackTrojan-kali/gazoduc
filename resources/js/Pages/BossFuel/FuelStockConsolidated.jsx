import React, { useState, useMemo } from 'react';
import { usePage, Head } from '@inertiajs/react';
import CEOFuelLayout from '../../layout/CEOFuelLayout/CEOFuelLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilter, 
    faTimes, 
    faWarehouse, 
    faCheckCircle, 
    faExclamationTriangle, 
    faSearch,
    faBuilding,
    faGasPump
} from '@fortawesome/free-solid-svg-icons';

// --- Composant Carte KPI ---
const SummaryCard = ({ title, value, subValue, icon, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColor} ${color} shadow-sm`}>
            <FontAwesomeIcon icon={icon} className="text-lg" />
        </div>
    </div>
);

const FuelStockConsolidated = () => {
    const { report } = usePage().props;

    // --- 1. ÉTATS DES FILTRES ---
    const [selectedAgency, setSelectedAgency] = useState('');
    const [selectedArticle, setSelectedArticle] = useState('');
    const [search, setSearch] = useState('');

    // --- 2. LISTES UNIQUES POUR LES SELECTS ---
    const agencies = useMemo(() => [...new Set(report.map(r => r.agency_name))].sort(), [report]);
    const articles = useMemo(() => [...new Set(report.map(r => r.article_name))].sort(), [report]);

    // --- 3. FILTRAGE ---
    const filteredReport = useMemo(() => {
        return report.filter(row => {
            const matchesSearch = !search || 
                row.agency_name.toLowerCase().includes(search.toLowerCase()) || 
                row.article_name.toLowerCase().includes(search.toLowerCase());

            return (
                (!selectedAgency || row.agency_name === selectedAgency) &&
                (!selectedArticle || row.article_name === selectedArticle) &&
                matchesSearch
            );
        });
    }, [report, selectedAgency, selectedArticle, search]);

    // --- 4. CALCUL DES TOTAUX ---
    const totals = useMemo(() => {
        const t = filteredReport.reduce((acc, r) => ({
            real: acc.real + Number(r.total_quantity),
            theo: acc.theo + Number(r.total_theorical_quantity),
            gap: acc.gap + (Number(r.total_quantity) - Number(r.total_theorical_quantity))
        }), { real: 0, theo: 0, gap: 0 });
        
        return t;
    }, [filteredReport]);

    // Fonction pour formater les nombres (avec 2 décimales si nécessaire pour le carburant)
    const fmt = (num) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 lg:p-8 font-sans text-gray-900 dark:text-gray-100">
            <Head title="Stock Carburant Global" />

            {/* --- EN-TÊTE --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faWarehouse} className="text-indigo-600" />
                        Stock Carburant Consolidé
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Surveillance des niveaux de cuves et analyse des écarts (Coulage).
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                        Données en temps réel
                    </span>
                </div>
            </div>

            {/* --- CARTES KPI --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard 
                    title="Stock Physique (Réel)" 
                    value={`${fmt(totals.real)} L`}
                    subValue="Volume total mesuré en cuve"
                    icon={faCheckCircle} 
                    color="text-emerald-600 dark:text-emerald-400" 
                    bgColor="bg-emerald-50 dark:bg-emerald-900/20" 
                />
                <SummaryCard 
                    title="Stock Théorique" 
                    value={`${fmt(totals.theo)} L`} 
                    subValue="Basé sur les entrées/sorties"
                    icon={faGasPump} 
                    color="text-blue-600 dark:text-blue-400" 
                    bgColor="bg-blue-50 dark:bg-blue-900/20" 
                />
                <SummaryCard 
                    title="Écart Global (Coulage)" 
                    value={`${totals.gap > 0 ? '+' : ''}${fmt(totals.gap)} L`}
                    subValue="Différence Réel vs Théorique" 
                    icon={faExclamationTriangle} 
                    color={totals.gap < 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"} 
                    bgColor={totals.gap < 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-800"} 
                />
            </div>

            {/* --- BARRE DE FILTRES --- */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-gray-500 tracking-wider">
                    <FontAwesomeIcon icon={faFilter} />
                    Filtres
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Recherche */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faSearch} className="text-sm"/>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher agence, produit..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Agence */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faBuilding} className="text-sm"/>
                        </div>
                        <select
                            value={selectedAgency}
                            onChange={e => setSelectedAgency(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        >
                            <option value="">Toutes les agences</option>
                            {agencies.map((agency, i) => (
                                <option key={i} value={agency}>{agency}</option>
                            ))}
                        </select>
                    </div>

                    {/* Article */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faGasPump} className="text-sm"/>
                        </div>
                        <select
                            value={selectedArticle}
                            onChange={e => setSelectedArticle(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        >
                            <option value="">Tous les produits</option>
                            {articles.map((article, i) => (
                                <option key={i} value={article}>{article}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={() => { setSelectedAgency(''); setSelectedArticle(''); setSearch(''); }}
                        className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                        Effacer
                    </button>
                </div>
            </div>

            {/* --- TABLEAU --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Agence</th>
                                <th className="px-6 py-4">Produit</th>
                                <th className="px-6 py-4 text-right">Stock Réel</th>
                                <th className="px-6 py-4 text-right">Stock Théorique</th>
                                <th className="px-6 py-4 text-right">Écart</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredReport.length > 0 ? (
                                filteredReport.map((row, i) => {
                                    // Calcul de l'écart
                                    const gap = Number(row.total_quantity) - Number(row.total_theorical_quantity);
                                    // Seuil d'alerte (par exemple -10 litres)
                                    const isCritical = gap < -10; 

                                    return (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {row.agency_name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                    {row.article_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                                                {fmt(row.total_quantity)} L
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-gray-500 dark:text-gray-400">
                                                {fmt(row.total_theorical_quantity)} L
                                            </td>
                                            <td className={`px-6 py-4 text-right font-mono font-bold ${gap < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                <div className="flex items-center justify-end gap-2">
                                                    {isCritical && <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs animate-pulse" />}
                                                    <span>{gap > 0 ? '+' : ''}{fmt(gap)} L</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                            </div>
                                            <p>Aucune donnée de stock trouvée.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        
                        {/* PIED DE TABLEAU */}
                        {filteredReport.length > 0 && (
                            <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white">
                                <tr>
                                    <td colSpan="2" className="px-6 py-4 text-right uppercase text-xs tracking-wider text-gray-500 dark:text-gray-300">
                                        Totaux Filtrés
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        {fmt(totals.real)} L
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-gray-500 dark:text-gray-400">
                                        {fmt(totals.theo)} L
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono ${totals.gap < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {totals.gap > 0 ? '+' : ''}{fmt(totals.gap)} L
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

FuelStockConsolidated.layout = (page) => <CEOFuelLayout children={page} />;
export default FuelStockConsolidated;