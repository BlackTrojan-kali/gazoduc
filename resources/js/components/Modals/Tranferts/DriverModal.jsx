// resources/js/components/Modals/Drivers/DriverModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Chemin vers votre composant Modal
import Form from '../../form/Form'; // Chemin vers votre composant Form
import Label from '../../form/Label'; // Chemin vers votre composant Label
import Input from '../../form/input/InputField'; // Chemin vers votre composant InputField

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';


const DriverFormModal = ({ isOpen, onClose, driver, routeName }) => {
  const { data, setData, post, put, processing, errors, reset, recentlySuccessful } = useForm({
    name: '',
    licence_number: '',
    licence_expiry: '',
    phone_number: '',
    address: '',
  });

  // Gérer l'initialisation/réinitialisation des données du formulaire
  useEffect(() => {
    if (isOpen) {
      if (driver) {
        // Mode édition : pré-remplir les champs avec les données du chauffeur existant
        // L'état 'archived' n'est pas géré par ce formulaire
        setData({
          name: driver.name || '',
          licence_number: driver.licence_number || '',
          licence_expiry: driver.licence_expiry || '',
          phone_number: driver.phone_number || '',
          address: driver.address || '',
        });
      } else {
        // Mode création : réinitialiser les champs à des valeurs par défaut
        reset();
      }
    }
  }, [isOpen, driver, reset, setData]);

  // Gérer la réinitialisation du formulaire et la fermeture de la modale après succès
  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
      Swal.fire({
        title: 'Succès !',
        text: `Chauffeur ${driver ? 'modifié' : 'créé'} avec succès.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, [recentlySuccessful, reset, onClose, driver]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (driver) {
      // Mode modification : Requête PUT
      put(route(routeName, driver.id), {
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
      // Mode création : Requête POST
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={driver ? "Modifier le Chauffeur" : "Créer un Nouveau Chauffeur"}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom du Chauffeur */}
        <div>
          <Label htmlFor="driver-name">Nom Complet <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="driver-name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing}
            error={!!errors.name}
            hint={errors.name}
            required
          />
        </div>

        {/* Champ Numéro de Permis */}
        <div>
          <Label htmlFor="driver-licence_number">Numéro de Permis <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="driver-licence_number"
            name="licence_number"
            value={data.licence_number}
            onChange={(e) => setData('licence_number', e.target.value)}
            disabled={processing}
            error={!!errors.licence_number}
            hint={errors.licence_number}
            required
          />
        </div>

        {/* Champ Date d'Expiration du Permis */}
        <div>
          <Label htmlFor="driver-licence_expiry">Date d'Expiration du Permis <span className="text-red-500">*</span></Label>
          <Input
            type="date" // Type date pour faciliter la saisie
            id="driver-licence_expiry"
            name="licence_expiry"
            value={data.licence_expiry}
            onChange={(e) => setData('licence_expiry', e.target.value)}
            disabled={processing}
            error={!!errors.licence_expiry}
            hint={errors.licence_expiry}
            required
          />
        </div>

        {/* Champ Numéro de Téléphone */}
        <div>
          <Label htmlFor="driver-phone_number">Numéro de Téléphone <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="driver-phone_number"
            name="phone_number"
            value={data.phone_number}
            onChange={(e) => setData('phone_number', e.target.value)}
            disabled={processing}
            error={!!errors.phone_number}
            hint={errors.phone_number}
            required
          />
        </div>

        {/* Champ Adresse */}
        <div>
          <Label htmlFor="driver-address">Adresse <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="driver-address"
            name="address"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            disabled={processing}
            error={!!errors.address}
            hint={errors.address}
            required
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
                {driver ? 'Mise à jour...' : 'Création...'}
              </>
            ) : (
              driver ? 'Modifier le chauffeur' : 'Créer le chauffeur'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default DriverFormModal;