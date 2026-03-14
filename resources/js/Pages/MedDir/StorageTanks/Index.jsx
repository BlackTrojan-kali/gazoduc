import React, { useState, useEffect } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faEdit, faTrash, faFilter, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

// Import de la modale
import StorageTankModal from '@/Components/Modals/Oxygene/direction/StorageTankModal';

// --- Import de votre Layout ---
import DirMedLayout from '../../../layout/DirMedLayout/DirMedLayout';

const Index = ({ tanks, gases, agencies, filters, flash }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTank, setSelectedTank] = useState(null);
    
    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [agencyFilter, setAgencyFilter] = useState(filters?.agency_id || '');

    const { delete: inertiaDelete } = useForm();

    // Gestion de la recherche et du filtrage en temps réel
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Ne déclenche la requête que si les valeurs ont changé
            if (searchTerm !== (filters?.search || '') || agencyFilter !== (filters?.agency_id || '')) {
                router.get(
                    route('storage-tanks.index'),
                    { search: searchTerm, agency_id: agencyFilter },
                    { preserveState: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, agencyFilter, filters]);

    const handleOpenCreate = () => {
        setSelectedTank(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (tank) => {
        setSelectedTank(tank);
        setIsModalOpen(true);
    };

    // --- Fonction de suppression ---
    const handleDelete = (id, reference, currentVolume) => {
        // Bloquage côté interface si la cuve n'est pas vide (pour correspondre au backend)
        if (currentVolume > 0) {
            Swal.fire({
                title: 'Opération interdite',
                text: `Impossible de supprimer la cuve ${reference}. Elle contient encore ${currentVolume} unités de gaz. Videz-la informatiquement d'abord.`,
                icon: 'error',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        Swal.fire({
            title: 'Confirmer la suppression',
            text: `Voulez-vous vraiment retirer la cuve "${reference}" du système ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                inertiaDelete(route('storage-tanks.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Supprimée !', `La cuve "${reference}" a été retirée.`, 'success');
                    }
                });
            }
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Head title="Parc des Cuves" />

            {/* En-tête de la page */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parc des Cuves (Réservoirs)</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                        Supervisez les niveaux de gaz en temps réel dans les différentes usines et dépôts.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Ajouter une cuve
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
                
                {/* Barre de recherche et Filtres */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center md:justify-between">
                    
                    {/* Recherche Texte */}
                    <div className="w-full md:w-1/3 relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Rechercher une cuve (ex: CUV-01)..."
                        />
                    </div>

                    {/* Filtre par Agence */}
                    <div className="w-full md:w-1/4 relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FontAwesomeIcon icon={faFilter} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <select
                            value={agencyFilter}
                            onChange={(e) => setAgencyFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Toutes les agences</option>
                            {agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>{agency.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tableau */}
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Référence</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Site / Produit</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider w-1/3">Niveau de la Cuve</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Statut</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {tanks.data && tanks.data.length > 0 ? (
                                tanks.data.map((tank) => {
                                    // Calcul du pourcentage pour la barre de progression
                                    const percentage = Math.round((tank.current_volume / tank.max_capacity) * 100);
                                    // Vérification si le niveau est critique
                                    const isCritical = tank.current_volume <= tank.safe_minimum_level;

                                    return (
                                        <tr key={tank.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            
                                            {/* Référence */}
                                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                                                {tank.reference_code}
                                            </td>
                                            
                                            {/* Agence et Gaz */}
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                        {tank.agency?.name || 'Agence Inconnue'}
                                                    </span>
                                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
                                                        {tank.gas?.name || 'Gaz Inconnu'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Barre de Progression (Niveau) */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-xs font-bold ${isCritical ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {isCritical && <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />}
                                                        {tank.current_volume} / {tank.max_capacity} Unités
                                                    </span>
                                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                        {percentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                    <div 
                                                        className={`h-2.5 rounded-full transition-all duration-500 ${isCritical ? 'bg-red-600' : 'bg-green-500'}`} 
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    Alerte à : {tank.safe_minimum_level}
                                                </div>
                                            </td>

                                            {/* Statut */}
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                                                    ${tank.status === 'Operationnelle' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}
                                                    ${tank.status === 'En_Maintenance' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : ''}
                                                    ${tank.status === 'Hors_Service' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : ''}
                                                `}>
                                                    {tank.status.replace('_', ' ')}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-4 flex justify-end gap-3 items-center h-full">
                                                <button 
                                                    onClick={() => handleOpenEdit(tank)}
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                                                    title="Modifier les paramètres"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                    <span className="hidden lg:inline">Modifier</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(tank.id, tank.reference_code, tank.current_volume)}
                                                    className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
                                                    title="Supprimer la cuve"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        Aucune cuve de stockage trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {tanks.links && tanks.links.length > 3 && (
                    <nav className="flex justify-end mt-4">
                        <div className="flex gap-2">
                            {tanks.links.map((link, index) => (
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
                                    only={['tanks']}
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
            <StorageTankModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                storageTank={selectedTank}
                gases={gases}
                agencies={agencies}
            />
        </div>
    );
};

// --- Application du Layout Persistant ---
Index.layout = page => <DirMedLayout children={page} />;

export default Index;