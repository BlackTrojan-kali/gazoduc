import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import ComBoutiqueLayout from '../../layout/ComBoutiqueLayout/ComBoutiqueLayout'; 
import Modal from '../../components/Modals/Modal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, faFilePdf, faCalendarAlt, faChevronDown, faChevronUp, faMoneyBillWave, faDownload
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// --- MODALE INTERNE POUR GENERER LE RAPPORT ---
const GeneratePaymentReportModal = ({ isOpen, onClose }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = () => {
        if (!startDate || !endDate) return Swal.fire('Erreur', 'Sélectionnez les dates', 'warning');
        
        setLoading(true);
        const url = route('product-payments.report.pdf', { start_date: startDate, end_date: endDate });
        window.open(url, '_blank');
        setLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilePdf} className="text-red-500"/> Rapport Versements
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Du</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Au</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-200">Annuler</button>
                        <button onClick={handleGenerate} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2">
                            <FontAwesomeIcon icon={faDownload} /> Télécharger
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// --- COMPOSANT LIGNE DE TABLEAU (Avec Accordéon) ---
const PaymentRow = ({ payment }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {new Date(payment.created_at).toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                    {payment.reference || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                    {payment.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                    {Number(payment.amount).toLocaleString()} FCFA
                </td>
                <td className="px-6 py-4 text-center">
                    <button className="text-gray-400 hover:text-blue-500">
                        <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} />
                    </button>
                </td>
            </tr>
            {/* Zone Détails (Factures associées) */}
            {expanded && (
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <td colSpan="5" className="px-6 py-4">
                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Factures réglées par ce versement :</div>
                        {payment.product_sales && payment.product_sales.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {payment.product_sales.map(sale => (
                                    <div key={sale.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-3 py-1 text-sm shadow-sm flex items-center gap-2">
                                        <span className="font-mono text-blue-600 dark:text-blue-400">{sale.facture_code}</span>
                                        <span className="text-gray-400">|</span>
                                        <span className="text-gray-600 dark:text-gray-300">{Number(sale.total_ttc).toLocaleString()} F</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400 italic">Aucune facture liée directement.</span>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
};

// --- PAGE PRINCIPALE ---
const PaymentHistory = ({ payments, filters }) => {
    const [search, setSearch] = useState(filters.search || '');
    const [dateStart, setDateStart] = useState(filters.date_start || '');
    const [dateEnd, setDateEnd] = useState(filters.date_end || '');
    const [showReportModal, setShowReportModal] = useState(false);

    const handleSearch = () => {
        router.get(route('payments.history'), { search, date_start: dateStart, date_end: dateEnd }, { preserveState: true, replace: true });
    };

    useEffect(() => {
        const timer = setTimeout(() => { if (search !== filters.search) handleSearch(); }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <ComBoutiqueLayout>
            <Head title="Historique Versements" />
            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600"/> Historique des Versements
                    </h2>
                    <button 
                        onClick={() => setShowReportModal(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faFilePdf} /> Rapport PDF
                    </button>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-3 mb-6 items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded px-2">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400"/>
                        <input type="date" value={dateStart} onChange={e => { setDateStart(e.target.value); handleSearch(); }} className="bg-transparent border-none text-sm focus:ring-0 dark:text-white"/>
                        <span className="text-gray-400 mx-1">au</span>
                        <input type="date" value={dateEnd} onChange={e => { setDateEnd(e.target.value); handleSearch(); }} className="bg-transparent border-none text-sm focus:ring-0 dark:text-white"/>
                    </div>
                    <div className="relative flex-1">
                        <input type="text" placeholder="Recherche (Réf, Montant...)" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 py-2 border-gray-300 dark:border-gray-600 rounded-md focus:ring-green-500 dark:bg-gray-700 dark:text-white"/>
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400"/>
                    </div>
                </div>

                {/* Tableau */}
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Référence</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Libellé</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Montant</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {payments.data.length > 0 ? (
                                payments.data.map(payment => <PaymentRow key={payment.id} payment={payment} />)
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Aucun versement trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {payments.links && payments.links.length > 3 && (
                    <div className="mt-4 flex justify-center gap-1">
                        {payments.links.map((link, k) => (
                            <Link key={k} href={link.url || '#'} className={`px-3 py-1 border rounded text-sm ${link.active ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}

                <GeneratePaymentReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} />
            </div>
        </ComBoutiqueLayout>
    );
};

export default PaymentHistory;