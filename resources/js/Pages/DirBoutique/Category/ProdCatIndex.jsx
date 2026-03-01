import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import { debounce } from 'lodash'; 
import Select from 'react-select'; // Import de React-Select

import ProductCategoryFormModal from '../../../components/Modals/Boutique_Modals/Produits/ProductCategoryFormModal';
import Button from '../../../components/ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faTags, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';

const ProdCatIndex = ({ categories, allCategories, filters }) => {
  // --- États ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  
  const [search, setSearch] = useState(filters.search || '');
  
  // Formatage des options pour React-Select
  const parentOptions = allCategories.map(cat => ({ value: cat.id, label: cat.name }));
  
  // État initial du select basé sur les filtres de l'URL
  const [selectedParent, setSelectedParent] = useState(
    filters.parent_id 
      ? parentOptions.find(option => option.value == filters.parent_id) 
      : null
  );

  // --- Gestion des Filtres (Server-Side) ---
  const applyFilters = useCallback(
    debounce((searchQuery, parentId) => {
      router.get(
        route('product.category.index'),
        { 
            search: searchQuery, 
            parent_id: parentId // On passe le parent_id au backend
        },
        { preserveState: true, replace: true }
      );
    }, 300),
    []
  );

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    applyFilters(value, selectedParent?.value || '');
  };

  const onParentFilterChange = (selectedOption) => {
    setSelectedParent(selectedOption);
    applyFilters(search, selectedOption?.value || '');
  };

  // --- Gestion de la Modale ---
  const openCreateModal = () => {
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  // --- Suppression ---
  const handleDelete = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      router.delete(route('product-categories.destroy', id), {
        onSuccess: () => {
            // Notification toast ici
        }
      });
    }
  };

  const dataList = categories.data || [];

  return (
    <div className="p-6 space-y-6">
      <Head title="Catégories de Produits" />

      {/* --- En-tête --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faLayerGroup} className="text-brand-600"/>
            Catégories de Produits
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez la classification de vos articles en stock.
          </p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouvelle Catégorie
        </Button>
      </div>

      {/* --- Barre d'outils (Recherche & Filtres) --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
        
        {/* Recherche Texte */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={onSearchChange}
            className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-brand-500 focus:border-brand-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filtre React-Select pour la Catégorie Parente */}
        <div className="flex-1 max-w-xs z-20"> {/* z-20 important pour que le dropdown passe par-dessus le reste */}
            <Select
                value={selectedParent}
                onChange={onParentFilterChange}
                options={parentOptions}
                isClearable
                placeholder="Filtrer par parent..."
                className="react-select-container"
                classNamePrefix="react-select"
                // Styles basiques pour l'intégrer au design Tailwind
                styles={{
                    control: (base) => ({
                        ...base,
                        borderRadius: '0.5rem',
                        borderColor: '#D1D5DB', // gray-300
                        padding: '1px',
                    })
                }}
            />
        </div>

      </div>

      {/* --- Tableau --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/3">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catégorie Parente</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {dataList.length > 0 ? (
                dataList.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 mr-3">
                            <FontAwesomeIcon icon={faTags} className="text-xs"/>
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {cat.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {/* Affichage du parent au lieu de la description */}
                        {cat.parent ? (
                            <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
                                {cat.parent.name}
                            </span>
                        ) : (
                            <span className="italic opacity-50 text-xs">Catégorie Principale</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(cat)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 transition-colors p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full"
                        title="Modifier"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        title="Supprimer"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                    Aucune catégorie trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {categories.links && (
           <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                 Affichage de {categories.from || 0} à {categories.to || 0} sur {categories.total || 0} résultats
              </div>
              <div className="flex gap-1 overflow-x-auto">
                 {categories.links.map((link, k) => (
                    <button
                       key={k}
                       onClick={() => link.url && router.get(link.url, { search, parent_id: selectedParent?.value }, { preserveState: true })}
                       disabled={!link.url || link.active}
                       className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
                          link.active 
                          ? 'bg-brand-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                       } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                       dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                 ))}
              </div>
           </div>
        )}
      </div>

      {/* --- Modale --- */}
      <ProductCategoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={currentCategory}
        categories={allCategories} // On passe la liste pour le select interne
      />
    </div>
  );
};

ProdCatIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default ProdCatIndex;