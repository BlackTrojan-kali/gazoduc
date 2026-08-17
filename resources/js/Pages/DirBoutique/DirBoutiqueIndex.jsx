import React, { useState, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import DirBoutiqueLayout from '../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import BoutiqueFormModal from '../../components/Modals/Boutique_Modals/Boutiques/BoutiqueFormModal';
import Button from '../../components/ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSearch, faFilter, faStore, faMapMarkerAlt, faDesktop } from '@fortawesome/free-solid-svg-icons';

const DirBoutiqueIndex = ({ boutiques, cities, regions }) => {
  // Gestion des données
  const allBoutiques = boutiques.data || boutiques;

  // --- États ---
  const [displayedBoutiques, setDisplayedBoutiques] = useState(allBoutiques);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBoutique, setCurrentBoutique] = useState(null);

  // État des filtres
  const [filters, setFilters] = useState({
    search: '',
    region_id: '',
    city_id: '',
  });

  // --- Logique de Filtrage Front-End ---
  useEffect(() => {
    let result = allBoutiques;

    // 1. Filtre par Recherche (Uniquement sur le Nom désormais)
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(term));
    }

    // 2. Filtre par Région
    if (filters.region_id) {
      result = result.filter(b => String(b.region_id) === String(filters.region_id));
    }

    // 3. Filtre par Ville
    if (filters.city_id) {
      result = result.filter(b => String(b.city_id) === String(filters.city_id));
    }

    setDisplayedBoutiques(result);
  }, [filters, allBoutiques]);

  // --- Villes filtrées pour le select de filtre ---
  const availableCities = useMemo(() => {
    if (!filters.region_id) return cities;
    return cities.filter(city => String(city.region_id) === String(filters.region_id));
  }, [filters.region_id, cities]);

  // --- Gestionnaires d'événements ---
  const handleFilterChange = (key, value) => {
    if (key === 'region_id') {
      setFilters(prev => ({ ...prev, [key]: value, city_id: '' }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const openCreateModal = () => {
    setCurrentBoutique(null);
    setIsModalOpen(true);
  };

  const openEditModal = (boutique) => {
    setCurrentBoutique(boutique);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette boutique ?")) {
      router.delete(route('boutiques.destroy', id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Head title="Gestion des Boutiques" />

      {/* --- En-tête --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faStore} className="text-brand-600"/>
            Liste des Boutiques
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {displayedBoutiques.length} boutique(s) affichée(s)
          </p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nouvelle Boutique
        </Button>
      </div>

      {/* --- Barre de Filtres --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Recherche */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une boutique..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-brand-500 focus:border-brand-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Région */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
          </div>
          <select
            value={filters.region_id}
            onChange={(e) => handleFilterChange('region_id', e.target.value)}
            className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-brand-500 focus:border-brand-500 text-gray-900 dark:text-white"
          >
            <option value="">Toutes les régions</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
        </div>

        {/* Ville */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
          </div>
          <select
            value={filters.city_id}
            onChange={(e) => handleFilterChange('city_id', e.target.value)}
            className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-brand-500 focus:border-brand-500 text-gray-900 dark:text-white"
          >
            <option value="">Toutes les villes</option>
            {availableCities.map(city => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Tableau --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Boutique</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Configuration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {displayedBoutiques.length > 0 ? (
                displayedBoutiques.map((boutique) => (
                  <tr key={boutique.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    
                    {/* Colonne Nom */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{boutique.name}</div>
                      <div className="text-xs text-gray-500">ID: #{boutique.id}</div>
                    </td>

                    {/* Colonne Localisation */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                        {boutique.city?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {boutique.region?.name || 'Région N/A'}
                      </div>
                      {boutique.address && (
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1"/>
                            <span className="truncate max-w-[150px]" title={boutique.address}>{boutique.address}</span>
                        </div>
                      )}
                    </td>

                    {/* Colonne Compteurs */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <FontAwesomeIcon icon={faDesktop} className="mr-2 text-gray-400"/>
                        {boutique.counters} Compteur(s)
                      </div>
                    </td>

                    {/* Colonne Type (Centrale ou non) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {boutique.is_central ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800">
                          Centrale
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                          Annexe
                        </span>
                      )}
                    </td>

                    {/* Colonne Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(boutique)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 transition-colors p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full"
                        title="Modifier"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(boutique.id)}
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
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon icon={faStore} className="text-4xl mb-3 opacity-20"/>
                        <p>Aucune boutique ne correspond à vos filtres.</p>
                        <button 
                            onClick={() => setFilters({search: '', region_id: '', city_id: ''})}
                            className="text-brand-600 hover:underline mt-2 text-sm"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modale Connectée --- */}
      <BoutiqueFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boutique={currentBoutique}
        cities={cities}
        regions={regions} // AJOUT CRUCIAL ICI
      />
    </div>
  );
};

DirBoutiqueIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default DirBoutiqueIndex;