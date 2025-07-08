// resources/js/components/Modals/CreateAgenceModal.jsx

import React, { useEffect } from 'react'; // Gardez useEffect
import Modal from './Modal';
import Form from '../form/Form'; // Votre composant Form
import Label from '../form/Label'; // Votre composant Label
import Input from '../form/input/InputField'; // Votre composant InputField

import { useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Pour les notifications

const CreateAgenceModal = ({ isOpen, onClose,entreprises, licences, regions, cities }) => {
  

  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    entreprise_id: '',
    licence_id: '',
    region_id: '',
    city_id: '',
    name: '',
    address: '',
  });

  // Réinitialiser le formulaire quand la modale s'ouvre
  // ou définir les premières valeurs par défaut des selects
  useEffect(() => {
    if (isOpen) {
      reset();
      // Si les listes sont disponibles, pré-sélectionner le premier élément
      if (entreprises && entreprises.length > 0) setData('entreprise_id', entreprises[0].id);
      if (licences && licences.length > 0) setData('licence_id', licences[0].id);
      if (regions && regions.length > 0) setData('region_id', regions[0].id);
      // La ville ne doit pas être pré-sélectionnée car elle dépend de la région
      setData('city_id', '');
    }
  }, [isOpen, entreprises, licences, regions, setData, reset]); // Ajouter les dépendances manquantes

  // Gérer la réinitialisation du formulaire après une soumission réussie et fermer la modale
  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
      Swal.fire({
        title: 'Succès !',
        text: 'Agence créée avec succès.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault(); // S'assurer que le rechargement par défaut est prévenu si Form ne le gère pas
    post(route('agencies.store'), {
      preserveScroll: true,
      onError: (validationErrors) => {
        Swal.fire({
          title: 'Erreur !',
          text: 'Veuillez corriger les erreurs dans le formulaire.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.error("Erreurs de validation:", validationErrors);
      },
    });
  };

  // Filtrer les villes en fonction de la région sélectionnée
  const filteredCities = cities.filter(city => city.region_id == data.region_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une Nouvelle Agence">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Entreprise */}
        <div>
          <Label htmlFor="create-entreprise_id">Entreprise <span className="text-red-500">*</span></Label>
          <select
            id="create-entreprise_id"
            value={data.entreprise_id}
            onChange={(e) => setData('entreprise_id', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.entreprise_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une entreprise</option>
            {entreprises && entreprises.map((entreprise) => ( // Vérifiez que entreprises existe
              <option key={entreprise.id} value={entreprise.id}>
                {entreprise.name}
              </option>
            ))}
          </select>
          {errors.entreprise_id && <div className="text-red-500 text-sm mt-1">{errors.entreprise_id}</div>}
        </div>

        {/* Champ Licence */}
        <div>
          <Label htmlFor="create-licence_id">Licence <span className="text-red-500">*</span></Label>
          <select
            id="create-licence_id"
            value={data.licence_id}
            onChange={(e) => setData('licence_id', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.licence_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une licence</option>
            {licences && licences.map((licence) => ( // Vérifiez que licences existe
              <option key={licence.id} value={licence.id}>
                {licence.name} ({licence.type})
              </option>
            ))}
          </select>
          {errors.licence_id && <div className="text-red-500 text-sm mt-1">{errors.licence_id}</div>}
        </div>

        {/* Champ Région */}
        <div>
          <Label htmlFor="create-region_id">Région <span className="text-red-500">*</span></Label>
          <select
            id="create-region_id"
            value={data.region_id}
            onChange={(e) => {
              setData('region_id', e.target.value);
              setData('city_id', ''); // Réinitialise la ville quand la région change
            }}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.region_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une région</option>
            {regions && regions.map((region) => ( // Vérifiez que regions existe
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          {errors.region_id && <div className="text-red-500 text-sm mt-1">{errors.region_id}</div>}
        </div>

        {/* Champ Ville (dépend de la région) */}
        <div>
          <Label htmlFor="create-city_id">Ville <span className="text-red-500">*</span></Label>
          <select
            id="create-city_id"
            value={data.city_id}
            onChange={(e) => setData('city_id', e.target.value)}
            disabled={processing || !data.region_id || filteredCities.length === 0} // Désactive si aucune région ou pas de villes
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.city_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une ville</option>
            {filteredCities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city_id && <div className="text-red-500 text-sm mt-1">{errors.city_id}</div>}
        </div>

        {/* Champ Nom */}
        <div>
          <Label htmlFor="create-agence-name">Nom de l'agence <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="create-agence-name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>

        {/* Champ Adresse */}
        <div>
          <Label htmlFor="create-agence-address">Adresse <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="create-agence-address"
            name="address"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            disabled={processing}
            error={!!errors.address}
            hint={errors.address}
          />
        </div>

        {/* Pied de la modale (boutons) */}
        <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700">
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
                Création...
              </>
            ) : (
              'Créer l\'agence'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateAgenceModal;