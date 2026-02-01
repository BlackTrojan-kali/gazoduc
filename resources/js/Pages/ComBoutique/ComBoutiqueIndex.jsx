import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import ComBoutiqueLayout from '../../layout/ComBoutiqueLayout/ComBoutiqueLayout';
import CommercialStockMoveModal from '../../components/Modals/Boutique_Modals/Moves/CommercialStockMoveModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faBoxOpen, 
    faArrowRightFromBracket,
    faCubes 
} from '@fortawesome/free-solid-svg-icons';

const ComBoutiqueIndex = ({ stocks, filters }) => {
    
    // --- États ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');

    // --- Gestion de la Recherche (Debounce) ---
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route("commercial.boutique.index"), // Assurez-vous que cette route existe
                { search: search },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // --- Préparation des données pour la Modale ---
    const productsForModal = useMemo(() => {
        return stocks.data.map(stockItem => ({
            ...stockItem.product, 
            stock_comptoir: stockItem.available_qty, 
            unit: stockItem.product.unit 
        }));
    }, [stocks.data]);

    return (
        <>
            <Head title="Mon Stock Commercial" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- HEADER & TITRE --- */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
                                <FontAwesomeIcon icon={faCubes} className="text-blue-600"/>
                                Stock Comptoir
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Produits disponibles pour la vente immédiate.
                            </p>
                        </div>

                        {/* --- BOUTON ACTION --- */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md flex items-center transition-all transform hover:scale-105"
                        >
                            <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2" />
                            Sortie / Perte
                        </button>
                    </div>

                    {/* --- BARRE D'OUTILS (RECHERCHE) --- */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Rechercher un produit (Nom, SKU)..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>

                    {/* --- TABLEAU DES STOCKS --- */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Référence (SKU)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantité Dispo</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">État</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {stocks.data.length > 0 ? (
                                        stocks.data.map((stock) => (
                                            <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                            <FontAwesomeIcon icon={faBoxOpen} />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {stock.product.designation}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                Catégorie: {stock.product.category?.name || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                    {stock.product.sku}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className={`text-lg font-bold ${Number(stock.available_qty) <= 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                        {Number(stock.available_qty).toLocaleString('fr-FR')}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-1">{stock.product.unit || 'U'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {Number(stock.available_qty) <= 0 ? (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                            Rupture
                                                        </span>
                                                    ) : Number(stock.available_qty) <= 5 ? (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                            Faible
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                            En Stock
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FontAwesomeIcon icon={faBoxOpen} className="text-4xl text-gray-300 mb-3" />
                                                    <p>Aucun produit trouvé dans votre stock comptoir.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* --- PAGINATION (Directe) --- */}
                        {stocks.links && stocks.links.length > 3 && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-center -mb-1 space-x-1">
                                {stocks.links.map((link, key) => (
                                    link.url === null ? (
                                        <div
                                            key={key}
                                            className="mr-1 mb-1 px-4 py-2 text-sm leading-4 text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <Link
                                            key={key}
                                            className={`mr-1 mb-1 px-4 py-2 text-sm leading-4 border rounded focus:border-indigo-500 focus:text-indigo-500 transition-colors duration-150 ${
                                                link.active
                                                    ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
                                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            href={link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODALE DE SORTIE --- */}
            <CommercialStockMoveModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                products={productsForModal} // On passe les données transformées
                routeName="commercial.stock.store" // Le nom de la route créée dans le contrôleur
            />

        </>
    );
}

// Application du Layout
ComBoutiqueIndex.layout = page => <ComBoutiqueLayout children={page} />;

export default ComBoutiqueIndex;