import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Select from 'react-select';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faWarehouse, 
    faSearch, 
    faFilter, 
    faExclamationTriangle, 
    faCheckCircle, 
    faStoreAlt,
    faChartPie,
    faTags
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../../components/ui/button/Button';

const ProductStockIndex = ({ stocks, boutiques, categories, filters }) => {
    // --- Préparation des Options pour React-Select ---
    const boutiqueOptions = boutiques.map(b => ({ value: b.id, label: b.name }));
    const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
    const serviceOptions = [
        { value: 'magasin', label: 'Magasin (Réserve)' },
        { value: 'comptoir', label: 'Comptoir (Rayon)' }
    ];
    const statusOptions = [
        { value: 'alerte', label: 'En Alerte (Critique)' },
        { value: 'rupture', label: 'En Rupture (≤ 0)' },
        { value: 'disponible', label: 'Stock Disponible' }
    ];

    // --- États pour les filtres ---
    const [search, setSearch] = useState(filters.search || '');
    const [selectedBoutique, setSelectedBoutique] = useState(boutiqueOptions.find(o => o.value == filters.boutique_id) || null);
    const [selectedService, setSelectedService] = useState(serviceOptions.find(o => o.value == filters.service) || null);
    const [selectedCategory, setSelectedCategory] = useState(categoryOptions.find(o => o.value == filters.category_id) || null);
    const [selectedStatus, setSelectedStatus] = useState(statusOptions.find(o => o.value == filters.stock_status) || null);

    // --- Gestion des filtres ---
    const handleFilter = () => {
        router.get(route('product.stocks'), { 
            search: search, 
            boutique_id: selectedBoutique?.value || '', 
            service: selectedService?.value || '',
            category_id: selectedCategory?.value || '',
            stock_status: selectedStatus?.value || '',
        }, { preserveState: true, replace: true });
    };

    // --- Styles communs pour React-Select (Dark Mode compatible) ---
    const rsClassNames = {
        control: (state) => 
            `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors text-sm min-h-[38px] ${
                state.isFocused ? 'ring-1 ring-brand-500 border-brand-500' : 'hover:border-gray-300 dark:hover:border-gray-600'
            }`,
        menu: () => 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md mt-1 z-50 text-sm',
        option: (state) => `px-3 py-2 cursor-pointer ${
            state.isSelected ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium' 
            : state.isFocused ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
            : 'text-gray-700 dark:text-gray-300'
        }`,
        singleValue: () => 'text-gray-900 dark:text-gray-100',
        placeholder: () => 'text-gray-400 dark:text-gray-500',
        input: () => 'text-gray-900 dark:text-gray-100',
    };
    const rsStyles = {
        control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
        menu: (base) => ({ ...base, backgroundColor: 'transparent' }),
        option: (base) => ({ ...base, backgroundColor: 'transparent', color: 'inherit' }),
        singleValue: (base) => ({ ...base, color: 'inherit' })
    };

    // --- Composant Jauge (Progress Bar) ---
    const StockGauge = ({ available, alert }) => {
        const percentage = alert > 0 ? (available / (alert * 2)) * 100 : 100;
        const clampedPercentage = Math.min(Math.max(percentage, 5), 100); 

        let colorClass = "bg-green-500"; 
        if (available <= 0) colorClass = "bg-red-700"; // Rupture totale
        else if (available <= alert) colorClass = "bg-red-500 animate-pulse"; // Alerte critique
        else if (available <= alert * 1.5) colorClass = "bg-orange-400"; // Stock bas

        return (
            <div className="w-full">
                <div className="flex justify-between mb-1 text-xs">
                    <span className="font-bold dark:text-gray-200">{available} en stock</span>
                    <span className="text-gray-500 dark:text-gray-400">Alerte: {alert}</span>
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
            <Head title="État des Stocks - Vision Directeur" />

            {/* --- En-tête --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faWarehouse} className="text-brand-600"/>
                        Inventaire Global des Stocks
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tableau de bord de suivi des ruptures et alertes par rayon.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase">Lignes de Stock</p>
                            <p className="text-lg font-bold text-brand-600">{stocks.total}</p>
                        </div>
                        <FontAwesomeIcon icon={faChartPie} className="text-gray-200 text-2xl" />
                    </div>
                </div>
            </div>

            {/* --- Barre de Filtres Avancée --- */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    
                    {/* Recherche */}
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rechercher</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400 text-sm z-10" />
                            <input 
                                type="text" 
                                className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm min-h-[38px] focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                                placeholder="Produit, SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>
                    </div>

                    {/* Filtre Catégorie */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rayon / Catégorie</label>
                        <Select 
                            options={categoryOptions} value={selectedCategory} onChange={setSelectedCategory}
                            isClearable placeholder="Toutes catégories" classNames={rsClassNames} styles={rsStyles}
                        />
                    </div>

                    {/* Filtre Boutique */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Boutique</label>
                        <Select 
                            options={boutiqueOptions} value={selectedBoutique} onChange={setSelectedBoutique}
                            isClearable placeholder="Toutes boutiques" classNames={rsClassNames} styles={rsStyles}
                        />
                    </div>

                    {/* Filtre Statut de Stock */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-orange-500"/> Alertes
                        </label>
                        <Select 
                            options={statusOptions} value={selectedStatus} onChange={setSelectedStatus}
                            isClearable placeholder="Tous statuts" classNames={rsClassNames} styles={rsStyles}
                        />
                    </div>

                    {/* Bouton Filtrer */}
                    <div>
                        <Button onClick={handleFilter} className="bg-brand-600 hover:bg-brand-700 text-white w-full h-[38px]">
                            <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filtrer
                        </Button>
                    </div>

                </div>
            </div>

            {/* --- Tableau des Stocks --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produit</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Localisation</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Niveau de Stock</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {stocks.data.length > 0 ? stocks.data.map((item) => {
                                const isLowStock = item.available_qty <= item.product.stock_alert;
                                const isOutOfStock = item.available_qty <= 0;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0">
                                                    {item.product.image_url ? (
                                                        <img src={`/storage/${item.product.image_url}`} className="h-full w-full object-cover rounded-lg" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faTags} className="text-gray-400 dark:text-gray-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {item.product.designation}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                                                        <span>SKU: {item.product.sku}</span>
                                                        {item.product.category && (
                                                            <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold">
                                                                {item.product.category.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faStoreAlt} className="text-gray-400 text-xs" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{item.boutique.name}</span>
                                            </div>
                                            <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold uppercase mt-1">
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
                                            {isOutOfStock ? (
                                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" /> Rupture
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                                    <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" /> Alerte
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Optimal
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Aucun stock trouvé pour ces critères.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                {stocks.links && stocks.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Affichage de <span className="font-semibold">{stocks.from}</span> à <span className="font-semibold">{stocks.to}</span> sur <span className="font-semibold">{stocks.total}</span>
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
                            {stocks.links.map((link, k) => (
                                <button
                                    key={k}
                                    onClick={() => {
                                        if (link.url) {
                                            router.get(link.url, {
                                                search: search,
                                                boutique_id: selectedBoutique?.value || '',
                                                service: selectedService?.value || '',
                                                category_id: selectedCategory?.value || '',
                                                stock_status: selectedStatus?.value || '',
                                            }, { preserveState: true });
                                        }
                                    }}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                                        link.active 
                                        ? 'bg-brand-600 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

ProductStockIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default ProductStockIndex;