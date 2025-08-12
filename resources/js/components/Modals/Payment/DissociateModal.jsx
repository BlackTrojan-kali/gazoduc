import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faUnlink } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Importation du composant Modal fourni par le client
import Modal from '../Modal';

// Cette modale permet de dissocier une ou plusieurs factures
// déjà associées à un versement.
const DisassociatePaymentModal = ({ isOpen, onClose, selectedPayment }) => {
  // État local pour gérer les factures sélectionnées pour la dissociation
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([]);

  // Utilisation de useForm pour la soumission des données
  const { post, processing } = useForm({});

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
        text: 'Veuillez sélectionner au moins une facture à dissocier, monsieur.',
      });
      return;
    }

    // Logique de soumission vers le nouveau endpoint backend 'payments.disassociate'
    post(route('payments.disassociate',{payment: selectedPayment.id, invoices: selectedInvoiceIds}), {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Le versement a été dissocié des factures sélectionnées avec succès, monsieur.',
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
          text: 'Une erreur est survenue lors de la dissociation des factures, monsieur.',
        });
      },
    });
  };

  if (!isOpen || !selectedPayment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <FontAwesomeIcon icon={faUnlink} className="mr-2 text-yellow-500" />
          Dissocier des factures du versement #{selectedPayment?.id}
        </>
      }
    >
      {/* Contenu de la modale */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Client : <span className="font-semibold text-gray-900 dark:text-white">{selectedPayment?.client?.name || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Montant du versement restant : <span className="font-semibold text-green-600 dark:text-green-400">{selectedPayment?.amout?.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2">Factures associées à ce versement :</h3>
          {selectedPayment.factures && selectedPayment.factures.length > 0 ? (
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900">
              {selectedPayment.factures.map(invoice => (
                <label key={invoice.id} className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedInvoiceIds.includes(invoice.id)}
                    onChange={() => handleCheckboxChange(invoice.id)}
                    className="form-checkbox h-4 w-4 text-yellow-600 transition duration-150 ease-in-out border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Facture #{invoice.id} - Montant appliqué : {invoice.pivot?.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic dark:text-gray-400">
              Aucune facture n'est associée à ce versement, monsieur.
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
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-yellow-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-yellow-700 dark:border-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
            disabled={processing}
          >
            <FontAwesomeIcon icon={faCheck} />
            {processing ? 'Dissociation en cours...' : 'Dissocier'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DisassociatePaymentModal;