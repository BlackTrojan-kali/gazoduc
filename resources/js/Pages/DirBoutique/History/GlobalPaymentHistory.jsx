import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
// IMPORT DU LAYOUT DIRECTEUR
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import Modal from '../../../components/Modals/Modal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faFilePdf, 
    faCalendarAlt, 
    faStore, 
    faMoneyBillWave, 
    faEye, 
    faTimes,
    faReceipt
} from '@fortawesome/free-solid-svg-icons';

const GlobalPaymentHistory = ({ payments, boutiques, filters, stats }) => {
    
    // --- ÉTATS ---
    const [search, setSearch] = useState(filters.search || '');
    const [dateStart, setDateStart] = useState(filters.date_start || '');
    const [dateEnd, setDateEnd] = useState(filters.date_end || '');
    const [boutiqueId, setBoutiqueId] = useState(filters.boutique_id || '');

    // États Modale Détails
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // --- RECHERCHE AUTOMATIQUE (Debounce) ---
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(route('admin.reports.payments'), { 
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
        const url = route('admin.reports.payments.pdf', {
            search,
            date_start: dateStart,
            date_end: dateEnd,
            boutique_id: boutiqueId
        });
        window.open(url, '_blank');
    };

    // --- DETAILS ---
    const openDetails = (payment) => {
        setSelectedPayment(payment);
        setIsDetailOpen(true);
    };

    return (
        <>
            <Head title="Rapport Global des Versements" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
                
                {/* --- 1. CARTE STATISTIQUE --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Total Versements (Sélection)</p>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                                {Number(stats.total_amount).toLocaleString()} <span className="text-lg text-gray-500">FCFA</span>
                            </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                            <FontAwesomeIcon icon={faMoneyBillWave} size="lg" />
                        </div>
                    </div>
                    {/* Vous pouvez ajouter une 2ème carte ici si besoin (ex: Moyenne par versement) */}
                </div>

                {/* --- 2. BARRE D'OUTILS ET FILTRES --- */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                        
                        {/* Titre */}
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <FontAwesomeIcon icon={faStore} className="text-gray-500"/>
                            Historique Versements
                        </h2>

                        {/* Zone Filtres */}
                        <div className="flex flex-wrap gap-3 w-full xl:w-auto items-center">
                            
                            {/* Filtre Boutique */}
                            <select
                                value={boutiqueId}
                                onChange={(e) => setBoutiqueId(e.target.value)}
                                className="border-gray-300 dark:border-gray-600 rounded-md text-sm py-2 px-3 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
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
                                    placeholder="Réf, Montant..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm w-full xl:w-48 dark:bg-gray-700 dark:text-white focus:ring-green-500"
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Boutique</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Référence</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Caissier</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nb Fact.</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {payments.data.length > 0 ? (
                                    payments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(payment.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                                                {payment.user?.boutique?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-mono font-bold">
                                                {payment.reference || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                {payment.user?.first_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300">
                                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                                    {payment.product_sales?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                                                {Number(payment.amount).toLocaleString()} F
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => openDetails(payment)}
                                                    className="text-gray-400 hover:text-green-500 transition-colors"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                            Aucun versement trouvé pour ces critères.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {payments.links && payments.links.length > 3 && (
                    <div className="mt-4 flex justify-center flex-wrap gap-1">
                        {payments.links.map((link, k) => (
                            <Link
                                key={k}
                                href={link.url || '#'}
                                className={`px-3 py-1 border rounded text-sm ${
                                    link.active 
                                    ? 'bg-green-600 text-white border-green-600' 
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
                {selectedPayment && (
                    <div className="p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                            <div>
                                <h3 className="text-lg font-bold">Détails Versement</h3>
                                <p className="text-sm text-gray-500">Réf: {selectedPayment.reference || 'N/A'}</p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-red-500"><FontAwesomeIcon icon={faTimes}/></button>
                        </div>

                        <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm">
                            <p><strong>Libellé :</strong> {selectedPayment.label}</p>
                            <p><strong>Caissier :</strong> {selectedPayment.user?.first_name} {selectedPayment.user?.last_name}</p>
                            <p><strong>Montant Total :</strong> {Number(selectedPayment.amount).toLocaleString()} FCFA</p>
                        </div>

                        <h4 className="font-bold text-sm uppercase text-gray-500 dark:text-gray-400 mb-2">Factures réglées</h4>
                        <div className="max-h-[50vh] overflow-y-auto border dark:border-gray-700 rounded">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-900 text-left">
                                    <tr>
                                        <th className="p-2 border-b dark:border-gray-700">Code Facture</th>
                                        <th className="p-2 border-b dark:border-gray-700">Client</th>
                                        <th className="p-2 border-b dark:border-gray-700 text-right">Montant Facture</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPayment.product_sales && selectedPayment.product_sales.length > 0 ? (
                                        selectedPayment.product_sales.map((sale, idx) => (
                                            <tr key={idx} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="p-2 font-mono text-blue-600 dark:text-blue-400">{sale.facture_code}</td>
                                                <td className="p-2">{sale.customer?.name || 'Inconnu'}</td>
                                                <td className="p-2 text-right">{Number(sale.total_ttc).toLocaleString()} F</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="p-4 text-center text-gray-500 italic">
                                                <FontAwesomeIcon icon={faReceipt} className="mr-2"/>
                                                Aucune facture liée directement.
                                            </td>
                                        </tr>
                                    )}
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
GlobalPaymentHistory.layout = page => <DirBoutiqueLayout children={page} />;

export default GlobalPaymentHistory;