// resources/js/components/Modals/EditAgenceModal.jsx

import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form'; // Votre composant Form
import Label from '../form/Label'; // Votre composant Label
import Input from '../form/input/InputField'; // Votre composant InputField

import { useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Pour les notifications

const EditAgenceModal = ({ isOpen, onClose, agence,entreprises, licences, regions, cities }) => {
  

  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    entreprise_id: agence?.entreprise_id || '',
    licence_id: agence?.licence_id || '',
    region_id: agence?.region_id || '',
    city_id: agence?.city_id || '',
    name: agence?.name || '',
    address: agence?.address || '',
  });

  // Met à jour les données du formulaire lorsque la prop 'agence' change
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
    } else {
      reset(); // Réinitialise si agence est null ou undefined
    }
  }, [agence, setData, reset]); // Ajouter les dépendances manquantes

  // Gérer la réinitialisation du formulaire après une soumission réussie et fermer la modale
  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
      Swal.fire({
        title: 'Succès !',
        text: 'Agence modifiée avec succès.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault(); // S'assurer que le rechargement par défaut est prévenu si Form ne le gère pas
    if (!agence || !agence.id) {
      console.error("Impossible de modifier: ID d'agence manquant, monsieur.");
      Swal.fire({
        title: 'Erreur !',
        text: "L'agence à modifier n'a pas été trouvée.",
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    console.log(`Données du formulaire agence ${agence.id} avant modification, monsieur:`, data);

    put(route('agencies.update', agence.id), { // Assurez-vous que 'agencies.update' est la bonne route
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier l'Agence : ${agence?.name || ''}`}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Entreprise */}
        <div>
          <Label htmlFor="edit-entreprise_id">Entreprise <span className="text-red-500">*</span></Label>
          <select
            id="edit-entreprise_id"
            value={data.entreprise_id}
            onChange={(e) => setData('entreprise_id', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.entreprise_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une entreprise</option>
            {entreprises && entreprises.map((entreprise) => (
              <option key={entreprise.id} value={entreprise.id}>
                {entreprise.name}
              </option>
            ))}
          </select>
          {errors.entreprise_id && <div className="text-red-500 text-sm mt-1">{errors.entreprise_id}</div>}
        </div>

        {/* Champ Licence */}
        <div>
          <Label htmlFor="edit-licence_id">Licence <span className="text-red-500">*</span></Label>
          <select
            id="edit-licence_id"
            value={data.licence_id}
            onChange={(e) => setData('licence_id', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.licence_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une licence</option>
            {licences && licences.map((licence) => (
              <option key={licence.id} value={licence.id}>
                {licence.name} ({licence.type})
              </option>
            ))}
          </select>
          {errors.licence_id && <div className="text-red-500 text-sm mt-1">{errors.licence_id}</div>}
        </div>

        {/* Champ Région */}
        <div>
          <Label htmlFor="edit-region_id">Région <span className="text-red-500">*</span></Label>
          <select
            id="edit-region_id"
            value={data.region_id}
            onChange={(e) => {
              setData('region_id', e.target.value);
              setData('city_id', ''); // Réinitialise la ville quand la région change
            }}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.region_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une région</option>
            {regions && regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          {errors.region_id && <div className="text-red-500 text-sm mt-1">{errors.region_id}</div>}
        </div>

        {/* Champ Ville (dépend de la région) */}
        <div>
          <Label htmlFor="edit-city_id">Ville <span className="text-red-500">*</span></Label>
          <select
            id="edit-city_id"
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
          <Label htmlFor="edit-agence-name">Nom de l'agence <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-agence-name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={true}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>

        {/* Champ Adresse */}
        <div>
          <Label htmlFor="edit-agence-address">Adresse <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-agence-address"
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
                Mise à jour...
              </>
            ) : (
              'Mettre à jour'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditAgenceModal;