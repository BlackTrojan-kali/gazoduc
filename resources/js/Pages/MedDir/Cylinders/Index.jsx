import React, { useState, useEffect } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faEdit, faTrash, faFilter, faBarcode, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

// Import de la modale
import CylinderModal from '@/Components/Modals/Oxygene/direction/CylinderModal';

// --- Import de votre Layout ---
import DirMedLayout from '../../../layout/DirMedLayout/DirMedLayout';

const Index = ({ cylinders, cylinderTypes, agencies, gases, filters, flash }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCylinder, setSelectedCylinder] = useState(null);
    
    // États pour la recherche et les filtres (Incluant Multi-site et Gaz)
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [typeFilter, setTypeFilter] = useState(filters?.cylinder_type_id || '');
    const [agencyFilter, setAgencyFilter] = useState(filters?.current_agency_id || ''); // NOUVEAU
    const [gasFilter, setGasFilter] = useState(filters?.gas_id || ''); // NOUVEAU

    const { delete: inertiaDelete } = useForm();

    // Gestion de la recherche et du filtrage en temps réel
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (
                searchTerm !== (filters?.search || '') || 
                statusFilter !== (filters?.status || '') ||
                typeFilter !== (filters?.cylinder_type_id || '') ||
                agencyFilter !== (filters?.current_agency_id || '') ||
                gasFilter !== (filters?.gas_id || '')
            ) {
                router.get(
                    route('cylinders.index'),
                    { 
                        search: searchTerm, 
                        status: statusFilter, 
                        cylinder_type_id: typeFilter,
                        current_agency_id: agencyFilter,
                        gas_id: gasFilter
                    },
                    { preserveState: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, typeFilter, agencyFilter, gasFilter, filters]);

    const handleOpenCreate = () => {
        setSelectedCylinder(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (cylinder) => {
        setSelectedCylinder(cylinder);
        setIsModalOpen(true);
    };

    // --- Fonction de suppression ---
    const handleDelete = (id, serialNumber, status) => {
        // Sécurité métier : On ne supprime pas une bouteille en circulation
        if (status === 'Chez_Client' || status === 'En_Transit') {
            Swal.fire({
                title: 'Opération interdite',
                text: `Impossible de supprimer la bouteille N° ${serialNumber}. Elle est actuellement en circulation (${status.replace('_', ' ')}).`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        Swal.fire({
            title: 'Retirer du parc ?',
            text: `Voulez-vous vraiment retirer la bouteille N° ${serialNumber} du système ? (Il est souvent préférable de la passer au statut "Rebut")`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, la retirer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                inertiaDelete(route('cylinders.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Retirée !', `La bouteille N° ${serialNumber} a été effacée.`, 'success');
                    }
                });
            }
        });
    };

    // Fonction d'aide pour la couleur des badges de statut
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Vide_Usine':
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
            case 'Pleine_Usine':
            case 'Pleine_Agence':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'Chez_Client':
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case 'En_Transit':
                return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
            case 'En_Maintenance':
                return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'Rebut':
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Head title="Parc des Bouteilles" />

            {/* En-tête de la page */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parc des Bouteilles</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                        Gérez et tracez l'intégralité de vos bouteilles de gaz, de l'usine jusqu'aux agences et clients.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Enregistrer une bouteille
                    </button>
                </div>
            </div>

            {/* Messages Flash */}
            {flash?.success && (
                <div className="mb-4 p-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
                    {flash.error}
                </div>
            )}

            {/* Conteneur principal */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                
                {/* ---------------- BARRE DE FILTRES AVANCÉE ---------------- */}
                <div className="flex flex-col gap-4 mb-6">
                    
                    {/* Ligne 1 : Recherche et Statut */}
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        {/* Recherche Texte */}
                        <div className="w-full md:w-1/2 relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FontAwesomeIcon icon={faBarcode} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Scanner ou taper le code/SN..."
                                autoFocus
                            />
                        </div>

                        {/* Filtre Statut */}
                        <div className="w-full md:w-1/2 relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FontAwesomeIcon icon={faFilter} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="Vide_Usine">Vides à l'usine centrale</option>
                                <option value="Pleine_Usine">Pleines (Usine)</option>
                                <option value="Pleine_Agence">Pleines (Agences)</option>
                                <option value="En_Transit">En Transit</option>
                                <option value="Chez_Client">Chez les Clients</option>
                                <option value="En_Maintenance">En Maintenance</option>
                            </select>
                        </div>
                    </div>

                    {/* Ligne 2 : Filtres Multi-sites et Techniques */}
                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        
                        {/* Filtre Agence */}
                        <div className="w-full md:w-1/3 relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <select
                                value={agencyFilter}
                                onChange={(e) => setAgencyFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Toutes les agences</option>
                                {agencies?.map((agency) => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre Gaz */}
                        <div className="w-full md:w-1/3 relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FontAwesomeIcon icon={faFilter} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <select
                                value={gasFilter}
                                onChange={(e) => setGasFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tous les gaz</option>
                                {gases?.map((gas) => (
                                    <option key={gas.id} value={gas.id}>{gas.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre Format */}
                        <div className="w-full md:w-1/3 relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FontAwesomeIcon icon={faFilter} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="">Tous les formats</option>
                                {cylinderTypes?.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ---------------- TABLEAU ---------------- */}
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Identification</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Affectation & Produit</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Statut & Localisation</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {cylinders.data && cylinders.data.length > 0 ? (
                                cylinders.data.map((cylinder) => (
                                    <tr key={cylinder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        
                                        {/* SN et Code barre */}
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {cylinder.serial_number}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono mt-0.5">
                                                    <FontAwesomeIcon icon={faBarcode} className="mr-1" />
                                                    {cylinder.barcode}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        {/* Format et Gaz */}
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    {cylinder.cylinder_type?.name || '-'}
                                                </span>
                                                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                                                    {cylinder.gas?.name || 'Gaz Mixte'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Statut & Localisation */}
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(cylinder.status)}`}>
                                                    {cylinder.status.replace('_', ' ')}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                                    {cylinder.current_agency?.name || 'Non localisée / En Transit'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4 flex justify-end gap-3 items-center">
                                            <button 
                                                onClick={() => handleOpenEdit(cylinder)}
                                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                                                title="Modifier la fiche"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cylinder.id, cylinder.serial_number, cylinder.status)}
                                                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
                                                title="Retirer la bouteille"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <FontAwesomeIcon icon={faSearch} className="text-4xl text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">Aucune bouteille trouvée.</p>
                                            <p className="text-sm mt-1">Vérifiez vos filtres ou ajoutez une nouvelle bouteille au parc.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {cylinders.links && cylinders.links.length > 3 && (
                    <nav className="flex justify-end mt-4">
                        <div className="flex gap-2">
                            {cylinders.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                                        ${link.active
                                            ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                                            : link.url === null
                                                ? 'bg-white border-gray-300 text-gray-400 opacity-50 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700'
                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
                                        }
                                    `}
                                    preserveState
                                    preserveScroll
                                    only={['cylinders']}
                                    onClick={(e) => {
                                        if (!link.url) e.preventDefault();
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </nav>
                )}
            </div>

            {/* Modale de Création/Édition */}
            <CylinderModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                cylinder={selectedCylinder}
                cylinderTypes={cylinderTypes}
                agencies={agencies}
                gases={gases}
            />
        </div>
    );
};

// --- Application du Layout Persistant ---
Index.layout = page => <DirMedLayout children={page} />;

export default Index;