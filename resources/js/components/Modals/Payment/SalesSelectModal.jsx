import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../Modal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

/**
 * Composant de modale pour sélectionner des factures à associer à un versement.
 *
 * @param {boolean} isOpen - État de l'ouverture de la modale.
 * @param {function} onClose - Fonction pour fermer la modale.
 * @param {array} sales - Liste complète de toutes les factures.
 * @param {function} onSave - Fonction à appeler lors de la soumission.
 * @param {boolean} processing - Indique si la soumission est en cours.
 * @param {string} paymentType - Le type de versement ('sale' ou 'consignment').
 */
const SalesSelectionModal = ({ isOpen, onClose, sales, onSave, processing, paymentType }) => {
  // État local pour stocker les factures sélectionnées
  const [selectedSales, setSelectedSales] = useState([]);

  // Utiliser useMemo pour filtrer les ventes par statut "pending" ET par type
  const pendingSales = useMemo(() => {
    // S'assurer que 'sales' est un tableau et que 'paymentType' est défini
    if (!Array.isArray(sales) || !paymentType) {
      return [];
    }
    // Filtrer les factures pour qu'elles correspondent au statut 'pending' et au type de versement
    return sales.filter(sale => sale.status === 'pending' && sale.invoice_type === paymentType);
  }, [sales, paymentType]); // Les dépendances incluent 'paymentType'

  // Réinitialiser les sélections quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setSelectedSales([]);
    }
  }, [isOpen]);

  // Gérer la sélection/désélection d'une seule facture
  const handleCheckboxChange = (sale) => {
    setSelectedSales(prevSelected => {
      // Si la facture est déjà sélectionnée, on la retire de la liste
      if (prevSelected.some(s => s.id === sale.id)) {
        return prevSelected.filter(s => s.id !== sale.id);
      } else {
        // Sinon, on l'ajoute à la liste
        return [...prevSelected, sale];
      }
    });
  };

  // Gérer la sélection de toutes les factures
  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedSales(pendingSales);
    } else {
      setSelectedSales([]);
    }
  };

  // Calculer le total des montants des ventes sélectionnées
  const totalSelectedAmount = useMemo(() => {
    return selectedSales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  }, [selectedSales]);

  // Soumettre le formulaire
  const handleSubmit = () => {
    if (selectedSales.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sélection requise',
        text: 'Vous devez sélectionner au moins une facture à associer à ce versement, monsieur.',
      });
      return;
    }
    onSave(selectedSales);
  };

  // Vérifier si la case "Tout sélectionner" doit être cochée
  const isSelectAllChecked = selectedSales.length === pendingSales.length && pendingSales.length > 0;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sélectionner les Factures"
      modalWidth="max-w-3xl"
    >
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Veuillez sélectionner les factures en attente de paiement auxquelles ce versement doit être associé, monsieur.
        </p>
        <span className='text-red-500 font-semibold'>
          Vous devez sélectionner au moins une facture.
        </span>

        {pendingSales.length > 0 ? (
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelectAllChecked}
                        onChange={handleSelectAllChange}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2">Tout sélectionner</span>
                    </label>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Facture #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Montant Dû
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {pendingSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSales.some(s => s.id === sale.id)}
                        onChange={() => handleCheckboxChange(sale)}
                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white/90">
                      #{sale.invoice_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {sale.client ? sale.client.name : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {sale.total_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Aucune facture en attente de paiement pour ce client avec ce type de versement.
          </p>
        )}
      </div>

      {/* Section pour afficher le total des sommes sélectionnées */}
      {selectedSales.length > 0 && (
        <div className="flex justify-end mt-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Total des factures sélectionnées :{' '}
            <span className="text-blue-600">
              {totalSelectedAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
            </span>
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-white/90 dark:border-gray-700 dark:hover:bg-white/[0.03]"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={processing}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {processing ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              Soumission...
            </>
          ) : (
            `Associer les factures`
          )}
        </button>
      </div>
    </Modal>
  );
};

export default SalesSelectionModal;