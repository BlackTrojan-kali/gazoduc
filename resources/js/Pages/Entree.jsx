import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faFileExport, faFilter, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../components/ui/button/Button';
import MovementHistoryPDFExcelModal from '../components/Modals/MovHistModal';
import Select from 'react-select';

// Layouts
import MagLayout from '../layout/MagLayout/MagLayout';
import ProdLayout from '../layout/ProdLayout/ProdLayout';
import RegLayout from '../layout/RegLayout/RegLayout';
import useLicenceChoice from '../hooks/useLicenceChoice';
import MagFuelLayout from '../layout/FuelLayout/MagFuelLayout';
import DirLayout from '../layout/DirLayout/DirLayout';
import DirFuelLayout from '../layout/DirFuelLayout/DirFuelLayout';

// --- 1. Styles React-Select (Mode Sombre/Clair) ---
const getSelectStyles = (isDark) => ({
  control: (base, state) => ({
    ...base,
    height: '42px',
    minHeight: '42px',
    borderColor: state.isFocused ? '#3B82F6' : (isDark ? '#374151' : '#D1D5DB'),
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    color: isDark ? '#F3F4F6' : '#111827',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    '&:hover': { borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
    zIndex: 50,
    border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? (isDark ? '#374151' : '#F3F4F6') : 'transparent',
    color: state.isSelected ? '#FFFFFF' : (isDark ? '#F3F4F6' : '#111827'),
    cursor: 'pointer',
    fontSize: '0.875rem',
  }),
  singleValue: (base) => ({ ...base, color: isDark ? '#F3F4F6' : '#111827' }),
  input: (base) => ({ ...base, color: isDark ? '#F3F4F6' : '#111827' }),
  placeholder: (base) => ({ ...base, color: isDark ? '#9CA3AF' : '#6B7280' }),
});

// --- 2. Composant Pagination ---
const Pagination = ({ links }) => {
  if (!links || links.length <= 3) return null;
  return (
    <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
      <div className="flex flex-wrap gap-1">
        {links.map((link, key) => {
           // Nettoyage des entités HTML pour les flèches
           let label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
           return link.url === null ? (
            <div key={key} className="px-3 py-1 text-sm text-gray-400 dark:text-gray-600 border border-transparent bg-transparent rounded-md cursor-not-allowed">
              {label}
            </div>
          ) : (
            <Link
              key={key}
              href={link.url}
              preserveState
              preserveScroll
              only={['movements']} // Optimisation : ne recharge que les mouvements
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                link.active
                  ? 'bg-blue-600 text-white border-blue-600 font-medium'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// --- 3. Composant Badge (Type de Mouvement) ---
const MovementBadge = ({ type }) => {
  const isEntree = type === 'entree';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      isEntree 
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
    }`}>
      {type === 'entree' ? '+ Entrée' : '- Sortie'}
    </span>
  );
};

// --- 4. Contenu Principal de la Page ---
const PageContent = ({ movements, articles, agencies, services, filters }) => {
  const [isPDFExcelModalOpen, setIsPDFExcelModalOpen] = useState(false);
  
  // Récupération des infos utilisateur et Rôle
  const { auth } = usePage().props;
  const userRole = auth.user.role?.name || auth.user.role; // Normalisation (objet ou string)
  
  const isDark = document.documentElement.classList.contains('dark');

  // État local des filtres
  const [values, setValues] = useState({
    article_name: filters.article_name || '',
    qualification: filters.qualification || '',
    agency_id: filters.agency_id || '',
    service: filters.service || '',
  });

  // Synchronisation des filtres (si l'utilisateur fait Précédent/Suivant)
  useEffect(() => {
    setValues({
        article_name: filters.article_name || '',
        qualification: filters.qualification || '',
        agency_id: filters.agency_id || '',
        service: filters.service || '',
    });
  }, [filters]); 

  const { delete: inertiaDelete, processing } = useForm();

  // Gestion du changement de filtre (Router.get)
  const handleFilterChange = useCallback((key, value) => {
    setValues(prev => {
      const newValues = { ...prev, [key]: value };
      router.get(
        window.location.pathname,
        { ...newValues, page: 1 }, // Reset page à 1 lors d'un nouveau filtre
        { preserveState: true, preserveScroll: true, replace: true }
      );
      return newValues;
    });
  }, []);

  // Options pour les Selects
  const articleOptions = articles.map(a => ({ value: a.name, label: a.name }));
  const agencyOptions = agencies.map(a => ({ value: String(a.id), label: a.name }));
  const serviceOptions = services.map(s => ({ value: s.name, label: s.name.charAt(0).toUpperCase() + s.name.slice(1) }));
  const qualificationOptions = [
    { value: 'reepreuve', label: 'Réépreuve' }, { value: 'achat', label: 'Achat' },
    { value: 'vente', label: 'Vente' }, { value: 'perte', label: 'Perte' },
    { value: 'transfert', label: 'Transfert' }, { value: 'inventaire', label: 'Inventaire' },
  ];

  // --- LOGIQUE DE SÉCURITÉ : SUPPRESSION ---
  const canDelete = (createdAt) => {
    // 1. Bloquer strictement Direction et Contrôleur (Régional)
    const forbiddenRoles = ['direction', 'controleur', 'regional'];
    if (forbiddenRoles.includes(userRole)) {
        return false;
    }

    // 2. Pour les autres (Magasin, Production), vérifier la limite de temps
    if (!auth.user?.modif_days || auth.user.modif_days <= 0) return false;
    
    const diffDays = Math.ceil((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return diffDays <= auth.user.modif_days;
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Supprimer ce mouvement ?',
      text: "Le stock sera recalculé. Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      background: isDark ? '#1F2937' : '#fff',
      color: isDark ? '#F3F4F6' : '#000'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('magasin.move.delete', id), { preserveScroll: true });
      }
    });
  };

  return (
    <>
      <Head title="Gestion des Mouvements" />
      <div className="p-4 md:p-6 space-y-6">
        
        {/* En-tête avec Bouton Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <FontAwesomeIcon icon={faCube} />
              </div>
              Mouvements de Stock
            </h2>
          </div>
          <Button onClick={() => setIsPDFExcelModalOpen(true)} variant="secondary" className="shadow-sm border-gray-200 dark:border-gray-600">
            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
            Exporter
          </Button>
        </div>

        {/* Zone de Filtres */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
            <FontAwesomeIcon icon={faFilter} className="text-blue-500" /> Filtres
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="z-40">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Article</label>
                <Select placeholder="Article..." options={articleOptions} styles={getSelectStyles(isDark)} isClearable
                    value={articleOptions.find(op => op.value === values.article_name) || null}
                    onChange={(opt) => handleFilterChange('article_name', opt ? opt.value : '')} />
            </div>
            <div className="z-30">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Qualification</label>
                <Select placeholder="Opération..." options={qualificationOptions} styles={getSelectStyles(isDark)} isClearable
                    value={qualificationOptions.find(op => op.value === values.qualification) || null}
                    onChange={(opt) => handleFilterChange('qualification', opt ? opt.value : '')} />
            </div>
            <div className="z-20">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Agence</label>
                <Select placeholder="Site..." options={agencyOptions} styles={getSelectStyles(isDark)} isClearable
                    value={agencyOptions.find(op => op.value === values.agency_id) || null}
                    onChange={(opt) => handleFilterChange('agency_id', opt ? opt.value : '')}
                    isDisabled={agencies.length <= 1} />
            </div>
            <div className="z-10">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Service</label>
                <Select placeholder="Service..." options={serviceOptions} styles={getSelectStyles(isDark)} isClearable
                    value={serviceOptions.find(op => op.value === values.service) || null}
                    onChange={(opt) => handleFilterChange('service', opt ? opt.value : '')} />
            </div>
          </div>
        </div>

        {/* Tableau des Données */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-700/50">
                <TableRow>
                  <TableCell isHeader>Article</TableCell>
                  <TableCell isHeader>Agence</TableCell>
                  <TableCell isHeader className="text-right">Quantité</TableCell>
                  <TableCell isHeader className="text-center">Type</TableCell>
                  <TableCell isHeader>Qualification</TableCell>
                  <TableCell isHeader>Date</TableCell>
                  <TableCell isHeader className="text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center opacity-50">
                            <FontAwesomeIcon icon={faSearch} className="text-2xl mb-2" />
                            <p>Aucun résultat trouvé</p>
                        </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.data.map((movement) => (
                    <TableRow key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                        {movement.article?.name || 'Inconnu'}
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                        {movement.agency?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-gray-700 dark:text-gray-300">
                        {parseFloat(movement.quantity).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-center">
                        <MovementBadge type={movement.movement_type} />
                      </TableCell>
                      <TableCell className="text-sm capitalize text-gray-600 dark:text-gray-300">
                        {movement.qualification}
                        {movement.source_location && <span className="text-xs text-gray-400 block">Via {movement.source_location}</span>}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(movement.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {/* Affichage conditionnel du bouton supprimer */}
                        {canDelete(movement.created_at) && (
                          <button 
                            onClick={() => handleDelete(movement.id)} 
                            className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" 
                            title="Supprimer"
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
          </div>
          
          {/* Pagination */}
          <Pagination links={movements.links} />
        </div>
      </div>

      <MovementHistoryPDFExcelModal
        isOpen={isPDFExcelModalOpen}
        onClose={() => setIsPDFExcelModalOpen(false)}
        articles={articles}
        agencies={agencies}
        services={services}
        currentFilters={values} // Passage des filtres pour pré-remplir la modale
      />
    </>
  );
};

// --- 5. Wrapper Principal (Layout dynamique) ---
const Entree = (props) => {
  const { auth } = usePage().props;
  const userRole = auth.user.role?.name || auth.user.role;
  const { licence, DirLicence } = useLicenceChoice();
  // Mapping des rôles vers les Layouts
  const LayoutMap = {
    production: ProdLayout,
    controleur: RegLayout, // Contrôleur = Régional
    magasin: licence === "gaz" ? MagLayout : MagFuelLayout,
    direction: DirLicence === "gaz" ? DirLayout : DirFuelLayout,
  };
  
  const SelectedLayout = LayoutMap[userRole] || MagLayout;

  return (
    <SelectedLayout>
      <PageContent {...props} />
    </SelectedLayout>
  );
};

export default Entree;