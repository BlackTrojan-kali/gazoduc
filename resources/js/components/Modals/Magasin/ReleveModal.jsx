// resources/js/Components/Modals/EditCiterneStockModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Votre composant Modal générique
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';

const EditCiterneStockModal = ({ isOpen, onClose, stockToEdit }) => {
  // Initialise le formulaire avec les données du stock à modifier
  // ou des valeurs par défaut si stockToEdit est null (quand la modal est fermée)
  const { data, setData, post, processing, errors, reset } = useForm({
    id: stockToEdit ? stockToEdit.id : null,
    theorical_quantity: stockToEdit ? stockToEdit.theorical_quantity : '', // Notez "theoritical_quantity"
    quantity: stockToEdit ? stockToEdit.quantity : '', // Notez "quantity" (stock relevé)
    // Pas besoin de citerne_id ici si on le passe via l'URL de la requête PUT/PATCH
  });

  // Réinitialise les données du formulaire lorsque stockToEdit change (quand une nouvelle citerne est sélectionnée)
  useEffect(() => {
    if (stockToEdit) {
      setData({
        id: stockToEdit.id,
        theorical_quantity: stockToEdit.theorical_quantity,
        quantity: stockToEdit.quantity,
      });
    } else {
      reset(); // Réinitialise si aucun stock n'est sélectionné (modal fermée)
    }
  }, [stockToEdit, setData, reset]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Utilisation de Inertia.js pour envoyer la requête PUT/PATCH
    // On assume une route comme 'stocks.update' qui prend l'ID du stock
    post(route('magasin.releve', data.id), {
      _method: 'put', // Important: Force la requête PUT ou PATCH
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Stock de citerne mis à jour avec succès !',
          showConfirmButton: false,
          timer: 1500
        })
      },
      onError: (validationErrors) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Veuillez corriger les erreurs dans le formulaire, monsieur.',
          confirmButtonText: 'Compris'
        });
        console.error("Validation Errors:", validationErrors);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier Stock pour ${stockToEdit?.citerne?.name || '...'}`}>
      {stockToEdit ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Capacité maximale de la citerne : <span className="font-bold">{stockToEdit.citerne?.capacity_kg} kg</span>
          </p>

          <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            stock theorique
          </label>
          {/* Champ pour la quantité théorique */}
          <Input
            id="theorical_quantity"
            type="number"
            step="0.01"
            label="Quantité Théorique (Kg)"
            value={data.theorical_quantity}
            onChange={handleChange}
            error={errors.theorical_quantity}
            placeholder="Ex: 5000"
            disabled
            required
          />

          <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stock relevee
          </label>
          {/* Champ pour la quantité relevée (réelle) */}
          <Input
            id="quantity"
            type="number"
            step="0.01"
            label="Quantité Relevée (Kg)"
            value={data.quantity}
            onChange={handleChange}
            error={errors.quantity}
            placeholder="Ex: 4980"
            required
          />

          <div className="flex justify-end mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="destructive"
              className="mr-2"
              disabled={processing}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={processing}
            >
              {processing ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Mise à jour...
                </>
              ) : (
                'Enregistrer les Modifications'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Aucun stock sélectionné pour modification.
        </div>
      )}
    </Modal>
  );
};

export default EditCiterneStockModal;