import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTruckFast, 
    faSearch, 
    faPlus, 
    faEdit, 
    faTrash, 
    faBuilding,
    faPhone,
    faIdCard,
    faFileContract
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../../components/ui/button/Button';
import Swal from 'sweetalert2';
import SupplierFormModal from '../../../components/Modals/Boutique_Modals/Supply/SupplierFormModal';

const SupplierIndex = ({ suppliers, filters }) => {
    // --- États ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    // --- Gestion Recherche (Server-Side avec debounce) ---
    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(
                route('suppliers.index'),
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
        setSelectedSupplier(null);
        setIsModalOpen(true);
    };

    const openEditModal = (supplier) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    // --- Gestion Suppression (Archivage Soft Delete) ---
    const handleDelete = (supplier) => {
        Swal.fire({
            title: 'Archiver ce fournisseur ?',
            text: `${supplier.name} ne sera plus disponible pour les nouvelles commandes. Ses historiques seront conservés.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, archiver',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('suppliers.destroy', supplier.id), {
                    onSuccess: () => Swal.fire('Archivé!', 'Le fournisseur a été archivé avec succès.', 'success')
                });
            }
        });
    };

    // --- Helper pour formater les conditions de paiement ---
    const formatPaymentTerms = (term) => {
        const terms = {
            'comptant': 'Comptant',
            'avance_50': 'Avance 50%',
            '15_jours': 'À 15 jours',
            '30_jours': 'À 30 jours',
            '60_jours': 'À 60 jours',
        };
        return terms[term] || <span className="text-gray-400 italic">Non défini</span>;
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Annuaire des Fournisseurs" />

            {/* --- En-tête --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faTruckFast} className="text-brand-600"/>
                        Annuaire des Fournisseurs
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gérez vos partenaires commerciaux pour l'approvisionnement de vos boutiques.
                    </p>
                </div>
                <Button 
                    onClick={openCreateModal}
                    className="bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all h-[38px]"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Nouveau Fournisseur
                </Button>
            </div>

            {/* --- Barre de Recherche --- */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="relative max-w-md">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400 text-sm z-10" />
                    <input 
                        type="text" 
                        className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm min-h-[38px] focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                        placeholder="Rechercher par raison sociale, NIU, téléphone..."
                        value={search}
                        onChange={onSearchChange}
                    />
                </div>
            </div>

            {/* --- Tableau des Fournisseurs --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Entreprise</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact & Téléphone</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Légal & Paiement</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {suppliers.data.length > 0 ? (
                                suppliers.data.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        
                                        {/* Entreprise */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0">
                                                    <FontAwesomeIcon icon={faBuilding} />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {supplier.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                                        {supplier.address || 'Adresse non renseignée'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                {supplier.contact_name || <span className="text-gray-400 italic">Non spécifié</span>}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1">
                                                <FontAwesomeIcon icon={faPhone} className="text-gray-400 text-[10px]" />
                                                {supplier.phone || 'N/A'}
                                            </div>
                                        </td>

                                        {/* Légal & Administratif */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faIdCard} className="text-gray-400 text-[10px]" />
                                                    <span className="font-semibold">NIU:</span> {supplier.tax_id || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faFileContract} className="text-gray-400 text-[10px]" />
                                                    <span className="font-semibold">Paiement:</span> 
                                                    <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[11px] font-medium text-gray-800 dark:text-gray-200">
                                                        {formatPaymentTerms(supplier.payment_terms)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(supplier)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(supplier)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Archiver"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Aucun fournisseur trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                {suppliers.links && suppliers.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Affichage de <span className="font-semibold">{suppliers.from}</span> à <span className="font-semibold">{suppliers.to}</span> sur <span className="font-semibold">{suppliers.total}</span>
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
                            {suppliers.links.map((link, k) => (
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

            {/* --- Modale Fournisseur --- */}
            <SupplierFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                supplier={selectedSupplier}
                routeName={selectedSupplier ? 'suppliers.update' : 'suppliers.store'}
            />
        </div>
    );
};

SupplierIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default SupplierIndex;