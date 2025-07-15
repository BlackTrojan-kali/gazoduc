import React, { useState } from 'react'; // Importez useState
import MagLayout from '../layout/MagLayout/MagLayout'; // Assurez-vous du bon chemin vers votre layout
import { Head, Link, useForm } from '@inertiajs/react'; // Importez useForm
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFileExport } from '@fortawesome/free-solid-svg-icons'; // Importez l'icône de la poubelle et faFileExport
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table'; // Composants de table
import Swal from 'sweetalert2'; // Importez SweetAlert2

// Importez vos composants personnalisés :
import Button from '../components/ui/button/Button'; // Assurez-vous que le chemin est correct
// Correction du nom de la modale si elle est nommée DepotageHistoryPDFExcelModal.jsx
import DepotageHistoryPDFExcelModal from '../components/Modals/RecHistModal'; // Assurez-vous que le chemin est correct et le nom du fichier

const Reception = ({ receptions, agencies /* Assurez-vous que les agences sont passées par le contrôleur */ }) => {
  // 'receptions' viendra du contrôleur sous forme d'objet paginé (par exemple, { data: [], links: [] })
  // 'agencies' est nécessaire pour la modale d'exportation

  // Initialisation de useForm d'Inertia pour la suppression
  const { delete: inertiaDelete, processing } = useForm();

  // --- États et fonctions pour la modale d'exportation ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);

  // --- Fonction pour gérer la pagination après une suppression ---
  const applyPaginationAfterDelete = () => {
    const newPage = receptions.data.length === 1 && receptions.current_page > 1
      ? receptions.current_page - 1
      : receptions.current_page;

    // Recharge la page 'receptions.index' via Inertia avec les paramètres de pagination
    inertiaDelete(route('receptions.index', { page: newPage, per_page: receptions.per_page }), {
        preserveScroll: true,
        preserveState: true,
        only: ['receptions'],
        onSuccess: () => {
            // Le message de succès est géré dans handleDelete
        },
        onError: (errors) => {
            console.error('Erreur lors du rechargement après suppression:', errors);
            Swal.fire(
                'Erreur de rechargement !',
                'La liste des réceptions n\'a pas pu être mise à jour correctement.',
                'error'
            );
        }
    });
  };

  // --- Fonction pour gérer la suppression d'une réception avec SweetAlert2 ---
  const handleDelete = (receptionId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: 'Vous êtes sur le point de supprimer cette réception. Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // CORRECTION: Utilisez route('receptions.destroy', receptionId) pour la suppression RESTful
        inertiaDelete(route('receptions.destroy', receptionId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'La réception a été supprimée avec succès.',
              'success'
            );
            // Recharge la table pour refléter le changement
            applyPaginationAfterDelete();
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de la réception. ' + (errors.message || 'Veuillez réessayer.'),
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title="Réceptions" />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste des Réceptions
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {/* Bouton pour ouvrir la modale d'exportation */}
              <Button
                onClick={openExportModal} // Appelle la fonction pour ouvrir la modale
                variant="secondary"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faFileExport} />
                Exporter
              </Button>
              {/* Vous pouvez ajouter d'autres boutons ici, par exemple "Nouvelle Réception" */}
              {/* <Link href={route('receptions.create')} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
                Nouvelle Réception
              </Link> */}
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Citerne Mobile</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Article</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Qté Reçue (L)</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agence Destination</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Enregistré par</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Origine</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Créé le</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receptions.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-6 text-center text-gray-400">Aucune réception trouvée, monsieur.</TableCell>
                  </TableRow>
                ) : (
                  receptions.data.map(reception => (
                    <TableRow key={reception.id}>
                      <TableCell>{reception.id}</TableCell>
                      {/* Correction des noms de relations pour correspondre à votre modèle et aux props passées */}
                      <TableCell>{reception.citerne ? reception.citerne.name : '—'}</TableCell>
                      <TableCell>{reception.article ? reception.article.name : '—'}</TableCell>
                      <TableCell>{reception.received_quantity.toLocaleString('fr-FR')}</TableCell>
                      <TableCell>{reception.agency ? reception.agency.name : '—'}</TableCell>
                      {/* Correction: Utilisez recorded_by_user si c'est le nom de la relation dans le modèle Reception */}
                      <TableCell>{reception.user ? `${reception.user.first_name} ${reception.user.last_name || ''}` : '—'}</TableCell>
                      <TableCell>{reception.origin || '—'}</TableCell>
                      <TableCell>{new Date(reception.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <button
                            disabled={processing}
                            onClick={() => handleDelete(reception.id)}
                            title="Supprimer cette réception"
                            className="text-red-600 hover:text-red-800 transition-colors"
                            type="button"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION D'INERTIA --- */}
            {receptions.links && receptions.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {receptions.links.map((link, index) => (
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
                      only={['receptions']}
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

      {/* --- La modale de génération de PDF/Excel pour les réceptions --- */}
      <DepotageHistoryPDFExcelModal // Utilisez le nom de la modale pour les dépotages comme demandé
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        agencies={agencies} // Passez les agences reçues du contrôleur à la modale
      />
    </>
  );
};

Reception.layout = page => <MagLayout children={page} title="Réceptions" />;
export default Reception;