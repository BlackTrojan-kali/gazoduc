import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const InvoiceDetailsModal = ({ isOpen, onClose, facture }) => {
  if (!isOpen || !facture) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/10 dark:bg-white/10 bg-opacity-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-3xl w-full mx-4 my-8 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3">
          Détails de la Facture #{facture.id}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-gray-700 dark:text-gray-300">
          <div>
            <p><strong className="font-semibold text-gray-900 dark:text-white">Client:</strong> {facture.client ? `${facture.client.name} ` : 'N/A'}</p>
            <p><strong className="font-semibold text-gray-900 dark:text-white">Agent Commercial:</strong> {facture.user ? `${facture.user.first_name} ${facture.user.last_name}` : 'N/A'}</p>
            <p><strong className="font-semibold text-gray-900 dark:text-white">Agence:</strong> {facture.agency ? facture.agency.name : 'N/A'}</p>
          </div>
          <div>
            <p><strong className="font-semibold text-gray-900 dark:text-white">Date:</strong> {new Date(facture.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}</p>
            <p><strong className="font-semibold text-gray-900 dark:text-white">Mode de Paiement:</strong> {facture.currency || 'N/A'}</p>
            <p><strong className="font-semibold text-gray-900 dark:text-white">Statut:</strong> {facture.status || 'N/A'}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 dark:text-white mt-8 mb-4 border-b pb-2">
          Articles de la Facture
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Article
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantité
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prix Unitaire
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sous-total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {facture.items && facture.items.length > 0 ? (
                facture.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.article ? item.article.name : 'N/A'} {/* Assurez-vous d'avoir la relation article chargée */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.unit_price.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {item.subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-center">
                    Aucun article pour cette facture.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t dark:border-gray-700">
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            Total Général: {facture.total_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsModal;