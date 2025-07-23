import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Chemin correct vers votre Modal (corrigé si nécessaire)
import InputField from '../../form/input/InputField'; // Chemin correct vers votre InputField
import Button from '../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// La modale prend une prop 'price' (optionnelle) pour la modification et les listes pour les selects
const PriceFormModal = ({ isOpen, onClose, price, clientCategories, articles, agencies, routeName }) => {
  const isEditMode = !!price;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    article_id: price?.article_id || '',
    client_category_id: price?.client_category_id || '',
    agency_id: price?.agency_id || '',
    price: price?.price || '', // Le champ de prix principal
    consigne_price: price?.consigne_price || '', // <-- NOUVEAU CHAMP : Prix de la consigne
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setData({
          article_id: price.article_id || '',
          client_category_id: price.client_category_id || '',
          agency_id: price.agency_id || '',
          price: price.price,
          consigne_price: price.consigne_price || '', // Initialise avec la valeur existante ou vide
        });
      } else {
        reset(); // Vide le formulaire pour une nouvelle création
      }
    }
  }, [isOpen, isEditMode, price, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // S'assurer que consigne_price est null si vide pour la base de données
    const submitData = {
      ...data,
      consigne_price: data.consigne_price === '' ? null : data.consigne_price,
    };

    if (isEditMode) {
      put(route(routeName, price.id), {
        data: submitData, // Utilisez submitData pour envoyer
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          console.error("Erreur lors de la modification du prix :", err);
        },
      });
    } else {
      post(route(routeName), {
        data: submitData, // Utilisez submitData pour envoyer
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
  const articleOptions = [
    { value: '', label: 'Sélectionner un article' },
    ...(articles || []).map(item => ({ value: item.id, label: item.name }))
  ];

  // Options pour les catégories de clients
  const clientCategoryOptions = [
    { value: '', label: 'Sélectionner une catégorie client' },
    ...(clientCategories || []).map(cat => ({ value: cat.id, label: cat.name }))
  ];

  // Options pour les agences
  const agencyOptions = [
    { value: '', label: 'Sélectionner une agence' },
    ...(agencies || []).map(agency => ({ value: agency.id, label: agency.name }))
  ];

  // Classes Tailwind pour les selects natifs
  const selectBaseClasses = `h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
    bg-transparent focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
    dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {/* Champ Article (select HTML natif) */}
          <div>
            <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Article <span className="text-red-500">*</span>
            </label>
            <select
              id="article_id"
              value={data.article_id}
              onChange={(e) => setData('article_id', e.target.value)}
              required
              className={`${selectBaseClasses} ${errors.article_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-300 dark:border-gray-700'}`}
            >
              {articleOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.article_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.article_id}
              </p>
            )}
          </div>

          {/* Champ Catégorie Client (select HTML natif) */}
          <div>
            <label htmlFor="client_category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie Client <span className="text-red-500">*</span>
            </label>
            <select
              id="client_category_id"
              value={data.client_category_id}
              onChange={(e) => setData('client_category_id', e.target.value)}
              required
              className={`${selectBaseClasses} ${errors.client_category_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-300 dark:border-gray-700'}`}
            >
              {clientCategoryOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.client_category_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.client_category_id}
              </p>
            )}
          </div>

          {/* Champ Agence (select HTML natif) */}
          <div>
            <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agence <span className="text-red-500">*</span>
            </label>
            <select
              id="agency_id"
              value={data.agency_id}
              onChange={(e) => setData('agency_id', e.target.value)}
              required
              className={`${selectBaseClasses} ${errors.agency_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-300 dark:border-gray-700'}`}
            >
              {agencyOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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