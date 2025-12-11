import React, { useEffect, useCallback } from 'react'; // Ajout de useCallback
import { useForm } from '@inertiajs/react';
import Select from 'react-select';
import Modal from '../Modal';
import Button from '../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';

// Définition de la fonction 'route' pour éviter l'erreur de linting
// En pratique, vous devez vous assurer que la fonction 'route' de Ziggy est globale (fournie par Laravel/Inertia)

const ExportPricesModal = ({ isOpen, onClose, agencies,articles, clientCategories, routeName }) => {

  // Inertia ne gère pas nativement les téléchargements (GET/Blob) comme une navigation de page.
  // Pour un export, on utilise une requête GET normale (via window.open ou window.location.href).
  // On utilise useForm pour gérer l'état local du formulaire et le flag 'processing'.
  const { data, setData, processing, reset, recentlySuccessful, isDirty } = useForm({
    agency_id: '',
    client_category_id: '',
    article_id:"",
  });

  // Utilisation de useCallback pour une meilleure performance et stabilité de useEffect
  const resetForm = useCallback(() => {
    reset();
  }, [reset]);

  // Réinitialisation du formulaire à l'ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Marquer le formulaire comme en cours de traitement (processing = true)
    // C'est un peu un "hack" car on n'appelle pas de méthode Inertia, mais cela permet
    // de désactiver le bouton "Exporter". On doit le remettre à false manuellement.
    setData((currentData) => {
      // Pour forcer l'état 'processing' sans méthode Inertia, on peut temporairement
      // utiliser un état local, mais rester avec 'useForm' est plus simple pour l'UI.
      // Dans une implémentation sans Inertia, on utiliserait un 'useState' pour le 'loading'.

      // On utilise l'état pour construire l'URL et ouvrir le téléchargement.
      const url = route(routeName, {
        agency_id: currentData.agency_id || undefined, // undefined pour ne pas inclure un param vide
        client_category_id: currentData.client_category_id || undefined,
        article_id: currentData.article_id || undefined,
      });

      // Ouvrir l'URL d'export dans un nouvel onglet/fenêtre
      // Cela permet de télécharger le fichier sans recharger la page principale.
      window.open(url, '_blank');

      // 2. Simuler un succès après l'ouverture (l'export se fait en arrière-plan)
      // On réinitialise et ferme la modale.
      resetForm();
      onClose();

      // IMPORTANT: Si la route export retourne un gros fichier, le navigateur met du temps
      // à commencer le téléchargement. La modale sera fermée immédiatement. Si vous voulez
      // un feedback plus long, il faudrait utiliser un état 'loading' local et le désactiver
      // après un court délai (par exemple, 1-2 secondes).
      return currentData; // Retourne l'état actuel (l'état est déjà réinitialisé par resetForm)
    });
  };

  // =========================
  // OPTIONS SELECT
  // =========================

  const agencyOptions = [
    { value: '', label: 'Toutes les agences' },
    ...agencies.map(a => ({ value: a.id, label: a.name })),
  ];

  const clientCategoryOptions = [
    { value: '', label: 'Toutes les catégories' },
    ...clientCategories.map(cat => ({ value: cat.id, label: cat.name })),
  ];

  const ArticlesOptions = [
    { value: '', label: 'Tous les articles' },
    ...articles.map(art => ({ value: art.id, label: art.name })),
  ];
  // =========================
  // STYLES CUSTOM REACT-SELECT
  // (Laissé tel quel)
  // =========================

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '44px',
      borderRadius: '8px',
      backgroundColor: 'rgb(255 255 255)',
      borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(229 231 235)',
      boxShadow: state.isFocused ? '0 0 0 3px rgb(59 130 246 / 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(229 231 235)',
      },
      '.dark &': {
        backgroundColor: 'rgb(17 24 39)',
        borderColor: 'rgb(55 65 81)',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'rgb(17 24 39)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgb(107 114 128)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? 'rgb(59 130 246)' : state.isFocused ? 'rgb(243 244 246)' : 'rgb(255 255 255)',
      color: state.isSelected ? 'white' : 'rgb(17 24 39)',
      '.dark &': {
        backgroundColor: state.isSelected ? 'rgb(59 130 246)' : state.isFocused ? 'rgb(55 65 81)' : 'rgb(31 41 55)',
        color: state.isSelected ? 'white' : 'rgb(255 255 255 / 0.9)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      zIndex: 100,
    }),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exporter les prix par catégorie">
      <form onSubmit={handleSubmit} className="p-4 space-y-4">

        {/* AGENCE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agence
          </label>
          <Select
            value={agencyOptions.find(opt => opt.value === data.agency_id)}
            onChange={e => setData('agency_id', e ? e.value : '')}
            options={agencyOptions}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            placeholder="Sélectionner une agence"
            isClearable={false}
          />
        </div>

        {/* CATEGORIE CLIENT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Catégorie client
          </label>
          <Select
            value={clientCategoryOptions.find(opt => opt.value === data.client_category_id)}
            onChange={e => setData('client_category_id', e ? e.value : '')}
            options={clientCategoryOptions}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            placeholder="Sélectionner une catégorie"
            isClearable={false}
          />
        </div>

        {/* Articles  */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Articles
          </label>
          <Select
            value={ArticlesOptions.find(opt => opt.value === data.article_id)}
            onChange={e => setData('article_id', e ? e.value : '')}
            options={ArticlesOptions}
            styles={customSelectStyles}
            classNamePrefix="react-select"
            placeholder="Sélectionner un article"
            isClearable={false}
          />
        </div>
        {/* BOUTONS */}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={processing}>
            <FontAwesomeIcon icon={faTimes} className="mr-2" /> Annuler
          </Button>

          {/* Le bouton d'export est toujours 'submit' pour déclencher handleSubmit */}
          <Button
            type="submit"
            className="bg-brand-600 text-white hover:bg-brand-700"
            disabled={processing} // Désactivé si en cours
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            {processing ? 'Exportation...' : 'Exporter'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};

export default ExportPricesModal;