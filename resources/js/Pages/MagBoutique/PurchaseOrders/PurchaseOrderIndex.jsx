import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import Select from 'react-select';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFileInvoice, 
    faSearch, 
    faPlus, 
    faEdit, 
    faTrash, 
    faStore,
    faTruckFast,
    faCalendarAlt,
    faMoneyBillWave,
    faPaperPlane,
    faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../../components/ui/button/Button';
import Swal from 'sweetalert2';
import PurchaseOrderFormModal from '../../../components/Modals/Boutique_Modals/Supply/PurchaseOrderFormModal';
import MagBoutiqueLayout from '../../../layout/MagBoutiqueLayout/MagBoutiqueLayout';

const PurchaseOrderIndex = ({ purchaseOrders, suppliers, boutiques, products, filters }) => {
    // --- États ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    
    const statusOptions = [
        { value: 'draft', label: 'Brouillon' },
        { value: 'sent', label: 'Envoyé au fournisseur' },
        { value: 'partial', label: 'Partiellement reçu' },
        { value: 'received', label: 'Totalement réceptionné' },
        { value: 'cancelled', label: 'Annulé' }
    ];
    
    const [selectedStatus, setSelectedStatus] = useState(
        statusOptions.find(opt => opt.value === filters.status) || null
    );

    // --- Gestion Recherche (Server-Side avec debounce) ---
    const debouncedSearch = useCallback(
        debounce((query, status) => {
            router.get(
                route('purchase-orders.index'),
                { search: query, status: status },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    const onSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value, selectedStatus?.value || '');
    };

    const onStatusChange = (selected) => {
        setSelectedStatus(selected);
        debouncedSearch(search, selected ? selected.value : '');
    };

    // --- Gestion Modale ---
    const openCreateModal = () => {
        setSelectedPO(null);
        setIsModalOpen(true);
    };

    const openEditModal = (po) => {
        setSelectedPO(po);
        setIsModalOpen(true);
    };

    // --- Actions ---
    const handleDelete = (po) => {
        Swal.fire({
            title: 'Supprimer ce bon de commande ?',
            text: `La commande ${po.reference || 'en brouillon'} sera définitivement supprimée.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('purchase-orders.destroy', po.id), {
                    onSuccess: () => Swal.fire('Supprimé!', 'La commande a été supprimée.', 'success'),
                    onError: (err) => Swal.fire('Erreur', err.message || 'Impossible de supprimer cette commande.', 'error')
                });
            }
        });
    };

    // --- Helpers de formatage ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'draft':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">Brouillon</span>;
            case 'sent':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800"><FontAwesomeIcon icon={faPaperPlane} className="mr-1"/> Envoyé</span>;
            case 'partial':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800">Partiel</span>;
            case 'received':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800">Réceptionné</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800">Annulé</span>;
            default:
                return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    // --- Styles React-Select ---
    const rsClassNames = {
        control: (state) => `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-sm min-h-[38px] ${state.isFocused ? 'ring-1 ring-brand-500 border-brand-500' : ''}`,
        menu: () => 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md mt-1 z-50 text-sm',
        option: (state) => `px-3 py-2 cursor-pointer ${state.isSelected ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium' : state.isFocused ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`,
        singleValue: () => 'text-gray-900 dark:text-gray-100',
        placeholder: () => 'text-gray-400 dark:text-gray-500',
    };
    const rsStyles = {
        control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
        menu: (base) => ({ ...base, backgroundColor: 'transparent' }),
        option: (base) => ({ ...base, backgroundColor: 'transparent', color: 'inherit' }),
        singleValue: (base) => ({ ...base, color: 'inherit' })
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Bons de Commande" />

            {/* --- En-tête --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileInvoice} className="text-brand-600"/>
                        Bons de Commande (Fournisseurs)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gérez vos commandes d'approvisionnement et suivez leurs réceptions.
                    </p>
                </div>
                <Button 
                    onClick={openCreateModal}
                    className="bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all h-[38px]"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Nouvelle Commande
                </Button>
            </div>

            {/* --- Barre de Filtres --- */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400 text-sm z-10" />
                            <input 
                                type="text" 
                                className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm min-h-[38px] focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                                placeholder="Rechercher par référence ou nom du fournisseur..."
                                value={search}
                                onChange={onSearchChange}
                            />
                        </div>
                    </div>
                    <div>
                        <Select 
                            options={statusOptions}
                            value={selectedStatus}
                            onChange={onStatusChange}
                            placeholder="Filtrer par statut..."
                            classNames={rsClassNames}
                            styles={rsStyles}
                            isClearable
                        />
                    </div>
                </div>
            </div>

            {/* --- Tableau --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Réf & Date</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fournisseur</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Livraison Prévue</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Montant Total</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {purchaseOrders.data.length > 0 ? (
                                purchaseOrders.data.map((po) => (
                                    <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        
                                        {/* Référence et Date */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-brand-600 dark:text-brand-400">
                                                {po.reference || <span className="italic text-gray-400">En création</span>}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
                                                {formatDate(po.order_date)}
                                            </div>
                                        </td>

                                        {/* Fournisseur */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                <FontAwesomeIcon icon={faTruckFast} className="text-gray-400" />
                                                {po.supplier ? po.supplier.name : 'N/A'}
                                            </div>
                                        </td>

                                        {/* Livraison (Boutique & Date) */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 dark:text-gray-200 flex items-center gap-1.5">
                                                <FontAwesomeIcon icon={faStore} className="text-gray-400 text-xs" />
                                                {po.boutique ? po.boutique.name : 'N/A'}
                                            </div>
                                            {po.expected_delivery_date && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Prévu le: {formatDate(po.expected_delivery_date)}
                                                </div>
                                            )}
                                        </td>

                                        {/* Montant Total */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(po.total_amount)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {po.lines?.length || 0} article(s)
                                            </div>
                                        </td>

                                        {/* Statut */}
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(po.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <a 
                                                        href={route('purchase-orders.pdf', po.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="Télécharger le PDF"
                                                    >
                                                        <FontAwesomeIcon icon={faFilePdf} />
                                                    </a> 
                                                <button 
                                                    onClick={() => openEditModal(po)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                    title={po.status === 'draft' ? "Modifier" : "Consulter"}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                {(po.status === 'draft' || po.status === 'cancelled') && (
                                                    <button 
                                                        onClick={() => handleDelete(po)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Aucun bon de commande trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                {purchaseOrders.links && purchaseOrders.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Affichage de <span className="font-semibold">{purchaseOrders.from}</span> à <span className="font-semibold">{purchaseOrders.to}</span> sur <span className="font-semibold">{purchaseOrders.total}</span>
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
                            {purchaseOrders.links.map((link, k) => (
                                <button
                                    key={k}
                                    onClick={() => link.url && router.get(link.url, { search, status: selectedStatus?.value }, { preserveState: true })}
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
            <PurchaseOrderFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                purchaseOrder={selectedPO}
                suppliers={suppliers}
                boutiques={boutiques}
                products={products}
                routeName={selectedPO ? 'purchase-orders.update' : 'purchase-orders.store'}
            />
        </div>
    );
};

PurchaseOrderIndex.layout = (page) => <MagBoutiqueLayout children={page} />;

export default PurchaseOrderIndex;