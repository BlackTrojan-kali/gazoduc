import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; // Adaptez le chemin
import InputField from '../../../form/input/InputField'; // Adaptez le chemin
import Button from '../../../ui/button/Button'; // Adaptez le chemin
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select'; // Ajout de react-select

const ProductCategoryFormModal = ({ 
    isOpen, 
    onClose, 
    category, 
    categories = [], 
    routeName = 'product-categories.store' 
}) => {
  const isEditMode = !!category;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: category?.name || '',
    parent_id: category?.parent_id || '',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setData({
          name: category.name,
          parent_id: category.parent_id || '',
        });
      } else {
        reset(); 
      }
    }
  }, [isOpen, isEditMode, category]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      put(route('product-categories.update', category.id), {
        onSuccess: () => onClose(),
        onError: (err) => console.error("Erreur update catégorie :", err),
      });
    } else {
      post(route(routeName), {
        onSuccess: () => onClose(),
        onError: (err) => console.error("Erreur création catégorie :", err),
      });
    }
  };

  const modalTitle = isEditMode ? "Modifier la Catégorie" : "Nouvelle Catégorie de Produit";

  // --- Préparation des options pour React-Select ---
  // Sécurité : Empêcher une catégorie d'être son propre parent
  const availableParents = categories.filter(c => c.id !== category?.id);
  
  const parentOptions = availableParents.map(parent => ({
    value: parent.id,
    label: parent.name
  }));

  // Retrouver l'option sélectionnée actuellement pour l'afficher dans le Select
  const selectedParentOption = data.parent_id 
    ? parentOptions.find(opt => opt.value === data.parent_id) || null 
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          
          <InputField
            id="name"
            label="Nom de la Catégorie"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            errorMessage={errors.name}
            required
            autoFocus
            placeholder="Ex: Boissons, Épicerie..."
          />

          <div className="flex flex-col">
            <label htmlFor="parent_id" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Catégorie Parente (Optionnelle)
            </label>
            
            <Select
              id="parent_id"
              options={parentOptions}
              value={selectedParentOption}
              onChange={(selected) => setData('parent_id', selected ? selected.value : '')}
              isClearable
              placeholder="-- Aucune (Catégorie Principale) --"
              className="mt-1"
              // Utilisation de classNames pour intégrer Tailwind et le Dark Mode
              classNames={{
                control: (state) => 
                  `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition-colors text-sm ${
                    state.isFocused ? 'ring-1 ring-brand-500 border-brand-500' : 'hover:border-gray-400 dark:hover:border-gray-500'
                  }`,
                menu: () => 
                  'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md mt-1 z-50',
                option: (state) => 
                  `px-3 py-2 cursor-pointer text-sm ${
                    state.isSelected 
                      ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium' 
                      : state.isFocused 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                        : 'text-gray-700 dark:text-gray-300'
                  }`,
                singleValue: () => 'text-gray-900 dark:text-gray-100',
                placeholder: () => 'text-gray-500 dark:text-gray-400',
                input: () => 'text-gray-900 dark:text-gray-100',
                menuList: () => 'p-1',
              }}
              // Neutralisation des styles inline de react-select pour laisser Tailwind agir
              styles={{
                control: (base) => ({ ...base, backgroundColor: 'white', border: 'none', boxShadow: 'none' }),
                menu: (base) => ({ ...base, backgroundColor: 'white' }),
                option: (base) => ({ ...base, backgroundColor: 'white', color: 'inherit' }),
                singleValue: (base) => ({ ...base, color: 'inherit' })
              }}
            />

            {errors.parent_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parent_id}</p>
            )}
          </div>

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