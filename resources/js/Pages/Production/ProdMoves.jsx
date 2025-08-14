import React, { useState, useEffect, useMemo } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import ProdLayout from '../../layout/ProdLayout/ProdLayout';
import InputField from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import Select from 'react-select';
import ExportProductionModal from '../../components/Modals/ProdPdfModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faTimes, faCalendarAlt, faSearch, faSpinner, faFileExport, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import RegLayout from '../../layout/RegLayout/RegLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';

const PageContent = ({ prodMoves, agencies, articles, citernes }) => {
  const { auth } = usePage().props;
  const { delete: inertiaDelete, processing } = useForm();
  
  const initialMoves = prodMoves.data;

  const [filteredMoves, setFilteredMoves] = useState(initialMoves);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCiterne, setSelectedCiterne] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showExportModal, setShowExportModal] = useState(false);

  const agencyOptions = useMemo(() => Array.isArray(agencies)
    ? agencies.map(agency => ({ value: String(agency.id), label: agency.name }))
    : [], [agencies]);

  const articleOptions = useMemo(() => Array.isArray(articles)
    ? articles.map(article => ({ value: String(article.id), label: article.name }))
    : [], [articles]);

  const citerneOptions = useMemo(() => Array.isArray(citernes)
    ? citernes.map(citerne => ({ value: String(citerne.id), label: citerne.name }))
    : [], [citernes]);

  const applyFilters = () => {
    let tempMoves = initialMoves;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempMoves = tempMoves.filter(move =>
        move.citerne?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        move.article?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        move.agency?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        move.recorded_by_user?.name.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (selectedAgency) {
      tempMoves = tempMoves.filter(move => move.agency?.id === parseInt(selectedAgency.value));
    }

    if (selectedArticle) {
      tempMoves = tempMoves.filter(move => move.article?.id === parseInt(selectedArticle.value));
    }

    if (selectedCiterne) {
        tempMoves = tempMoves.filter(move => move.citerne?.id === parseInt(selectedCiterne.value));
    }

    if (startDate) {
      const start = new Date(startDate);
      tempMoves = tempMoves.filter(move => new Date(move.created_at).setHours(0,0,0,0) >= start.setHours(0,0,0,0));
    }
    if (endDate) {
      const end = new Date(endDate);
      tempMoves = tempMoves.filter(move => new Date(move.created_at).setHours(0,0,0,0) <= end.setHours(0,0,0,0));
    }

    setFilteredMoves(tempMoves);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedAgency(null);
    setSelectedArticle(null);
    setSelectedCiterne(null);
    setStartDate('');
    setEndDate('');
    setFilteredMoves(initialMoves);
  };

  useEffect(() => {
    // Re-appliquer les filtres si les données initiales changent
    applyFilters();
  }, [searchTerm, selectedAgency, selectedArticle, selectedCiterne, startDate, endDate, prodMoves.data]);

  // Définition des variables CSS pour les couleurs en fonction du thème
  const colors = useMemo(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return {
      '--text-color': isDarkMode ? 'rgb(249 250 251 / 0.9)' : 'rgb(31 41 55)',
      '--placeholder-color': isDarkMode ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
      '--border-color': isDarkMode ? 'rgb(75 85 99)' : 'rgb(209 213 219)',
      '--bg-menu': isDarkMode ? 'rgb(31 41 55)' : 'rgb(255 255 255)',
      '--bg-option-hover': isDarkMode ? 'rgb(55 65 81)' : 'rgb(243 244 246)',
    };
  }, []);

  // Styles personnalisés pour react-select, utilisant les variables CSS
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: '44px',
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : colors['--border-color'],
      backgroundColor: 'transparent',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
      },
    }),
    singleValue: (baseStyles) => ({ ...baseStyles, color: colors['--text-color'] }),
    placeholder: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'] }),
    input: (baseStyles) => ({ ...baseStyles, color: colors['--text-color'] }),
    menu: (baseStyles) => ({ ...baseStyles, backgroundColor: colors['--bg-menu'], zIndex: 9999 }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? colors['--bg-option-hover'] : colors['--bg-menu'],
      color: state.isSelected ? 'white' : colors['--text-color'],
      '&:hover': { backgroundColor: colors['--bg-option-hover'], color: colors['--text-color'] },
    }),
    indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: colors['--border-color'] }),
    dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'] }),
    clearIndicator: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'], '&:hover': { color: '#EF4444' } }),
  };

  // Fonction pour déterminer si une production peut être supprimée
  const canDelete = (productionCreatedAt) => {
    // Si l'utilisateur n'a pas de `modif_days` ou si c'est 0, la suppression n'est pas permise
    if (!auth.user || !auth.user.modif_days || auth.user.modif_days <= 0) {
      return false;
    }

    const today = new Date();
    const creationDate = new Date(productionCreatedAt);
    // Calculer la différence en jours
    const diffTime = today.getTime() - creationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Renvoyer vrai si la production a été créée dans la période autorisée
    return diffDays <= auth.user.modif_days;
  };

  const handleDelete = (productionId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('prodMove.delete', productionId), {
          onSuccess: () => {
            Swal.fire({
              title: 'Supprimé !',
              text: 'La production a été supprimée avec succès, monsieur.',
              icon: 'success',
              showConfirmButton: false,
              timer: 2000,
            });
          },
          onError: (errors) => {
            Swal.fire({
              title: 'Erreur !',
              text: 'Une erreur est survenue lors de la suppression de la production. ' + (errors.message || ''),
              icon: 'error',
            });
            console.error("Erreurs de suppression:", errors);
          },
        });
      }
    });
  };

  return (
    <>
      <Head title="Historique Productions" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white/90">
            Historique des Productions de Bouteilles
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowExportModal(true)}
              variant="primary"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <FontAwesomeIcon icon={faFileExport} />
              Exporter
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 mb-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              Filtres de Recherche
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <InputField
                id="searchTerm"
                label="Recherche rapide"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Citerne, article, agence, utilisateur..."
                icon={faSearch}
              />
              <InputField
                id="startDate"
                label="Date de début"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                icon={faCalendarAlt}
              />
              <InputField
                id="endDate"
                label="Date de fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                icon={faCalendarAlt}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="select-agency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filtrer par Agence
                </label>
                <Select
                  id="select-agency"
                  name="selectedAgency"
                  options={agencyOptions}
                  value={selectedAgency}
                  onChange={setSelectedAgency}
                  placeholder="Toutes les agences"
                  isClearable={true}
                  isSearchable={true}
                  styles={selectStyles}
                />
              </div>
              <div>
                <label htmlFor="select-article" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filtrer par Article
                </label>
                <Select
                  id="select-article"
                  name="selectedArticle"
                  options={articleOptions}
                  value={selectedArticle}
                  onChange={setSelectedArticle}
                  placeholder="Tous les articles"
                  isClearable={true}
                  isSearchable={true}
                  styles={selectStyles}
                />
              </div>
              <div>
                <label htmlFor="select-citerne" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filtrer par Citerne
                </label>
                <Select
                  id="select-citerne"
                  name="selectedCiterne"
                  options={citerneOptions}
                  value={selectedCiterne}
                  onChange={setSelectedCiterne}
                  placeholder="Toutes les citernes"
                  isClearable={true}
                  isSearchable={true}
                  styles={selectStyles}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-3">
              <Button
                onClick={resetFilters}
                variant="secondary"
                className="inline-flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTimes} />
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Date de Production
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Citerne Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Article Produit
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Quantité Produite
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Agence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Enregistré par
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredMoves.length > 0 ? (
                filteredMoves.map((move) => (
                  <tr key={move.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {move.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(move.created_at).toLocaleString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {move.citerne?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {move.article?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {move.quantity_produced}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {move.agency?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {move.recorded_by_user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(move.id)}
                        disabled={processing || !canDelete(move.created_at)}
                        className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          canDelete(move.created_at)
                          ? "Supprimer cette production"
                          : `Suppression non autorisée après ${auth.user.modif_days} jour(s)`
                        }
                      >
                        {processing ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            <FontAwesomeIcon icon={faTrashAlt} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucune production trouvée pour les critères sélectionnés, monsieur. 😔
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {prodMoves.links.length > 3 && (
          <div className="flex flex-wrap justify-center items-center mt-6 gap-2">
            {prodMoves.links.map((link, index) => (
              link.url ? (
                <Link
                  key={index}
                  href={link.url}
                  className={`
                    relative inline-flex items-center px-4 py-2 text-sm font-medium
                    rounded-md border border-gray-300 dark:border-gray-700
                    ${link.active
                      ? 'bg-brand-600 text-white dark:bg-brand-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                    ${link.label.includes('Previous') || link.label.includes('Next') ? 'px-3' : ''}
                  `}
                  dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '<').replace('&raquo;', '>') }}
                />
              ) : (
                <span
                  key={index}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-700 bg-white text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                  dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '<').replace('&raquo;', '>') }}
                />
              )
            ))}
          </div>
        )}

        {prodMoves.total > 0 && (
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Affichage de {prodMoves.from} à {prodMoves.to} sur {prodMoves.total} productions.
            </div>
        )}
      </div>

      <ExportProductionModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        agencies={agencies}
        articles={articles}
        citernes={citernes}
      />
    </>
  );
};
const ProdMoves = ({ prodMoves, agencies, articles, citernes })=>{
  const {auth} = usePage().props
  if(auth.user.role == "production"){
    return (
      <ProdLayout>
        <PageContent prodMoves={prodMoves} agencies={agencies} articles={articles} citernes={citernes}/>
      </ProdLayout>
    )
  }  if(auth.user.role == "controleur"){
    return (
      <RegLayout>
        <PageContent prodMoves={prodMoves} agencies={agencies} articles={articles} citernes={citernes}/>
      </RegLayout>
    )
  }
  if(auth.user.role === "direction"){
    return (
      <DirLayout>
        <PageContent prodMoves={prodMoves} agencies={agencies} articles={articles} citernes={citernes}/>
      </DirLayout>
    )
  }
}
export default ProdMoves;
