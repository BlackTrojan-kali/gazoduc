import React, { useEffect } from 'react';
import Modal from './Modal'; // Assurez-vous que le chemin est correct vers votre composant Modal
import Form from '../form/Form';   // Votre composant Form
import Label from '../form/Label'; // Votre composant Label
import Input from '../form/input/InputField'; // Votre composant InputField

import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const CreateRegionModal = ({ isOpen, onClose }) => {
  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    name: '', // Un seul champ pour le nom de la région
  });

  // Gère la réinitialisation du formulaire et la fermeture de la modale après une soumission réussie
  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = () => {
    // Affiche les données du formulaire dans la console avant l'envoi
    console.log("Données du formulaire région avant soumission, monsieur:", data);

    // Envoie les données du formulaire à la route Laravel 'regions.store'
    post(route('regions.store'), {
      preserveScroll: true, // Maintient la position de défilement après la redirection Inertia
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une nouvelle région">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom de la région */}
        <div>
          <Label htmlFor="name">Nom de la région <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing} // Désactive le champ pendant la soumission
            error={!!errors.name} // Indique une erreur si présente
            hint={errors.name} // Affiche le message d'erreur
          />
        </div>

        {/* Pied de la modale avec les boutons d'action */}
        <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700">
          <button
            type="button"
            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            onClick={onClose}
            disabled={processing} // Désactive le bouton d'annulation pendant la soumission
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            disabled={processing} // Désactive le bouton de soumission pendant la soumission
          >
            {processing ? ( // Affiche le spinner et le texte "Soumission..." pendant la soumission
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Soumission...
              </>
            ) : (
              'Créer' // Texte par défaut du bouton
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateRegionModal;