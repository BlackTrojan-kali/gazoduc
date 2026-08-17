import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; // Adaptez le chemin selon votre structure
import InputField from '../../../form/input/InputField'; // Adaptez le chemin
import TextArea from '../../../form/input/TextArea'; // Adaptez le chemin
import Button from '../../../ui/button/Button'; // Adaptez le chemin
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const ProductCategoryFormModal = ({ 
    isOpen, 
    onClose, 
    category, 
    routeName = 'product-categories.store' 
}) => {
  // Mode Édition si l'objet 'category' est fourni
  const isEditMode = !!category;

  // Initialisation du formulaire avec Inertia
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: category?.name || '',
    description: category?.description || '',
  });

  // Synchronisation des données à l'ouverture ou au changement de mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setData({
          name: category.name,
          description: category.description || '',
        });
      } else {
        reset(); // Vide le formulaire pour une nouvelle création
      }
    }
  }, [isOpen, isEditMode, category, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      // Pour l'update, on change la méthode en PUT et on cible l'ID
      // Note: Assurez-vous que la route update est bien 'product-categories.update'
      put(route('product-categories.update', category.id), {
        onSuccess: () => onClose(),
        onError: (err) => console.error("Erreur update catégorie :", err),
      });
    } else {
      // Pour le store
      post(route(routeName), {
        onSuccess: () => onClose(),
        onError: (err) => console.error("Erreur création catégorie :", err),
      });
    }
  };

  const modalTitle = isEditMode ? "Modifier la Catégorie" : "Nouvelle Catégorie de Produit";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          
          {/* Champ Nom (Requis) */}
          <InputField
            id="name"
            label="Nom de la Catégorie"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            errorMessage={errors.name}
            required
            autoFocus
            placeholder="Ex: Électronique, Boissons, Pièces détachées..."
          />

          {/* Champ Description (Optionnel) */}
          <TextArea
            id="description"
            label="Description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            errorMessage={errors.description}
            rows={4}
            placeholder="Courte description de la catégorie (optionnel)"
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

export default ProductCategoryFormModal;