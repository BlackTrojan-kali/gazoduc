import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChartLine, 
    faMoneyBillWave, 
    faShoppingCart, 
    faExclamationTriangle,
    faFilter,
    faStore
} from '@fortawesome/free-solid-svg-icons';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import DirBoutiqueLayout from '../../layout/DirBoutiqueLayout/DirBoutiqueLayout';

// Vous pouvez remplacer par le Layout qui correspond à l'utilisateur (ex: DirBoutiqueLayout)


const StatisticsIndex = ({ isDirecteur, boutiques, filters, kpis, charts }) => {

    // --- ÉTATS DES FILTRES ---
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [selectedBoutique, setSelectedBoutique] = useState(
        filters.boutique_id 
        ? { value: filters.boutique_id, label: boutiques.find(b => b.id === filters.boutique_id)?.name || 'Sélectionné' } 
        : null
    );

    // --- OPTIONS POUR LE SELECT (Directeur Uniquement) ---
    const boutiqueOptions = boutiques ? boutiques.map(b => ({ value: b.id, label: b.name })) : [];

    // --- APPLICATION DES FILTRES ---
    const applyFilters = () => {
        router.get(route('statistics.index'), {
            start_date: startDate,
            end_date: endDate,
            boutique_id: selectedBoutique ? selectedBoutique.value : ''
        }, { preserveState: true, preserveScroll: true });
    };

    // --- HELPERS DE FORMATAGE ---
    const formatCurrency = (value) => new Intl.NumberFormat('fr-FR').format(value) + ' F';
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); // ex: "14 févr."
    };

    // Préparation des données pour Recharts (S'assurer que les chiffres sont bien des Numbers)
    const revenueData = charts.revenueByDay.map(item => ({
        date: formatDate(item.date),
        total: Number(item.total)
    }));

    const topProductsData = charts.topSellingProducts.map(item => ({
        name: item.designation.length > 20 ? item.designation.substring(0, 20) + '...' : item.designation,
        revenu: Number(item.total_revenue),
        quantite: Number(item.total_qty)
    }));

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Head title="Tableau de Bord Analytique" />

            {/* --- EN-TÊTE ET FILTRES --- */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row justify-between gap-4 items-end lg:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faChartLine} className="text-blue-600" />
                        Performances & KPI's
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyse des ventes {isDirecteur ? 'du réseau global' : 'de votre boutique'}.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3 items-end w-full lg:w-auto">
                    {/* Filtre Boutique (Réservé au Directeur) */}
                    {isDirecteur && (
                        <div className="w-full md:w-48">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                <FontAwesomeIcon icon={faStore} className="mr-1"/> Boutique
                            </label>
                            <Select 
                                options={boutiqueOptions}
                                value={selectedBoutique}
                                onChange={setSelectedBoutique}
                                placeholder="Toutes les boutiques"
                                isClearable
                                className="text-sm"
                                styles={{ control: (base) => ({ ...base, minHeight: '38px', borderRadius: '0.5rem' }) }}
                            />
                        </div>
                    )}

                    {/* Filtres de Dates */}
                    <div className="flex gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Du</label>
                            <input 
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[38px] px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Au</label>
                            <input 
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)}
                                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[38px] px-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={applyFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-[38px] rounded-lg font-bold text-sm transition-colors flex items-center shadow-md"
                    >
                        <FontAwesomeIcon icon={faFilter} className="mr-2" />
                        Filtrer
                    </button>
                </div>
            </div>

            {/* --- CARTES KPI (GRID 4 COLONNES) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* CA Total */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-blue-50 dark:text-gray-700">
                        <FontAwesomeIcon icon={faMoneyBillWave} size="6x" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Chiffre d'Affaires</p>
                        <h3 className="text-3xl font-black text-gray-800 dark:text-white">
                            {formatCurrency(kpis.totalRevenue)}
                        </h3>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-green-50 dark:text-gray-700">
                        <FontAwesomeIcon icon={faShoppingCart} size="6x" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Ventes Réalisées</p>
                        <h3 className="text-3xl font-black text-gray-800 dark:text-white">
                            {new Intl.NumberFormat('fr-FR').format(kpis.totalTransactions)}
                        </h3>
                    </div>
                </div>

                {/* Panier Moyen */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-purple-50 dark:text-gray-700">
                        <FontAwesomeIcon icon={faChartLine} size="6x" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Panier Moyen</p>
                        <h3 className="text-3xl font-black text-gray-800 dark:text-white">
                            {formatCurrency(kpis.averageOrderValue)}
                        </h3>
                    </div>
                </div>

                {/* Alertes Stock */}
                <div className={`p-6 rounded-2xl shadow-sm border relative overflow-hidden ${kpis.lowStockCount > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                    <div className={`absolute -right-6 -top-6 ${kpis.lowStockCount > 0 ? 'text-red-100 dark:text-red-900/30' : 'text-gray-50 dark:text-gray-700'}`}>
                        <FontAwesomeIcon icon={faExclamationTriangle} size="6x" />
                    </div>
                    <div className="relative z-10">
                        <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${kpis.lowStockCount > 0 ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`}>
                            Produits en Rupture
                        </p>
                        <h3 className={`text-3xl font-black ${kpis.lowStockCount > 0 ? 'text-red-700 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                            {kpis.lowStockCount} <span className="text-sm font-normal">alerte(s)</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* --- GRAPHIQUES --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Graphe Évolution CA (Prend 2/3 de l'espace) */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Évolution du Chiffre d'Affaires</h3>
                    
                    {revenueData.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                                    <Tooltip 
                                        formatter={(value) => [formatCurrency(value), "CA TTC"]}
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-400">Aucune donnée pour cette période.</div>
                    )}
                </div>

                {/* Top 5 Produits (Prend 1/3 de l'espace) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Top 5 Produits Vendeurs</h3>
                    
                    {topProductsData.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProductsData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#4b5563', fontSize: 11}} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        formatter={(value, name) => [name === 'revenu' ? formatCurrency(value) : value, name === 'revenu' ? 'Recettes' : 'Qté vendue']}
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}}/>
                                    <Bar dataKey="revenu" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} name="Chiffre d'Affaires" />
                                    {/* Décommentez la ligne ci-dessous si vous voulez aussi afficher la quantité en barre superposée */}
                                    {/* <Bar dataKey="quantite" fill="#10b981" radius={[0, 4, 4, 0]} barSize={10} name="Quantité Vendue" /> */}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 flex items-center justify-center text-gray-400">Aucune vente enregistrée.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Remplacez par le layout de votre choix
StatisticsIndex.layout = page => <DirBoutiqueLayout children={page} />;

export default StatisticsIndex;