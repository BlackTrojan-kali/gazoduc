import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Importation de votre composant de modale personnalisé
import Modal from '../Modal.jsx';

/**
 * Composant de modale pour modifier un versement.
 *
 * @param {object} props Les propriétés du composant.
 * @param {boolean} props.isOpen Indique si la modale est ouverte.
 * @param {function} props.onClose Fonction pour fermer la modale.
 * @param {array} props.clients Liste des clients pour le sélecteur.
 * @param {array} props.banks Liste des banques pour le sélecteur.
 * @param {object} props.payment Le versement à modifier.
 */
const EditPaymentModal = ({ isOpen, onClose, clients, banks, payment }) => {
  // Initialisation du formulaire Inertia.js.
  // Les données sont initialisées avec les valeurs du versement passé en prop.

  const { data, setData, put, processing, reset, errors } = useForm({
    client_id: payment?.client_id || '',
    bank_id: payment?.bank_id || '',
    type: payment?.type || '',
    amout: payment?.amout || '',
    notes: payment?.notes || '',
    amout_notes: payment?.amout_notes || '',
  });

  // Mettre à jour les données du formulaire lorsque le `payment` change
  useEffect(() => {
    if (payment) {
      setData({
        client_id: payment.client_id,
        bank_id: payment.bank_id,
        type: payment.type,
        amout: payment.amout,
        notes: payment.notes || '',
        amout_notes: payment.amout_notes || '',
      });
    }
  }, [payment]);

  // Définition des variables CSS pour les couleurs en fonction du thème
  const colors = {
    '--text-color': 'rgb(31 41 55)',
    '--placeholder-color': 'rgb(107 114 128)',
    '--border-color': 'rgb(209 213 219)',
    '--bg-menu': 'rgb(255 255 255)',
    '--bg-option-hover': 'rgb(243 244 246)',
  };
  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    colors['--text-color'] = 'rgb(249 250 251 / 0.9)';
    colors['--placeholder-color'] = 'rgb(156 163 175)';
    colors['--border-color'] = 'rgb(75 85 99)';
    colors['--bg-menu'] = 'rgb(31 41 55)';
    colors['--bg-option-hover'] = 'rgb(55 65 81)';
  }

  // Options pour les sélecteurs
  const clientOptions = Array.isArray(clients)
    ? clients.map(client => ({ value: String(client.id), label: client.name }))
    : [];

  const bankOptions = Array.isArray(banks)
    ? banks.map(bank => ({ value: String(bank.id), label: bank.name }))
    : [];

  // Styles pour react-select, utilisant les variables CSS
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: '44px',
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : 'var(--border-color)',
      backgroundColor: 'transparent',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
      },
    }),
    singleValue: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)' }),
    placeholder: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
    input: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)' }),
    menu: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--bg-menu)', zIndex: 9999 }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? 'var(--bg-option-hover)' : 'var(--bg-menu)',
      color: state.isSelected ? 'white' : 'var(--text-color)',
      '&:hover': { backgroundColor: 'var(--bg-option-hover)', color: 'var(--text-color)' },
    }),
    indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--border-color)' }),
    dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
    clearIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)', '&:hover': { color: '#EF4444' } }),
  };

  // Gestion de la soumission du formulaire de mise à jour
  const handleSubmit = (e) => {
    e.preventDefault();

    // Valider les champs nécessaires
    const tempErrors = {};
    if (!data.client_id) tempErrors.client_id = 'Le client est obligatoire.';
    if (!data.bank_id) tempErrors.bank_id = 'La banque est obligatoire.';
    if (!data.amout || data.amout <= 0) tempErrors.amount = 'Le montant doit être positif.';
    if (!data.type) tempErrors.type = 'Le type de versement est obligatoire.';

    if (Object.keys(tempErrors).length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation échouée',
        html: Object.values(tempErrors).map(err => `<li>${err}</li>`).join(''),
      });
      return;
    }

    // Soumettre le formulaire avec la méthode `put` pour mettre à jour le versement
    // L'ID du versement est récupéré depuis la prop `payment`
    put(route('payments.update', payment.id), {
      onSuccess: () => {
        onClose(); // Ferme la modale principale
        reset(); // Réinitialise le formulaire
        Swal.fire({
          icon: 'success',
          title: 'Mise à jour réussie',
          text: 'Le versement a été mis à jour avec succès.',
        });
      },
      onError: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la mise à jour du versement.',
        });
      },
    });
  };

  const handleClose = () => {
      onClose();
      reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Modifier Versement"
    >
      <form onSubmit={handleSubmit} className="space-y-4" style={colors}>
        {/* Champ Client */}
        <div>
          <label htmlFor="paymentClient" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Client <span className="text-red-500">*</span>
          </label>
          <Select
            id="paymentClient"
            options={clientOptions}
            value={clientOptions.find(opt => String(opt.value) === String(data.client_id))}
            onChange={(selectedOption) => {
                setData('client_id', selectedOption ? selectedOption.value : '');
            }}
            isClearable={true}
            placeholder="Sélectionner un client"
            classNamePrefix="react-select"
            styles={selectStyles}
          />
          {errors.client_id && <div className="text-red-500 text-sm mt-1">{errors.client_id}</div>}
        </div>

        {/* Champ Banque */}
        <div>
          <label htmlFor="paymentBank" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Banque <span className="text-red-500">*</span>
          </label>
          <Select
            id="paymentBank"
            options={bankOptions}
            value={bankOptions.find(opt => String(opt.value) === String(data.bank_id))}
            onChange={(selectedOption) => setData('bank_id', selectedOption ? selectedOption.value : '')}
            isClearable={true}
            placeholder="Sélectionner une banque"
            classNamePrefix="react-select"
            styles={selectStyles}
          />
          {errors.bank_id && <div className="text-red-500 text-sm mt-1">{errors.bank_id}</div>}
        </div>

        {/* Champ Type de Versement avec un select HTML simple */}
        <div>
          <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Type de Versement <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="paymentType"
              name="paymentType"
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-white/90 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:focus:border-brand-800"
            >
              <option value="" disabled>Sélectionner le type</option>
              <option value="consigne">Consigne</option>
              <option value="vente">Vente</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
        </div>

        {/* Montant */}
        <div>
          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Montant <span className="text-red-500">*</span>
          </label>
          <input
            id="paymentAmount"
            type="number"
            step="1"
            value={data.amout}
            onChange={(e) => setData('amout', e.target.value)}
            placeholder="Montant du versement"
            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          {errors.amout && <div className="text-red-500 text-sm mt-1">{errors.amout}</div>}
        </div>

        {/* Commentaire (Note) */}
        <div>
          <label htmlFor="paymentNotes" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Commentaire (Optionnel)
          </label>
          <input
            id="paymentNotes"
            type="text"
            value={data.notes}
            onChange={(e) => setData('notes', e.target.value)}
            placeholder="Ajouter une note"
            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          {errors.notes && <div className="text-red-500 text-sm mt-1">{errors.notes}</div>}
        </div>

        {/* Commentaire Somme (Nullable) */}
        <div>
          <label htmlFor="paymentAmountNotes" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Commentaire Somme (Optionnel)
          </label>
          <input
            id="paymentAmountNotes"
            type="text"
            value={data.amout_notes}
            onChange={(e) => setData('amout_notes', e.target.value)}
            placeholder="Ajouter un commentaire sur la somme"
            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          {errors.amout_notes && <div className="text-red-500 text-sm mt-1">{errors.amout_notes}</div>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-white/90 dark:border-gray-700 dark:hover:bg-white/[0.03]"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Mettre à jour
            <FontAwesomeIcon icon={faSpinner} className={processing ? 'animate-spin' : 'hidden'} />
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPaymentModal;
