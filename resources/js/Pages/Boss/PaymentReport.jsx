import React, { useState, useMemo } from 'react';
import { usePage, Head } from '@inertiajs/react';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilter, 
    faTimes, 
    faMoneyBillWave, 
    faFileInvoiceDollar, 
    faChartPie, 
    faBuilding, 
    faCalendarAlt,
    faSearch,
    faExchangeAlt
} from '@fortawesome/free-solid-svg-icons';

// --- Composant Carte de Synthèse (Widget KPI) ---
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

const PaymentReport = () => {
    // On récupère 'grouped' et 'year' envoyés par le PaymentReport du CEOController
    const { grouped, year } = usePage().props;

    // --- 1. APLATISSEMENT DES DONNÉES ---
    // Le contrôleur envoie des données groupées par mois. Pour faciliter le filtrage et l'affichage
    // dans un tableau unique, on transforme l'objet 'grouped' en une liste plate.
    const allRecords = useMemo(() => {
        // On récupère les valeurs de l'objet grouped (qui est indexé par mois)
        return Object.values(grouped).flatMap(group => {
            // Pour chaque groupe mensuel, on prend les détails et on ajoute le label du mois
            return group.details.map(detail => ({
                ...detail,
                month_label: group.month_label // Ajout du nom du mois (ex: "janvier") au record
            }));
        });
    }, [grouped]);

    // --- 2. ÉTATS DES FILTRES ---
    const [filterType, setFilterType] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterAgency, setFilterAgency] = useState('');

    // --- 3. DONNÉES POUR LES SELECTS (Dropdowns) ---
    const uniqueAgencies = useMemo(() => [...new Set(allRecords.map(r => r.agency_name))].sort(), [allRecords]);
    
    // Extraction des mois uniques présents dans les données pour le filtre
    const availableMonths = useMemo(() => {
        const months = new Map();
        allRecords.forEach(r => months.set(r.month, r.month_label));
        return Array.from(months.entries()).sort((a, b) => a[0] - b[0]);
    }, [allRecords]);

    // --- 4. LOGIQUE DE FILTRAGE ---
    const filteredReport = useMemo(() => {
        return allRecords.filter(r => {
            return (
                (filterType === '' || r.type === filterType) &&
                (filterMonth === '' || r.month === parseInt(filterMonth)) &&
                (filterAgency === '' || r.agency_name === filterAgency)
            );
        });
    }, [allRecords, filterType, filterMonth, filterAgency]);

    // --- 5. CALCUL DES TOTAUX DYNAMIQUES ---
    const totals = useMemo(() => {
        return filteredReport.reduce((acc, curr) => ({
            // Note: Les champs SQL sont total_versement, total_notes, total_facture
            versements: acc.versements + (parseFloat(curr.total_versement) || 0) + (parseFloat(curr.total_notes) || 0),
            factures: acc.factures + (parseFloat(curr.total_facture) || 0),
            ecart: acc.ecart + (parseFloat(curr.ecart) || 0)
        }), { versements: 0, factures: 0, ecart: 0 });
    }, [filteredReport]);

    // Formatage monétaire (FCFA)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' F';
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 lg:p-8 font-sans text-gray-900 dark:text-gray-100">
            <Head title={`Trésorerie ${year}`} />

            {/* --- EN-TÊTE --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faExchangeAlt} className="text-brand-600" />
                        Rapport de Trésorerie
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyse comparative Encaissements vs Facturation pour <strong>{year}</strong>.
                    </p>
                </div>
                <div className="text-right hidden md:block">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        Exercice {year}
                    </span>
                </div>
            </div>

            {/* --- CARTES KPI (Mises à jour dynamiquement) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard 
                    title="Encaissements (Cash + Notes)" 
                    value={formatCurrency(totals.versements)} 
                    icon={faMoneyBillWave} 
                    color="text-emerald-600 dark:text-emerald-400" 
                    bgColor="bg-emerald-50 dark:bg-emerald-900/20" 
                />
                <SummaryCard 
                    title="Chiffre d'Affaires Facturé" 
                    value={formatCurrency(totals.factures)} 
                    icon={faFileInvoiceDollar} 
                    color="text-blue-600 dark:text-blue-400" 
                    bgColor="bg-blue-50 dark:bg-blue-900/20" 
                />
                <SummaryCard 
                    title="Écart de Trésorerie" 
                    value={(totals.ecart > 0 ? '+' : '') + formatCurrency(totals.ecart)} 
                    icon={faChartPie} 
                    color={totals.ecart >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"} 
                    bgColor={totals.ecart >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"} 
                />
            </div>

            {/* --- ZONE DE FILTRES --- */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase text-gray-500 tracking-wider">
                    <FontAwesomeIcon icon={faFilter} />
                    Filtres d'analyse
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Mois */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-sm"/>
                        </div>
                        <select
                            value={filterMonth}
                            onChange={e => setFilterMonth(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        >
                            <option value="">Toute l'année</option>
                            {availableMonths.map(([monthNum, label]) => (
                                <option key={monthNum} value={monthNum} className="capitalize">{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Agence */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faBuilding} className="text-sm"/>
                        </div>
                        <select
                            value={filterAgency}
                            onChange={e => setFilterAgency(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        >
                            <option value="">Toutes les agences</option>
                            {uniqueAgencies.map((agency, i) => (
                                <option key={i} value={agency}>{agency}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faFilter} className="text-sm"/>
                        </div>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="block w-full rounded-lg border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:ring-gray-600 dark:text-white"
                        >
                            <option value="">Tous les types</option>
                            <option value="vente">Vente</option>
                            <option value="consigne">Consigne</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={() => { setFilterType(''); setFilterMonth(''); setFilterAgency(''); }}
                        className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                        Effacer
                    </button>
                </div>
            </div>

            {/* --- TABLEAU --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Mois</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Détails (Agence / Banque)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Type</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Versements</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Notes Crédit</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Facturé</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Écart</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {filteredReport.length > 0 ? (
                                filteredReport.map((r, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        {/* Mois */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                {r.month_label}
                                            </span>
                                        </td>

                                        {/* Agence & Banque */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 dark:text-white">{r.agency_name}</span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <FontAwesomeIcon icon={faBuilding} className="text-[10px]" /> 
                                                    {r.bank_name || 'Caisse'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                r.type === 'vente' 
                                                ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400' 
                                                : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400'
                                            }`}>
                                                {r.type}
                                            </span>
                                        </td>

                                        {/* Montants */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300 font-mono">
                                            {r.total_versement > 0 ? parseFloat(r.total_versement).toLocaleString('fr-FR') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-700 dark:text-gray-300 font-mono">
                                            {r.total_notes > 0 ? parseFloat(r.total_notes).toLocaleString('fr-FR') : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-white font-mono bg-gray-50/50 dark:bg-gray-700/20">
                                            {parseFloat(r.total_facture).toLocaleString('fr-FR')}
                                        </td>

                                        {/* Écart */}
                                        <td className={`px-6 py-4 whitespace-nowrap text-right font-bold font-mono ${
                                            parseFloat(r.ecart) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                            {parseFloat(r.ecart) > 0 ? '+' : ''}{parseFloat(r.ecart).toLocaleString('fr-FR')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Aucun résultat</h3>
                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                Aucune donnée ne correspond aux filtres sélectionnés.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        
                        {/* PIED DE TABLEAU (TOTAUX FILTRÉS) */}
                        {filteredReport.length > 0 && (
                            <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold text-gray-900 dark:text-white">
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-right uppercase text-xs tracking-wider text-gray-500 dark:text-gray-300">
                                        Total Filtré
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                        {totals.versements.toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-400">-</td>
                                    <td className="px-6 py-4 text-right font-mono text-blue-600 dark:text-blue-400">
                                        {totals.factures.toLocaleString('fr-FR')}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono ${totals.ecart >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {totals.ecart > 0 ? '+' : ''}{totals.ecart.toLocaleString('fr-FR')}
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

PaymentReport.layout = page => <CEOLayout children={page} />;
export default PaymentReport;