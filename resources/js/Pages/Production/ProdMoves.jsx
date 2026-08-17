import React, { useState, useEffect, useMemo } from 'react';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilter, faTimes, faCalendarAlt, faSearch, faSpinner, 
    faFileExport, faTrashAlt, faIndustry, faTruckDroplet, faUser 
} from '@fortawesome/free-solid-svg-icons';

// Layouts
import ProdLayout from '../../layout/ProdLayout/ProdLayout';
import RegLayout from '../../layout/RegLayout/RegLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';

// UI Components
import InputField from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import ExportProductionModal from '../../components/Modals/ProdPdfModal';

const PageContent = ({ prodMoves, agencies, articles, citernes }) => {
  const { auth } = usePage().props;
  const { delete: inertiaDelete, processing } = useForm();
  
  // Données de la page courante (Pagination)
  const initialMoves = prodMoves.data;

  // --- États ---
  const [filteredMoves, setFilteredMoves] = useState(initialMoves);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCiterne, setSelectedCiterne] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  // --- Options Select ---
  const agencyOptions = useMemo(() => Array.isArray(agencies) ? agencies.map(a => ({ value: String(a.id), label: a.name })) : [], [agencies]);
  const articleOptions = useMemo(() => Array.isArray(articles) ? articles.map(a => ({ value: String(a.id), label: a.name })) : [], [articles]);
  const citerneOptions = useMemo(() => Array.isArray(citernes) ? citernes.map(c => ({ value: String(c.id), label: c.name })) : [], [citernes]);

  // --- Logique de Filtrage (Client-side sur la page courante) ---
  const applyFilters = () => {
    let tempMoves = initialMoves;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      tempMoves = tempMoves.filter(move =>
        move.citerne?.name.toLowerCase().includes(lowerTerm) ||
        move.vehicle?.licence_plate.toLowerCase().includes(lowerTerm) || // Recherche Camion
        move.vehicle?.brand?.toLowerCase().includes(lowerTerm) ||       // Recherche Marque
        move.article?.name.toLowerCase().includes(lowerTerm) ||
        move.agency?.name.toLowerCase().includes(lowerTerm) ||
        move.user?.last_name.toLowerCase().includes(lowerTerm)
      );
    }

    if (selectedAgency) tempMoves = tempMoves.filter(m => m.agency_id === parseInt(selectedAgency.value));
    if (selectedArticle) tempMoves = tempMoves.filter(m => m.article_id === parseInt(selectedArticle.value));
    if (selectedCiterne) tempMoves = tempMoves.filter(m => m.source_citerne_id === parseInt(selectedCiterne.value));

    if (startDate) {
      const start = new Date(startDate);
      tempMoves = tempMoves.filter(m => new Date(m.created_at) >= start.setHours(0,0,0,0));
    }
    if (endDate) {
      const end = new Date(endDate);
      tempMoves = tempMoves.filter(m => new Date(m.created_at) <= end.setHours(23,59,59,999));
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
    applyFilters();
  }, [searchTerm, selectedAgency, selectedArticle, selectedCiterne, startDate, endDate, prodMoves.data]);

  // --- Suppression ---
  const canDelete = (productionCreatedAt) => {
    if (!auth.user?.modif_days || auth.user.modif_days <= 0) return false;
    const today = new Date();
    const creationDate = new Date(productionCreatedAt);
    const diffDays = Math.ceil((today - creationDate) / (1000 * 60 * 60 * 24));
    return diffDays <= auth.user.modif_days;
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Annuler cette production ?',
      text: "Les stocks (vide/plein/gaz) seront rétablis et les mouvements supprimés.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Oui, annuler !',
      cancelButtonText: 'Retour',
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('production.delete', id), { // Assurez-vous que la route s'appelle bien production.delete
          onSuccess: () => Swal.fire('Annulé !', 'La production a été annulée.', 'success'),
          onError: () => Swal.fire('Erreur', 'Impossible de supprimer.', 'error'),
        });
      }
    });
  };

  // --- Styles ---
  const isDark = document.documentElement.classList.contains('dark');
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? '#1F2937' : '#fff',
      borderColor: state.isFocused ? '#3B82F6' : (isDark ? '#374151' : '#E5E7EB'),
      color: isDark ? '#fff' : '#000',
    }),
    singleValue: (base) => ({ ...base, color: isDark ? '#fff' : '#000' }),
    menu: (base) => ({ ...base, backgroundColor: isDark ? '#1F2937' : '#fff', zIndex: 50 }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? (isDark ? '#374151' : '#F3F4F6') : 'transparent',
        color: state.isSelected ? '#fff' : (isDark ? '#fff' : '#000'),
    })
  };

  return (
    <div className="p-6 space-y-6">
      <Head title="Historique Productions" />

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Historique de Production
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Suivi des transformations Gaz Vrac → Bouteilles
            </p>
        </div>
        <Button onClick={() => setShowExportModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
          <FontAwesomeIcon icon={faFileExport} className="mr-2" /> Exporter PDF
        </Button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} className="text-blue-500" /> Filtres
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <InputField 
                id="search" 
                placeholder="Rechercher..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                icon={faSearch} 
            />
            <InputField type="date" value={startDate} onChange={e => setStartDate(e.target.value)} label="Du" />
            <InputField type="date" value={endDate} onChange={e => setEndDate(e.target.value)} label="Au" />
            
            <div className="z-20">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Article</label>
                <Select 
                    options={articleOptions} 
                    value={selectedArticle} 
                    onChange={setSelectedArticle} 
                    placeholder="Tous" 
                    styles={customSelectStyles} 
                    isClearable 
                />
            </div>
        </div>
        
        <div className="flex justify-end">
            <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-blue-600 underline">
                <FontAwesomeIcon icon={faTimes} className="mr-1" /> Réinitialiser
            </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Source (Vrac)</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produit Fini</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Quantité</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Poids Total</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Opérateur</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredMoves.length > 0 ? (
                        filteredMoves.map((move) => (
                            <tr key={move.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    {new Date(move.created_at).toLocaleDateString('fr-FR')} <br/>
                                    <span className="text-xs text-gray-400">{new Date(move.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span>
                                </td>
                                
                                {/* Colonne Source Intelligente */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {move.source_citerne_id ? (
                                        <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-400">
                                            <FontAwesomeIcon icon={faIndustry} />
                                            <span>{move.citerne?.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                            <FontAwesomeIcon icon={faTruckDroplet} />
                                            <span>{move.vehicle?.licence_plate || 'Camion'}</span>
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {move.article?.name}
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                        +{move.quantity_produced}
                                    </span>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    {parseFloat(move.total_weight_produced).toLocaleString('fr-FR')} kg
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                            <FontAwesomeIcon icon={faUser} />
                                        </div>
                                        {move.user?.last_name} {move.user?.first_name?.charAt(0)}.
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {canDelete(move.created_at) && (
                                        <button 
                                            onClick={() => handleDelete(move.id)} 
                                            disabled={processing}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all"
                                            title="Annuler cette production"
                                        >
                                            {processing ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faTrashAlt} />}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center">
                                    <FontAwesomeIcon icon={faSearch} className="text-3xl mb-3 opacity-20" />
                                    <p>Aucune production trouvée pour ces critères.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Pagination */}
      {prodMoves.links?.length > 3 && (
        <div className="flex justify-center mt-6">
            <div className="flex flex-wrap gap-1">
                {prodMoves.links.map((link, index) => (
                    link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                link.active 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span key={index} className="px-3 py-1 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-md" dangerouslySetInnerHTML={{ __html: link.label }} />
                    )
                ))}
            </div>
        </div>
      )}

      <ExportProductionModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        agencies={agencies}
        articles={articles}
        citernes={citernes}
      />
    </div>
  );
};

// Composant Wrapper Principal
const ProdMoves = (props) => {
  const { auth } = usePage().props;
  const role = auth.user?.role?.toLowerCase(); // Sécurisation de l'accès au rôle

  // Sélection du Layout en fonction du rôle
  let Layout = ProdLayout; // Par défaut
  if (role === 'controleur') Layout = RegLayout;
  if (role === 'direction' || role === 'admin') Layout = DirLayout;

  return (
    <Layout>
      <PageContent {...props} />
    </Layout>
  );
};

export default ProdMoves; 