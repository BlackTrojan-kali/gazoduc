import React, { useState, useMemo } from 'react';
import DirFuelLayout from '../../../layout/DirFuelLayout/DirFuelLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faGasPump, faLink, faLinkSlash } from '@fortawesome/free-solid-svg-icons'; // Ajout de faLink
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../../components/ui/table';

// ----------------------------------------------------------------------------------------------------------------
// --- Imports des Modals ---
// Assurez-vous d'ajuster les chemins d'accès à vos composants
import PompeFormModal from '../../../components/Modals/Pompe/PompeModal'; 
import PompeCiterneAssociationModal from '../../../components/Modals/Pompe/PompeCiterneAssociationModal'; // NOUVEL IMPORT

import Swal from 'sweetalert2';
import PompeCiterneDissociationModal from '../../../components/Modals/Pompe/PompeCiterneDissociationModal';

// ----------------------------------------------------------------------------------------------------------------

/**
 * Page d'affichage et de gestion des pompes à carburant.
 * @param {object} props.pompes - Liste paginée des pompes (Inertia data).
 * @param {Array} props.agencies - Liste complète des agences.
 * @param {Array} props.citernes - Liste complète des citernes (pour la modal d'association).
 */
const FuelPompes = ({ pompes, agencies, citernes }) => {
    // --- États pour la gestion des Modals ---
    const [isPompeFormModalOpen, setIsPompeFormModalOpen] = useState(false);
    const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false); // NOUVEL ÉTAT
    const [isDissociationModalOpen, setIsDissociationModalOpen] = useState(false); // NOUVEL ÉTAT
    const [selectedPompe, setSelectedPompe] = useState(null);

    // --- États pour les filtres ---
    const [filterAgency, setFilterAgency] = useState('');
    const [filterName, setFilterName] = useState('');

    const { delete: inertiaDelete } = useForm();
    const { props: { auth } } = usePage();

    // ---------------------------------------------
    // --- Fonctions de gestion de la Modal Formulaire (Création/Édition) ---
    // ---------------------------------------------
    
    const openCreatePompeModal = () => {
        setSelectedPompe(null);
        setIsPompeFormModalOpen(true);
    };

    const openEditPompeModal = (pompe) => {
        setSelectedPompe(pompe);
        setIsPompeFormModalOpen(true);
    };

    const closePompeFormModal = () => {
        setIsPompeFormModalOpen(false);
        setSelectedPompe(null);
    };

    // ---------------------------------------------
    // --- NOUVEAU : Fonctions de gestion de la Modal d'Association ---
    // ---------------------------------------------
    
    const openAssociationModal = (pompe) => {
        setSelectedPompe(pompe);
        setIsAssociationModalOpen(true);
    };

    const closeAssociationModal = () => {
        setIsAssociationModalOpen(false);
        setSelectedPompe(null);
        // Après association, on pourrait vouloir actualiser la liste des pompes si Inertia ne le fait pas automatiquement.
        // Puisque le contrôleur d'association renvoie un redirect, Inertia devrait actualiser la page.
    };

    const openDissociationModal = (pompe) => {
        setSelectedPompe(pompe);
        setIsDissociationModalOpen(true);
    };

    const closeDissociationModal = () => {
        setIsDissociationModalOpen(false);
        setSelectedPompe(null);
    };
    // ---------------------------------------------
    // --- Fonction pour gérer la suppression (inchangée) ---
    // ---------------------------------------------

    const handleDeletePompe = (pompeId, pompeName) => {
        Swal.fire({
            title: 'Êtes-vous sûr, monsieur ?',
            text: `Vous êtes sur le point de supprimer la pompe "${pompeName}". Cette action est irréversible !`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#676c75',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                inertiaDelete(route('pompes.destroy', pompeId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Supprimée !', 'La pompe a été supprimée avec succès.', 'success');
                    },
                    onError: (errors) => {
                        console.error('Erreur de suppression:', errors);
                        const errorMessage = errors.error || 'Une erreur est survenue lors de la suppression de la pompe.';
                        Swal.fire('Erreur !', errorMessage, 'error');
                    },
                });
            }
        });
    };

    // ---------------------------------------------
    // --- Logique de Filtrage (inchangée) ---
    // ---------------------------------------------
    
    const filteredPompes = useMemo(() => {
        const pompesData = pompes.data || pompes; 
        if (!pompesData || !Array.isArray(pompesData)) return [];

        return pompesData.filter(pompe => {
            const matchesAgency = filterAgency === '' || (pompe.agency_id && pompe.agency_id.toString() === filterAgency);
            const matchesName = filterName === '' || pompe.name.toLowerCase().includes(filterName.toLowerCase());

            return matchesAgency && matchesName;
        });
    }, [pompes, filterAgency, filterName]);

    // ----------------------------------------------------------------------------------------------------------------

    return (
        <>
            <Head title='FuelPompes' />
            <div className="p-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-4">
                    Gestion des FuelPompes
                </h1>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                    
                    {/* Section d'en-tête et Bouton Créer */}
                    <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Liste Des FuelPompes
                            </h3>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={openCreatePompeModal}
                                className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 dark:border-blue-700"
                            >
                                <FontAwesomeIcon icon={faPlus} /> Créer une Pompe
                            </button>
                        </div>
                    </div>

                    {/* Section: Les Filtres */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Filtre par Nom de Pompe */}
                        <input
                            type="text"
                            placeholder="Rechercher par Nom de Pompe..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="rounded-lg border border-gray-300 p-2.5 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 col-span-1 sm:col-span-2"
                        />

                        {/* Filtre par Agence (Conservé avec le SELECT HTML standard) */}
                        <select
                            value={filterAgency}
                            onChange={(e) => setFilterAgency(e.target.value)}
                            className="rounded-lg border border-gray-300 p-2.5 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                            <option value="">Toutes les Agences</option>
                            {agencies && agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>
                                    {agency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Fin des Filtres */}

                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                <TableRow>
                                    <TableCell isHeader>Nom de la Pompe</TableCell>
                                    <TableCell isHeader>Agence</TableCell>
                                    <TableCell isHeader>Cuve(s) Liée(s)</TableCell>
                                    <TableCell isHeader className='text-center'>Actions</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredPompes.length > 0 ? (
                                    filteredPompes.map((pompe) => (
                                        <TableRow key={pompe.id}>
                                            <TableCell className="font-medium text-gray-900 dark:text-white">{pompe.name}</TableCell>
                                            <TableCell>{pompe.agency ? pompe.agency.name : 'N/A'}</TableCell>
                                            <TableCell className="max-w-xs text-sm truncate">
                                                {/* Affichage des cuves liées, séparées par une virgule */}
                                                {pompe.cuves && pompe.cuves.length > 0
                                                    ? pompe.cuves.map(cuve => cuve.name + (cuve.product_type ? ` (${cuve.product_type})` : '')).join(', ')
                                                    : <span className='italic text-gray-500 dark:text-gray-400'>Aucune cuve liée</span>}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex justify-center dark:text-gray-400">
                                                
                                                {/* NOUVEAU BOUTON : Associer les Cuves */}
                                                <button
                                                    onClick={() => openAssociationModal(pompe)}
                                                    title="Associer des cuves à cette pompe"
                                                    className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:bg-green-800 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-200"
                                                >
                                                    <FontAwesomeIcon icon={faLink} /> Lier Cuve(s)
                                                </button>
                                                {/* NOUVEAU BOUTON : Dissocier les Cuves */}
                                        {pompe.cuves && pompe.cuves.length > 0 && (
                                            <button
                                                onClick={() => openDissociationModal(pompe)}
                                                title="Dissocier des cuves de cette pompe"
                                                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                                            >
                                                <FontAwesomeIcon icon={faLinkSlash} /> Retirer Cuve(s)
                                            </button>
                                        )}
                                                {/* Bouton Modifier */}
                                                <button
                                                    onClick={() => openEditPompeModal(pompe)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-yellow-700 shadow-theme-xs hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-700 dark:bg-yellow-800 dark:text-yellow-400 dark:hover:bg-white/[0.03] dark:hover:text-yellow-200"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} /> Modifier
                                                </button>
                                                
                                                {/* Bouton Supprimer */}
                                                <button
                                                    onClick={() => handleDeletePompe(pompe.id, pompe.name)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} /> Supprimer
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-3 text-center text-gray-500 dark:text-gray-400">
                                            {pompes.data && pompes.data.length > 0 ? 
                                                'Aucune pompe ne correspond aux critères de filtre.' : 
                                                'Aucune pompe trouvée.'
                                            }
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination InertiaJS (inchangée) */}
                        {(pompes.links && pompes.links.length > 3) && (
                            <nav className="flex justify-end mt-4">
                                <div className="flex gap-2">
                                    {pompes.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                                            ${link.active
                                                ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                                                : link.url === null
                                                    ? 'bg-white border-gray-300 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
                                            }`}
                                            preserveState
                                            preserveScroll
                                            only={['pompes']}
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
                </div>
            </div>

            {/* Modal de formulaire de Pompe (Création/Édition) */}
            <PompeFormModal
                isOpen={isPompeFormModalOpen}
                onClose={closePompeFormModal}
                agencies={agencies}
                pompe={selectedPompe}
                title={selectedPompe ? 'Modifier la Pompe' : 'Créer une Nouvelle Pompe'}
            />

            {/* NOUVELLE MODAL : Association Pompe-Citerne */}
            <PompeCiterneAssociationModal
                isOpen={isAssociationModalOpen}
                onClose={closeAssociationModal}
                pompe={selectedPompe}
                allCiternes={citernes} // Passer la liste complète des citernes ici
            />
            {/* NOUVELLE MODAL : Dissociation Pompe-Citerne */}
            <PompeCiterneDissociationModal
                isOpen={isDissociationModalOpen}
                onClose={closeDissociationModal}
                pompe={selectedPompe} // La pompe DOIT contenir la relation 'cuves' chargée !
            />
        </>
    );
};

FuelPompes.layout = page => <DirFuelLayout children={page} />;
export default FuelPompes;