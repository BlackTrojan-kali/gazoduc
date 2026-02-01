import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import ComBoutiqueLayout from '../../layout/ComBoutiqueLayout/ComBoutiqueLayout';
import Modal from '../../components/Modals/Modal'; 
import GenerateHistoryModal from '../../components/Modals/Boutique_Modals/Sales/GenerateHistoryModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faEye, faPrint, faCalendarAlt, faReceipt, faTimes, faFilePdf 
} from '@fortawesome/free-solid-svg-icons';

const SalesHistory = ({ sales, filters }) => {
    
    // --- ÉTATS ---
    const [search, setSearch] = useState(filters.search || '');
    const [dateStart, setDateStart] = useState(filters.date_start || '');
    const [dateEnd, setDateEnd] = useState(filters.date_end || '');
    
    // États Modales
    const [selectedSale, setSelectedSale] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);

    // --- GESTION RECHERCHE ---
    const handleSearch = () => {
        router.get(route('sales.history'), { 
            search, 
            date_start: dateStart, 
            date_end: dateEnd 
        }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== filters.search) handleSearch();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // --- FONCTIONS ---
    const openDetails = (sale) => {
        setSelectedSale(sale);
        setIsDetailOpen(true);
    };

    const printTicket = (saleId) => {
        const url = route('sales.print', saleId);
        window.open(url, 'PRINT_TICKET', 'height=600,width=400');
    };

    return (
        <ComBoutiqueLayout>
            <Head title="Historique des Ventes" />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* --- EN-TÊTE ET FILTRES --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <FontAwesomeIcon icon={faReceipt} className="text-blue-600 dark:text-blue-400"/>
                        Historique des Ventes
                    </h2>

                    <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
                        
                        {/* BOUTON RAPPORT PDF */}
                        <button
                            onClick={() => setShowPdfModal(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <FontAwesomeIcon icon={faFilePdf} />
                            Rapport PDF
                        </button>

                        <div className="hidden md:block h-8 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

                        {/* Filtres Dates */}
                        <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 shadow-sm transition-colors">
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 dark:text-gray-500 mr-2"/>
                            <input 
                                type="date" 
                                className="border-none focus:ring-0 text-sm p-1.5 text-gray-600 dark:text-gray-300 bg-transparent outline-none dark:[color-scheme:dark]"
                                value={dateStart}
                                onChange={(e) => { setDateStart(e.target.value); handleSearch(); }}
                            />
                            <span className="text-gray-400 dark:text-gray-500 mx-1 text-sm">au</span>
                            <input 
                                type="date" 
                                className="border-none focus:ring-0 text-sm p-1.5 text-gray-600 dark:text-gray-300 bg-transparent outline-none dark:[color-scheme:dark]"
                                value={dateEnd}
                                onChange={(e) => { setDateEnd(e.target.value); handleSearch(); }}
                            />
                        </div>

                        {/* Recherche */}
                        <div className="relative flex-1 xl:flex-none">
                            <input
                                type="text"
                                placeholder="N° Facture, Client..."
                                className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full xl:w-64 text-sm shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 text-sm" />
                        </div>
                    </div>
                </div>

                {/* --- TABLEAU DES VENTES --- */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Référence</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total TTC</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paiement</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {sales.data.length > 0 ? (
                                    sales.data.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-blue-600 dark:text-blue-400 font-bold">
                                                {sale.facture_code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(sale.created_at).toLocaleString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 font-medium">
                                                {sale.customer?.name || 'Client de passage'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-white">
                                                {Number(sale.total_ttc).toLocaleString()} FCFA
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    sale.payment_mode === 'cash' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                }`}>
                                                    {sale.payment_mode === 'cash' ? 'Espèces' : 'Mobile Money'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button 
                                                    onClick={() => openDetails(sale)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4 transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button 
                                                    onClick={() => printTicket(sale.id)}
                                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                                                    title="Réimprimer ticket"
                                                >
                                                    <FontAwesomeIcon icon={faPrint} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <FontAwesomeIcon icon={faSearch} className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
                                                <p>Aucun historique de vente trouvé.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- PAGINATION --- */}
                {sales.links && sales.links.length > 3 && (
                    <div className="mt-4 flex justify-center flex-wrap gap-1">
                        {sales.links.map((link, k) => (
                            <Link
                                key={k}
                                href={link.url || '#'}
                                className={`px-3 py-1 border rounded text-sm transition-colors ${
                                    link.active 
                                    ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500' 
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODALE DÉTAILS VENTE --- */}
            <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="lg">
                {selectedSale && (
                    <div className="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Détails de la Vente</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{selectedSale.facture_code}</p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                <FontAwesomeIcon icon={faTimes} size="lg" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Infos Générales */}
                            <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold tracking-wider">Vendeur</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{selectedSale.user?.first_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold tracking-wider">Date</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(selectedSale.created_at).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Liste Produits */}
                            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-100 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Produit</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Qté</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">P.U</th>
                                            <th className="px-3 py-2 text-right font-semibold text-gray-600 dark:text-gray-300">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                        {selectedSale.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-3 py-2 text-gray-800 dark:text-gray-200">{item.product?.designation}</td>
                                                <td className="px-3 py-2 text-right font-mono text-gray-600 dark:text-gray-400">{item.qty}</td>
                                                <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{Number(item.unit_price).toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">{Number(item.sub_total).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <button 
                                onClick={() => printTicket(selectedSale.id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-sm flex items-center gap-2 font-medium"
                            >
                                <FontAwesomeIcon icon={faPrint} /> Réimprimer le ticket
                            </button>
                            <div className="text-xl font-extrabold text-gray-900 dark:text-white">
                                Total: {Number(selectedSale.total_ttc).toLocaleString()} FCFA
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- MODALE GÉNÉRATION PDF (Historique) --- */}
            <GenerateHistoryModal 
                isOpen={showPdfModal} 
                onClose={() => setShowPdfModal(false)} 
            />

        </ComBoutiqueLayout>
    );
};

export default SalesHistory;