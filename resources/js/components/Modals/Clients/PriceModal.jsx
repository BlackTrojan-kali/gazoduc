import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Select from 'react-select'; // <-- Import de react-select
import Modal from '../Modal';
import InputField from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

const PriceFormModal = ({ isOpen, onClose, price, clientCategories, articles, agencies, routeName }) => {
  const isEditMode = !!price;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    article_id: price?.article_id || '',
    client_category_id: price?.client_category_id || '',
    agency_id: price?.agency_id || '',
    price: price?.price || '',
    consigne_price: price?.consigne_price || '',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setData({
          article_id: price.article_id || '',
          client_category_id: price.client_category_id || '',
          agency_id: price.agency_id || '',
          price: price.price,
          consigne_price: price.consigne_price || '',
        });
      } else {
        reset();
      }
    }
  }, [isOpen, isEditMode, price, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...data,
      consigne_price: data.consigne_price === '' ? null : data.consigne_price,
    };

    if (isEditMode) {
      put(route(routeName, price.id), {
        data: submitData,
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          console.error("Erreur lors de la modification du prix :", err);
        },
      });
    } else {
      post(route(routeName), {
        data: submitData,
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          console.error("Erreur lors de la création du prix :", err);
        },
      });
    }
  };

  const modalTitle = isEditMode ? "Modifier le Prix" : "Créer un Nouveau Prix";

  // Options pour les articles
  const articleOptions = (articles || []).map(item => ({ value: item.id, label: item.name }));

  // Options pour les catégories de clients
  const clientCategoryOptions = (clientCategories || []).map(cat => ({ value: cat.id, label: cat.name }));

  // Options pour les agences
  const agencyOptions = (agencies || []).map(agency => ({ value: agency.id, label: agency.name }));

  // Styles pour react-select pour gérer le mode sombre et le design général
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '44px',
      borderRadius: '8px',
      backgroundColor: 'rgb(255 255 255)', // Light mode background
      borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(229 231 235)', // Tailwind 'brand-500' on focus
      boxShadow: state.isFocused ? '0 0 0 3px rgb(59 130 246 / 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(229 231 235)',
      },
      // Dark mode styles
      '.dark &': {
        backgroundColor: 'rgb(17 24 39)', // Tailwind 'gray-900'
        borderColor: 'rgb(55 65 81)', // Tailwind 'gray-700'
        '&:hover': {
          borderColor: 'rgb(55 65 81)',
        },
        boxShadow: state.isFocused ? '0 0 0 3px rgb(59 130 246 / 0.1)' : 'none',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'rgb(17 24 39)', // Light mode text
      '.dark &': {
        color: 'rgb(255 255 255 / 0.9)', // Dark mode text
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgb(107 114 128)', // Tailwind 'gray-500'
    }),
    input: (provided) => ({
      ...provided,
      color: 'rgb(17 24 39)', // Light mode text
      '.dark &': {
        color: 'rgb(255 255 255 / 0.9)', // Dark mode text
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'rgb(59 130 246)' : state.isFocused ? 'rgb(243 244 246)' : 'rgb(255 255 255)',
      color: state.isSelected ? 'white' : 'rgb(17 24 39)',
      '&:active': {
        backgroundColor: state.isSelected ? 'rgb(59 130 246)' : 'rgb(243 244 246)',
      },
      '.dark &': {
        backgroundColor: state.isSelected ? 'rgb(59 130 246)' : state.isFocused ? 'rgb(55 65 81)' : 'rgb(31 41 55)',
        color: state.isSelected ? 'white' : 'rgb(255 255 255 / 0.9)',
        '&:active': {
          backgroundColor: state.isSelected ? 'rgb(59 130 246)' : 'rgb(55 65 81)',
        },
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      zIndex: 100,
      '.dark &': {
        backgroundColor: 'rgb(31 41 55)', // Dark mode menu background
      },
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'rgb(107 114 128)',
      '&:hover': {
        color: 'rgb(107 114 128)',
      },
    }),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {/* Champ Article (avec react-select) */}
          <div>
            <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Article <span className="text-red-500">*</span>
            </label>
            <Select
              id="article_id"
              value={articleOptions.find(opt => opt.value === data.article_id)}
              onChange={(e) => setData('article_id', e ? e.value : '')}
              options={articleOptions}
              isClearable
              placeholder="Sélectionner un article"
              styles={customSelectStyles}
              classNamePrefix="react-select"
              required
            />
            {errors.article_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.article_id}
              </p>
            )}
          </div>

          {/* Champ Catégorie Client (avec react-select) */}
          <div>
            <label htmlFor="client_category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie Client <span className="text-red-500">*</span>
            </label>
            <Select
              id="client_category_id"
              value={clientCategoryOptions.find(opt => opt.value === data.client_category_id)}
              onChange={(e) => setData('client_category_id', e ? e.value : '')}
              options={clientCategoryOptions}
              isClearable
              placeholder="Sélectionner une catégorie client"
              styles={customSelectStyles}
              classNamePrefix="react-select"
              required
            />
            {errors.client_category_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.client_category_id}
              </p>
            )}
          </div>

          {/* Champ Agence (avec react-select) */}
          <div>
            <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agence <span className="text-red-500">*</span>
            </label>
            <Select
              id="agency_id"
              value={agencyOptions.find(opt => opt.value === data.agency_id)}
              onChange={(e) => setData('agency_id', e ? e.value : '')}
              options={agencyOptions}
              isClearable
              placeholder="Sélectionner une agence"
              styles={customSelectStyles}
              classNamePrefix="react-select"
              required
            />
            {errors.agency_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.agency_id}
              </p>
            )}
          </div>

          {/* Champ Prix */}
          <InputField
            id="price"
            label="Prix"
            type="number"
            value={data.price}
            onChange={(e) => setData('price', e.target.value)}
            errorMessage={errors.price}
            required
            step="0.01"
            placeholder="Ex: 1500.50"
          />

          {/* NOUVEAU CHAMP : Prix de la Consigne (optionnel) */}
          <InputField
            id="consigne_price"
            label="Prix de la Consigne (optionnel)"
            type="number"
            value={data.consigne_price}
            onChange={(e) => setData('consigne_price', e.target.value)}
            errorMessage={errors.consigne_price}
            step="0.01"
            placeholder="Ex: 500.00 (laisser vide si non applicable)"
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

export default PriceFormModal;
