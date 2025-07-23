import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Assurez-vous que le chemin est correct
import InputField from '../../form/input/InputField'; // Assurez-vous que le chemin est correct
import TextArea from '../../form/input/TextArea'; // Assurez-vous que le chemin est correct
import Button from '../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// La modale prend une prop 'category' (optionnelle) pour la modification
const ClientCategoryFormModal = ({ isOpen, onClose, category, routeName }) => {
  // Déterminez si nous sommes en mode modification ou création
  const isEditMode = !!category; // 'category' existe si c'est une modification

  // Initialisez le formulaire avec les données de la catégorie si en mode modification,
  // sinon avec des chaînes vides pour la création.
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: category?.name || '',
    description: category?.description || '',
  });

  // Réinitialise le formulaire et remplit les données si 'category' change (pour l'édition)
  // ou si la modale est fermée (pour vider le formulaire de création)
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setData({
          name: category.name,
          description: category.description,
        });
      } else {
        reset(); // Vide le formulaire pour une nouvelle création
      }
    }
  }, [isOpen, isEditMode, category, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      // Pour la modification, utilisez la méthode PUT d'Inertia
      // La route doit inclure l'ID de la catégorie à modifier
      put(route(routeName, category.id), {
        onSuccess: () => {
          onClose(); // Ferme la modale après succès
          // Message de succès géré par Laravel flash ou un autre système de notification
        },
        onError: (err) => {
          console.error("Erreur lors de la modification de la catégorie :", err);
        },
      });
    } else {
      // Pour la création, utilisez la méthode POST d'Inertia
      post(route(routeName), {
        onSuccess: () => {
          onClose(); // Ferme la modale après succès
        },
        onError: (err) => {
          console.error("Erreur lors de la création de la catégorie :", err);
        },
      });
    }
  };

  const modalTitle = isEditMode ? "Modifier la Catégorie" : "Créer une Nouvelle Catégorie";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {/* Champ Nom de la catégorie */}
          <InputField
            id="name"
            label="Nom de la Catégorie"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            error={errors.name}
            required
            autoFocus
          />

          {/* Champ Description */}
          <TextArea
            id="description"
            label="Description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            error={errors.description}
            rows={4} // Définir la hauteur du TextArea
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="inline-flex items-center"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={processing}
            className="inline-flex items-center bg-brand-600 text-white hover:bg-brand-700"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            {processing ? (isEditMode ? 'Mise à jour...' : 'Enregistrement...') : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientCategoryFormModal;