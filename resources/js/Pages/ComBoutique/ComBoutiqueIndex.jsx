import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import ComBoutiqueLayout from '../../layout/ComBoutiqueLayout/ComBoutiqueLayout';
import CommercialStockMoveModal from '../../components/Modals/Boutique_Modals/Moves/CommercialStockMoveModal';
import CreateSaleModal from '../../components/Modals/Boutique_Modals/Sales/CreateSaleModal'; 
import CreatePaymentModal from '../../components/Modals/Boutique_Modals/Payments/CreatePaymentModal'; 
import OpenSessionModal from '../../components/Modals/Boutique_Modals/Sales/OpenSessionModal'; // Modale d'ouverture de caisse

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faBoxOpen, 
    faArrowRightFromBracket,
    faCubes,
    faCashRegister,
    faHandHoldingDollar,
    faMoneyBillWave,
    faChartLine,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

// Ajout de "activeSession" dans les props
const ComBoutiqueIndex = ({ stocks, filters, customers = [], userCounterId, stats, salesToAssociate = [], activeSession }) => {
    // --- États ---
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isOpenSessionModalOpen, setIsOpenSessionModalOpen] = useState(false); // État pour la modale d'ouverture
    const [search, setSearch] = useState(filters.search || '');

    // --- Logique du Seuil de Versement ---
    const isTransferDue = (stats?.unassociated_total || 0) >= (stats?.transfer_point || 0) && (stats?.unassociated_total > 0);

    // --- Gestion de la Recherche (Debounce) ---
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route(route().current()), 
                { search: search },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // --- Préparation des données pour la Modale de SORTIE ---
    const productsForMoveModal = useMemo(() => {
        return stocks.data.map(stockItem => ({
            ...stockItem.product, 
            stock_comptoir: Number(stockItem.available_qty) || 0,
            unit: stockItem.product.unit 
        }));
    }, [stocks.data]);

    // --- Préparation des données pour la Modale de VENTE ---
    const productsForSaleModal = useMemo(() => {
        return stocks.data.map(stockItem => ({
            id: stockItem.product.id,
            designation: stockItem.product.designation,
            sku: stockItem.product.sku,
            barcode: stockItem.product.barcode,
            prix_vente: stockItem.product.prix_vente, 
            tva: stockItem.product.tva, 
            image_url: stockItem.product.image_url,
            stock_comptoir: Number(stockItem.available_qty) || 0,
            unit: stockItem.product.unit
        }));
    }, [stocks.data]);

    // Helper pour les images
    const getImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('/') ? url : `/storage/${url}`;
    };

    return (
        <>
            <Head title="Caisse & Stock Comptoir" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- SECTION STATISTIQUES & ALERTES --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Carte 1 : Ventes du Jour */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ventes du Jour</p>
                                <p className="text-2xl font-extrabold text-gray-800 dark:text-white mt-1">
                                    {Number(stats?.total_sales_today || 0).toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <FontAwesomeIcon icon={faChartLine} />
                            </div>
                        </div>

                        {/* Carte 2 : En Attente de Versement */}
                        <div className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 flex items-center justify-between transition-colors ${
                            isTransferDue ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-orange-400'
                        }`}>
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                    En Attente de Versement
                                    {isTransferDue && <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 animate-pulse ml-1"/>}
                                </p>
                                <p className={`text-2xl font-extrabold mt-1 ${isTransferDue ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                                    {Number(stats?.unassociated_total || 0).toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
                                </p>
                            </div>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                isTransferDue ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                                <FontAwesomeIcon icon={faHandHoldingDollar} />
                            </div>
                        </div>

                        {/* Carte 3 : Point de Transfert (Info) */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-gray-300 dark:border-gray-600 flex items-center justify-between opacity-80">
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Seuil de Versement</p>
                                <p className="text-2xl font-extrabold text-gray-600 dark:text-gray-300 mt-1">
                                    {Number(stats?.transfer_point || 0).toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                            </div>
                        </div>
                    </div>

                    {/* --- HEADER & ACTIONS --- */}
                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
                                <FontAwesomeIcon icon={faCubes} className="text-blue-600"/>
                                Stock Comptoir (Caisse)
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Gestion du stock et point de vente.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            
                            {/* BOUTON NOUVEAU VERSEMENT */}
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                disabled={!isTransferDue}
                                className={`px-5 py-2.5 rounded-lg font-bold shadow-md flex items-center transition-all transform ${
                                    isTransferDue 
                                    ? 'bg-red-600 hover:bg-red-700 text-white hover:scale-105 animate-bounce-slow' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                }`}
                                title={!isTransferDue ? `Le montant en attente est inférieur au seuil (${stats?.transfer_point})` : "Effectuer un versement maintenant"}
                            >
                                <FontAwesomeIcon icon={faHandHoldingDollar} className="mr-2" />
                                Faire un Versement
                            </button>

                            <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 mx-2 hidden md:block"></div>

                            {/* BOUTON VENTE (POS) AVEC VERIFICATION DE SESSION */}
                            {userCounterId ? (
                                activeSession ? (
                                    // SI LA CAISSE EST OUVERTE : On permet la vente
                                    <button
                                        onClick={() => setIsSaleModalOpen(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md flex items-center transition-all transform hover:scale-105"
                                    >
                                        <FontAwesomeIcon icon={faCashRegister} className="mr-2" />
                                        Nouvelle Vente
                                    </button>
                                ) : (
                                    // SI LA CAISSE EST FERMÉE : On force l'ouverture
                                    <button
                                        onClick={() => setIsOpenSessionModalOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md flex items-center transition-all animate-pulse hover:scale-105"
                                    >
                                        <FontAwesomeIcon icon={faCashRegister} className="mr-2" />
                                        Ouvrir ma Caisse
                                    </button>
                                )
                            ) : (
                                <div className="text-xs text-red-500 font-bold bg-red-100 px-3 py-2 rounded border border-red-200 flex items-center">
                                    ⚠️ Caisse non assignée
                                </div>
                            )}

                            {/* Bouton SORTIE / PERTE */}
                            <button
                                onClick={() => setIsMoveModalOpen(true)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md flex items-center transition-all transform hover:scale-105"
                            >
                                <FontAwesomeIcon icon={faArrowRightFromBracket} className="mr-2" />
                                Sortie / Perte
                            </button>
                        </div>
                    </div>

                    {/* --- BARRE D'OUTILS (RECHERCHE) --- */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="relative w-full md:w-96">
                            <input
                                type="text"
                                placeholder="Rechercher un produit (Nom, SKU, Barcode)..."
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ref (SKU)</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix Vente</th>
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
                                                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
                                                            {stock.product.image_url ? (
                                                                <img src={getImageUrl(stock.product.image_url)} alt={stock.product.designation} className="h-full w-full object-cover"/>
                                                            ) : (
                                                                <FontAwesomeIcon icon={faBoxOpen} />
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {stock.product.designation}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                Cat: {stock.product.category?.name || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                    {stock.product.sku || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    {Number(stock.product.prix_vente).toLocaleString('fr-FR')} FCFA
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
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
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

                        {/* --- PAGINATION --- */}
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

            {/* --- MODALES --- */}
            <CommercialStockMoveModal 
                isOpen={isMoveModalOpen}
                onClose={() => setIsMoveModalOpen(false)}
                products={productsForMoveModal}
                routeName="commercial.stock.store"
            />

            <CreateSaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                products={productsForSaleModal}
                customers={customers}
                userCounterId={userCounterId}
            />

            <CreatePaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                salesToAssociate={salesToAssociate} 
                counterId={userCounterId}
            />
            
            {/* Modale d'Ouverture de Caisse */}
            <OpenSessionModal
                isOpen={isOpenSessionModalOpen}
                onClose={() => setIsOpenSessionModalOpen(false)}
            />
        </>
    );
}

ComBoutiqueIndex.layout = page => <ComBoutiqueLayout children={page} />;

export default ComBoutiqueIndex;