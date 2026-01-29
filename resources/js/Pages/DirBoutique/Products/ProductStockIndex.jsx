import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faWarehouse, 
    faSearch, 
    faFilter, 
    faExclamationTriangle, 
    faCheckCircle, 
    faStoreAlt,
    faChartPie
} from '@fortawesome/free-solid-svg-icons';

const ProductStockIndex = ({ stocks, boutiques, filters }) => {
    // --- États pour les filtres ---
    const [search, setSearch] = useState(filters.search || '');
    const [boutiqueId, setBoutiqueId] = useState(filters.boutique_id || '');
    const [service, setService] = useState(filters.service || '');

    // --- Gestion des filtres ---
    const handleFilter = () => {
        router.get(route('stocks.index'), { 
            search, 
            boutique_id: boutiqueId, 
            service 
        }, { preserveState: true });
    };

    // --- Composant Jauge (Progress Bar) ---
    const StockGauge = ({ available, alert }) => {
        const percentage = alert > 0 ? (available / (alert * 2)) * 100 : 100;
        const clampedPercentage = Math.min(Math.max(percentage, 5), 100); // Minimum 5% pour la visibilité

        let colorClass = "bg-green-500"; // Stock sain
        if (available <= alert) colorClass = "bg-red-500 animate-pulse"; // Alerte critique
        else if (available <= alert * 1.5) colorClass = "bg-orange-400"; // Stock bas

        return (
            <div className="w-full">
                <div className="flex justify-between mb-1 text-xs">
                    <span className="font-medium">{available} en stock</span>
                    <span className="text-gray-400">Alerte: {alert}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${colorClass}`} 
                        style={{ width: `${clampedPercentage}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="État des Stocks" />

            {/* --- En-tête --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faWarehouse} className="text-brand-600"/>
                        Inventaire Global des Stocks
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Consultez les quantités disponibles par boutique et par service.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase">Total Articles</p>
                            <p className="text-lg font-bold text-brand-600">{stocks.total}</p>
                        </div>
                        <FontAwesomeIcon icon={faChartPie} className="text-gray-200 text-2xl" />
                    </div>
                </div>
            </div>

            {/* --- Barre de Filtres --- */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rechercher</label>
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            type="text" 
                            className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                            placeholder="Produit, SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-48">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Boutique</label>
                    <select 
                        className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                        value={boutiqueId}
                        onChange={(e) => setBoutiqueId(e.target.value)}
                    >
                        <option value="">Toutes les boutiques</option>
                        {boutiques.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div className="w-48">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Service</label>
                    <select 
                        className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                    >
                        <option value="">Tous les services</option>
                        <option value="magasin">Magasin</option>
                        <option value="comptoir">Comptoir</option>
                    </select>
                </div>

                <Button onClick={handleFilter} className="bg-brand-600 text-white h-[38px]">
                    <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filtrer
                </Button>
            </div>

            {/* --- Tableau des Stocks --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produit</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Boutique & Service</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-64">État du Stock</th>
                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {stocks.data.map((item) => {
                            const isLowStock = item.available_qty <= item.product.stock_alert;

                            return (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center mr-3">
                                                {item.product.image_url ? (
                                                    <img src={`/storage/${item.product.image_url}`} className="h-full w-full object-cover rounded" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faWarehouse} className="text-gray-300" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{item.product.designation}</div>
                                                <div className="text-xs text-gray-400">SKU: {item.product.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faStoreAlt} className="text-gray-400 text-xs" />
                                            <span className="text-sm font-medium dark:text-gray-200">{item.boutique.name}</span>
                                        </div>
                                        <div className="text-xs text-brand-600 font-semibold uppercase mt-1">
                                            {item.service}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StockGauge 
                                            available={parseFloat(item.available_qty)} 
                                            alert={item.product.stock_alert} 
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {isLowStock ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" /> Critique
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Optimal
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* --- Pagination --- */}
            <div className="flex justify-center">
                {/* Intégrez ici votre composant de pagination habituel */}
            </div>
        </div>
    );
};

ProductStockIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default ProductStockIndex;