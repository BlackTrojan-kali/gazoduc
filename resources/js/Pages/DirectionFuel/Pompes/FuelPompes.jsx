import React, { useState, useMemo, useEffect } from 'react';
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
    faFilter,
    faFolder,
    faFolderOpen,
    faChevronRight,
    faChevronDown,
    faPlug
} from '@fortawesome/free-solid-svg-icons';

// --- Imports des Modals ---
import PompeFormModal from '../../../components/Modals/Pompe/PompeModal'; 
import PompeCiterneAssociationModal from '../../../components/Modals/Pompe/PompeCiterneAssociationModal';
import PompeCiterneDissociationModal from '../../../components/Modals/Pompe/PompeCiterneDissociationModal';
import Swal from 'sweetalert2';

const FuelPompes = ({ pompes, agencies, citernes }) => {
    // --- États ---
    const [isPompeFormModalOpen, setIsPompeFormModalOpen] = useState(false);
    const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false);
    const [isDissociationModalOpen, setIsDissociationModalOpen] = useState(false);
    const [selectedPompe, setSelectedPompe] = useState(null);

    // --- Filtres ---
    const [filterAgency, setFilterAgency] = useState('');
    const [filterName, setFilterName] = useState('');

    // --- État des Dossiers ---
    const [expandedAgencies, setExpandedAgencies] = useState({});

    const { delete: inertiaDelete } = useForm();

    // --- Gestionnaires de Modal ---
    const openCreatePompeModal = () => { setSelectedPompe(null); setIsPompeFormModalOpen(true); };
    const openEditPompeModal = (pompe) => { setSelectedPompe(pompe); setIsPompeFormModalOpen(true); };
    const closePompeFormModal = () => { setIsPompeFormModalOpen(false); setSelectedPompe(null); };

    const openAssociationModal = (pompe) => { setSelectedPompe(pompe); setIsAssociationModalOpen(true); };
    const closeAssociationModal = () => { setIsAssociationModalOpen(false); setSelectedPompe(null); };

    const openDissociationModal = (pompe) => { setSelectedPompe(pompe); setIsDissociationModalOpen(true); };
    const closeDissociationModal = () => { setIsDissociationModalOpen(false); setSelectedPompe(null); };

    // --- Suppression ---
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

    // --- 1. Filtrage à plat ---
    const filteredPompes = useMemo(() => {
        const pompesData = pompes.data || pompes; 
        if (!pompesData || !Array.isArray(pompesData)) return [];
        return pompesData.filter(pompe => {
            const matchesAgency = filterAgency === '' || (pompe.agency_id && pompe.agency_id.toString() === filterAgency);
            const matchesName = filterName === '' || pompe.name.toLowerCase().includes(filterName.toLowerCase());
            return matchesAgency && matchesName;
        });
    }, [pompes, filterAgency, filterName]);

    // --- 2. Regroupement par Agence ---
    const groupedPompes = useMemo(() => {
        const groups = {};
        filteredPompes.forEach(pompe => {
            const agencyName = pompe.agency?.name || 'Agence Non Assignée';
            if (!groups[agencyName]) {
                groups[agencyName] = [];
            }
            groups[agencyName].push(pompe);
        });
        return groups;
    }, [filteredPompes]);

    // --- 3. Auto-Ouverture lors de la recherche ---
    useEffect(() => {
        if (filterName) {
            const allOpen = {};
            Object.keys(groupedPompes).forEach(key => allOpen[key] = true);
            setExpandedAgencies(allOpen);
        }
    }, [filterName, groupedPompes]);

    // --- Toggle Dossier ---
    const toggleAgency = (agencyName) => {
        setExpandedAgencies(prev => ({
            ...prev,
            [agencyName]: !prev[agencyName]
        }));
    };

    return (
        <>
            <Head title='Gestion des Pompes' />
            
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative p-6">
                {/* Background Blueprint */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* En-tête */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-blue-200">
                                <FontAwesomeIcon icon={faGasPump} />
                            </span>
                            Workflow Pompes
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-10">
                            Configuration des nœuds de distribution.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Recherche */}
                        <div className="relative group flex-grow md:flex-grow-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-slate-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Rechercher..." 
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 w-full md:w-48 transition-all"
                            />
                        </div>

                        {/* Filtre Select */}
                        <div className="relative flex-grow md:flex-grow-0">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faFilter} className="text-slate-400" />
                            </div>
                            <select
                                value={filterAgency}
                                onChange={(e) => setFilterAgency(e.target.value)}
                                className="pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer w-full md:w-auto"
                            >
                                <option value="">Toutes les Agences</option>
                                {agencies && agencies.map((agency) => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={openCreatePompeModal}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap w-full md:w-auto"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Nouveau Nœud</span>
                        </button>
                    </div>
                </div>

                {/* --- LISTE DES DOSSIERS (AGENCES) --- */}
                <div className="relative z-10 space-y-6">
                    {Object.entries(groupedPompes).map(([agencyName, pompesList]) => {
                        const isExpanded = expandedAgencies[agencyName];

                        return (
                            <div key={agencyName} className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
                                
                                {/* HEADER DOSSIER */}
                                <div 
                                    onClick={() => toggleAgency(agencyName)}
                                    className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                                            <FontAwesomeIcon icon={faBuilding} size="lg" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                {agencyName}
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                {pompesList.length} pompe(s) installée(s)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-slate-400">
                                        <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                                    </div>
                                </div>

                                {/* CONTENU DOSSIER (GRILLE) */}
                                {isExpanded && (
                                    <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {pompesList.map((pompe) => (
                                                <div key={pompe.id} className="group relative bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">
                                                    
                                                    {/* Barre de Status (Connecté ou non) */}
                                                    <div className={`h-1 w-full ${pompe.cuves && pompe.cuves.length > 0 ? 'bg-green-500' : 'bg-red-400'}`}></div>
                                                    
                                                    {/* En-tête Carte */}
                                                    <div className="p-4 flex justify-between items-start border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                                                                <FontAwesomeIcon icon={faGasPump} size="lg" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{pompe.name}</h3>
                                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded w-fit">
                                                                    ID: {pompe.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Actions Rapides */}
                                                        <div className="flex gap-1">
                                                            <button 
                                                                onClick={() => openEditPompeModal(pompe)}
                                                                className="p-1.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                                                title="Éditer"
                                                            >
                                                                <FontAwesomeIcon icon={faEdit} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeletePompe(pompe.id, pompe.name)}
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Supprimer"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Connexions (Sources) */}
                                                    <div className="p-4 flex-1 flex flex-col gap-3">
                                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex justify-between items-center">
                                                            <span>Sources (Cuves)</span>
                                                            <FontAwesomeIcon icon={faPlug} className="text-slate-300" />
                                                        </div>

                                                        <div className="space-y-2">
                                                            {pompe.cuves && pompe.cuves.length > 0 ? (
                                                                pompe.cuves.map((cuve, idx) => (
                                                                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                                                    <FontAwesomeIcon icon={faDatabase} className="text-[10px] text-slate-400" />
                                                                                    {cuve.name}
                                                                                </span>
                                                                                <span className="text-[9px] text-slate-500 uppercase">{cuve.product_type || 'N/A'}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-2 p-3 rounded border border-dashed border-red-200 bg-red-50/50 text-red-400 text-xs">
                                                                    <FontAwesomeIcon icon={faLinkSlash} />
                                                                    <span>Non connecté</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions Footer */}
                                                    <div className="bg-white dark:bg-slate-800 p-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center gap-2">
                                                        <button
                                                            onClick={() => openAssociationModal(pompe)}
                                                            className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-md transition-colors"
                                                        >
                                                            <FontAwesomeIcon icon={faLink} className="text-green-500" /> Lier
                                                        </button>
                                                        
                                                        {pompe.cuves && pompe.cuves.length > 0 && (
                                                            <button
                                                                onClick={() => openDissociationModal(pompe)}
                                                                className="flex-1 inline-flex justify-center items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-md transition-colors"
                                                            >
                                                                <FontAwesomeIcon icon={faLinkSlash} className="text-red-500" /> Délier
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {Object.keys(groupedPompes).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="text-4xl mb-4 opacity-30">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                            <p className="text-lg font-medium">Aucune pompe trouvée</p>
                            <p className="text-sm">Vérifiez vos filtres ou créez une nouvelle pompe.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {(pompes.links && pompes.links.length > 3) && (
                    <div className="mt-8 flex justify-center pb-8">
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

            {/* Modals */}
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