import React, { useState, useMemo, useEffect } from 'react';
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
    faWeightHanging,
    faFolder,
    faFolderOpen,
    faChevronRight,
    faChevronDown,
    faBuilding
} from '@fortawesome/free-solid-svg-icons';

import CiterneFormModal from '../../components/Modals/Direction/CiternModal'; 
import Swal from 'sweetalert2';

const Citernes = ({ citernes, entreprises, products, agencies }) => {

    // --- États ---
    const [isCiterneFormModalOpen, setIsCiterneFormModalOpen] = useState(false);
    const [selectedCiterne, setSelectedCiterne] = useState(null);

    // --- Filtres ---
    const [filterAgency, setFilterAgency] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [filterName, setFilterName] = useState('');

    // --- États Dossiers (Expansion) ---
    const [expandedAgencies, setExpandedAgencies] = useState({});
    const [expandedProducts, setExpandedProducts] = useState({});

    const { delete: inertiaDelete, post: inertiaPost } = useForm();

    // --- Gestionnaires de Modal ---
    const openCreateCiterneModal = () => { setSelectedCiterne(null); setIsCiterneFormModalOpen(true); };
    const openEditCiterneModal = (citerne) => { setSelectedCiterne(citerne); setIsCiterneFormModalOpen(true); };
    const closeCiterneFormModal = () => { setIsCiterneFormModalOpen(false); setSelectedCiterne(null); };

    // --- Helpers de Design ---
    const getProductColor = (productName) => {
        if (!productName) return 'border-gray-300 text-gray-500 bg-gray-50';
        const name = productName.toLowerCase();
        if (name.includes('gas') || name.includes('butane')) return 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/20';
        if (name.includes('oxygen') || name.includes('air')) return 'border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20';
        return 'border-indigo-400 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20';
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

    // --- 1. Filtrage à plat ---
    const filteredCiternes = useMemo(() => {
        if (!citernes.data) return [];
        return citernes.data.filter(citerne => {
            const matchesAgency = filterAgency === '' || citerne.agency_id.toString() === filterAgency;
            const matchesProduct = filterProduct === '' || (citerne.current_product_id && citerne.current_product_id.toString() === filterProduct);
            const matchesName = filterName === '' || citerne.name.toLowerCase().includes(filterName.toLowerCase());
            return matchesAgency && matchesProduct && matchesName;
        });
    }, [citernes.data, filterAgency, filterProduct, filterName]);

    // --- 2. Regroupement Hiérarchique (Agence -> Produit) ---
    const groupedData = useMemo(() => {
        const structure = {};
        filteredCiternes.forEach(citerne => {
            const agencyName = citerne.agency?.name || 'Agence Inconnue';
            // On regroupe par nom d'article ou par type de produit
            const productName = citerne.article?.name || citerne.product_type || 'Produit non défini';

            if (!structure[agencyName]) structure[agencyName] = {};
            if (!structure[agencyName][productName]) structure[agencyName][productName] = [];
            
            structure[agencyName][productName].push(citerne);
        });
        return structure;
    }, [filteredCiternes]);

    // --- 3. Ouverture automatique lors de la recherche ---
    useEffect(() => {
        if (filterName) {
            const allAgencies = {};
            const allProducts = {};
            Object.keys(groupedData).forEach(agency => {
                allAgencies[agency] = true;
                Object.keys(groupedData[agency]).forEach(prod => {
                    allProducts[`${agency}-${prod}`] = true;
                });
            });
            setExpandedAgencies(allAgencies);
            setExpandedProducts(allProducts);
        }
    }, [filterName, groupedData]);

    // --- Helpers Toggle ---
    const toggleAgency = (agencyName) => {
        setExpandedAgencies(prev => ({ ...prev, [agencyName]: !prev[agencyName] }));
    };
    const toggleProduct = (agencyName, productName) => {
        const key = `${agencyName}-${productName}`;
        setExpandedProducts(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <>
            <Head title='Gestion des Citernes' />
            
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative p-6">
                 <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* En-tête & Contrôles */}
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
                        {/* Recherche */}
                        <div className="relative group flex-grow md:flex-grow-0">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Rechercher..." 
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                            />
                        </div>

                        {/* Filtres */}
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

                {/* --- LISTE HIERARCHIQUE DES CITERNES --- */}
                <div className="space-y-6 relative z-10">
                    {Object.entries(groupedData).map(([agencyName, productsMap]) => {
                        const isAgencyOpen = expandedAgencies[agencyName];
                        const totalCiternes = Object.values(productsMap).flat().length;

                        return (
                            <div key={agencyName} className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
                                
                                {/* NIVEAU 1 : AGENCE */}
                                <div 
                                    onClick={() => toggleAgency(agencyName)}
                                    className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isAgencyOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                            <FontAwesomeIcon icon={faBuilding} size="lg" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{agencyName}</h2>
                                            <p className="text-xs text-slate-500">{Object.keys(productsMap).length} produit(s) • {totalCiternes} citerne(s)</p>
                                        </div>
                                    </div>
                                    <div className="text-slate-400">
                                        <FontAwesomeIcon icon={isAgencyOpen ? faChevronDown : faChevronRight} />
                                    </div>
                                </div>

                                {/* CONTENU AGENCE */}
                                {isAgencyOpen && (
                                    <div className="p-5 space-y-4 bg-white dark:bg-slate-800">
                                        {Object.entries(productsMap).map(([productName, citernesList]) => {
                                            const productKey = `${agencyName}-${productName}`;
                                            const isProductOpen = expandedProducts[productKey];

                                            return (
                                                <div key={productKey} className="ml-2 md:ml-6 border-l-2 border-slate-100 dark:border-slate-700 pl-4">
                                                    
                                                    {/* NIVEAU 2 : PRODUIT */}
                                                    <div 
                                                        onClick={() => toggleProduct(agencyName, productName)}
                                                        className="flex items-center justify-between py-2 pr-2 cursor-pointer group select-none"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-amber-400 dark:text-amber-500">
                                                                <FontAwesomeIcon icon={isProductOpen ? faFolderOpen : faFolder} size="lg" />
                                                            </div>
                                                            <h3 className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
                                                                {productName}
                                                            </h3>
                                                            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-500 font-medium">
                                                                {citernesList.length}
                                                            </span>
                                                        </div>
                                                        <div className="text-slate-300 group-hover:text-slate-500">
                                                            <FontAwesomeIcon icon={isProductOpen ? faChevronDown : faChevronRight} size="sm" />
                                                        </div>
                                                    </div>

                                                    {/* NIVEAU 3 : GRILLE DES CITERNES */}
                                                    {isProductOpen && (
                                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fadeIn">
                                                            {citernesList.map((citerne) => {
                                                                const themeClass = getProductColor(citerne.article?.name);
                                                                
                                                                return (
                                                                    <div key={citerne.id} className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
                                                                        
                                                                        {/* Barre Couleur */}
                                                                        <div className={`h-1 w-full ${themeClass.split(' ')[0].replace('border', 'bg')}`}></div>

                                                                        <div className="p-4 flex-1 flex flex-col">
                                                                            {/* En-tête Carte */}
                                                                            <div className="flex justify-between items-start mb-3">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-inner ${themeClass}`}>
                                                                                        <FontAwesomeIcon icon={faDatabase} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h3 className="font-bold text-slate-800 dark:text-white text-md">{citerne.name}</h3>
                                                                                        <div className="flex items-center gap-2 text-[10px] font-medium mt-0.5 text-slate-500">
                                                                                            <span className="uppercase">{citerne.type === 'fixed' ? 'Fixe' : 'Mobile'}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Stats */}
                                                                            <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                                                                <div>
                                                                                    <span className="text-[9px] uppercase text-slate-400 font-bold">Volume</span>
                                                                                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold text-xs">
                                                                                        <FontAwesomeIcon icon={faTruckDroplet} className="text-indigo-400" />
                                                                                        {parseInt(citerne.capacity_liter).toLocaleString()} L
                                                                                    </div>
                                                                                </div>
                                                                                <div className="pl-2 border-l border-slate-200 dark:border-slate-700">
                                                                                    <span className="text-[9px] uppercase text-slate-400 font-bold">Masse</span>
                                                                                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-semibold text-xs">
                                                                                        <FontAwesomeIcon icon={faWeightHanging} className="text-indigo-400" />
                                                                                        {parseInt(citerne.capacity_kg).toLocaleString()} kg
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Actions */}
                                                                            <div className="flex gap-2 mt-auto">
                                                                                <button 
                                                                                    onClick={() => openEditCiterneModal(citerne)}
                                                                                    className="flex-1 py-1.5 rounded-md text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center justify-center gap-1"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faEdit} /> Éditer
                                                                                </button>
                                                                                
                                                                                <button 
                                                                                    onClick={() => handleCreateCiterneStock(citerne.id, citerne.name, citerne.current_product_id)}
                                                                                    className="px-2 py-1.5 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                                                                    title="Initialiser le stock"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faBoxesStacked} />
                                                                                </button>

                                                                                <button 
                                                                                    onClick={() => handleDeleteCiterne(citerne.id, citerne.name)}
                                                                                    className="px-2 py-1.5 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                                                                    title="Supprimer"
                                                                                >
                                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {Object.keys(groupedData).length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 text-2xl opacity-50">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Aucune Citerne Trouvée</h3>
                            <p className="text-sm">Vérifiez vos filtres ou ajoutez une nouvelle citerne.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
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