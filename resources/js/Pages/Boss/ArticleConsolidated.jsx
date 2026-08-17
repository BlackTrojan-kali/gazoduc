import React, { useState, useMemo } from 'react';
import { usePage, Head } from '@inertiajs/react';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilter, 
    faTimes, 
    faBoxOpen, 
    faLayerGroup, 
    faBuilding, 
    faCalendarAlt,
    faSearch,
    faTag,
    faShoppingCart
} from '@fortawesome/free-solid-svg-icons';

// --- Composant Carte KPI ---
const SummaryCard = ({ title, value, icon, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColor} ${color} shadow-sm`}>
            <FontAwesomeIcon icon={icon} className="text-lg" />
        </div>
    </div>
);

const ArticleConsolidated = () => {
    const { year, grouped } = usePage().props;

    // --- 1. APLATISSEMENT DES DONNÉES (Grouped -> Flat) ---
    const allRecords = useMemo(() => {
        // Transformation de la structure { 1: { details: [...] }, 2: ... } en tableau plat
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
    const [selectedType, setSelectedType] = useState('');
    const [search, setSearch] = useState('');

    // --- 3. LISTES UNIQUES POUR LES SELECTS ---
    const monthsAvailable = useMemo(() => {
        const m = new Map();
        allRecords.forEach(r => m.set(r.month, r.month_label));
        return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
    }, [allRecords]);

    const agencies = useMemo(() => [...new Set(allRecords.map(r => r.agency_name))].sort(), [allRecords]);
    const types = useMemo(() => [...new Set(allRecords.map(r => r.invoice_type))], [allRecords]);

    // --- 4. FILTRAGE ---
    const filteredData = useMemo(() => {
        return allRecords.filter(r => {
            const matchesSearch = !search || 
                r.article_name.toLowerCase().includes(search.toLowerCase()) || 
                (r.article_code && r.article_code.toLowerCase().includes(search.toLowerCase()));

            return (
                (!selectedMonth || r.month === parseInt(selectedMonth)) &&
                (!selectedAgency || r.agency_name === selectedAgency) &&
                (!selectedType || r.invoice_type === selectedType) &&
                matchesSearch
            );
        });
    }, [allRecords, selectedMonth, selectedAgency, selectedType, search]);

    // --- 5. CALCUL DES TOTAUX ---
    const totals = useMemo(() => {
        return {
            quantity: filteredData.reduce((acc, curr) => acc + Number(curr.total_quantity), 0),
            uniqueArticles: new Set(filteredData.map(d => d.article_name)).size
        };
    }, [filteredData]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 lg:p-8 font-sans text-gray-900 dark:text-gray-100">
            <Head title={`Articles vendus ${year}`} />

            {/* --- EN-TÊTE --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-brand-600" />
                        Rapport des Ventes Articles
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Consolidation des volumes de vente par article pour l'exercice <strong>{year}</strong>.
                    </p>
                </div>
                <div className="hidden md:block">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {allRecords.length} lignes traitées
                    </span>
                </div>
            </div>

            {/* --- CARTES KPI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <SummaryCard 
                    title="Volume Total (Qté)" 
                    value={totals.quantity.toLocaleString('fr-FR')} 
                    icon={faBoxOpen} 
                    color="text-blue-600 dark:text-blue-400" 
                    bgColor="bg-blue-50 dark:bg-blue-900/20" 
                />
                <SummaryCard 
                    title="Articles Uniques Vendus" 
                    value={totals.uniqueArticles} 
                    icon={faTag} 
                    color="text-violet-600 dark:text-violet-400" 
                    bgColor="bg-violet-50 dark:bg-violet-900/20" 
                />
            </div>

            {/* --- BARRE DE FILTRES --- */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-gray-500 tracking-wider">
                    <FontAwesomeIcon icon={faFilter} />
                    Filtrer les données
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Recherche Texte */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faSearch} className="text-sm" />
                        </div>
                        <input
                            type="text"
                            placeholder="Code ou Nom Article..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Mois */}
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="block w-full rounded-lg border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                    >
                        <option value="">Tous les mois</option>
                        {monthsAvailable.map(([val, label]) => (
                            <option key={val} value={val} className="capitalize">{label}</option>
                        ))}
                    </select>

                    {/* Agence */}
                    <select
                        value={selectedAgency}
                        onChange={e => setSelectedAgency(e.target.value)}
                        className="block w-full rounded-lg border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                    >
                        <option value="">Toutes les agences</option>
                        {agencies.map((a, i) => (
                            <option key={i} value={a}>{a}</option>
                        ))}
                    </select>

                    {/* Type */}
                    <select
                        value={selectedType}
                        onChange={e => setSelectedType(e.target.value)}
                        className="block w-full rounded-lg border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white capitalize"
                    >
                        <option value="">Tous les types</option>
                        {types.map((t, i) => (
                            <option key={i} value={t}>{t}</option>
                        ))}
                    </select>

                    {/* Reset */}
                    <button
                        onClick={() => { setSelectedMonth(''); setSelectedAgency(''); setSelectedType(''); setSearch(''); }}
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
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Article</th>
                                <th className="px-6 py-4 text-right">Qté Vendue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredData.length > 0 ? (
                                filteredData.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap capitalize font-medium text-gray-900 dark:text-white">
                                            {row.month_label}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faBuilding} className="text-gray-400 text-xs"/>
                                                {row.agency_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                                                row.invoice_type === 'vente' 
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {row.invoice_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{row.article_name}</div>
                                            {row.article_code && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                                                    {row.article_code}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold font-mono text-gray-900 dark:text-white">
                                            {Number(row.total_quantity).toLocaleString('fr-FR')}
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
                                            <p>Aucun article trouvé pour ces critères.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        
                        {/* PIED DE TABLEAU */}
                        {filteredData.length > 0 && (
                            <tfoot className="bg-gray-50 dark:bg-gray-800 font-bold text-gray-900 dark:text-white">
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-right uppercase text-xs tracking-wider text-gray-500 dark:text-gray-300">
                                        Total Quantité
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-blue-600 dark:text-blue-400 text-lg">
                                        {totals.quantity.toLocaleString('fr-FR')}
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

ArticleConsolidated.layout = page => <CEOLayout children={page} />;
export default ArticleConsolidated;