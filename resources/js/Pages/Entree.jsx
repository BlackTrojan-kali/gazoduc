import React, { useState } from 'react'; // Importez useState
import MagLayout from '../layout/MagLayout/MagLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faFileExport } from '@fortawesome/free-solid-svg-icons'; // Importez faFileExport
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../components/ui/button/Button'; // Assurez-vous d'avoir ce composant Button
import MovementHistoryPDFExcelModal from '../components/Modals/MovHistModal'; // Importez la modale

const Entree = ({ movements, articles, agencies, services }) => { // Ajoutez articles, agencies, services aux props
  console.log(movements);
  const entreeMovementsData = movements.data.filter(movement => movement.movement_type === 'entree');

  // --- États pour la modale d'exportation ---
  const [isPDFExcelModalOpen, setIsPDFExcelModalOpen] = useState(false);

  const openPDFExcelModal = () => setIsPDFExcelModalOpen(true);
  const closePDFExcelModal = () => setIsPDFExcelModalOpen(false);

  // --- useForm d'Inertia pour la suppression ---
  const { delete: inertiaDelete, processing } = useForm();

  // --- Fonction pour gérer la suppression d'un mouvement avec SweetAlert2 ---
  const handleDelete = (movementId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer ce mouvement. Cette action est irréversible et ajustera le stock de l'article !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('magasin.move.delete', movementId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'Le mouvement a été supprimé avec succès et le stock ajusté.',
              'success'
            );
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression du mouvement. ' + (errors.message || ''),
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title="Mouvements d'Entrée" />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faCube} className="mr-3 text-brand-600" />
                Liste des Mouvements d'Entrée
              </h3>
            </div>
            {/* Nouveau bouton pour ouvrir la modale d'exportation */}
            <div className="flex items-center gap-3">
              <Button
                onClick={openPDFExcelModal}
                variant="secondary" // Utilisez la variante de bouton appropriée
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faFileExport} />
                Exporter
              </Button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Article
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Agence
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Quantité
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Qualification
                  </TableCell>
                   <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Destination
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Enregistré par
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Description
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {entreeMovementsData && entreeMovementsData.length > 0 ? (
                  entreeMovementsData.map((movement) => (
                    <TableRow key={movement.id} className="">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {movement.article ? movement.article.name : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {movement.agency ? movement.agency.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {movement.qualification}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {movement.destination_location || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {movement.recorded_by_user ? movement.recorded_by_user.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {new Date(movement.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {movement.description || 'Aucune'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        <button
                          onClick={() => handleDelete(movement.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                          disabled={processing}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Supprimer
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun mouvement d'entrée n'a été enregistré pour le moment, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION --- */}
            {movements.links && movements.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {movements.links.map((link, index) => (
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
                      only={['movements']}
                      onClick={(e) => {
                        if (!link.url) e.preventDefault();
                      }}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </nav>
            )}
            {/* -------------------------------------------------------- */}
          </div>
        </div>
      </div>

      {/* La modale de génération de PDF/Excel */}
      <MovementHistoryPDFExcelModal
        isOpen={isPDFExcelModalOpen}
        onClose={closePDFExcelModal}
        articles={articles}
        agencies={agencies}
        services={services}
      />
    </>
  );
};

Entree.layout = page => <MagLayout children={page} />;
export default Entree;