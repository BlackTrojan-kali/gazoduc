import React, { useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Cette modale permet d'associer un versement existant à une ou plusieurs
// factures en attente du même client.
const AssociatePaymentModal = ({ isOpen, onClose, sales, selectedPayment }) => {
  // État local pour gérer les factures sélectionnées
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);
  
  // Utilisation de useForm pour la soumission des données
  const { post, processing } = useForm({});

  // Filtrage des factures pertinentes (en attente pour le client du versement)
  const availableInvoices = useMemo(() => {
    // Si la modale n'est pas ouverte ou aucun versement n'est sélectionné, ne rien faire
    if (!isOpen || !selectedPayment) {
      return [];
    }

    // Filtrer les factures qui appartiennent au même client,
    // qui ont un solde restant (total_amount > 0) ET qui ont le même type que le versement.
    return sales.filter(sale => 
      sale.client_id === selectedPayment.client_id && 
      sale.total_amount > 0 &&
      // NOUVEAU: Ajout de la condition pour que le type corresponde
      sale.invoice_type === selectedPayment.type
    );
  }, [isOpen, selectedPayment, sales]);

  // Gérer la sélection des cases à cocher
  const handleCheckboxChange = (invoiceId) => {
    setSelectedInvoiceIds(prevIds => {
      if (prevIds.includes(invoiceId)) {
        return prevIds.filter(id => id !== invoiceId);
      } else {
        return [...prevIds, invoiceId];
      }
    });
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedInvoiceIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner au moins une facture à associer, monsieur.',
      });
      return;
    }

    // Logique de soumission vers le backend Laravel
    // Correction de l'appel post pour utiliser l'ID du versement et passer les factures dans le payload
    post(route('payments.associate', { payment: selectedPayment.id,invoices: selectedInvoiceIds }), {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Le versement a été associé aux factures sélectionnées avec succès, monsieur.',
        });
        // Fermer la modale et réinitialiser l'état
        setSelectedInvoiceIds([]);
        onClose();
      },
      onError: (errors) => {
        console.error(errors);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'association des factures, monsieur.',
        });
      },
    });
  };

  // Afficher la modale uniquement si elle est ouverte
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            <FontAwesomeIcon icon={faPaperclip} className="mr-2 text-blue-500" />
            Associer des factures au versement #{selectedPayment?.id}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        
        {/* Affichage des détails du versement sélectionné */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Client : <span className="font-semibold text-gray-900 dark:text-white">{selectedPayment?.client?.name || 'N/A'}</span>
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Montant du versement : <span className="font-semibold text-green-600 dark:text-green-400">{selectedPayment?.amout?.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</span>
          </p>
        </div>

        {/* Formulaire de sélection des factures */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Factures en attente pour ce client :</h3>
            {availableInvoices.length > 0 ? (
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900">
                {availableInvoices.map(invoice => (
                  <label key={invoice.id} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedInvoiceIds.includes(invoice.id)}
                      onChange={() => handleCheckboxChange(invoice.id)}
                      className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Facture #{invoice.id} - Montant restant : {invoice.total_amount}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic dark:text-gray-400">
                Aucune facture en attente trouvée pour ce client avec le type de versement `{selectedPayment?.type}`.
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => {
                setSelectedInvoiceIds([]);
                onClose();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-white/90 dark:border-gray-700 dark:hover:bg-white/[0.03]"
              disabled={processing}
            >
              <FontAwesomeIcon icon={faTimes} /> Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              disabled={processing}
            >
              <FontAwesomeIcon icon={faCheck} />
              {processing ? 'Association en cours...' : 'Associer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssociatePaymentModal;