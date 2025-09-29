import React, { useState, useMemo } from 'react';
import MagLayout from '../layout/MagLayout/MagLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFileExport, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Swal from 'sweetalert2';

// Importez vos composants personnalisés :
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import ReceptionHistoryPDFExcelModal from '../components/Modals/RecHistModal';
import ProdLayout from '../layout/ProdLayout/ProdLayout';
import RegLayout from '../layout/RegLayout/RegLayout';
import DirLayout from '../layout/DirLayout/DirLayout';
import useLicenceChoice from '../hooks/useLicenceChoice';
import MagFuelLayout from '../layout/FuelLayout/MagFuelLayout';

const PageContent = ({ receptions: initialReceptions, agencies }) => {
  const { delete: inertiaDelete, processing } = useForm();
  const { props: { auth } } = usePage(); // Ajoutez la récupération de l'utilisateur authentifié

  // --- États et fonctions pour la modale d'exportation ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);

  // --- Gestion des filtres frontend AVEC useState ---
  const [filterState, setFilterState] = useState({
    search: '',
    start_date: '',
    end_date: '',
    agency_id: '',
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
    });
  };

  // --- Fonction pour déterminer si une réception peut être supprimée ---
  const canDelete = (receptionCreatedAt) => {
    // Si l'utilisateur n'a pas de `modification_days` défini ou s'il est 0, la suppression n'est pas permise.
    if (!auth.user || !auth.user.modif_days || auth.user.modif_days <= 0) {
      return false;
    }
    const today = new Date();
    const creationDate = new Date(receptionCreatedAt);
    // Calculer la différence en jours
    const diffTime = today.getTime() - creationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Renvoyer vrai si la réception a été créée dans la période autorisée
    return diffDays <= auth.user.modif_days;
  };

  // --- Filtrage côté frontend des données de réceptions ---
  const filteredReceptions = useMemo(() => {
    let currentReceptions = initialReceptions.data;

    if (filterState.agency_id) {
        currentReceptions = currentReceptions.filter(reception =>
            reception.destination_agency && String(reception.destination_agency.id) === filterState.agency_id
        );
    }

    if (filterState.start_date && filterState.end_date) {
      const startDate = new Date(filterState.start_date);
      const endDate = new Date(filterState.end_date);
      endDate.setHours(23, 59, 59, 999);

      currentReceptions = currentReceptions.filter(reception => {
        const receptionDate = new Date(reception.created_at);
        return receptionDate >= startDate && receptionDate <= endDate;
      });
    }

    if (filterState.search) {
      const searchTerm = filterState.search.toLowerCase();
      currentReceptions = currentReceptions.filter(reception => {
        const searchString = [
          String(reception.id),
          reception.citerne_mobile?.name,
          reception.article?.name,
          String(reception.received_quantity),
          reception.destination_agency?.name,
          reception.user ? `${reception.user.first_name} ${reception.user.last_name || ''}` : '',
          reception.origin,
          new Date(reception.created_at).toLocaleDateString('fr-FR'),
          reception.bl_number,
        ].join(' ').toLowerCase();

        return searchString.includes(searchTerm);
      });
    }

    return currentReceptions;
  }, [initialReceptions.data, filterState]);

  // --- Fonction pour gérer la pagination après une suppression ---
  const applyPaginationAfterDelete = () => {
    const newPage = initialReceptions.data.length === 1 && initialReceptions.current_page > 1
      ? initialReceptions.current_page - 1
      : initialReceptions.current_page;

    window.Inertia.get(route('receptions.index', { page: newPage, per_page: initialReceptions.per_page }), {
        preserveScroll: true,
        preserveState: true,
        only: ['receptions'],
        onSuccess: () => {},
        onError: (errors) => {
            console.error('Erreur lors du rechargement après suppression:', errors);
            Swal.fire(
                'Erreur de rechargement !',
                'La liste des réceptions n\'a pas pu être mise à jour correctement.',
                'error'
            );
        }
    });
  };

  // --- Fonction pour gérer la suppression d'une réception avec SweetAlert2 ---
  const handleDelete = (receptionId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: 'Vous êtes sur le point de supprimer cette réception. Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('receptions.delete', receptionId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'La réception a été supprimée avec succès.',
              'success'
            );
            applyPaginationAfterDelete();
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de la réception. ' + (errors.message || 'Veuillez réessayer.'),
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title="Réceptions" />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste des Réceptions
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

          <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Rechercher & Filtrer</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Input
                id="search"
                type="text"
                label="Rechercher par mot-clé"
                placeholder="Citerne, article, agence, quantité, origine..."
                value={filterState.search}
                onChange={handleFilterChange}
                className="col-span-full md:col-span-1"
                icon={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
              />
              {agencies && agencies.length > 0 && (
                <div>
                  <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agence
                  </label>
                  <select
                    id="agency_id"
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={filterState.agency_id}
                    onChange={handleFilterChange}
                  >
                    <option value="">Toutes les agences</option>
                    {agencies.map(agency => (
                      <option key={agency.id} value={String(agency.id)}>
                        {agency.name}
                      </option>
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

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Citerne Mobile</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Article</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Qté Reçue (L)</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agence Destination</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Enregistré par</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Origine</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Créé le</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-6 text-center text-gray-400">Aucune réception trouvée avec ces filtres, monsieur.</TableCell>
                  </TableRow>
                ) : (
                  filteredReceptions.map(reception => (
                    <TableRow key={reception.id}>
                      <TableCell className="py-4">{reception.id}</TableCell>
                      <TableCell className="py-4">{reception.citerne ? reception.citerne.licence_plate : '—'}</TableCell>
                      <TableCell className="py-4">{reception.article ? reception.article.name : '—'}</TableCell>
                      <TableCell className="py-4">{reception.received_quantity.toLocaleString('fr-FR')}</TableCell>
                      <TableCell className="py-4">{reception.agency ? reception.agency.name : '—'}</TableCell>
                      <TableCell className="py-4">{reception.user ? `${reception.user.first_name} ` : '—'}</TableCell>
                      <TableCell className="py-4">{reception.origin || '—'}</TableCell>
                      <TableCell className="py-4">{new Date(reception.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            disabled={processing || !canDelete(reception.created_at)}
                            onClick={() => handleDelete(reception.id)}
                            title={
                              canDelete(reception.created_at)
                                ? "Supprimer cette réception"
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
            {initialReceptions.links && initialReceptions.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {initialReceptions.links.map((link, index) => (
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
                      only={['receptions']}
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

      {/* --- La modale de génération de PDF/Excel pour les réceptions --- */}
      <ReceptionHistoryPDFExcelModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        agencies={agencies}
        currentFilters={filterState}
      />
    </>
  );
};

const Reception = ({ receptions, agencies }) => {
  const { auth } = usePage().props;
  const {licence} = useLicenceChoice()
  if (auth.user.role === "production") {
    return (
      <ProdLayout>
        <PageContent receptions={receptions} agencies={agencies} />
      </ProdLayout>
    );
  }

  if (auth.user.role === "magasin") 
    {
      if (licence == "gas"){
    return (
      <MagLayout>
        <PageContent receptions={receptions} agencies={agencies} />
      </MagLayout>
    );
  }else{
    return(
      <MagFuelLayout>
        <PageContent receptions={receptions} agencies={agencies} />  
      </MagFuelLayout>
    )
  }
  }

  if (auth.user.role === "controleur") {
    return (
      <RegLayout>
        <PageContent receptions={receptions} agencies={agencies} />
      </RegLayout>
    );
  }

  if (auth.user.role === "direction") {
    return (
      <DirLayout>
        <PageContent receptions={receptions} agencies={agencies} />
      </DirLayout>
    );
  }

  
};

export default Reception;
