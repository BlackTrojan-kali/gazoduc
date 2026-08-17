import React, { useState, useMemo } from "react";
import { usePage, Head } from "@inertiajs/react";
import CEOFuelLayout from "../../layout/CEOFuelLayout/CEOFuelLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faMoneyBillWave, 
    faReceipt, 
    faBuilding, 
    faCalendarAlt, 
    faChartBar, 
    faFilter,
    faTimes 
} from "@fortawesome/free-solid-svg-icons";

// --- Composant Carte KPI ---
const StatCard = ({ title, value, icon, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-all hover:shadow-md">
        <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${bgColor} ${color} shadow-inner`}>
            <FontAwesomeIcon icon={icon} className="text-xl" />
        </div>
    </div>
);

const FuelPaymentConsolidated = () => {
    // 'report' ici est la structure groupée par mois envoyée par le contrôleur
    const { year, report } = usePage().props;

    // --- 1. ÉTATS DES FILTRES ---
    const [selectedAgency, setSelectedAgency] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    // --- 2. TRANSFORMATION DES DONNÉES (Flattening) ---
    // On transforme l'objet groupé en une liste plate pour le tableau détaillé
    const flatRecords = useMemo(() => {
        return Object.values(report).flatMap(monthGroup => 
            monthGroup.agencies_details.map(detail => ({
                ...detail,
                month_name: monthGroup.month_name,
                month_num: monthGroup.month
            }))
        );
    }, [report]);

    // Données pour les selects
    const agencies = useMemo(() => [...new Set(flatRecords.map(r => r.agency_name))].sort(), [flatRecords]);

    // --- 3. FILTRAGE ---
    const filteredRecords = useMemo(() => {
        return flatRecords.filter(r => {
            return (
                (!selectedAgency || r.agency_name === selectedAgency) &&
                (!selectedMonth || r.month_num === parseInt(selectedMonth))
            );
        });
    }, [flatRecords, selectedAgency, selectedMonth]);

    // --- 4. CALCULS DES TOTAUX ---
    const totals = useMemo(() => {
        return filteredRecords.reduce((acc, curr) => ({
            amount: acc.amount + Number(curr.total_amount),
            count: acc.count + Number(curr.count_payments)
        }), { amount: 0, count: 0 });
    }, [filteredRecords]);

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-6 lg:p-8 font-sans text-gray-900 dark:text-gray-100">
            <Head title={`Paiements Carburant ${year}`} />

            {/* --- EN-TÊTE --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-emerald-600" />
                        Versements Carburant Consolidés
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-medium">
                        Suivi des recettes directes (Pompistes/Citernes) • Exercice {year}
                    </p>
                </div>
            </div>

            {/* --- CARTES KPI --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard 
                    title="Total Recettes Encaissées" 
                    value={`${totals.amount.toLocaleString('fr-FR')} F`} 
                    icon={faMoneyBillWave} 
                    color="text-emerald-600 dark:text-emerald-400" 
                    bgColor="bg-emerald-50 dark:bg-emerald-900/20" 
                />
                <StatCard 
                    title="Volume de Transactions" 
                    value={`${totals.count.toLocaleString('fr-FR')} Versements`} 
                    icon={faReceipt} 
                    color="text-blue-600 dark:text-blue-400" 
                    bgColor="bg-blue-50 dark:bg-blue-900/20" 
                />
            </div>

            {/* --- GRAPHIQUE MENSUEAL --- */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <div className="flex items-center gap-2 mb-6">
                    <FontAwesomeIcon icon={faChartBar} className="text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-tight">Courbe mensuelle des flux</h2>
                </div>
                <div className="h-[350px] w-full">
                    {Object.values(report).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.values(report)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="month_name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#9ca3af', fontSize: 12}}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#9ca3af', fontSize: 12}}
                                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f3f4f6'}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                    formatter={(val) => [val.toLocaleString() + ' F', 'Recette Mensuelle']}
                                />
                                <Bar dataKey="total_amount" radius={[6, 6, 0, 0]}>
                                    {Object.values(report).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 italic">Données graphiques indisponibles</div>
                    )}
                </div>
            </div>

            {/* --- FILTRES --- */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase mr-4">
                    <FontAwesomeIcon icon={faFilter} />
                    Filtres
                </div>
                
                <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-emerald-500"
                >
                    <option value="">Tous les mois</option>
                    {Object.values(report).map(m => (
                        <option key={m.month} value={m.month}>{m.month_name}</option>
                    ))}
                </select>

                <select
                    value={selectedAgency}
                    onChange={e => setSelectedAgency(e.target.value)}
                    className="rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-emerald-500"
                >
                    <option value="">Toutes les agences</option>
                    {agencies.map(a => (
                        <option key={a} value={a}>{a}</option>
                    ))}
                </select>

                <button
                    onClick={() => { setSelectedAgency(''); setSelectedMonth(''); }}
                    className="ml-auto text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                    <FontAwesomeIcon icon={faTimes} /> Réinitialiser
                </button>
            </div>

            {/* --- TABLEAU DÉTAILLÉ --- */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest border-b dark:border-gray-700">
                                <th className="px-6 py-4"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2"/> Mois</th>
                                <th className="px-6 py-4"><FontAwesomeIcon icon={faBuilding} className="mr-2"/> Agence</th>
                                <th className="px-6 py-4 text-right">Transactions</th>
                                <th className="px-6 py-4 text-right">Montant Encaissé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white capitalize italic">
                                            {row.month_name}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                                            {row.agency_name}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-gray-500">
                                            {row.count_payments}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                            {Number(row.total_amount).toLocaleString('fr-FR')} F
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-gray-400 italic">Aucun versement enregistré pour cette période.</td>
                                </tr>
                            )}
                        </tbody>
                        {filteredRecords.length > 0 && (
                            <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-black border-t-2 border-gray-100 dark:border-gray-700">
                                <tr>
                                    <td colSpan="2" className="px-6 py-4 text-right uppercase text-xs tracking-widest text-gray-500">Sous-total Filtré</td>
                                    <td className="px-6 py-4 text-right font-mono">{totals.count.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-mono text-lg text-emerald-600 dark:text-emerald-400">
                                        {totals.amount.toLocaleString('fr-FR')} F
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

FuelPaymentConsolidated.layout = (page) => <CEOFuelLayout children={page} />;
export default FuelPaymentConsolidated;