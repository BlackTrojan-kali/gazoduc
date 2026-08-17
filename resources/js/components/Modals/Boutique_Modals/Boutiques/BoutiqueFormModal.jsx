import React, { useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal';
import InputField from '../../../form/input/InputField';
import TextArea from '../../../form/input/TextArea';
import Button from '../../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";

// N'oubliez pas de passer 'regions' en props depuis le composant parent (DirBoutiqueIndex)
const BoutiqueFormModal = ({ isOpen, onClose, boutique, cities, regions, routeName = 'boutiques.store' }) => {
  const isEditMode = !!boutique;

  // Initialisation du formulaire conforme à la migration
  const { data, setData, post, put, processing, errors, reset } = useForm({
    region_id: boutique?.region_id || '',
    city_id: boutique?.city_id || '',
    name: boutique?.name || '',
    address: boutique?.address || '',
    counters: boutique?.counters || 0,     // Champ integer de la migration
    is_central: boutique?.is_central || false, // Champ boolean de la migration
  });

  // Reset des données à l'ouverture ou au changement de mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setData({
          region_id: boutique.region_id || '',
          city_id: boutique.city_id || '',
          name: boutique.name,
          address: boutique.address || '',
          counters: boutique.counters || 0,
          is_central: Boolean(boutique.is_central),
        });
      } else {
        reset();
      }
    }
  }, [isOpen, isEditMode, boutique, setData, reset]);

  // --- Options pour les Selects ---

  // 1. Options des Régions
  const regionsOptions = useMemo(() => (regions || []).map(r => ({
    value: String(r.id),
    label: r.name
  })), [regions]);

  // 2. Options des Villes (Filtrées par la région sélectionnée)
  const citiesOptions = useMemo(() => {
    if (!data.region_id) return []; // Si aucune région n'est choisie, pas de ville
    return (cities || [])
      .filter(city => String(city.region_id) === String(data.region_id))
      .map(city => ({
        value: String(city.id),
        label: city.name
      }));
  }, [cities, data.region_id]);


  // --- Gestionnaires d'événements ---

  const handleRegionChange = (selectedOption) => {
    // Quand on change de région, on reset la ville pour éviter les incohérences
    setData(prev => ({
      ...prev,
      region_id: selectedOption ? selectedOption.value : "",
      city_id: "" 
    }));
  };

  const handleCityChange = (selectedOption) => {
    setData("city_id", selectedOption ? selectedOption.value : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const routeUrl = isEditMode ? route(routeName.replace('store', 'update'), boutique.id) : route(routeName);
    const method = isEditMode ? put : post;

    method(routeUrl, {
      onSuccess: () => onClose(),
      onError: (err) => console.error("Erreur soumission boutique :", err),
    });
  };

  const modalTitle = isEditMode ? "Modifier la Boutique" : "Créer une Nouvelle Boutique";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">

          {/* 1. Sélection de la Région (Requis par migration) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Région <span className="text-red-500 ml-1">*</span>
            </label>
            <Select 
                options={regionsOptions} 
                onChange={handleRegionChange}
                value={regionsOptions.find(opt => opt.value === String(data.region_id))}
                placeholder="Sélectionner une région..."
                className="text-black text-sm"
                classNamePrefix="react-select"
            />
             {/* Note: Si vous n'avez pas d'erreur spécifique pour region_id coté Laravel, cela peut être générique */}
          </div>

          {/* 2. Sélection de la Ville (Requis par migration) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ville <span className="text-red-500 ml-1">*</span>
            </label>
            <Select 
                options={citiesOptions} 
                onChange={handleCityChange}
                value={citiesOptions.find(opt => opt.value === String(data.city_id))}
                placeholder={data.region_id ? "Sélectionner une ville..." : "Veuillez d'abord choisir une région"}
                isDisabled={!data.region_id}
                className="text-black text-sm"
                classNamePrefix="react-select"
            />
            {errors.city_id && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.city_id}</p>
            )}
          </div>
          
          {/* 3. Nom de la boutique (Unique) */}
          <InputField
            id="name"
            label="Nom de la Boutique"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            errorMessage={errors.name}
            required
          />

          {/* 4. Compteurs (Integer) */}
          <InputField
            id="counters"
            label="Nombre de guichets/compteurs"
            type="number"
            value={data.counters}
            onChange={(e) => setData('counters', e.target.value)}
            errorMessage={errors.counters}
            required
            min="0"
          />

          {/* 5. Adresse (Nullable) */}
          <TextArea
            id="address"
            label="Adresse complète"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            errorMessage={errors.address}
            rows={3}
            placeholder="Localisation précise..."
          />

          {/* 6. Is Central (Boolean) */}
          <div className="flex items-center gap-3 mt-2">
            <input
              id="is_central"
              type="checkbox"
              checked={data.is_central}
              onChange={(e) => setData('is_central', e.target.checked)}
              className="w-5 h-5 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="is_central" className="text-sm font-medium text-gray-900 dark:text-gray-300">
              Est-ce une boutique centrale ?
            </label>
          </div>
          {errors.is_central && <p className="text-xs text-red-600">{errors.is_central}</p>}

        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="inline-flex items-center"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={processing}
            className="inline-flex items-center bg-brand-600 text-white hover:bg-brand-700"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            {processing ? (isEditMode ? 'Mise à jour...' : 'Enregistrement...') : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BoutiqueFormModal;