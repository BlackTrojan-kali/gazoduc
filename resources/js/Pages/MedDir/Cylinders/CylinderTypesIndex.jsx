import React, { useState, useEffect } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faEdit, faTrash, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Import de votre modal (Ajustez le chemin exact si nécessaire)
import CylinderTypeModal from '@/Components/Modals/Oxygene/direction/CylinderTypeModal';

// --- Importez votre Layout ici ---
import DirMedLayout from '../../../layout/DirMedLayout/DirMedLayout'; 

const CylinderTypesIndex = ({ cylinderTypes, filters, flash }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // Utilisation de useForm pour la suppression
    const { delete: inertiaDelete } = useForm();

    // Gestion de la recherche en temps réel
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(
                    route('cylinder-types.index'),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filters]);

    const handleOpenCreate = () => {
        setSelectedType(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (type) => {
        setSelectedType(type);
        setIsModalOpen(true);
    };

    // --- Fonction de suppression avec ALERTE ROUGE (Cascade On Delete) ---
    const handleDelete = (id, typeName) => {
        Swal.fire({
            title: 'DANGER : Suppression en cascade',
            html: `Vous êtes sur le point de supprimer le format <b>"${typeName}"</b>.<br><br>
                   <span class="text-red-600 font-bold">ATTENTION :</span> Cette action détruira définitivement 
                   <b>TOUTES</b> les bouteilles physiques de ce format dans la base de données de l'ERP !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, détruire ce format !',
            cancelButtonText: 'Annuler',
            iconHtml: '!', // Icône d'avertissement plus stricte
        }).then((result) => {
            if (result.isConfirmed) {
                // Double vérification par sécurité pour une action aussi critique
                Swal.fire({
                    title: 'Êtes-vous absolument sûr ?',
                    text: "C'est votre dernière chance d'annuler.",
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Confirmer la destruction',
                    cancelButtonText: 'Annuler'
                }).then((secondResult) => {
                    if (secondResult.isConfirmed) {
                        inertiaDelete(route('cylinder-types.destroy', id), {
                            preserveScroll: true,
                            onSuccess: () => {
                                Swal.fire(
                                    'Format supprimé !',
                                    `Le format "${typeName}" et toutes ses bouteilles ont été effacés du système.`,
                                    'success'
                                );
                            }
                        });
                    }
                });
            }
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Head title="Formats de Bouteilles" />

            {/* En-tête de la page */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formats d'emballages</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                        Gérez les différents types de bouteilles (capacités et pressions) utilisés par l'usine.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Ajouter un format
                    </button>
                </div>
            </div>

            {/* Messages Flash venant du Backend */}
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
                
                {/* Barre de recherche */}
                <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full md:w-1/3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Rechercher un format (ex: B50)..."
                            />
                        </div>
                    </div>
                </div>

                {/* Tableau */}
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Nom du Format</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Capacité en Eau</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Pression de Service</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Description</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {cylinderTypes.data && cylinderTypes.data.length > 0 ? (
                                cylinderTypes.data.map((type) => (
                                    <tr key={type.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                                            {type.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                                {type.water_capacity_liters} Litres
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-orange-900 dark:text-orange-300">
                                                {type.working_pressure_bars} Bars
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">{type.description || '-'}</td>
                                        <td className="py-3 px-4 flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleOpenEdit(type)}
                                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                                                title="Modifier"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                <span className="hidden sm:inline">Modifier</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(type.id, type.name)}
                                                className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors"
                                                title="Supprimer"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                                <span className="hidden sm:inline">Supprimer</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        Aucun format de bouteille trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {cylinderTypes.links && cylinderTypes.links.length > 3 && (
                    <nav className="flex justify-end mt-4">
                        <div className="flex gap-2">
                            {cylinderTypes.links.map((link, index) => (
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
                                    only={['cylinderTypes']}
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

            {/* Modal */}
            <CylinderTypeModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                cylinderType={selectedType} 
            />
        </div>
    );
};

// --- Application du Layout Persistant ---
CylinderTypesIndex.layout = page => <DirMedLayout children={page} />;

export default CylinderTypesIndex;