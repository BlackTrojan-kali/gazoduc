import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Chemin correct vers votre Modal
import InputField from '../../form/input/InputField'; // Chemin correct vers votre InputField
import TextArea from '../../form/input/TextArea'; // Chemin correct vers votre TextArea (Assurez-vous qu'il prend `errorMessage`)
// import SelectField from '../../form/select/SelectField'; // <-- N'importez plus SelectField
import Button from '../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// La modale prend une prop 'client' (optionnelle) pour la modification et 'clientCategories' pour le select
const ClientFormModal = ({ isOpen, onClose, client, clientCategories, routeName }) => {
  // Déterminez si nous sommes en mode modification ou création
  const isEditMode = !!client;

  // Initialisez le formulaire avec les données du client si en mode modification,
  // sinon avec des chaînes vides pour la création.
  const { data, setData, post, put, processing, errors, reset } = useForm({
    client_category_id: client?.client_category_id || '',
    client_type: client?.client_type || '', // Par exemple: 'particulier', 'entreprise'
    name: client?.name || '',
    phone_number: client?.phone_number || '',
    email_address: client?.email_address || '',
    address: client?.address || '',
    NUI: client?.NUI || '',
  });

  // Réinitialise le formulaire et remplit les données si 'client' change (pour l'édition)
  // ou si la modale est fermée (pour vider le formulaire de création)
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setData({
          client_category_id: client.client_category_id || '',
          client_type: client.client_type || '',
          name: client.name,
          phone_number: client.phone_number || '',
          email_address: client.email_address || '',
          address: client.address || '',
          NUI: client.NUI || '',
        });
      } else {
        reset(); // Vide le formulaire pour une nouvelle création
      }
    }
  }, [isOpen, isEditMode, client, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      put(route(routeName, client.id), {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          console.error("Erreur lors de la modification du client :", err);
        },
      });
    } else {
      post(route(routeName), {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          console.error("Erreur lors de la création du client :", err);
        },
      });
    }
  };

  const modalTitle = isEditMode ? "Modifier le Client" : "Créer un Nouveau Client";

  // Options pour le type de client (peut être étendu)
  const clientTypeOptions = [
    { value: '', label: 'Sélectionner un type' },
    { value: 'particulier', label: 'Particulier' },
    { value: 'entreprise', label: 'Entreprise' },
  ];

  // Options pour les catégories de clients
  const categoryOptions = [
    { value: '', label: 'Sélectionner une catégorie' },
    ...(clientCategories || []).map(cat => ({ value: cat.id, label: cat.name }))
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {/* Champ Nom */}
          <InputField
            id="name"
            label="Nom du Client"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)} // Corrigé ici : e.target.value
            errorMessage={errors.name}
            required
            autoFocus
          />

          {/* Type de Client (select HTML natif) */}
          <div>
            <label htmlFor="client_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de Client <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="client_type"
              value={data.client_type}
              onChange={(e) => setData('client_type', e.target.value)}
              required
              className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                ${errors.client_type ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-300 dark:border-gray-700'}
                bg-transparent focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`}
            >
              {clientTypeOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.client_type && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.client_type}
              </p>
            )}
          </div>

          {/* Catégorie de Client (select HTML natif) */}
          <div>
            <label htmlFor="client_category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie de Client <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="client_category_id"
              value={data.client_category_id}
              onChange={(e) => setData('client_category_id', e.target.value)}
              required
              className={`h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
                ${errors.client_category_id ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-300 dark:border-gray-700'}
                bg-transparent focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`}
            >
              {categoryOptions.map((option, index) => (
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

          {/* Numéro de Téléphone */}
          <InputField
            id="phone_number"
            label="Numéro de Téléphone"
            type="text"
            value={data.phone_number}
            onChange={(e) => setData('phone_number', e.target.value)}
            errorMessage={errors.phone_number}
            placeholder="Ex: +237XXXXXXXXX"
          />

          {/* Adresse Email */}
          <InputField
            id="email_address"
            label="Adresse Email"
            type="email"
            value={data.email_address}
            onChange={(e) => setData('email_address', e.target.value)}
            errorMessage={errors.email_address}
            placeholder="Ex: client@example.com"
          />

          {/* Adresse Physique */}
          <TextArea
            id="address"
            label="Adresse Physique"
            value={data.address}
            onChange={(e) => setData('address', e.target.value)}
            errorMessage={errors.address}
            rows={3}
            placeholder="Adresse complète du client"
          />

          {/* NUI */}
          <InputField
            id="nui"
            label="Numéro Unique d'Identification (NUI)"
            type="text"
            value={data.NUI}
            onChange={(e) => setData('NUI', e.target.value)}
            errorMessage={errors.NUI}
            placeholder="Si applicable"
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

export default ClientFormModal;