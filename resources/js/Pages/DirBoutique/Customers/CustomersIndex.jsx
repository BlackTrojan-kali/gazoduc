import React, { useState, useEffect } from 'react';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faFileExcel, 
    faFileExport, 
    faSearch, 
    faEdit, 
    faTrash, 
    faPhone, 
    faEnvelope 
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Vos imports spécifiques
import CustomerFormModal from '../../../components/Modals/Boutique_Modals/Customers/CustomerFormModal';
import CustomerImportModal from '../../../components/Modals/Boutique_Modals/Customers/CustomerImportModal';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';

const CustomersIndex = ({ auth, customers, filters }) => {
    
    // --- États pour les Modales ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // --- États pour les Filtres ---
    const [search, setSearch] = useState(filters.search || '');
    const [dateRange, setDateRange] = useState({
        start_date: '',
        end_date: new Date().toISOString().split('T')[0]
    });

    // --- Gestion de la Recherche (Debounce) ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('customers.index'),
                { search: search },
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    // --- Gestionnaires d'Actions ---

    const openCreateModal = () => {
        setEditingCustomer(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setIsCreateModalOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler',
            background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('customers.destroy', id), {
                    onSuccess: () => Swal.fire({
                        title: 'Supprimé!',
                        text: 'Le client a été supprimé.',
                        icon: 'success',
                        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                    })
                });
            }
        });
    };

    const handleExport = () => {
        const url = route('customers.export', {
            start_date: dateRange.start_date,
            end_date: dateRange.end_date
        });
        window.open(url, '_blank');
    };

    return (
        <>
            <Head title="Gestion des Clients" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Titre */}
                    <div className="mb-6">
                        <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                            Gestion des Clients
                        </h2>
                    </div>

                    {/* --- BARRE D'OUTILS --- */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            
                            {/* Boutons Principaux */}
                            <div className="flex space-x-3 w-full md:w-auto">
                                <button
                                    onClick={openCreateModal}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-bold text-sm flex items-center shadow transition dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Nouveau
                                </button>
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold text-sm flex items-center shadow transition dark:bg-green-500 dark:hover:bg-green-600"
                                >
                                    <FontAwesomeIcon icon={faFileExcel} className="mr-2" />
                                    Importer
                                </button>
                            </div>

                            {/* Zone Export et Recherche */}
                            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
                                
                                {/* Filtres Date Export */}
                                <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden lg:inline">Export:</span>
                                    <input 
                                        type="date" 
                                        className="text-xs border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        value={dateRange.start_date}
                                        onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input 
                                        type="date" 
                                        className="text-xs border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        value={dateRange.end_date}
                                        onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
                                    />
                                    <button
                                        onClick={handleExport}
                                        className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                                        title="Télécharger Excel"
                                    >
                                        <FontAwesomeIcon icon={faFileExport} className="text-lg" />
                                    </button>
                                </div>

                                {/* Recherche */}
                                <div className="relative w-full md:w-64">
                                    <input
                                        type="text"
                                        placeholder="Rechercher..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- TABLEAU DES CLIENTS --- */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom / Entreprise</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adresse</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dette Actuelle</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {customers.data.length > 0 ? (
                                        customers.data.map((customer) => (
                                            <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{customer.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">Créé le {new Date(customer.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col text-sm text-gray-600 dark:text-gray-300">
                                                        {customer.phone && (
                                                            <span className="flex items-center mb-1">
                                                                <FontAwesomeIcon icon={faPhone} className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500" />
                                                                {customer.phone}
                                                            </span>
                                                        )}
                                                        {customer.email && (
                                                            <span className="flex items-center">
                                                                <FontAwesomeIcon icon={faEnvelope} className="w-3 h-3 mr-2 text-gray-400 dark:text-gray-500" />
                                                                {customer.email}
                                                            </span>
                                                        )}
                                                        {!customer.phone && !customer.email && <span className="text-gray-400 dark:text-gray-500 italic">Aucun contact</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {customer.address || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${parseFloat(customer.dept_amount) > 0 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                                                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(customer.dept_amount || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button 
                                                        onClick={() => openEditModal(customer)}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mx-2 p-2 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
                                                        title="Modifier"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(customer.id)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mx-2 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                                        title="Supprimer"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                                Aucun client trouvé. Commencez par en ajouter un ou importez une liste Excel.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* --- PAGINATION (Directe avec Dark Mode) --- */}
                        {customers.links && customers.links.length > 3 && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-center -mb-1 space-x-1">
                                {customers.links.map((link, key) => (
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
            <CustomerFormModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                customer={editingCustomer}
            />

            <CustomerImportModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
            />

        </>
    );
};

// Application du Layout Persistant
CustomersIndex.layout = page => <DirBoutiqueLayout children={page} />;

export default CustomersIndex;