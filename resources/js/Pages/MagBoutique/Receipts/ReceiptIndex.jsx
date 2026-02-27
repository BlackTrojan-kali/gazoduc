import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faClipboardCheck, 
    faSearch, 
    faPlus, 
    faEdit, 
    faTrash, 
    faEye,
    faStore,
    faCalendarAlt,
    faFileInvoice,
    faTruck
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../../components/ui/button/Button';
import Swal from 'sweetalert2';
import MagBoutiqueLayout from '../../../layout/MagBoutiqueLayout/MagBoutiqueLayout';
import ReceiptFormModal from '../../../components/Modals/Boutique_Modals/Supply/ReceiptFormModal';

const ReceiptIndex = ({ receipts, purchaseOrders, boutiques, filters }) => {
    // --- États ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    // --- Gestion Recherche (Server-Side avec debounce) ---
    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(
                route('receipts.index'),
                { search: query },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const onSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    // --- Gestion Modale ---
    const openCreateModal = () => {
        setSelectedReceipt(null);
        setIsModalOpen(true);
    };

    const openEditModal = (receipt) => {
        setSelectedReceipt(receipt);
        setIsModalOpen(true);
    };

    // --- Actions ---
    const handleDelete = (receipt) => {
        Swal.fire({
            title: 'Supprimer ce brouillon ?',
            text: `Cette action est irréversible. Êtes-vous sûr de vouloir annuler cette réception ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('receipts.destroy', receipt.id), {
                    onSuccess: () => Swal.fire('Supprimé!', 'Le brouillon de réception a été supprimé.', 'success'),
                    onError: (err) => Swal.fire('Erreur', err.message || 'Impossible de supprimer cette réception.', 'error')
                });
            }
        });
    };

    // --- Helpers de formatage ---
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getStatusBadge = (status) => {
        if (status === 'validated') {
            return (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800 flex items-center gap-1.5 w-fit">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Stock Validé
                </span>
            );
        }
        return (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5 w-fit">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                Inspection (Brouillon)
            </span>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Réceptions de Marchandises" />

            {/* --- En-tête --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faClipboardCheck} className="text-brand-600"/>
                        Réceptions & Entrées en Stock
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Contrôlez les livraisons de vos fournisseurs et mettez à jour vos stocks physiques.
                    </p>
                </div>
                <Button 
                    onClick={openCreateModal}
                    className="bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all h-[38px]"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Nouvelle Réception
                </Button>
            </div>

            {/* --- Barre de Recherche --- */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative max-w-md">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400 text-sm z-10" />
                    <input 
                        type="text" 
                        className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm min-h-[38px] focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                        placeholder="Rechercher par référence BL ou commande..."
                        value={search}
                        onChange={onSearchChange}
                    />
                </div>
            </div>

            {/* --- Tableau des Réceptions --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date & Réf. BL</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lié à la Commande</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Lieu (Boutique)</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {receipts.data.length > 0 ? (
                                receipts.data.map((receipt) => (
                                    <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        
                                        {/* Date et Réf BL */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <FontAwesomeIcon icon={faTruck} className="text-gray-400 text-xs" />
                                                {receipt.reference || <span className="italic text-gray-400">Sans Réf. BL</span>}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                                                Reçu le: {formatDate(receipt.received_at)}
                                            </div>
                                        </td>

                                        {/* Bon de Commande lié */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faFileInvoice} />
                                                {receipt.purchase_order ? receipt.purchase_order.reference : 'Inconnu'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                {receipt.purchase_order?.supplier?.name || 'Fournisseur inconnu'}
                                            </div>
                                        </td>

                                        {/* Boutique */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faStore} className="text-gray-400" />
                                                {receipt.boutique ? receipt.boutique.name : 'N/A'}
                                            </div>
                                        </td>

                                        {/* Statut */}
                                        <td className="px-6 py-4">
                                            {getStatusBadge(receipt.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {receipt.status === 'pending' ? (
                                                    <>
                                                        <button 
                                                            onClick={() => openEditModal(receipt)}
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                            title="Continuer l'inspection"
                                                        >
                                                            <FontAwesomeIcon icon={faEdit} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(receipt)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                            title="Supprimer ce brouillon"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        onClick={() => openEditModal(receipt)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        title="Consulter les détails (Lecture seule)"
                                                    >
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Aucun bon de réception trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                {receipts.links && receipts.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Affichage de <span className="font-semibold">{receipts.from}</span> à <span className="font-semibold">{receipts.to}</span> sur <span className="font-semibold">{receipts.total}</span>
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
                            {receipts.links.map((link, k) => (
                                <button
                                    key={k}
                                    onClick={() => link.url && router.get(link.url, { search }, { preserveState: true })}
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

            {/* --- Modale globale de création / édition --- */}
            <ReceiptFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                receipt={selectedReceipt}
                purchaseOrders={purchaseOrders}
                boutiques={boutiques}
                routeName={selectedReceipt ? 'receipts.update' : 'receipts.store'}
            />
        </div>
    );
};

ReceiptIndex.layout = (page) => <MagBoutiqueLayout children={page} />;

export default ReceiptIndex;