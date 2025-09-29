import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faFileExport, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import MovementHistoryPDFExcelModal from '../components/Modals/MovHistModal';
import Select from 'react-select'; // Import du composant Select

// Layouts - assurez-vous que les chemins sont corrects
import MagLayout from '../layout/MagLayout/MagLayout';
import ProdLayout from '../layout/ProdLayout/ProdLayout';
import RegLayout from '../layout/RegLayout/RegLayout';
import useLicenceChoice from '../hooks/useLicenceChoice';
import MagFuelLayout from '../layout/FuelLayout/MagFuelLayout';

// --- Composant PageContent: Contient la logique principale de la page ---
const PageContent = ({ movements, articles, agencies, services }) => {
  // --- États pour la modale d'exportation ---
  const [isPDFExcelModalOpen, setIsPDFExcelModalOpen] = useState(false);
  const openPDFExcelModal = () => setIsPDFExcelModalOpen(true);
  const closePDFExcelModal = () => setIsPDFExcelModalOpen(false);

  // --- États pour les filtres frontend ---
  const [filterMovementType, setFilterMovementType] = useState('');
  const [filterArticle, setFilterArticle] = useState(null);
  const [filterQualification, setFilterQualification] = useState('');
  const [filterAgency, setFilterAgency] = useState(null);
  const [filterService, setFilterService] = useState(null);

  // --- useForm d'Inertia pour la suppression ---
  const { delete: inertiaDelete, processing } = useForm();
  const { props: { auth } } = usePage();
console.log(auth);
  // --- Fonction pour déterminer si un mouvement peut être supprimé ---
  const canDelete = (movementCreatedAt) => {
    // Si l'utilisateur n'a pas de `modification_days` défini ou s'il est 0, on ne permet pas la suppression.
    if (!auth.user || !auth.user.modif_days || auth.user.modif_days <= 0) {
      return false;
    }
    const today = new Date();
    const creationDate = new Date(movementCreatedAt);
    // Calculer la différence en jours
    const diffTime = today.getTime() - creationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Renvoyer vrai si le mouvement a été créé dans la période autorisée
    return diffDays <= auth.user.modif_days;
  };

  // --- Fonction pour gérer la suppression d'un mouvement avec SweetAlert2 ---
  const handleDelete = (movementId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer ce mouvement. Cette action est irréversible et ajustera le stock de l'article !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('magasin.move.delete', movementId), {
          preserveScroll: true,
          onSuccess: () => {
          
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
           
          },
        });
      }
    });
  };
  
  // --- Filtrage des mouvements selon les filtres (optimisé avec useMemo) ---
  const filteredMovements = useMemo(() => {
    if (!movements || !movements.data) {
      return [];
    }

    return movements.data.filter(movement => {
      // 1. Filtrer par type de mouvement
      const matchesType = filterMovementType === '' || movement.movement_type === filterMovementType;

      // 2. Filtrer par article
      const matchesArticle = !filterArticle || (movement.article && movement.article.id === parseInt(filterArticle.value));

      // 3. Filtrer par qualification
      const matchesQualification = filterQualification === '' ||
        (movement.qualification && movement.qualification.toLowerCase() === filterQualification.toLowerCase());

      // 4. Filtrer par agence
      const matchesAgency = !filterAgency || String(movement.agency_id) === filterAgency.value;

      // 5. Filtrer par service (source_location)
      const matchesService = !filterService || (movement.source_location && movement.source_location.toLowerCase() === filterService.value.toLowerCase());

      return matchesType && matchesArticle && matchesQualification && matchesAgency && matchesService;
    });
  }, [movements.data, filterMovementType, filterArticle, filterQualification, filterAgency, filterService]);

  // Options pour le sélecteur d'articles
  const articleOptions = Array.isArray(articles)
    ? articles.map(article => ({ value: String(article.id), label: article.name }))
    : [];

  // Options pour le sélecteur d'agences
  const agencyOptions = Array.isArray(agencies)
    ? agencies.map(agency => ({ value: String(agency.id), label: agency.name }))
    : [];
  
  // Options pour le sélecteur de services
  const serviceOptions = [
    { value: 'magasin', label: 'Magasin' },
    { value: 'production', label: 'Production' },
    { value: 'commercial', label: 'Commercial' },
  ];

  // Définition des variables CSS pour les couleurs en fonction du thème
  const colors = {
    '--text-color': 'rgb(31 41 55)',
    '--placeholder-color': 'rgb(107 114 128)',
    '--border-color': 'rgb(209 213 219)',
    '--bg-menu': 'rgb(255 255 255)',
    '--bg-option-hover': 'rgb(243 244 246)',
  };
  if (document.documentElement.classList.contains('dark')) {
    colors['--text-color'] = 'rgb(249 250 251 / 0.9)';
    colors['--placeholder-color'] = 'rgb(156 163 175)';
    colors['--border-color'] = 'rgb(75 85 99)';
    colors['--bg-menu'] = 'rgb(31 41 55)';
    colors['--bg-option-hover'] = 'rgb(55 65 81)';
  }

  // Styles personnalisés pour react-select, utilisant les variables CSS
  // MODIFICATION : Réduction de la taille de la police pour un meilleur ajustement.
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: '44px',
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : 'var(--border-color)',
      backgroundColor: 'transparent',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      fontSize: '0.875rem', // Taille de police réduite
      '&:hover': {
        borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
      },
    }),
    singleValue: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)', fontSize: '0.875rem' }), // Taille de police réduite
    placeholder: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)', fontSize: '0.875rem' }), // Taille de police réduite
    input: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)', fontSize: '0.875rem' }), // Taille de police réduite
    menu: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--bg-menu)', zIndex: 9999 }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? 'var(--bg-option-hover)' : 'var(--bg-menu)',
      color: state.isSelected ? 'white' : 'var(--text-color)',
      fontSize: '0.875rem', // Taille de police réduite
      '&:hover': { backgroundColor: 'var(--bg-option-hover)', color: 'var(--text-color)' },
    }),
    indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--border-color)' }),
    dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
    clearIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)', '&:hover': { color: '#EF4444' } }),
  };

  return (
    <>
      <Head title="Mouvements" />
      <div className="p-6" style={colors}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faCube} className="mr-3 text-brand-600" />
                Liste des Mouvements
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={openPDFExcelModal}
                variant="secondary"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faFileExport} />
                Exporter
              </Button>
            </div>
          </div>

          <div className="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-white/[0.02]">
            <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
              <FontAwesomeIcon icon={faFilter} className="mr-2 text-blue-500" />
              Filtres
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"> 
              {/* Filtre par type de mouvement */}
              <div>
                <label htmlFor="filterMovementType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de Mouvement
                </label>
                <select
                  id="filterMovementType"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={filterMovementType}
                  onChange={(e) => setFilterMovementType(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="entree">Entrée</option>
                  <option value="sortie">Sortie</option>
                </select>
              </div>

              {/* Filtre par nom d'article (maintenant avec react-select) */}
              <div>
                <label htmlFor="filterArticle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Article
                </label>
                <Select
                  id="filterArticle"
                  options={articleOptions}
                  value={filterArticle}
                  onChange={setFilterArticle}
                  isClearable={true}
                  placeholder="Rechercher par article..."
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
              </div>

              {/* Filtre par qualification */}
              <div>
                <label htmlFor="filterQualification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qualification
                </label>
                <select
                  id="filterQualification"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={filterQualification}
                  onChange={(e) => setFilterQualification(e.target.value)}
                >
                  <option value="">Toutes les qualifications</option>
                  <option value="reepreuve">Réépreuve</option>
                  <option value="achat">Achat</option>
                  <option value="perte">Perte</option>
                  <option value="transfert">Transfert</option>
                </select>
              </div>

              {/* Filtre par agence (maintenant avec react-select) */}
              <div>
                <label htmlFor="filterAgency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Agence
                </label>
                <Select
                  id="filterAgency"
                  options={agencyOptions}
                  value={filterAgency}
                  onChange={setFilterAgency}
                  isClearable={true}
                  placeholder="Toutes les agences"
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
              </div>
              
              {/* Filtre par service */}
              <div>
                <label htmlFor="filterService" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service
                </label>
                <Select
                  id="filterService"
                  options={serviceOptions}
                  value={filterService}
                  onChange={setFilterService}
                  isClearable={true}
                  placeholder="Tous les services"
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Article</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agence</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantité</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type Mouvement</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Qualification</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center text-gray-400">Aucun mouvement trouvé pour les filtres appliqués, monsieur.</TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map(movement => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.article ? movement.article.name : '—'}</TableCell>
                      <TableCell>{movement.agency ? movement.agency.name : '—'}</TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{new Date(movement.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</TableCell>
                      <TableCell className={`font-semibold capitalize ${movement.movement_type === 'entree' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.movement_type}
                      </TableCell>
                      <TableCell>{movement.qualification || '—'}</TableCell>
                      <TableCell>
                        {canDelete(movement.created_at) && (
                          <button
                            disabled={processing}
                            onClick={() => handleDelete(movement.id)}
                            title="Supprimer ce mouvement"
                            className="text-red-600 hover:text-red-800 transition-colors"
                            type="button"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {movements.links && movements.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {movements.links.map((link, index) => (
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
                      only={['movements', 'articles', 'agencies', 'services']}
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

      <MovementHistoryPDFExcelModal
        isOpen={isPDFExcelModalOpen}
        onClose={closePDFExcelModal}
        articles={articles}
        agencies={agencies}
        services={services}
      />
    </>
  );
};

// --- Composant principal Entree: Gère le layout en fonction du rôle de l'utilisateur ---
const Entree = ({ movements, articles, agencies, services }) => {
    const { auth } = usePage().props;
    const userRole = auth.user.role;
    const {licence} = useLicenceChoice();
    if (userRole === "production") {
        return (
            <ProdLayout>
                <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
            </ProdLayout>
        );
    }
    if (userRole === "magasin") {
      if (licence=="gaz"){
        return (
            <MagLayout>
                <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
            </MagLayout>
        );
      }else{
        return (
          <MagFuelLayout>
                  <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
          </MagFuelLayout>
        )
      }
    }
    if (userRole === "controleur" || userRole === "direction") {
       return (
          <RegLayout>
            <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
          </RegLayout>
        );
    }
    return (
        <MagLayout>
            <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
        </MagLayout>
    );
};

export default Entree;
