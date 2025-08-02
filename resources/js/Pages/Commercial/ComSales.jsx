import React, { useState } from 'react';
import ComLayout from '../../layout/ComLayout/ComLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPrint, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Importez les modales
import InvoiceDetailsModal from '../../components/Modals/Sales/InvoiceDetailModal';
import NewSaleModal from '../../components/Modals/Sales/NewSaleModal';

// Ajoutez les props 'clients' et 'articles' ici, telles que passées par votre contrôleur Laravel
const ComSales = ({ factures, clients, articles }) => {
  const { delete: inertiaDelete } = useForm();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  // --- Fonctions pour la modale de Détails de Facture ---
  const openDetailsModal = (facture) => {
    setSelectedFacture(facture);
    setIsDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedFacture(null);
  };

  // --- Fonctions pour la modale Nouvelle Vente ---
  const openNewSaleModal = () => {
    setIsNewSaleModalOpen(true);
  };
  const closeNewSaleModal = () => {
    setIsNewSaleModalOpen(false);
  };

  // --- Fonction de Suppression de Facture ---
  const handleDeleteFacture = (factureId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: "Vous êtes sur le point de supprimer cette facture. Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('factures.destroy', factureId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimée !',
              'La facture a été supprimée avec succès.',
              'success'
            );
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de la facture.',
              'error'
            );
          },
        });
      }
    });
  };

  // --- Fonction d'Impression mise à jour pour télécharger le PDF ---
  const handlePrintFacture = (factureId) => {
    // Utilise la fonction 'route' de Laravel/Inertia pour générer l'URL
    // Ouvre le PDF dans une nouvelle fenêtre/onglet, ce qui déclenchera le téléchargement
    window.open(route('factures.print', { facture: factureId }), '_blank');

    // On peut toujours mettre une petite notification si on veut, mais ce n'est plus essentiel
    Swal.fire(
      'Téléchargement en cours',
      'Votre facture PDF est en cours de préparation et de téléchargement, monsieur.',
      'info'
    );
  };

  return (
    <>
      <Head title="Liste des Ventes" />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Liste des Ventes Effectuées
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={openNewSaleModal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <FontAwesomeIcon icon={faPlus} /> Nouvelle Vente
            </button>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    ID Facture
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Client
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Agent Commercial
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Agence
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Montant Total
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Mode de Paiement
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Statut
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {factures.data && factures.data.length > 0 ? (
                  factures.data.map((facture) => (
                    <TableRow key={facture.id}>
                      <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        #{facture.id}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.client ? `${facture.client.name} ` : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.user ? `${facture.user.first_name} ${facture.user.last_name}` : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.agency ? facture.agency.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {facture.total_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.currency || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.status || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(facture.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="py-3 flex items-center justify-center gap-2">
                        {/* Bouton Voir */}
                        <button
                          onClick={() => openDetailsModal(facture)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          title="Voir les détails"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {/* Bouton Imprimer (maintenant un téléchargement) */}
                        <button
                          onClick={() => handlePrintFacture(facture.id)}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                          title="Imprimer la facture"
                        >
                          <FontAwesomeIcon icon={faPrint} />
                        </button>
                        {/* Bouton Supprimer */}
                        <button
                          onClick={() => handleDeleteFacture(facture.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          title="Supprimer la facture"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucune vente trouvée pour cette agence, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {factures.links && factures.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {factures.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                        ${link.active
                          ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                          : link.url === null
                            ? 'bg-white border-gray-300 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
                      }`}
                      preserveState
                      preserveScroll
                      only={['factures']}
                      onClick={(e) => {
                        if (!link.url) e.preventDefault();
                      }}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Modale de Détails de Facture */}
      <InvoiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        facture={selectedFacture}
      />

      {/* Modale Nouvelle Vente : IMPORTANT - Passage des props clients et articles */}
      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={closeNewSaleModal}
        clients={clients}   
        articles={articles}
      />
    </>
  );
};

ComSales.layout = page => <ComLayout children={page} />;
export default ComSales;