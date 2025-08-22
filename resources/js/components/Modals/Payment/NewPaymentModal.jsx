import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Importation de votre composant de modale personnalisé
import Modal from '../Modal.jsx'; // Assurez-vous que le chemin est correct

// Importation du nouveau composant pour la sélection des factures
import SalesSelectionModal from './SalesSelectModal.jsx'; // Créez ce fichier

const NewPaymentModal = ({ isOpen, onClose, clients, banks, sales }) => {
  // Initialisation du formulaire Inertia.js pour le versement
  const { data, setData, post, processing, reset, errors } = useForm({
    client_id: '',
    bank_id: '',
    // NOUVEAU: Ajout du champ pour le type de versement
    type: '', 
    amount: '',
    notes: '',
    amount_notes: '',
    // Ajouter un champ pour les IDs des factures sélectionnées
    selected_sale_ids: [], 
  });

  const [isSalesSelectionModalOpen, setIsSalesSelectionModalOpen] = useState(false);
  const [selectedClientSales, setSelectedClientSales] = useState([]);

  // Définition des variables CSS pour les couleurs en fonction du thème
  const colors = {
    '--text-color': 'rgb(31 41 55)',
    '--placeholder-color': 'rgb(107 114 128)',
    '--border-color': 'rgb(209 213 219)',
    '--bg-menu': 'rgb(255 255 255)',
    '--bg-option-hover': 'rgb(243 244 246)',
  };
  if (document.documentElement.classList.contains('dark')) {
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

  const handleNextStep = (e) => {
    e.preventDefault();

    // Valider les champs nécessaires avant d'ouvrir la seconde modale
    const tempErrors = {};
    if (!data.client_id) tempErrors.client_id = 'Le client est obligatoire.';
    if (!data.bank_id) tempErrors.bank_id = 'La banque est obligatoire.';
    if (!data.amount || data.amount <= 0) tempErrors.amount = 'Le montant doit être positif.';
    // NOUVEAU: Validation du champ type
    if (!data.type) tempErrors.type = 'Le type de versement est obligatoire.';

    if (Object.keys(tempErrors).length > 0) {
      // Afficher les erreurs si la validation échoue
      // Pour une gestion plus propre des erreurs sans soumission réelle
      Swal.fire({
        icon: 'error',
        title: 'Validation échouée',
        html: Object.values(tempErrors).map(err => `<li>${err}</li>`).join(''),
      });
      return;
    }

    // Filtrer les ventes du client sélectionné qui ne sont pas encore entièrement payées
    const currentClientSales = Array.isArray(sales)
        ? sales.filter(sale => String(sale.client_id) === data.client_id && sale.total_amount > 0)
        : [];
    
    if (currentClientSales.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Aucune facture disponible',
            text: 'Ce client n\'a aucune facture en attente de paiement, monsieur.',
        });
        return;
    }

    setSelectedClientSales(currentClientSales);
    setIsSalesSelectionModalOpen(true);
  };

  const handleSalesSelected = (selectedSales) => {
    // Mettre à jour les factures sélectionnées dans les données du versement
    setData('selected_sale_ids', selectedSales.map(sale => sale.id));
    // Fermer la modale de sélection et soumettre le formulaire principal
    setIsSalesSelectionModalOpen(false);
    // Soumettre le formulaire du versement avec les IDs de factures
    
    post(route('payments.store',{sales:selectedSales}), {
      onSuccess: () => {
        onClose(); // Ferme la modale principale
        reset(); // Réinitialise le formulaire
      },
      onError: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'ajout du versement.',
        });
      },
    });
  };
  
  const handleClose = () => {
      onClose();
      reset();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Nouveau Versement"
      >
        <form onSubmit={handleNextStep} className="space-y-4" style={colors}>
          {/* Champ Client */}
          <div>
            <label htmlFor="paymentClient" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Client <span className="text-red-500">*</span>
            </label>
            <Select
              id="paymentClient"
              options={clientOptions}
              value={clientOptions.find(opt => opt.value === data.client_id)}
              onChange={(selectedOption) => {
                  setData('client_id', selectedOption ? selectedOption.value : '');
                  setData('selected_sale_ids', []); // Réinitialiser les factures si le client change
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
              value={bankOptions.find(opt => opt.value === data.bank_id)}
              onChange={(selectedOption) => setData('bank_id', selectedOption ? selectedOption.value : '')}
              isClearable={true}
              placeholder="Sélectionner une banque"
              classNamePrefix="react-select"
              styles={selectStyles}
            />
            {errors.bank_id && <div className="text-red-500 text-sm mt-1">{errors.bank_id}</div>}
          </div>

          {/* NOUVEAU: Champ Type de Versement avec un select HTML simple */}
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
              step="0.01"
              value={data.amount}
              onChange={(e) => setData('amount', e.target.value)}
              placeholder="Montant du versement"
              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.amount && <div className="text-red-500 text-sm mt-1">{errors.amount}</div>}
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
              value={data.amount_notes}
              onChange={(e) => setData('amount_notes', e.target.value)}
              placeholder="Ajouter un commentaire sur la somme"
              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
            {errors.amount_notes && <div className="text-red-500 text-sm mt-1">{errors.amount_notes}</div>}
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
              type="submit" // Changé en type="submit" pour déclencher handleNextStep
              className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              disabled={processing}
            >
              Suivant
              <FontAwesomeIcon icon={faSpinner} className={processing ? 'animate-spin' : 'hidden'} />
            </button>
          </div>
        </form>
      </Modal>

      {/* Seconde modale pour la sélection des factures */}
      <SalesSelectionModal
        isOpen={isSalesSelectionModalOpen}
        onClose={() => setIsSalesSelectionModalOpen(false)}
        sales={selectedClientSales} // Passer uniquement les ventes du client sélectionné
        onSave={handleSalesSelected}
        processing={processing} // Passer l'état de traitement pour désactiver le bouton de soumission
        paymentType={data.type}
/>
    </>
  );
};

export default NewPaymentModal;
