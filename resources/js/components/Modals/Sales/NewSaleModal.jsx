// resources/js/components/Modals/Sales/NewSaleModal.jsx

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import Select from 'react-select';

const NewSaleModal = ({ isOpen, onClose, clients, articles }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    client_id: null,
    currency: 'liquide',
    type: 'vente',
    items: [],
  });

  const [selectedArticleOption, setSelectedArticleOption] = useState(null);
  const [articleQuantity, setArticleQuantity] = useState(1);

  // Prépare les options pour React Select
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: `${client.name}`,
  }));

  const articleOptions = articles.map(article => ({
    value: article.id,
    label: article.name,
  }));

  // Styles personnalisés pour React Select, inspirés par votre exemple
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: '44px',
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      backgroundColor: '#1F2937', // Utilise un fond sombre pour le thème
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
      },
    }),
    singleValue: (baseStyles) => ({ ...baseStyles, color: '#F9FAFB' }),
    placeholder: (baseStyles) => ({ ...baseStyles, color: '#9CA3AF' }),
    input: (baseStyles) => ({ ...baseStyles, color: '#F9FAFB' }),
    menu: (baseStyles) => ({ ...baseStyles, backgroundColor: '#1F2937', zIndex: 9999 }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1F2937',
      color: state.isSelected ? 'white' : '#F9FAFB',
      '&:hover': { backgroundColor: '#374151', color: '#F9FAFB' },
    }),
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSelectedArticleOption(null);
      setArticleQuantity(1);
    }
  }, [isOpen, reset]);

  // Gère la sélection d'un client. Met à jour le `client_id` dans le formulaire.
  const handleClientSelect = (selectedOption) => {
    setData('client_id', selectedOption ? selectedOption.value : null);
  };

  // Gère la sélection d'un article. Met à jour l'état local de l'option sélectionnée.
  const handleArticleSelect = (selectedOption) => {
    setSelectedArticleOption(selectedOption);
    setArticleQuantity(1);
  };

  const handleAddItem = () => {
    if (!selectedArticleOption || articleQuantity <= 0) {
      Swal.fire('Erreur', 'Veuillez sélectionner un article et entrer une quantité valide.', 'error');
      return;
    }

    const articleId = selectedArticleOption.value;
    const articleName = selectedArticleOption.label;

    const existingItemIndex = data.items.findIndex(item => item.article_id == articleId);

    if (existingItemIndex > -1) {
      const updatedItems = data.items.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + articleQuantity }
          : item
      );
      setData('items', updatedItems);
    } else {
      const newItem = {
        article_id: articleId,
        name: articleName,
        quantity: articleQuantity,
      };
      setData('items', [...data.items, newItem]);
    }

    setSelectedArticleOption(null);
    setArticleQuantity(1);
  };

  const handleRemoveItem = (indexToRemove) => {
    setData('items', data.items.filter((_, index) => index !== indexToRemove));
  };

  const totalAmountDisplay = "Calculé au backend";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (data.client_id === null) {
      Swal.fire('Erreur', 'Veuillez sélectionner un client.', 'error');
      return;
    }
    if (data.items.length === 0) {
      Swal.fire('Erreur', 'Veuillez ajouter au moins un article à la facture.', 'error');
      return;
    }

    post(route('compage.store'), data, {
      onSuccess: () => {
        Swal.fire('Succès', 'Facture créée avec succès, monsieur !', 'success');
        onClose();
      },
      onError: (err) => {
        console.error('Erreur de création de facture:', err);
        Swal.fire('Erreur', 'Impossible de créer la facture. Veuillez vérifier les champs.', 'error');
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/10 dark:bg-white/10 bg-opacity-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3">
          Créer une Nouvelle Vente
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Informations Générales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="client_select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
              <Select
                id="client_select"
                options={clientOptions}
                onChange={handleClientSelect}
                value={clientOptions.find(option => option.value === data.client_id)}
                placeholder="Sélectionner un client"
                isClearable
                isSearchable
                styles={selectStyles}
              />
              {errors.client_id && <div className="text-red-500 text-sm mt-1">{errors.client_id}</div>}
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mode de Paiement</label>
              <select
                id="currency"
                name="currency"
                value={data.currency}
                onChange={(e) => setData('currency', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="liquide">Liquide</option>
                <option value="virement">Virement</option>
              </select>
              {errors.currency && <div className="text-red-500 text-sm mt-1">{errors.currency}</div>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Vente</label>
              <select
                id="type"
                name="type"
                value={data.type}
                onChange={(e) => setData('type', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="vente">Vente</option>
                <option value="consigne">Consigne</option>
              </select>
              {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
            </div>
          </div>

          {/* Section Ajout d'Articles */}
          <div className="border p-4 rounded-lg dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ajouter des Articles</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="article_select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article</label>
                <Select
                  id="article_select"
                  options={articleOptions}
                  onChange={handleArticleSelect}
                  value={selectedArticleOption}
                  placeholder="Sélectionner un article"
                  isClearable
                  isSearchable
                  styles={selectStyles}
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantité</label>
                <input
                  type="number"
                  id="quantity"
                  value={articleQuantity}
                  onChange={(e) => setArticleQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
              >
                <FontAwesomeIcon icon={faPlus} /> Ajouter
              </button>
            </div>
          </div>

          {/* Tableau des Articles de la Facture */}
          <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Article
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {data.items.length > 0 ? (
                  data.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                          title="Supprimer l'article"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      Ajoutez des articles pour créer une facture.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Général */}
          <div className="flex justify-end pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Total Général: {totalAmountDisplay}
            </p>
          </div>

          {/* Boutons d'Action */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              disabled={processing}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              disabled={processing}
            >
              {processing ? 'Création...' : 'Créer la Vente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSaleModal;