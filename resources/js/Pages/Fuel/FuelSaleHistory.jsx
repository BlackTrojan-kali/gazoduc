import React, { useState, useMemo } from 'react';
import MagLayout from '../../layout/MagLayout/MagLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFileExport, faSearch, faTimes, faGasPump } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';

import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import FuelSaleHistoryPDFExcelModal from '../../components/Modals/Fuel/FuelSaleHistoryPDFExcelModal'; 
import RegLayout from '../../layout/RegLayout/RegLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';
import useLicenceChoice from '../../hooks/useLicenceChoice';
import MagFuelLayout from '../../layout/FuelLayout/MagFuelLayout';
import DirFuelLayout from '../../layout/DirFuelLayout/DirFuelLayout';

// Composant principal de la page
const PageContent = ({ fuelSales: initialFuelSales, agencies, articles }) => {
    const { delete: inertiaDelete, processing } = useForm();
    const { props: { auth } } = usePage();
    
    // --- États et fonctions pour la modale d'exportation ---
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const openExportModal = () => setIsExportModalOpen(true);
    const closeExportModal = () => setIsExportModalOpen(false);

    // --- Gestion des filtres frontend ---
    const [filterState, setFilterState] = useState({
        search: '', 
        start_date: '',
        end_date: '',
        agency_id: '', 
        article_id: '', 
    });

    const handleFilterChange = (e) => {
        const { id, value } = e.target;
        setFilterState(prev => ({ ...prev, [id]: value }));
    };

    const resetFilters = () => {
        setFilterState({
            search: '',
            start_date: '',
            end_date: '',
            agency_id: '',
            article_id: '',
        });
    };

    // --- Fonction pour déterminer si un relevé peut être supprimé ---
    const canDelete = (saleCreatedAt) => {
        if (!auth.user || !auth.user.modif_days || auth.user.modif_days <= 0) {
            return false;
        }
        const today = new Date();
        const creationDate = new Date(saleCreatedAt);
        const diffTime = today.getTime() - creationDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= auth.user.modif_days;
    };

    // --- Filtrage côté frontend des données ---
    const filteredFuelSales = useMemo(() => {
        let currentSales = initialFuelSales.data ?? []; 

        // 1. Filtrer par Agence
        if (filterState.agency_id) {
            currentSales = currentSales.filter(sale =>
                sale.agency && String(sale.agency.id) === filterState.agency_id
            );
        }
        
        // 2. Filtrer par Article (Mise à jour architecture pistolet -> citerne -> article)
        if (filterState.article_id) {
            currentSales = currentSales.filter(sale =>
                sale.pistolet?.citerne?.article && String(sale.pistolet.citerne.article.id) === filterState.article_id
            );
        }

        // 3. Filtrer par Plage de Dates
        if (filterState.start_date && filterState.end_date) {
            const startDate = new Date(filterState.start_date);
            const endDate = new Date(filterState.end_date);
            endDate.setHours(23, 59, 59, 999);

            currentSales = currentSales.filter(sale => {
                const dateSaisie = sale.date_saisie ? new Date(sale.date_saisie) : new Date(sale.created_at);
                return dateSaisie >= startDate && dateSaisie <= endDate;
            });
        }

        // 4. Filtrer par Recherche textuelle
        if (filterState.search) {
            const searchTerm = filterState.search.toLowerCase();
            currentSales = currentSales.filter(sale => {
                const saleDateString = sale.date_saisie 
                    ? new Date(sale.date_saisie).toLocaleDateString('fr-FR')
                    : (sale.created_at ? new Date(sale.created_at).toLocaleDateString('fr-FR') : '');

                const searchString = [
                    String(sale.id),
                    sale.pistolet?.citerne?.article?.name, // Nom de l'Article/Carburant
                    sale.pistolet?.name, // Recherche par nom de pistolet
                    sale.pistolet?.pompe?.name, // Recherche par nom de la pompe/îlot
                    String(sale.volume_vendu), // Recherche par volume net
                    sale.agency?.name, 
                    sale.user ? `${sale.user.first_name} ${sale.user.last_name || ''}` : '',
                    saleDateString,
                ].join(' ').toLowerCase();

                return searchString.includes(searchTerm);
            });
        }

        return currentSales;
    }, [initialFuelSales.data, filterState]);

    // --- Fonction pour gérer la pagination après une suppression ---
    const applyPaginationAfterDelete = () => {
        const newPage = initialFuelSales.data?.length === 1 && initialFuelSales.current_page > 1
            ? initialFuelSales.current_page - 1
            : initialFuelSales.current_page;

        window.Inertia.get(route('fuel.history', { page: newPage, per_page: initialFuelSales.per_page }), {
            preserveScroll: true,
            preserveState: true,
            only: ['fuelSales'],
            onError: (errors) => {
                console.error('Erreur lors du rechargement après annulation:', errors);
                Swal.fire('Erreur de rechargement !', "La liste n'a pas pu être mise à jour correctement.", 'error');
            }
        });
    };

    // --- Fonction pour gérer l'annulation d'un relevé ---
    const handleDelete = (saleId) => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: 'Cette action va supprimer ce relevé d\'index et recréditer le stock de la cuve associée.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#676c75',
            confirmButtonText: 'Oui, annuler la saisie !',
            cancelButtonText: 'Non, conserver'
        }).then((result) => {
            if (result.isConfirmed) {
                inertiaDelete(route('fuelsales.delete', saleId), { 
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Annulé !', 'Le relevé a été supprimé et le stock rétabli.', 'success');
                        applyPaginationAfterDelete();
                    },
                    onError: (errors) => {
                        console.error('Erreur de suppression:', errors);
                        Swal.fire('Erreur !', 'Une erreur est survenue lors de l\'annulation. ' + (errors.message || 'Veuillez réessayer.'), 'error');
                    },
                }); 
            }
        });
    };
    
    return (
        <>
            <Head title="Historique Relevés Index Carburant" />
            <div className="p-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Historique des Clôtures & Relevés d'Index
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={openExportModal}
                                variant="secondary"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                            >
                                <FontAwesomeIcon icon={faFileExport} />
                                Exporter
                            </Button>
                        </div>
                    </div>

                    {/* --- Zone de Filtrage --- */}
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Rechercher & Filtrer</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <Input
                                id="search"
                                type="text"
                                label="Rechercher"
                                placeholder="ID, Pistolet, article, pompiste..."
                                value={filterState.search}
                                onChange={handleFilterChange}
                                className="col-span-full md:col-span-1"
                                icon={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
                            />

                            {agencies && agencies.length > 0 && (
                                <div>
                                    <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Station</label>
                                    <select
                                        id="agency_id"
                                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                                        value={filterState.agency_id}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Toutes les stations</option>
                                        {agencies.map(agency => (
                                            <option key={agency.id} value={String(agency.id)}>{agency.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {articles && articles.length > 0 && (
                                <div>
                                    <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carburant</label>
                                    <select
                                        id="article_id"
                                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:focus:border-brand-800"
                                        value={filterState.article_id}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Tous les carburants</option>
                                        {articles.map(article => (
                                            <option key={article.id} value={String(article.id)}>{article.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <Input
                                id="start_date"
                                type="date"
                                label="Date de début"
                                value={filterState.start_date}
                                onChange={handleFilterChange}
                            />
                            <Input
                                id="end_date"
                                type="date"
                                label="Date de fin"
                                value={filterState.end_date}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button onClick={resetFilters} variant="destructive" className="inline-flex items-center gap-2">
                                <FontAwesomeIcon icon={faTimes} />
                                Réinitialiser
                            </Button>
                        </div>
                    </div>

                    {/* --- Tableau des Ventes --- */}
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                <TableRow>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Date & Heure</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Pistolet / Îlot</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Produit</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-xs dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Idx Départ</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-xs dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">Idx Fin</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-xs dark:text-gray-400">Test (L)</TableCell>
                                    <TableCell isHeader className="py-3 font-bold text-gray-700 text-end text-xs dark:text-gray-300">Vol. Net (L)</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-xs dark:text-gray-400">P.U</TableCell>
                                    <TableCell isHeader className="py-3 font-bold text-gray-700 text-end text-xs dark:text-gray-300">Total (XAF/XOF)</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Station</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Clôturé par</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-xs dark:text-gray-400">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFuelSales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={12} className="py-6 text-center text-gray-400">Aucun relevé d'index trouvé avec ces filtres. ⛽</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFuelSales.map(sale => {
                                        // Utilisation de la date de saisie (fallback sur created_at)
                                        const dateToShow = sale.date_saisie ? new Date(sale.date_saisie) : new Date(sale.created_at);
                                        
                                        return (
                                        <TableRow key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <TableCell className="py-3 text-sm">
                                                {dateToShow.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}<br/>
                                                <span className="text-xs text-gray-400">{dateToShow.toLocaleTimeString('fr-FR', { hour: '2-digit', minute:'2-digit' })}</span>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faGasPump} className="text-gray-400" />
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{sale.pistolet?.name || '—'}</span>
                                                        <span className="text-xs text-gray-500">{sale.pistolet?.pompe?.name || ''}</span>
                                                    </div>
                                                </div>
                                            </TableCell> 
                                            <TableCell className="py-3 text-sm">{sale.pistolet?.citerne?.article?.name || '—'}</TableCell>
                                            
                                            {/* Colonnes Index */}
                                            <TableCell className="py-3 text-end font-mono text-sm bg-gray-50 dark:bg-gray-800/50">
                                                {Number(sale.index_ouverture).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="py-3 text-end font-mono text-sm font-semibold bg-gray-50 dark:bg-gray-800/50">
                                                {Number(sale.index_fermeture).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            
                                            {/* Colonne Test (Rouge si > 0) */}
                                            <TableCell className={`py-3 text-end text-sm ${sale.volume_test > 0 ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                                                {sale.volume_test > 0 ? Number(sale.volume_test).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '-'}
                                            </TableCell>
                                            
                                            {/* Colonnes Financières et Volumes */}
                                            <TableCell className="py-3 text-end font-bold text-sm text-green-600 dark:text-green-400">
                                                {Number(sale.volume_vendu).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="py-3 text-end text-sm">
                                                {Number(sale.prix_unitaire).toLocaleString('fr-FR')}
                                            </TableCell>
                                            <TableCell className="py-3 text-end font-bold text-sm">
                                                {Number(sale.montant_total).toLocaleString('fr-FR')}
                                            </TableCell>
                                            
                                            <TableCell className="py-3 text-sm">{sale.agency ? sale.agency.name : '—'}</TableCell>
                                            <TableCell className="py-3 text-sm">{sale.user ? `${sale.user.first_name} ${sale.user.last_name || ''}` : '—'}</TableCell>
                                            
                                            <TableCell className="py-3 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        disabled={processing || !canDelete(sale.created_at)}
                                                        onClick={() => handleDelete(sale.id)}
                                                        title={
                                                            canDelete(sale.created_at)
                                                                ? "Annuler ce relevé"
                                                                : `Annulation non autorisée après ${auth.user.modif_days} jour(s) `
                                                        }
                                                        className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                        type="button"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )})
                                )}
                            </TableBody>
                        </Table>

                        {/* --- CONTRÔLES DE PAGINATION D'INERTIA --- */}
                        {initialFuelSales.links && initialFuelSales.links.length > 3 && (
                            <nav className="flex justify-end mt-4">
                                <div className="flex gap-2">
                                    {initialFuelSales.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                                                ${link.active
                                                    ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                                                    : link.url === null
                                                        ? 'bg-white border-gray-300 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
                                                }`}
                                            preserveState
                                            preserveScroll
                                            only={['fuelSales']}
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
                      
            {/* --- La modale de génération de PDF/Excel pour les ventes de carburant --- */}
            <FuelSaleHistoryPDFExcelModal
                isOpen={isExportModalOpen}
                onClose={closeExportModal}
                agencies={agencies}
                articles={articles}
                currentFilters={filterState} 
            />
        </>
    );
};

// Composant de routage avec gestion des Layouts
const FuelSaleHistory = ({ fuelSales, agencies, articles }) => {
    const { auth } = usePage().props;
    const { licence, DirLicence} = useLicenceChoice(); 
    
    const contentProps = { fuelSales, agencies, articles };

    if (auth.user.role === "magasin") {
        return licence === "gas" 
            ? <MagLayout><PageContent {...contentProps} /></MagLayout>
            : <MagFuelLayout><PageContent {...contentProps} /></MagFuelLayout>;
    }

    if (auth.user.role === "controleur") {
        return <RegLayout><PageContent {...contentProps} /></RegLayout>;
    }

    if (auth.user.role === "direction") {
        if(DirLicence === "gaz"){
            return <DirLayout><PageContent {...contentProps} /></DirLayout>
        } else {
            return <DirFuelLayout><PageContent {...contentProps} /></DirFuelLayout>
        }
    }

    return <MagFuelLayout><PageContent {...contentProps} /></MagFuelLayout>;
};

export default FuelSaleHistory;