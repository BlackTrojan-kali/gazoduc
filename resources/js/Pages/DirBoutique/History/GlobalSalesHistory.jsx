import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
// IMPORT DU LAYOUT DIRECTEUR (Selon votre demande)
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout'; 
import Modal from '../../../components/Modals/Modal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faFilePdf, 
    faCalendarAlt, 
    faStore, 
    faChartLine, 
    faEye, 
    faTimes,
    faReceipt
} from '@fortawesome/free-solid-svg-icons';

const GlobalSalesHistory = ({ sales, boutiques, filters, stats }) => {
    
    // --- ÉTATS ---
    const [search, setSearch] = useState(filters.search || '');
    const [dateStart, setDateStart] = useState(filters.date_start || '');
    const [dateEnd, setDateEnd] = useState(filters.date_end || '');
    const [boutiqueId, setBoutiqueId] = useState(filters.boutique_id || '');

    // États Modale Détails
    const [selectedSale, setSelectedSale] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // --- RECHERCHE AUTOMATIQUE (Debounce) ---
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('admin.reports.sales'), { 
                search, 
                date_start: dateStart, 
                date_end: dateEnd,
                boutique_id: boutiqueId 
            }, { preserveState: true, replace: true, preserveScroll: true });
        }, 400);
        return () => clearTimeout(timer);
    }, [search, dateStart, dateEnd, boutiqueId]);

    // --- FONCTION GENERATION PDF ---
    const handleDownloadPdf = () => {
        const url = route('admin.reports.sales.pdf', {
            search,
            date_start: dateStart,
            date_end: dateEnd,
            boutique_id: boutiqueId
        });
        window.open(url, '_blank');
    };

    // --- DETAILS ---
    const openDetails = (sale) => {
        setSelectedSale(sale);
        setIsDetailOpen(true);
    };

    return (
        <>
            <Head title="Rapport Global des Ventes" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
                
                {/* --- 1. CARTES STATISTIQUES --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Chiffre d'Affaires (Sélection)</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                                {Number(stats.total_revenue).toLocaleString()} <span className="text-lg text-gray-500">FCFA</span>
                            </p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600 dark:text-blue-400">
                            <FontAwesomeIcon icon={faChartLine} size="lg" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Nombre de Ventes</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                                {stats.count}
                            </p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600 dark:text-purple-400">
                            <FontAwesomeIcon icon={faReceipt} size="lg" />
                        </div>
                    </div>
                </div>

                {/* --- 2. BARRE D'OUTILS ET FILTRES --- */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                        
                        {/* Titre */}
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <FontAwesomeIcon icon={faStore} className="text-gray-500"/>
                            Historique Global
                        </h2>

                        {/* Zone Filtres */}
                        <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
                            
                            {/* Filtre Boutique */}
                            <select
                                value={boutiqueId}
                                onChange={(e) => setBoutiqueId(e.target.value)}
                                className="border-gray-300 dark:border-gray-600 rounded-md text-sm py-2 px-3 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Toutes les boutiques</option>
                                {boutiques.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>

                            {/* Filtre Dates */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded px-2 border border-gray-200 dark:border-gray-600">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 ml-1"/>
                                <input 
                                    type="date" 
                                    value={dateStart} 
                                    onChange={(e) => setDateStart(e.target.value)}
                                    className="bg-transparent border-none text-sm focus:ring-0 dark:text-white w-32 dark:[color-scheme:dark]"
                                />
                                <span className="text-gray-400 mx-1">-</span>
                                <input 
                                    type="date" 
                                    value={dateEnd} 
                                    onChange={(e) => setDateEnd(e.target.value)}
                                    className="bg-transparent border-none text-sm focus:ring-0 dark:text-white w-32 dark:[color-scheme:dark]"
                                />
                            </div>

                            {/* Recherche */}
                            <div className="relative flex-1 xl:flex-none">
                                <input 
                                    type="text" 
                                    placeholder="Réf, Client, Vendeur..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full xl:w-48 dark:bg-gray-700 dark:text-white"
                                />
                                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400"/>
                            </div>

                            {/* --- BOUTON PDF --- */}
                            <button
                                onClick={handleDownloadPdf}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow flex items-center gap-2 text-sm font-bold transition-colors ml-auto xl:ml-0"
                            >
                                <FontAwesomeIcon icon={faFilePdf} />
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- 3. TABLEAU DES DONNEES --- */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date / Réf</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Boutique</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vendeur</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {sales.data.length > 0 ? (
                                    sales.data.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">{sale.facture_code}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(sale.created_at).toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                {sale.boutique?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {sale.user?.first_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {sale.customer?.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-white">
                                                {Number(sale.total_ttc).toLocaleString()} F
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => openDetails(sale)}
                                                    className="text-gray-400 hover:text-blue-500 transition-colors"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            Aucune vente trouvée pour ces critères.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {sales.links && sales.links.length > 3 && (
                    <div className="mt-4 flex justify-center flex-wrap gap-1">
                        {sales.links.map((link, k) => (
                            <Link
                                key={k}
                                href={link.url || '#'}
                                className={`px-3 py-1 border rounded text-sm ${
                                    link.active 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODALE DETAILS --- */}
            <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} maxWidth="lg">
                {selectedSale && (
                    <div className="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                            <h3 className="text-lg font-bold">Détails Vente : {selectedSale.facture_code}</h3>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-red-500"><FontAwesomeIcon icon={faTimes}/></button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700 text-left">
                                    <tr><th className="p-2">Produit</th><th className="p-2 text-right">Qté</th><th className="p-2 text-right">Total</th></tr>
                                </thead>
                                <tbody>
                                    {selectedSale.items.map((item, idx) => (
                                        <tr key={idx} className="border-b dark:border-gray-700">
                                            <td className="p-2">{item.product?.designation}</td>
                                            <td className="p-2 text-right">{item.qty}</td>
                                            <td className="p-2 text-right font-bold">{Number(item.sub_total).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Modal>

        </>
    );
}

// APPLICATION DU LAYOUT DIRECTEUR
GlobalSalesHistory.layout = page => <DirBoutiqueLayout children={page} />;

export default GlobalSalesHistory;