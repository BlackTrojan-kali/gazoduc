import React, { useState, useMemo } from 'react';
import DirLayout from '../../layout/DirLayout/DirLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faEdit, 
    faPlus, 
    faTrash, 
    faBoxesStacked, 
    faDatabase, 
    faIndustry, 
    faMapMarkerAlt,
    faSearch,
    faFilter,
    faTruckDroplet,
    faWeightHanging
} from '@fortawesome/free-solid-svg-icons';

import CiterneFormModal from '../../components/Modals/Direction/CiternModal'; 
import Swal from 'sweetalert2';

const Citernes = ({ citernes, entreprises, products, agencies }) => {

    // --- États (Inchangés) ---
    const [isCiterneFormModalOpen, setIsCiterneFormModalOpen] = useState(false);
    const [selectedCiterne, setSelectedCiterne] = useState(null);

    // --- Filtres ---
    const [filterAgency, setFilterAgency] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [filterName, setFilterName] = useState('');

    const { delete: inertiaDelete, post: inertiaPost } = useForm();

    // --- Gestionnaires de Modal ---
    const openCreateCiterneModal = () => { setSelectedCiterne(null); setIsCiterneFormModalOpen(true); };
    const openEditCiterneModal = (citerne) => { setSelectedCiterne(citerne); setIsCiterneFormModalOpen(true); };
    const closeCiterneFormModal = () => { setIsCiterneFormModalOpen(false); setSelectedCiterne(null); };

    // --- Helpers de Design ---
    const getProductColor = (productName) => {
        if (!productName) return 'border-gray-300 text-gray-500 bg-gray-50';
        const name = productName.toLowerCase();
        if (name.includes('gasoil') || name.includes('diesel')) return 'border-yellow-400 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
        if (name.includes('super') || name.includes('essence')) return 'border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20';
        return 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    };

    // --- Suppression ---
    const handleDeleteCiterne = (citerneId, citerneName) => {
        Swal.fire({
            title: 'Supprimer ce réservoir ?',
            text: `La citerne "${citerneName}" sera supprimée définitivement.`,
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
                inertiaDelete(route('citernes.destroy', citerneId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({ title: 'Supprimée !', icon: 'success', timer: 1500, showConfirmButton: false });
                        window.location.reload();
                    },
                    onError: () => Swal.fire('Erreur', 'Impossible de supprimer.', 'error'),
                });
            }
        });
    }; 

    // --- Initialisation Stock ---
    const handleCreateCiterneStock = (citerneId, citerneName, currentProductId) => {
        Swal.fire({
            title: 'Initialisation du Stock',
            text: `Créer un stock initial (0) pour "${citerneName}" ?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            confirmButtonText: 'Oui, initialiser',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                inertiaPost(route('citernes.generate-stock', { citerne_id: citerneId, article_id: currentProductId }), {
                    preserveScroll: true,
                    onSuccess: () => Swal.fire('Succès', 'Stock initialisé.', 'success'),
                    onError: (errors) => Swal.fire('Erreur', errors.message || 'Erreur inconnue', 'error'),
                });
            }
        });
    };

    // --- Logique de Filtrage ---
    const filteredCiternes = useMemo(() => {
        if (!citernes.data) return [];
        return citernes.data.filter(citerne => {
            const matchesAgency = filterAgency === '' || citerne.agency_id.toString() === filterAgency;
            const matchesProduct = filterProduct === '' || (citerne.current_product_id && citerne.current_product_id.toString() === filterProduct);
            const matchesName = filterName === '' || citerne.name.toLowerCase().includes(filterName.toLowerCase());
            return matchesAgency && matchesProduct && matchesName;
        });
    }, [citernes.data, filterAgency, filterProduct, filterName]);

    return (
        <>
            <Head title='Gestion des Citernes' />
            
            {/* Background Canvas Effect (Cohérent avec Pompes) */}
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative p-6">
                 <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* Header & Controls */}
                <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <span className="bg-indigo-600 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-indigo-200 shadow-lg">
                                <FontAwesomeIcon icon={faDatabase} />
                            </span>
                            Parc de Citernes
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-14">
                            Gérez vos capacités de stockage et l'affectation des produits.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                        {/* Barre de Recherche */}
                        <div className="relative group flex-grow md:flex-grow-0">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Rechercher une citerne..." 
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                            />
                        </div>

                        {/* Filtres Select */}
                        <div className="flex gap-2">
                             <div className="relative flex-grow">
                                <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                                <select
                                    value={filterAgency}
                                    onChange={(e) => setFilterAgency(e.target.value)}
                                    className="pl-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 appearance-none w-full md:w-48 cursor-pointer"
                                >
                                    <option value="">Toutes Agences</option>
                                    {agencies?.map(agency => <option key={agency.id} value={agency.id}>{agency.name}</option>)}
                                </select>
                            </div>
                            
                            <div className="relative flex-grow">
                                <select
                                    value={filterProduct}
                                    onChange={(e) => setFilterProduct(e.target.value)}
                                    className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 appearance-none w-full md:w-40 cursor-pointer"
                                >
                                    <option value="">Tous Produits</option>
                                    {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={openCreateCiterneModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Nouvelle Citerne</span>
                        </button>
                    </div>
                </div>

                {/* Grid des Citernes */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                    {filteredCiternes.length > 0 ? filteredCiternes.map((citerne) => {
                        const themeClass = getProductColor(citerne.article?.name); // Couleur basée sur le produit
                        
                        return (
                            <div key={citerne.id} className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
                                
                                {/* Bandeau supérieur coloré */}
                                <div className={`h-2 w-full border-b ${themeClass.split(' ')[0]} bg-gradient-to-r from-transparent via-current to-transparent opacity-50`}></div>

                                <div className="p-5 flex-1 flex flex-col">
                                    {/* En-tête Carte */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${themeClass}`}>
                                                <FontAwesomeIcon icon={faDatabase} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{citerne.name}</h3>
                                                <div className="flex items-center gap-2 text-xs font-medium mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border ${citerne.type === 'fixed' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                                        {citerne.type === 'fixed' ? 'Fixe' : 'Mobile'}
                                                    </span>
                                                    {citerne.product_type && (
                                                        <span className="text-slate-400">• {citerne.product_type}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Corps de la Carte : Infos Techniques */}
                                    <div className="grid grid-cols-2 gap-3 mb-5 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Capacité Vol.</span>
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold">
                                                <FontAwesomeIcon icon={faTruckDroplet} className="text-indigo-400 text-xs" />
                                                {parseInt(citerne.capacity_liter).toLocaleString()} L
                                            </div>
                                        </div>
                                        <div className="space-y-1 pl-3 border-l border-slate-200 dark:border-slate-700">
                                            <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Masse Max</span>
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold">
                                                <FontAwesomeIcon icon={faWeightHanging} className="text-indigo-400 text-xs" />
                                                {parseInt(citerne.capacity_kg).toLocaleString()} kg
                                            </div>
                                        </div>
                                    </div>

                                    {/* Localisation & Produit */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4" /> Agence
                                            </span>
                                            <span className="font-medium text-slate-800 dark:text-white">{citerne.agency?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                <FontAwesomeIcon icon={faIndustry} className="w-4" /> Entreprise
                                            </span>
                                            <span className="font-medium text-slate-800 dark:text-white truncate max-w-[150px]">{citerne.entreprise?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-700">
                                            <span className="text-slate-500 dark:text-slate-400">Produit Actuel</span>
                                            <span className={`font-bold ${themeClass.split(' ')[1]}`}>
                                                {citerne.article?.name || 'Aucun'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="bg-slate-50 dark:bg-slate-900/30 p-3 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                    <button 
                                        onClick={() => openEditCiterneModal(citerne)}
                                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faEdit} /> Configurer
                                    </button>
                                    
                                    {citerne.type === 'fixed' && (
                                        <button 
                                            onClick={() => handleCreateCiterneStock(citerne.id, citerne.name, citerne.current_product_id)}
                                            className="px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                            title="Initialiser le stock"
                                        >
                                            <FontAwesomeIcon icon={faBoxesStacked} />
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleDeleteCiterne(citerne.id, citerne.name)}
                                        className="px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                        title="Supprimer"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        /* Empty State */
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50">
                                <FontAwesomeIcon icon={faDatabase} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Aucune Citerne Trouvée</h3>
                            <p className="text-sm">Modifiez vos filtres ou ajoutez une nouvelle cuve.</p>
                        </div>
                    )}
                </div>

                {/* Pagination (Style Flottant) */}
                {(citernes.links && citernes.links.length > 3) && (
                    <div className="mt-10 flex justify-center pb-8">
                        <nav className="inline-flex rounded-xl shadow-lg bg-white dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 gap-1">
                            {citernes.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all
                                    ${link.active
                                        ? 'bg-indigo-600 text-white shadow-md'
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

            {/* Modal */}
            <CiterneFormModal
                isOpen={isCiterneFormModalOpen}
                onClose={closeCiterneFormModal}
                entreprises={entreprises}
                agencies={agencies}
                products={products}
                selectedCiterne={selectedCiterne}
            />
        </>
    );
};

Citernes.layout = page => <DirLayout children={page} />;
export default Citernes;