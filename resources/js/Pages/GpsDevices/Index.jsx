import React, { useState, useCallback } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import Swal from 'sweetalert2';

// Composants
import DirLayout from '../../layout/DirLayout/DirLayout';
import GpsDeviceFormModal from '../../../../resources/js/components/Modals/Tracking/GpsDeviceFormModal';

// Icones
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faSearch, 
    faSatelliteDish, 
    faEdit, 
    faTrash, 
    faMicrochip, 
    faSimCard 
} from '@fortawesome/free-solid-svg-icons';

export default function Index({ auth, gpsDevices, filters }) {
    // --- États ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // --- Gestion de la Recherche (Debounce) ---
    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(
                route('gps-devices.index'),
                { search: query },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 300),
        []
    );

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    // --- Gestion de la Modale ---
    const openCreateModal = () => {
        setEditingDevice(null);
        setIsModalOpen(true);
    };

    const openEditModal = (device) => {
        setEditingDevice(device);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDevice(null);
    };

    // --- Gestion de la Suppression ---
    const handleDelete = (device) => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: `Voulez-vous vraiment supprimer le boîtier IMEI : ${device.imei} ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('gps-devices.destroy', device.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Supprimé !', 'Le boîtier a été supprimé.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Erreur', 'Impossible de supprimer ce boîtier (peut-être lié à un véhicule ?)', 'error');
                    }
                });
            }
        });
    };

    return (
        <DirLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Gestion des Boîtiers GPS</h2>}
        >
            <Head title="Boîtiers GPS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- Barre d'outils (Recherche + Ajout) --- */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        
                        {/* Barre de recherche */}
                        <div className="relative w-full md:w-1/3">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Rechercher par IMEI, Modèle..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>

                        {/* Bouton Ajouter */}
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" />
                            Nouveau Boîtier
                        </button>
                    </div>

                    {/* --- Tableau des Données --- */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            IMEI / ID
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Modèle
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Carte SIM
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {gpsDevices.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FontAwesomeIcon icon={faSatelliteDish} className="text-4xl mb-3 text-gray-300" />
                                                    <p>Aucun boîtier GPS trouvé.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        gpsDevices.data.map((device) => (
                                            <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                                {/* Colonne IMEI */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                                                            <FontAwesomeIcon icon={faSatelliteDish} />
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {device.imei}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Ajouté le {new Date(device.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Colonne Modèle */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-gray-300 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faMicrochip} className="text-gray-400" />
                                                        {device.model}
                                                    </div>
                                                </td>

                                                {/* Colonne SIM */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                        <FontAwesomeIcon icon={faSimCard} className="text-gray-400" />
                                                        {device.sim_number || <span className="italic text-xs">Non défini</span>}
                                                    </div>
                                                </td>

                                                {/* Colonne Statut */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {device.is_active ? (
                                                        <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-800">
                                                            Actif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2 text-xs font-semibold leading-5 text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300 border border-gray-300">
                                                            Inactif
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Colonne Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openEditModal(device)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-4"
                                                        title="Modifier"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(device)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                                        title="Supprimer"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination Intégrée (Sans composant externe) */}
                        {gpsDevices.links && gpsDevices.links.length > 3 && (
                           <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-center gap-1">
                                {gpsDevices.links.map((link, key) => (
                                    link.url === null ? (
                                        <div 
                                            key={key} 
                                            className="px-3 py-1 text-gray-500 bg-white border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-600" 
                                            dangerouslySetInnerHTML={{ __html: link.label }} 
                                        />
                                    ) : (
                                        <Link
                                            key={key}
                                            href={link.url}
                                            className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                link.active 
                                                    ? 'bg-blue-600 text-white border-blue-600' 
                                                    : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                           </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modale Formulaire (Création / Édition) */}
            <GpsDeviceFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                gpsDevice={editingDevice}
            />

        </DirLayout>
    );
}