import React, { useState, useMemo } from 'react';
import DirFuelLayout from '../../../layout/DirFuelLayout/DirFuelLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEdit, 
    faPlus, 
    faTrash, 
    faGasPump, 
    faLink, 
    faLinkSlash, 
    faDatabase, 
    faBuilding,
    faSearch,
    faFilter
} from '@fortawesome/free-solid-svg-icons';

// --- Imports des Modals (Inchangés) ---
import PompeFormModal from '../../../components/Modals/Pompe/PompeModal'; 
import PompeCiterneAssociationModal from '../../../components/Modals/Pompe/PompeCiterneAssociationModal';
import PompeCiterneDissociationModal from '../../../components/Modals/Pompe/PompeCiterneDissociationModal';
import Swal from 'sweetalert2';

const FuelPompes = ({ pompes, agencies, citernes }) => {
    // --- États (Inchangés) ---
    const [isPompeFormModalOpen, setIsPompeFormModalOpen] = useState(false);
    const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false);
    const [isDissociationModalOpen, setIsDissociationModalOpen] = useState(false);
    const [selectedPompe, setSelectedPompe] = useState(null);

    // --- Filtres ---
    const [filterAgency, setFilterAgency] = useState('');
    const [filterName, setFilterName] = useState('');

    const { delete: inertiaDelete } = useForm();

    // --- Gestionnaires de Modal (Inchangés) ---
    const openCreatePompeModal = () => { setSelectedPompe(null); setIsPompeFormModalOpen(true); };
    const openEditPompeModal = (pompe) => { setSelectedPompe(pompe); setIsPompeFormModalOpen(true); };
    const closePompeFormModal = () => { setIsPompeFormModalOpen(false); setSelectedPompe(null); };

    const openAssociationModal = (pompe) => { setSelectedPompe(pompe); setIsAssociationModalOpen(true); };
    const closeAssociationModal = () => { setIsAssociationModalOpen(false); setSelectedPompe(null); };

    const openDissociationModal = (pompe) => { setSelectedPompe(pompe); setIsDissociationModalOpen(true); };
    const closeDissociationModal = () => { setIsDissociationModalOpen(false); setSelectedPompe(null); };

    // --- Suppression (Inchangé) ---
    const handleDeletePompe = (pompeId, pompeName) => {
        Swal.fire({
            title: 'Supprimer ce nœud ?',
            text: `La pompe "${pompeName}" sera définitivement supprimée.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            background: '#fff',
            customClass: { popup: 'rounded-xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                inertiaDelete(route('pompes.destroy', pompeId), {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire({ title: 'Supprimé!', icon: 'success', timer: 1500, showConfirmButton: false }),
                    onError: (errors) => Swal.fire('Erreur', 'Impossible de supprimer.', 'error'),
                });
            }
        });
    };

    // --- Logique de Filtrage (Inchangée) ---
    const filteredPompes = useMemo(() => {
        const pompesData = pompes.data || pompes; 
        if (!pompesData || !Array.isArray(pompesData)) return [];
        return pompesData.filter(pompe => {
            const matchesAgency = filterAgency === '' || (pompe.agency_id && pompe.agency_id.toString() === filterAgency);
            const matchesName = filterName === '' || pompe.name.toLowerCase().includes(filterName.toLowerCase());
            return matchesAgency && matchesName;
        });
    }, [pompes, filterAgency, filterName]);

    // --- Rendu Graphique Style n8n ---
    return (
        <>
            <Head title='Gestion des Pompes' />
            
            {/* Background Canvas Effect */}
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative p-6">
                {/* Motif de fond style "Blueprint/Canvas" */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* Header Flottant */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">
                                <FontAwesomeIcon icon={faGasPump} />
                            </span>
                            Workflow Pompes
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-10">
                            Configurez les nœuds de distribution et leurs sources.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Barre de Recherche Style "Palette" */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Filtrer par nom..." 
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-48 transition-all"
                            />
                        </div>

                        {/* Filtre Agence */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faFilter} className="text-slate-400" />
                            </div>
                            <select
                                value={filterAgency}
                                onChange={(e) => setFilterAgency(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                                <option value="">Toutes les Agences</option>
                                {agencies && agencies.map((agency) => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={openCreatePompeModal}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Nouveau Nœud</span>
                        </button>
                    </div>
                </div>

                {/* Grid des Nœuds (Pompes) */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPompes.length > 0 ? filteredPompes.map((pompe) => (
                        <div key={pompe.id} className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
                            
                            {/* En-tête du Nœud (Style n8n) */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                            <div className="p-4 flex justify-between items-start border-b border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <FontAwesomeIcon icon={faGasPump} size="lg" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{pompe.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            <FontAwesomeIcon icon={faBuilding} className="text-[10px]" />
                                            <span>{pompe.agency?.name || 'Agence N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Actions Rapides (Edit/Delete) */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openEditPompeModal(pompe)}
                                        className="p-1.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                        title="Configurer le nœud"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeletePompe(pompe.id, pompe.name)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Supprimer le nœud"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>

                            {/* Corps du Nœud : Connexions (Inputs) */}
                            <div className="p-4 flex-1 flex flex-col gap-3">
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex justify-between items-center">
                                    <span>Source (Cuves)</span>
                                    {/* Indicateur visuel de connexion */}
                                    <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                                </div>

                                <div className="space-y-2 relative">
                                    {/* Ligne de connexion visuelle verticale (Optionnelle) */}
                                    <div className="absolute left-[-24px] top-0 bottom-0 w-px border-l border-dashed border-slate-300 dark:border-slate-600 hidden group-hover:block"></div>

                                    {pompe.cuves && pompe.cuves.length > 0 ? (
                                        pompe.cuves.map((cuve, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 group/item">
                                                <div className="flex items-center gap-2">
                                                    {/* Point de connexion (Input Dot) */}
                                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            <FontAwesomeIcon icon={faDatabase} className="mr-1.5 opacity-70" />
                                                            {cuve.name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500">{cuve.product_type || 'Produit inconnu'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center gap-2 p-2 rounded border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 italic text-xs">
                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                            <span>Aucune source connectée</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer : Boutons d'Action Workflow */}
                            <div className="bg-slate-50 dark:bg-slate-900/30 p-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-2">
                                <button
                                    onClick={() => openAssociationModal(pompe)}
                                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100/50 hover:bg-green-100 rounded-md transition-colors border border-green-200"
                                >
                                    <FontAwesomeIcon icon={faLink} /> Lier
                                </button>
                                
                                {pompe.cuves && pompe.cuves.length > 0 && (
                                    <button
                                        onClick={() => openDissociationModal(pompe)}
                                        className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100/50 hover:bg-red-100 rounded-md transition-colors border border-red-200"
                                    >
                                        <FontAwesomeIcon icon={faLinkSlash} /> Délier
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="text-6xl mb-4 opacity-20">
                                <FontAwesomeIcon icon={faGasPump} />
                            </div>
                            <p className="text-lg font-medium">Aucun nœud trouvé</p>
                            <p className="text-sm">Ajustez les filtres ou créez une nouvelle pompe.</p>
                        </div>
                    )}
                </div>

                {/* Pagination (Style Flottant en bas) */}
                {(pompes.links && pompes.links.length > 3) && (
                    <div className="mt-8 flex justify-center">
                        <nav className="inline-flex rounded-xl shadow-lg bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                            {pompes.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all
                                    ${link.active
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : link.url === null
                                            ? 'text-slate-300 cursor-not-allowed'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                                    }`}
                                    onClick={(e) => !link.url && e.preventDefault()}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    </div>
                )}
            </div>

            {/* Modals (Inchangés) */}
            <PompeFormModal
                isOpen={isPompeFormModalOpen}
                onClose={closePompeFormModal}
                agencies={agencies}
                pompe={selectedPompe}
                title={selectedPompe ? 'Configuration du Nœud' : 'Nouveau Nœud Pompe'}
            />

            <PompeCiterneAssociationModal
                isOpen={isAssociationModalOpen}
                onClose={closeAssociationModal}
                pompe={selectedPompe}
                allCiternes={citernes}
            />

            <PompeCiterneDissociationModal
                isOpen={isDissociationModalOpen}
                onClose={closeDissociationModal}
                pompe={selectedPompe}
            />
        </>
    );
};

FuelPompes.layout = page => <DirFuelLayout children={page} />;
export default FuelPompes;