import React, { useState, useMemo } from 'react';
import { usePage, Head } from '@inertiajs/react';
import CEOFuelLayout from '../../layout/CEOFuelLayout/CEOFuelLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilter, 
    faTimes, 
    faGasPump, 
    faTint, 
    faBuilding, 
    faCalendarAlt,
    faSearch,
    faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';

// --- Composant Carte KPI ---
const SummaryCard = ({ title, value, unit, icon, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                {unit && <span className="text-sm font-medium text-gray-400">{unit}</span>}
            </div>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColor} ${color} shadow-sm`}>
            <FontAwesomeIcon icon={icon} className="text-lg" />
        </div>
    </div>
);

const FuelConsolidated = () => {
    const { year, grouped } = usePage().props;

    // --- 1. APLATISSEMENT DES DONNÉES (Structure plate pour filtrage) ---
    const allRecords = useMemo(() => {
        // Transformation : Grouped { Month: { details: [...] } } => Flat Array
        return Object.values(grouped).flatMap(group => 
            group.details.map(detail => ({
                ...detail,
                month_label: group.month_name
            }))
        );
    }, [grouped]);

    // --- 2. ÉTATS DES FILTRES ---
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('');
    const [selectedArticle, setSelectedArticle] = useState('');

    // --- 3. LISTES UNIQUES POUR LES SELECTS ---
    const monthsAvailable = useMemo(() => {
        const m = new Map();
        allRecords.forEach(r => m.set(r.month, r.month_label));
        return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
    }, [allRecords]);

    const agencies = useMemo(() => [...new Set(allRecords.map(r => r.agency_name))].sort(), [allRecords]);
    const articles = useMemo(() => [...new Set(allRecords.map(r => r.article_name))].sort(), [allRecords]);

    // --- 4. FILTRAGE ---
    const filteredReport = useMemo(() => {
        return allRecords.filter(row => {
            return (
                (!selectedMonth || row.month === parseInt(selectedMonth)) &&
                (!selectedAgency || row.agency_name === selectedAgency) &&
                (!selectedArticle || row.article_name === selectedArticle)
            );
        });
    }, [allRecords, selectedMonth, selectedAgency, selectedArticle]);

    // --- 5. CALCUL DES TOTAUX ---
    const totals = useMemo(() => {
        return filteredReport.reduce((acc, r) => ({
            quantity: acc.quantity + Number(r.total_quantity),
            revenue: acc.revenue + Number(r.total_revenue),
        }), { quantity: 0, revenue: 0 });
    }, [filteredReport]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 lg:p-8 font-sans text-gray-900 dark:text-gray-100">
            <Head title={`Ventes Carburant ${year}`} />

            {/* --- EN-TÊTE --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faGasPump} className="text-orange-600" />
                        Rapport Carburant Consolidé
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyse des volumes et revenus carburant pour l'exercice <strong>{year}</strong>.
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">
                        {allRecords.length} lignes de vente
                    </span>
                </div>
            </div>

            {/* --- CARTES KPI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <SummaryCard 
                    title="Volume Total Vendu" 
                    value={totals.quantity.toLocaleString('fr-FR')} 
                    unit="Litres"
                    icon={faTint} 
                    color="text-blue-600 dark:text-blue-400" 
                    bgColor="bg-blue-50 dark:bg-blue-900/20" 
                />
                <SummaryCard 
                    title="Chiffre d'Affaires Global" 
                    value={totals.revenue.toLocaleString('fr-FR')} 
                    unit="FCFA"
                    icon={faMoneyBillWave} 
                    color="text-emerald-600 dark:text-emerald-400" 
                    bgColor="bg-emerald-50 dark:bg-emerald-900/20" 
                />
            </div>

            {/* --- BARRE DE FILTRES --- */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-gray-500 tracking-wider">
                    <FontAwesomeIcon icon={faFilter} />
                    Filtres
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Mois */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-sm"/>
                        </div>
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        >
                            <option value="">Tous les mois</option>
                            {monthsAvailable.map(([val, label]) => (
                                <option key={val} value={val} className="capitalize">{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Agence */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faBuilding} className="text-sm"/>
                        </div>
                        <select
                            value={selectedAgency}
                            onChange={e => setSelectedAgency(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
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
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        >
                            <option value="">Tous les produits</option>
                            {articles.map((article, i) => (
                                <option key={i} value={article}>{article}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset */}
                    <button
                        onClick={() => { setSelectedMonth(''); setSelectedAgency(''); setSelectedArticle(''); }}
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
                                <th className="px-6 py-4">Mois</th>
                                <th className="px-6 py-4">Agence</th>
                                <th className="px-6 py-4">Produit</th>
                                <th className="px-6 py-4 text-right">Volume (L)</th>
                                <th className="px-6 py-4 text-right">Revenus (FCFA)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredReport.length > 0 ? (
                                filteredReport.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap capitalize font-medium text-gray-900 dark:text-white">
                                            {row.month_label}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            {row.agency_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10 dark:bg-orange-900/30 dark:text-orange-400">
                                                {row.article_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-blue-600 dark:text-blue-400 font-medium">
                                            {Number(row.total_quantity).toLocaleString('fr-FR')} L
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                                            {Number(row.total_revenue).toLocaleString('fr-FR')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                            </div>
                                            <p>Aucune vente de carburant trouvée.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        
                        {/* PIED DE TABLEAU (TOTAUX) */}
                        {filteredReport.length > 0 && (
                            <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white">
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-right uppercase text-xs tracking-wider text-gray-500 dark:text-gray-300">
                                        Totaux Filtrés
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-blue-600 dark:text-blue-400">
                                        {totals.quantity.toLocaleString('fr-FR')} L
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                        {totals.revenue.toLocaleString('fr-FR')} FCFA
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

FuelConsolidated.layout = (page) => <CEOFuelLayout children={page} />;
export default FuelConsolidated;