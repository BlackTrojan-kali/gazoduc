import React, { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal';
import Form from '../../form/Form';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';
import Select from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

import ArticlesSelectionModal from './ArticleSelectionModal';

const RoadbillFormModal = ({ isOpen, onClose, roadbill, routeName, vehicles, drivers, agencies, articles }) => {
  const { auth } = usePage().props;
  const userAgencyId = auth.user.agency_id;
  const userAgencyName = auth.user.agency.name;

  const { data, setData, post, put, processing, errors, reset, recentlySuccessful } = useForm({
    vehicle_id: '',
    driver_id: '',
    co_driver_id: '',
    departure_location_id: '',
    arrival_location_id: '',
    departure_date: '',
    arrival_date: '',
    status: 'en_cours', // Statut par défaut
    type: '',
    note: '',
    articles: [],
  });

  const [isArticlesModalOpen, setIsArticlesModalOpen] = useState(false);

  // Définition des options pour les Select
  const vehicleOptions = vehicles.map(v => ({ value: v.id, label: v.licence_plate }));
  const driverOptions = drivers.map(d => ({ value: d.id, label: d.name }));
  const agencyOptions = agencies.map(a => ({ value: a.id, label: a.name }));
  const typeOptions = [
    { value: 'ramassage', label: 'Ramassage' },
    { value: 'livraison', label: 'Livraison' },
    { value: 'transit', label: 'Transit' },
  ];
  // Fin de la définition des options

  useEffect(() => {
    if (isOpen) {
      if (roadbill) {
        // Mode modification : utiliser les données existantes
        setData({
          vehicle_id: roadbill.vehicle_id || '',
          driver_id: roadbill.driver_id || '',
          co_driver_id: roadbill.co_driver_id || '',
          departure_location_id: roadbill.departure_location_id || '',
          arrival_location_id: roadbill.arrival_location_id || '',
          departure_date: roadbill.departure_date ? new Date(roadbill.departure_date).toISOString().slice(0, 16) : '',
          arrival_date: roadbill.arrival_date ? new Date(roadbill.arrival_date).toISOString().slice(0, 16) : '',
          status: roadbill.status || 'en_cours',
          type: roadbill.type || '',
          note: roadbill.note || '',
          articles: roadbill.articles || [],
        });
      } else {
        // Mode création : réinitialiser et pré-remplir avec l'agence de l'utilisateur
        reset();
        setData({
          vehicle_id: '',
          driver_id: '',
          co_driver_id: '',
          departure_location_id: userAgencyId,
          arrival_location_id: '',
          departure_date: '',
          arrival_date: '',
          status: 'en_cours',
          type: '',
          note: '',
          articles: [],
        });
      }
    }
  }, [isOpen, roadbill, reset, setData, userAgencyId]);

  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      setData('articles', []); // Réinitialiser aussi les articles après succès
      onClose();
      Swal.fire({
        title: 'Succès !',
        text: `Bordereau ${roadbill ? 'modifié' : 'créé'} avec succès.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, [recentlySuccessful, reset, onClose, roadbill, setData]);

  const openArticlesModal = () => setIsArticlesModalOpen(true);
  const closeArticlesModal = () => setIsArticlesModalOpen(false);

  const handleSaveSelectedArticles = (selectedItems) => {
    setData('articles', selectedItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation : Vérifier si au moins un article a été sélectionné
    if (!data.articles || data.articles.length === 0) {
      Swal.fire({
        title: 'Attention !',
        text: 'Veuillez sélectionner au moins un article à transférer.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    // Fin de la validation

    if (roadbill) {
      put(route(routeName, roadbill.id), {
        preserveScroll: true,
        onError: (validationErrors) => {
          Swal.fire({
            title: 'Erreur !',
            text: 'Veuillez corriger les erreurs dans le formulaire.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error("Validation Errors:", validationErrors);
        },
      });
    } else {
      post(route(routeName), {
        preserveScroll: true,
        onError: (validationErrors) => {
          Swal.fire({
            title: 'Erreur !',
            text: 'Veuillez corriger les erreurs dans le formulaire.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          console.error("Validation Errors:", validationErrors);
        },
      });
    }
  };

  // Styles personnalisés pour React Select (mis à jour)
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#f3f4f6',
      borderColor: errors[state.selectProps.name] ? '#ef4444' : '#d1d5db',
      color: '#1f2937',
      borderRadius: '0.375rem',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : null,
      minHeight: '42px',

      '.dark &': {
        backgroundColor: '#374151',
        borderColor: errors[state.selectProps.name] ? '#ef4444' : '#4b5563',
        color: '#ffffff',
      },
      '&:hover': {
        borderColor: errors[state.selectProps.name] ? '#ef4444' : '#6b7280',
        '.dark &': {
          borderColor: errors[state.selectProps.name] ? '#ef4444' : '#60a5fa',
        },
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1f2937',
      '.dark &': {
        color: '#ffffff',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: '#1f2937',
      '.dark &': {
        color: '#ffffff',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
      '.dark &': {
        color: '#9ca3af',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#ffffff',
      borderRadius: '0.375rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      
      '.dark &': {
        backgroundColor: '#1f2937', // Fond du menu en dark mode
      },
    }),
    option: (provided, state) => ({
      ...provided,
      // Styles par défaut pour le mode clair
      backgroundColor: state.isSelected ? '#2563eb' : (state.isFocused ? '#3b82f6' : 'transparent'),
      color: state.isSelected || state.isFocused ? '#ffffff' : '#1f2937', // Texte noir par défaut

      // Styles pour le mode sombre
      '.dark &': {
        backgroundColor: state.isSelected ? '#2563eb' : (state.isFocused ? '#3b82f6' : 'transparent'),
        color: state.isSelected || state.isFocused ? '#ffffff' : '#e5e7eb', // Texte blanc par défaut
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#9ca3af',
      '.dark &': {
        backgroundColor: '#6b7280',
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      '.dark &': {
        color: '#9ca3af',
      },
      '&:hover': {
        color: '#3b82f6',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: '#6b7280',
      '&:hover': {
        color: '#ef4444',
      },
    }),
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={roadbill ? "Modifier le Bordereau de Route" : "Créer un Nouveau Bordereau de Route"}>
        <Form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ Véhicule */}
          <div>
            <Label htmlFor="roadbill-vehicle_id">Véhicule <span className="text-red-500">*</span></Label>
            <Select
              id="roadbill-vehicle_id"
              name="vehicle_id"
              options={vehicleOptions}
              value={vehicleOptions.find(option => option.value === data.vehicle_id) || null}
              onChange={(selectedOption) => setData('vehicle_id', selectedOption ? selectedOption.value : '')}
              isDisabled={processing}
              placeholder="Sélectionner un véhicule"
              isClearable
              styles={customStyles}
              classNamePrefix="react-select"
            />
            {errors.vehicle_id && <div className="text-red-500 text-sm mt-1">{errors.vehicle_id}</div>}
          </div>

          {/* Champ Chauffeur Principal */}
          <div>
            <Label htmlFor="roadbill-driver_id">Chauffeur Principal <span className="text-red-500">*</span></Label>
            <Select
              id="roadbill-driver_id"
              name="driver_id"
              options={driverOptions}
              value={driverOptions.find(option => option.value === data.driver_id) || null}
              onChange={(selectedOption) => setData('driver_id', selectedOption ? selectedOption.value : '')}
              isDisabled={processing}
              placeholder="Sélectionner un chauffeur"
              isClearable
              styles={customStyles}
              classNamePrefix="react-select"
            />
            {errors.driver_id && <div className="text-red-500 text-sm mt-1">{errors.driver_id}</div>}
          </div>

          {/* Champ Co-Chauffeur (facultatif) */}
          <div>
            <Label htmlFor="roadbill-co_driver_id">Co-Chauffeur</Label>
            <Select
              id="roadbill-co_driver_id"
              name="co_driver_id"
              options={driverOptions}
              value={driverOptions.find(option => option.value === data.co_driver_id) || null}
              onChange={(selectedOption) => setData('co_driver_id', selectedOption ? selectedOption.value : '')}
              isDisabled={processing}
              placeholder="Aucun co-chauffeur"
              isClearable
              styles={customStyles}
              classNamePrefix="react-select"
            />
            {errors.co_driver_id && <div className="text-red-500 text-sm mt-1">{errors.co_driver_id}</div>}
          </div>

          {/* Affichage du nom de l'agence de départ non-modifiable */}
          <div>
            <Label htmlFor="roadbill-departure_location_id">Agence de Départ <span className="text-red-500">*</span></Label>
            <p className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 shadow-sm px-3 py-2 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
              {userAgencyName}
            </p>
            {/* Champ caché pour la soumission du formulaire */}
            <input type="hidden" name="departure_location_id" value={data.departure_location_id} />
          </div>

          {/* Champ Agence d'Arrivée */}
          <div>
            <Label htmlFor="roadbill-arrival_location_id">Agence d'Arrivée <span className="text-red-500">*</span></Label>
            <Select
              id="roadbill-arrival_location_id"
              name="arrival_location_id"
              options={agencyOptions}
              value={agencyOptions.find(option => option.value === data.arrival_location_id) || null}
              onChange={(selectedOption) => setData('arrival_location_id', selectedOption ? selectedOption.value : '')}
              isDisabled={processing}
              placeholder="Sélectionner une agence d'arrivée"
              isClearable
              styles={customStyles}
              classNamePrefix="react-select"
            />
            {errors.arrival_location_id && <div className="text-red-500 text-sm mt-1">{errors.arrival_location_id}</div>}
          </div>

          {/* Champ Date de Départ */}
          <div>
            <Label htmlFor="roadbill-departure_date">Date de Départ <span className="text-red-500">*</span></Label>
            <Input
              type="datetime-local"
              id="roadbill-departure_date"
              name="departure_date"
              value={data.departure_date}
              onChange={(e) => setData('departure_date', e.target.value)}
              disabled={processing}
              error={!!errors.departure_date}
              hint={errors.departure_date}
              required
            />
          </div>

          {/* Champ Date d'Arrivée (facultatif) */}
          <div>
            <Label htmlFor="roadbill-arrival_date">Date d'Arrivée</Label>
            <Input
              type="datetime-local"
              id="roadbill-arrival_date"
              name="arrival_date"
              value={data.arrival_date}
              onChange={(e) => setData('arrival_date', e.target.value)}
              disabled={processing}
              error={!!errors.arrival_date}
              hint={errors.arrival_date}
            />
          </div>

          {/* Champ Type */}
          <div>
            <Label htmlFor="roadbill-type">Type <span className="text-red-500">*</span></Label>
            <Select
              id="roadbill-type"
              name="type"
              options={typeOptions}
              value={typeOptions.find(option => option.value === data.type) || null}
              onChange={(selectedOption) => setData('type', selectedOption ? selectedOption.value : '')}
              isDisabled={processing}
              placeholder="Sélectionner un type"
              styles={customStyles}
              classNamePrefix="react-select"
            />
            {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
          </div>

          {/* Champ Note (Commentaire) */}
          <div>
            <Label htmlFor="roadbill-note">Note (Commentaire)</Label>
            <textarea
              id="roadbill-note"
              name="note"
              value={data.note}
              onChange={(e) => setData('note', e.target.value)}
              disabled={processing}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.note ? 'border-red-500' : ''}`}
              rows="3"
            ></textarea>
            {errors.note && <div className="text-red-500 text-sm mt-1">{errors.note}</div>}
          </div>

          {/* Bouton pour ouvrir la modale de sélection d'articles */}
          <div className="mt-6">
            <button
              type="button"
              onClick={openArticlesModal}
              className="w-full bg-indigo-600 text-white active:bg-indigo-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              Sélectionner les Articles ({data.articles.length})
            </button>
            {/* Affichage de l'erreur si aucun article n'est sélectionné */}
            {errors.articles && <div className="text-red-500 text-sm mt-1">{errors.articles}</div>}
          </div>

          {/* Pied de la modale (boutons de soumission) */}
          <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700 mt-4">
            <button
              type="button"
              className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
              onClick={onClose}
              disabled={processing}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
              disabled={processing}
            >
              {processing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  {roadbill ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                roadbill ? 'Modifier le bordereau' : 'Créer le bordereau'
              )}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Modale de sélection des articles */}
      <ArticlesSelectionModal
        isOpen={isArticlesModalOpen}
        onClose={closeArticlesModal}
        articles={articles}
        onSaveArticles={handleSaveSelectedArticles}
        initialSelectedArticles={data.articles}
      />
    </>
  );
};

export default RoadbillFormModal;
