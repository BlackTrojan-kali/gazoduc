// resources/js/components/Modals/Vehicles/VehicleModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Chemin vers votre composant Modal
import Form from '../../form/Form'; // Chemin vers votre composant Form
import Label from '../../form/Label'; // Chemin vers votre composant Label
import Input from '../../form/input/InputField'; // Chemin vers votre composant InputField (utilisé pour text/number)

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Pour les notifications

// Le composant BasicCheckbox n'est plus nécessaire ici, car le champ 'archived' est retiré.


const VehicleFormModal = ({ isOpen, onClose, vehicle, routeName }) => {
  const { data, setData, post, put, processing, errors, reset, recentlySuccessful } = useForm({
    licence_plate: '',
    type: '',
    capacity_liters: '', // Facultatif
    owner_type: '',
    // 'archived' est retiré de l'état du formulaire
  });

  // Gérer l'initialisation/réinitialisation des données du formulaire
  useEffect(() => {
    if (isOpen) {
      if (vehicle) {
        setData({
          licence_plate: vehicle.licence_plate || '',
          type: vehicle.type || '',
          capacity_liters: vehicle.capacity_liters || '',
          owner_type: vehicle.owner_type || '',
          // 'archived' n'est plus initialisé ici
        });
      } else {
        reset();
      }
    }
  }, [isOpen, vehicle, reset, setData]);

  // Gérer la réinitialisation du formulaire et la fermeture de la modale après succès
  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
      Swal.fire({
        title: 'Succès !',
        text: `Véhicule ${vehicle ? 'modifié' : 'créé'} avec succès.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, [recentlySuccessful, reset, onClose, vehicle]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (vehicle) {
      put(route(routeName, vehicle.id), {
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
          console.error("Erreurs de validation:", validationErrors);
        },
      });
    }
  };

  const vehicleTypes = [
    { value: '', label: 'Sélectionner un type' },
    { value: 'Camion-citerne', label: 'Camion-citerne' },
    { value: 'Camion-plateau', label: 'Camion-plateau' },
    { value: 'Fourgon', label: 'Fourgon' },
    { value: 'Utilitaire', label: 'Véhicule utilitaire' },
    { value: 'Moto', label: 'Moto' },
    { value: 'Autre', label: 'Autre' },
  ];

  const ownerTypes = [
    { value: '', label: 'Sélectionner le type de propriétaire' },
    { value: 'Propre', label: 'Propre à l\'entreprise' },
    { value: 'Location', label: 'En location' },
    { value: 'Tiers', label: 'Appartient à un tiers' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vehicle ? "Modifier le Véhicule" : "Créer un Nouveau Véhicule"}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Plaque d'Immatriculation */}
        <div>
          <Label htmlFor="vehicle-licence_plate">Plaque d'Immatriculation <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="vehicle-licence_plate"
            name="licence_plate"
            value={data.licence_plate}
            onChange={(e) => setData('licence_plate', e.target.value)}
            disabled={processing}
            error={!!errors.licence_plate}
            hint={errors.licence_plate}
            required
          />
        </div>

        {/* Champ Type de Véhicule */}
        <div>
          <Label htmlFor="vehicle-type">Type de Véhicule <span className="text-red-500">*</span></Label>
          <select
            id="vehicle-type"
            value={data.type}
            onChange={(e) => setData('type', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.type ? 'border-red-500' : ''}`}
            required
          >
            {vehicleTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
        </div>

        {/* Champ Capacité (Litres) - Facultatif */}
        <div>
          <Label htmlFor="vehicle-capacity_liters">Capacité</Label>
          <Input
            type="number"
            id="vehicle-capacity_liters"
            name="capacity_liters"
            value={data.capacity_liters}
            onChange={(e) => setData('capacity_liters', e.target.value)}
            disabled={processing}
            error={!!errors.capacity_liters}
            hint={errors.capacity_liters}
            min="0"
            step="any"
          />
        </div>

        {/* Champ Type de Propriétaire */}
        <div>
          <Label htmlFor="vehicle-owner_type">Type de Propriétaire <span className="text-red-500">*</span></Label>
          <select
            id="vehicle-owner_type"
            value={data.owner_type}
            onChange={(e) => setData('owner_type', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.owner_type ? 'border-red-500' : ''}`}
            required
          >
            {ownerTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.owner_type && <div className="text-red-500 text-sm mt-1">{errors.owner_type}</div>}
        </div>

        {/* Le champ Archivé (Checkbox) est entièrement retiré */}

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
                {vehicle ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              vehicle ? 'Modifier le véhicule' : 'Créer le véhicule'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default VehicleFormModal;