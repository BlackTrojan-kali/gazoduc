import React, { useState, useMemo } from 'react'; // Importez useState et useMemo
import MagLayout from '../layout/MagLayout/MagLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFileExport, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'; // Ajoutez faSearch et faTimes
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Swal from 'sweetalert2';

// Importez vos composants personnalisés :
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField'; // Importez votre composant Input
import DepotageHistoryPDFExcelModal from '../components/Modals/DepHistModal'; // Assurez-vous que le chemin est correct

const Depotage = ({ depotages: initialDepotages, agencies }) => { // 'filters' a été retiré des props
  const { delete: inertiaDelete, processing } = useForm();

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

  // --- Filtrage côté frontend des données de dépotages ---
  const filteredDepotages = useMemo(() => {
    let currentDepotages = initialDepotages.data; // Utiliser les données brutes paginées

    // Filtrer par agence (si sélectionnée)
    if (filterState.agency_id) {
        currentDepotages = currentDepotages.filter(depotage =>
            depotage.agency && String(depotage.agency.id) === filterState.agency_id
        );
    }

    // Filtrer par dates (si sélectionnées)
    if (filterState.start_date && filterState.end_date) {
      const startDate = new Date(filterState.start_date + 'T00:00:00'); // Assurez-vous d'avoir l'heure de début du jour
      const endDate = new Date(filterState.end_date + 'T23:59:59');     // Assurez-vous d'avoir l'heure de fin du jour
      currentDepotages = currentDepotages.filter(depotage => {
        const depotageDate = new Date(depotage.depotage_date);
        return depotageDate >= startDate && depotageDate <= endDate;
      });
    }

    // Filtrer par recherche textuelle/numérique générique
    if (filterState.search) {
      const searchTerm = filterState.search.toLowerCase();
      currentDepotages = currentDepotages.filter(depotage => {
        // Recherche par ID
        if (String(depotage.id).includes(searchTerm)) return true;
        // Recherche par nom de citerne mobile
        if (depotage.citerne_mobile && depotage.citerne_mobile.name.toLowerCase().includes(searchTerm)) return true;
        // Recherche par nom de citerne fixe
        if (depotage.citerne_fixe && depotage.citerne_fixe.name.toLowerCase().includes(searchTerm)) return true;
        // Recherche par nom d'article
        if (depotage.article && depotage.article.name.toLowerCase().includes(searchTerm)) return true;
        // Recherche par nom d'agence
        if (depotage.agency && depotage.agency.name.toLowerCase().includes(searchTerm)) return true;
        // Recherche par numéro de BL
        if (depotage.bl_number && depotage.bl_number.toLowerCase().includes(searchTerm)) return true;
        // Recherche par nom d'utilisateur
        if (depotage.recorded_by_user && (`${depotage.recorded_by_user.first_name} ${depotage.recorded_by_user.last_name || ''}`).toLowerCase().includes(searchTerm)) return true;
        // Recherche par quantité
        if (String(depotage.quantity).includes(searchTerm)) return true;
        // Recherche par date de dépotage (format YYYY-MM-DD pour la comparaison simple)
        if (String(depotage.depotage_date).includes(searchTerm)) return true;

        return false;
      });
    }

    return currentDepotages;
  }, [initialDepotages.data, filterState]); // Recalcule quand les données initiales ou les filtres changent

  // Fonction pour gérer la pagination après une suppression si nécessaire
  // Note: Cette fonction est pour la suppression et recharge la page via Inertia.
  // Les filtres frontend ne seront pas persistés dans l'URL par cette fonction.
  const applyPaginationAfterDelete = (params = {}) => {
    const currentParams = {
      page: initialDepotages.current_page, // Utilisez la pagination de Inertia
      per_page: initialDepotages.per_page,
      ...params,
    };

    Object.keys(currentParams).forEach(key => {
      if (currentParams[key] === '' || currentParams[key] === undefined || currentParams[key] === null) {
        delete currentParams[key];
      }
    });

    // Assurez-vous d'avoir 'Inertia' importé ou défini globalement si vous l'utilisez
    // Si ce n'est pas le cas, vous devrez l'importer explicitement :
    // import { Inertia } from '@inertiajs/inertia'; // ou '@inertiajs/react' si vous l'utilisez comme ça
    window.Inertia.get(route('depotages.index'), currentParams, {
      preserveState: true,
      preserveScroll: true,
      only: ['depotages'], // Ne demande que la prop 'depotages'
    });
  };

  const handleDelete = (depotageId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: 'Vous êtes sur le point de supprimer ce dépotage. Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('depotages.destroy', depotageId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'Le dépotage a été supprimé avec succès.',
              'success'
            );
            if (initialDepotages.data.length === 1 && initialDepotages.current_page > 1) {
              applyPaginationAfterDelete({ page: initialDepotages.current_page - 1 });
            } else {
              applyPaginationAfterDelete();
            }
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression du dépotage. ' + (errors.message || 'Veuillez réessayer.'),
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title="Dépotages" />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste des Dépotages
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {/* Bouton pour ouvrir la modale d'exportation */}
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

          {/* --- Section de Filtrage Frontend --- */}
          <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Rechercher & Filtrer</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Recherche générique */}
              <Input
                id="search"
                type="text"
                label="Rechercher par mot-clé"
                placeholder="Citerne, agence, quantité, BL..."
                value={filterState.search}
                onChange={handleFilterChange}
                className="col-span-full md:col-span-1"
                icon={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
              />
              {/* Filtre Agence (si disponible et pertinent) */}
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
              {/* Date de début */}
              <Input
                id="start_date"
                type="date"
                label="Date de début"
                value={filterState.start_date}
                onChange={handleFilterChange}
              />
              {/* Date de fin */}
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
          {/* --- Fin Section de Filtrage Frontend --- */}

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Citerne Mobile</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Citerne Fixe</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Article</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantité (L)</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agence</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">BL Numéro</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Enregistré par</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Créé le</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepotages.length === 0 ? ( // Utiliser filteredDepotages ici
                  <TableRow>
                    <TableCell colSpan={10} className="py-6 text-center text-gray-400">Aucun dépotage trouvé avec ces filtres, monsieur.</TableCell>
                  </TableRow>
                ) : (
                  filteredDepotages.map(depotage => ( // Itérer sur filteredDepotages
                    <TableRow key={depotage.id}>
                      {/* Appliquer py-4 à chaque TableCell pour plus d'espace */}
                      <TableCell className="py-4">{depotage.id}</TableCell>
                      <TableCell className="py-4">{depotage.citerne_mobile ? depotage.citerne_mobile.name : '—'}</TableCell>
                      <TableCell className="py-4">{depotage.citerne_fixe ? depotage.citerne_fixe.name : '—'}</TableCell>
                      <TableCell className="py-4">{depotage.article ? depotage.article.name : '—'}</TableCell>
                      <TableCell className="py-4">{depotage.quantity.toLocaleString('fr-FR')}</TableCell>
                      <TableCell className="py-4">{depotage.agency ? depotage.agency.name : '—'}</TableCell>
                      <TableCell className="py-4">{depotage.bl_number || '—'}</TableCell>
                      <TableCell className="py-4">{depotage.user ? `${depotage.user.first_name} ` : '—'}</TableCell>
                      <TableCell className="py-4">{new Date(depotage.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</TableCell>
                      <TableCell className="py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            disabled={processing}
                            onClick={() => handleDelete(depotage.id)}
                            title="Supprimer ce dépotage"
                            className="text-red-600 hover:text-red-800 transition-colors"
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
            {initialDepotages.links && initialDepotages.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {initialDepotages.links.map((link, index) => (
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
                      // 'only' ne doit plus inclure 'filters' car nous ne les persistons pas dans l'URL
                      only={['depotages']}
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

      {/* La modale de génération de PDF/Excel */}
      <DepotageHistoryPDFExcelModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        agencies={agencies}
        // Passez les données de filtre actuelles à la modale
        currentFilters={filterState} // Passez filterState
      />
    </>
  );
};

Depotage.layout = page => <MagLayout children={page} title="Dépotages" />;
export default Depotage;