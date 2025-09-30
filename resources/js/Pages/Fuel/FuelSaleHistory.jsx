import React, { useState, useMemo } from 'react';
import MagLayout from '../../layout/MagLayout/MagLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFileExport, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';

// Importez vos composants personnalisés :
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import FuelSaleHistoryPDFExcelModal from '../../components/Modals/Fuel/FuelSaleHistoryPDFExcelModal'; 
import RegLayout from '../../layout/RegLayout/RegLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';
import useLicenceChoice from '../../hooks/useLicenceChoice';
import MagFuelLayout from '../../layout/FuelLayout/MagFuelLayout';

// Composant principal de la page
const PageContent = ({ fuelSales: initialFuelSales, agencies, articles }) => {
    // Renommé `receptions` en `fuelSales` pour la clarté
    const { delete: inertiaDelete, processing } = useForm();
    const { props: { auth } } = usePage();

    // --- États et fonctions pour la modale d'exportation ---
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const openExportModal = () => setIsExportModalOpen(true);
    const closeExportModal = () => setIsExportModalOpen(false);

    // --- Gestion des filtres frontend ---
    const [filterState, setFilterState] = useState({
        search: '', // Recherche textuelle (incluant agence et article par nom)
        start_date: '',
        end_date: '',
        agency_id: '', // Filtre par Agence (liste déroulante)
        article_id: '', // Filtre par Article (liste déroulante)
    });

    // Gérer le changement des champs de filtre
    const handleFilterChange = (e) => {
        const { id, value } = e.target;
        setFilterState(prev => ({ ...prev, [id]: value }));
    };

    // Réinitialiser les filtres
    const resetFilters = () => {
        setFilterState({
            search: '',
            start_date: '',
            end_date: '',
            agency_id: '',
            article_id: '',
        });
    };
    // --- Fonction pour déterminer si une vente peut être supprimée ---
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

    // --- Filtrage côté frontend des données de ventes ---
    const filteredFuelSales = useMemo(() => {
        let currentSales = initialFuelSales.data ?? []; 

        // 1. Filtrer par Agence (Liste déroulante)
        if (filterState.agency_id) {
            currentSales = currentSales.filter(sale =>
                sale.agency && String(sale.agency.id) === filterState.agency_id
            );
        }
        
        // 2. Filtrer par Article (Liste déroulante)
        if (filterState.article_id) {
            currentSales = currentSales.filter(sale =>
                sale.article && String(sale.article.id) === filterState.article_id
            );
        }

        // 3. Filtrer par Plage de Dates
        if (filterState.start_date && filterState.end_date) {
            const startDate = new Date(filterState.start_date);
            const endDate = new Date(filterState.end_date);
            endDate.setHours(23, 59, 59, 999);

            currentSales = currentSales.filter(sale => {
                if (!sale.created_at) return false;
                const saleDate = new Date(sale.created_at);
                return saleDate >= startDate && saleDate <= endDate;
            });
        }

        // 4. Filtrer par Recherche textuelle (incluant article et agence par nom, comme demandé)
        if (filterState.search) {
            const searchTerm = filterState.search.toLowerCase();
            currentSales = currentSales.filter(sale => {
                const saleDateString = sale.created_at 
                    ? new Date(sale.created_at).toLocaleDateString('fr-FR')
                    : '';

                // CONCATÉNATION DE TOUS LES CHAMPS PERTINENTS
                const searchString = [
                    String(sale.id),
                    sale.client?.name, // Nom du client
                    sale.citerne?.name, 
                    sale.article?.name, // Nom de l'Article/Carburant
                    String(sale.quantity),
                    sale.agency?.name, // Nom de l'Agence
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
                console.error('Erreur lors du rechargement après suppression:', errors);
                Swal.fire('Erreur de rechargement !', "La liste des ventes n'a pas pu être mise à jour correctement.", 'error');
            }
        });
    };

    // --- Fonction pour gérer la suppression d'une vente (InertiaDelete) ---
    const handleDelete = (saleId) => {
        Swal.fire({
            title: 'Êtes-vous sûr, monsieur ?',
            text: 'Vous êtes sur le point de supprimer cette vente. Cette action est irréversible !',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#676c75',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                inertiaDelete(route('fuelsales.delete', saleId), { 
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Supprimé !', 'La vente a été supprimée avec succès.', 'success');
                        applyPaginationAfterDelete();
                    },
                    onError: (errors) => {
                        console.error('Erreur de suppression:', errors);
                        Swal.fire('Erreur !', 'Une erreur est survenue lors de la suppression de la vente. ' + (errors.message || 'Veuillez réessayer.'), 'error');
                    },
                });
            }
        });
    };
    
    // Rendu du contenu de la page
    return (
        <>
            <Head title="Historique Ventes Carburant" />
            <div className="p-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                Historique des Ventes de Carburant
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
                                label="Rechercher par mot-clé"
                                placeholder="ID, client, article, quantité, utilisateur, agence..."
                                value={filterState.search}
                                onChange={handleFilterChange}
                                className="col-span-full md:col-span-1"
                                icon={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
                            />

                            {/* Filtre Agence (Liste déroulante) */}
                            {agencies && agencies.length > 0 && (
                                <div>
                                    <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agence</label>
                                    <select
                                        id="agency_id"
                                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                        value={filterState.agency_id}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Toutes les agences</option>
                                        {agencies.map(agency => (
                                            <option key={agency.id} value={String(agency.id)}>{agency.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            {/* Filtre Article (Carburant) (Liste déroulante) */}
                            {articles && articles.length > 0 && (
                                <div>
                                    <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carburant</label>
                                    <select
                                        id="article_id"
                                        className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Client</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Article</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Qté (L)</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Prix Unitaire</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Total (TTC)</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agence</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Enregistré par</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Créé le</TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFuelSales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-6 text-center text-gray-400">Aucune vente de carburant trouvée avec ces filtres, monsieur. ⛽</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFuelSales.map(sale => (
                                        <TableRow key={sale.id}>
                                            <TableCell className="py-4 font-semibold">{sale.id}</TableCell>
                                            <TableCell className="py-4">{sale.client ? `${sale.client.name}` : '—'}</TableCell> 
                                            <TableCell className="py-4">{sale.article ? sale.article.name : '—'}</TableCell>
                                            <TableCell className="py-4 text-end">{Number(sale.quantity).toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="py-4 text-end">{Number(sale.unitPrice).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</TableCell> 
                                            <TableCell className="py-4 text-end font-bold">{Number(sale.total_price).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</TableCell>
                                            <TableCell className="py-4">{sale.agency ? sale.agency.name : '—'}</TableCell>
                                            <TableCell className="py-4">{sale.user ? `${sale.user.first_name} ${sale.user.last_name || ''}` : '—'}</TableCell>
                                            <TableCell className="py-4">{new Date(sale.created_at).toLocaleDateString('fr-FR', {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}</TableCell>
                                            <TableCell className="py-4 text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        disabled={processing || !canDelete(sale.created_at)}
                                                        onClick={() => handleDelete(sale.id)}
                                                        title={
                                                            canDelete(sale.created_at)
                                                                ? "Supprimer cette vente"
                                                                : `Suppression non autorisée après ${auth.user.modif_days} jour(s) `
                                                        }
                                                        className="text-red-600 hover:text-red-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                                                        type="button"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
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
    const { licence } = useLicenceChoice(); 
    
    // 1. Définition des props pour `PageContent`
    const contentProps = { fuelSales, agencies, articles };

    // 2. Logique de sélection du Layout basée sur le rôle de l'utilisateur
    if (auth.user.role === "magasin") {
        return licence === "gas" 
            ? <MagLayout><PageContent {...contentProps} /></MagLayout>
            : <MagFuelLayout><PageContent {...contentProps} /></MagFuelLayout>;
    }

    if (auth.user.role === "controleur") {
        return <RegLayout><PageContent {...contentProps} /></RegLayout>;
    }

    if (auth.user.role === "direction") {
        return <DirLayout><PageContent {...contentProps} /></DirLayout>;
    }

    // Fallback (Layout par défaut)
    return <MagFuelLayout><PageContent {...contentProps} /></MagFuelLayout>;
};

export default FuelSaleHistory;