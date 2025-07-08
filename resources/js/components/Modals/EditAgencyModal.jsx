// resources/js/components/Modals/EditAgenceModal.jsx

import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from './Modal'; // Assurez-vous que le chemin vers votre composant Modal est correct
import Swal from 'sweetalert2';
import Input from '../form/input/InputField';

const EditAgenceModal = ({ isOpen, onClose, agence,entreprises, licences, regions, cities  }) => {
  // agence est la prop qui contiendra les données de l'agence à modifier
  // Récupérer les props nécessaires (entreprises, licences, régions, villes)
 

  const { data, setData, put, processing, errors, reset } = useForm({
    entreprise_id: agence?.entreprise_id || '',
    licence_id: agence?.licence_id || '',
    region_id: agence?.region_id || '',
    city_id: agence?.city_id || '',
    name: agence?.name || '',
    address: agence?.address || '',
  });

  // Mettre à jour les données du formulaire lorsque la prop 'agence' change
  useEffect(() => {
    if (agence) {
      setData({
        entreprise_id: agence.entreprise_id,
        licence_id: agence.licence_id,
        region_id: agence.region_id,
        city_id: agence.city_id,
        name: agence.name,
        address: agence.address,
      });
    }
  }, [agence]); // Dépendance à 'agence'

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('agencies.update', agence.id), { // Assurez-vous que 'agencies.update' est votre route de mise à jour
      onSuccess: () => {
        Swal.fire({
          title: 'Succès !',
          text: 'Agence modifiée avec succès !',
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier l'Agence : ${agence?.name || ''}`}>
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
          <Input
            type="text"
            id="name"
            value={data.name}
            disabled={true}
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
            {processing ? 'Mise à jour...' : 'Mettre à jour l\'agence'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAgenceModal;