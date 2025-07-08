import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';

import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// La prop 'region' contiendra les données de la région à modifier
const EditRegionModal = ({ isOpen, onClose, region }) => {
  // Initialise le formulaire avec les données de la région passée, ou des valeurs vides si aucune région
  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    name: region ? region.name : '',
  });

  // Met à jour les données du formulaire lorsque la prop 'region' change
  useEffect(() => {
    if (region) {
      setData('name', region.name);
    } else {
      reset(); // Réinitialise si la région est null ou undefined
    }
  }, [region, setData, reset]);

  // Gère la réinitialisation du formulaire après une soumission réussie
  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = () => {
    if (!region || !region.id) {
      console.error("Impossible de modifier: ID de région manquant, monsieur.");
      return;
    }
    console.log(`Données du formulaire région ${region.id} avant modification, monsieur:`, data);

    // Utilise la méthode PUT d'Inertia pour la mise à jour
    // Assurez-vous que la route 'regions.update' est définie dans Laravel
    put(route('regions.edit', region.id), {
      preserveScroll: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier la région: ${region ? region.name : ''}`}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom de la région */}
        <div>
          <Label htmlFor="edit-region-name">Nom de la région <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-region-name" // ID unique pour ce champ dans la modale d'édition
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing}
            error={!!errors.name}
            hint={errors.name}
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

export default EditRegionModal;