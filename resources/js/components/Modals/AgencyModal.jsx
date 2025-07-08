// resources/js/components/Modals/CreateAgenceModal.jsx

import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from './Modal'; // Assurez-vous que le chemin vers votre composant Modal est correct
import Swal from 'sweetalert2';

const CreateAgenceModal = ({ isOpen, onClose,entreprises, licences, regions, cities  }) => {
  // Récupérer les props nécessaires (entreprises, licences, régions, villes)
  // Ces props devraient être passées depuis votre contrôleur Laravel vers la page qui rend le Dashboard
  // et ensuite injectées ici via usePage().props.
  

  const { data, setData, post, processing, errors, reset } = useForm({
    entreprise_id: '',
    licence_id: '',
    region_id: '',
    city_id: '',
    name: '',
    address: '',
  });

  // Réinitialiser le formulaire quand la modale s'ouvre ou se ferme
  useEffect(() => {
    if (isOpen) {
      reset(); // Réinitialise les champs quand la modale s'ouvre
      // Définir des valeurs par défaut si vous le souhaitez, par exemple le premier élément
      if (entreprises.length > 0) setData('entreprise_id', entreprises[0].id);
      if (licences.length > 0) setData('licence_id', licences[0].id);
      if (regions.length > 0) setData('region_id', regions[0].id);
      // La ville pourrait dépendre de la région sélectionnée
      // if (cities.length > 0) setData('city_id', cities[0].id); // Peut-être pas la meilleure stratégie
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('agencies.store'), { // Assurez-vous que 'agencies.store' est votre route de création d'agence
      onSuccess: () => {
        Swal.fire({
          title: 'Succès !',
          text: 'Agence créée avec succès !',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        onClose(); // Ferme la modale après succès
      },
      onError: (errors) => {
        Swal.fire({
          title: 'Erreur !',
          text: 'Veuillez corriger les erreurs dans le formulaire.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.error("Erreurs de validation:", errors);
      },
    });
  };

  // Filtrer les villes en fonction de la région sélectionnée
  const filteredCities = cities.filter(city => city.region_id == data.region_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une Nouvelle Agence">
      <form onSubmit={handleSubmit} className="p-4">
        {/* Champ Entreprise */}
        <div className="mb-4">
          <label htmlFor="entreprise_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entreprise</label>
          <select
            id="entreprise_id"
            value={data.entreprise_id}
            onChange={(e) => setData('entreprise_id', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Sélectionner une entreprise</option>
            {entreprises.map((entreprise) => (
              <option key={entreprise.id} value={entreprise.id}>
                {entreprise.name}
              </option>
            ))}
          </select>
          {errors.entreprise_id && <div className="text-red-500 text-sm mt-1">{errors.entreprise_id}</div>}
        </div>

        {/* Champ Licence */}
        <div className="mb-4">
          <label htmlFor="licence_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Licence</label>
          <select
            id="licence_id"
            value={data.licence_id}
            onChange={(e) => setData('licence_id', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Sélectionner une licence</option>
            {licences.map((licence) => (
              <option key={licence.id} value={licence.id}>
                {licence.name} ({licence.type})
              </option>
            ))}
          </select>
          {errors.licence_id && <div className="text-red-500 text-sm mt-1">{errors.licence_id}</div>}
        </div>

        {/* Champ Région */}
        <div className="mb-4">
          <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Région</label>
          <select
            id="region_id"
            value={data.region_id}
            onChange={(e) => {
              setData('region_id', e.target.value);
              setData('city_id', ''); // Réinitialise la ville quand la région change
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Sélectionner une région</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          {errors.region_id && <div className="text-red-500 text-sm mt-1">{errors.region_id}</div>}
        </div>

        {/* Champ Ville (dépend de la région) */}
        <div className="mb-4">
          <label htmlFor="city_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ville</label>
          <select
            id="city_id"
            value={data.city_id}
            onChange={(e) => setData('city_id', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={!data.region_id} // Désactive si aucune région n'est sélectionnée
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
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de l'agence</label>
          <input
            type="text"
            id="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
        </div>

        {/* Champ Adresse */}
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse</label>
          <input
            type="text"
            id="address"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={processing}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {processing ? 'Création...' : 'Créer l\'agence'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAgenceModal;