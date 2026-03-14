import React, { useState, useEffect } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import GasModal from '@/Components/Modals/Oxygene/direction/GasModal';

// --- Importez votre Layout ici ---
import DirMedLayout from '../../../layout/DirMedLayout/DirMedLayout'; 

const Index = ({ gases, filters, flash }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGas, setSelectedGas] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // Utilisation de useForm pour la suppression
    const { delete: inertiaDelete } = useForm();

    // Gestion de la recherche en temps réel
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(
                    route('gases.index'),
                    { search: searchTerm },
                    { preserveState: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filters]);

    const handleOpenCreate = () => {
        setSelectedGas(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (gas) => {
        setSelectedGas(gas);
        setIsModalOpen(true);
    };

    // --- Fonction de suppression avec SweetAlert2 ---
    const handleDelete = (id, gasName) => {
        Swal.fire({
            title: 'Êtes-vous sûr, monsieur ?',
            text: `Vous êtes sur le point de retirer "${gasName}" du catalogue. Cette action est irréversible !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                inertiaDelete(route('gases.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire(
                            'Supprimé !',
                            `Le gaz "${gasName}" a été retiré du catalogue.`,
                            'success'
                        );
                    },
                    onError: (errors) => {
                        console.error('Erreur de suppression:', errors);
                        // Si le backend renvoie une erreur (ex: gaz utilisé), Swal l'affiche
                        Swal.fire(
                            'Erreur !',
                            'Impossible de supprimer ce gaz. Il est peut-être lié à des cuves ou bouteilles existantes.',
                            'error'
                        );
                    },
                });
            }
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Head title="Catalogue des Gaz" />

            {/* En-tête de la page */}
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catalogue des Gaz</h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">
                        Gérez la liste des gaz industriels, médicaux et spéciaux utilisés dans l'usine.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Ajouter un gaz
                    </button>
                </div>
            </div>

            {/* Messages Flash venant du Backend (optionnel si Swal gère tout) */}
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

            {/* Conteneur principal style tableau de bord */}
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
                                placeholder="Rechercher (ex: Oxygène, 1072)..."
                            />
                        </div>
                    </div>
                </div>

                {/* Tableau */}
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Nom du Gaz</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Catégorie</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Code ONU</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Description</th>
                                <th scope="col" className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {gases.data && gases.data.length > 0 ? (
                                gases.data.map((gas) => (
                                    <tr key={gas.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                            {gas.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${gas.category === 'Médical' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300' : ''}
                                                ${gas.category === 'Industriel' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : ''}
                                                ${gas.category === 'Alimentaire' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                                                ${gas.category === 'Spécial' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' : ''}
                                            `}>
                                                {gas.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{gas.un_code || '-'}</td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400 truncate max-w-xs">{gas.description || '-'}</td>
                                        <td className="py-3 px-4 flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleOpenEdit(gas)}
                                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                                                title="Modifier"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                <span className="hidden sm:inline">Modifier</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(gas.id, gas.name)}
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
                                        Aucun gaz trouvé dans le catalogue.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {gases.links && gases.links.length > 3 && (
                    <nav className="flex justify-end mt-4">
                        <div className="flex gap-2">
                            {gases.links.map((link, index) => (
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
                                    only={['gases']}
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
            <GasModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                gas={selectedGas} 
            />
        </div>
    );
};

// --- Application du Layout Persistant ---
Index.layout = page => <DirMedLayout children={page} />;

export default Index;