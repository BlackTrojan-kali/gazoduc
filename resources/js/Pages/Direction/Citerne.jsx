import React, { useState } from 'react';
import DirLayout from '../../layout/DirLayout/DirLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faBoxesStacked, faOilCan } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';

// Importez maintenant la modal unique pour la création/modification
import CiterneFormModal from '../../components/Modals/Direction/CiternModal'; // Assurez-vous que le chemin est correct et le nom est à jour

import Swal from 'sweetalert2';

const Citernes = ({ citernes, entreprises, products, agencies }) => {
  // Un seul état pour contrôler l'ouverture de la modal
  const [isCiterneFormModalOpen, setIsCiterneFormModalOpen] = useState(false);
  // Un état pour stocker la citerne sélectionnée (null pour la création)
  const [selectedCiterne, setSelectedCiterne] = useState(null);

  const { delete: inertiaDelete, post: inertiaPost } = useForm();
  const { props: { auth } } = usePage();

  // Fonction pour ouvrir la modal en mode CRÉATION
  const openCreateCiterneModal = () => {
    setSelectedCiterne(null); // Important : définir selectedCiterne à null pour le mode création
    setIsCiterneFormModalOpen(true);
  };

  // Fonction pour ouvrir la modal en mode MODIFICATION
  const openEditCiterneModal = (citerne) => {
    setSelectedCiterne(citerne); // Définit la citerne à modifier
    setIsCiterneFormModalOpen(true);
  };

  // Fonction pour fermer la modal (commune aux deux modes)
  const closeCiterneFormModal = () => {
    setIsCiterneFormModalOpen(false);
    setSelectedCiterne(null); // Réinitialiser selectedCiterne après la fermeture
    // Recharger la page après une opé
  };

  // --- Fonction pour gérer la suppression d'une citerne avec SweetAlert2 ---
  const handleDeleteCiterne = (citerneId, citerneName) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer la citerne "${citerneName}". Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('citernes.destroy', citerneId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimée !',
              'La citerne a été supprimée avec succès.',
              'success'
            );
            window.location.reload(); // Recharger après suppression
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de la citerne.',
              'error'
            );
          },
        });
      }
    });
  };

  // --- Fonction pour gérer la création de stocks pour une citerne ---
  const handleCreateCiterneStock = (citerneId, citerneName, currentProductId) => {
 
  

    Swal.fire({
      title: 'Confirmer l\'initialisation du stock de citerne, monsieur ?',
      text: `Cela va créer une entrée de stock initiale (quantité 0) pour la citerne "${citerneName}".`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, initialiser le stock !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaPost(route('citernes.generate-stock', {
          citerne_id: citerneId,
          article_id: currentProductId,
        },), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Stock Citerne Initialisé !',
              `Le stock pour la citerne "${citerneName}" a été initialisé.`,
              'success'
            );
            //window.location.reload(); // Recharger après initialisation du stock
          },
          onError: (errors) => {
            console.error('Erreur de création de stock de citerne:', errors);
            let errorMessage = 'Une erreur est survenue lors de l\'initialisation du stock de citerne.';
            if (errors && errors.message) {
              errorMessage = errors.message;
            }
            Swal.fire(
              'Erreur !',
              errorMessage,
              'error'
            );
          },
        });
      }
    });
  };


  return (
    <>
      <Head title='Citernes' />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-4">
          Gestion des Citernes
        </h1>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste Des Citernes
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openCreateCiterneModal} // Ouvre la modal en mode création
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Créer Citerne
              </button>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader>Nom</TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Type Produit</TableCell>
                  <TableCell isHeader>Capacité (L)</TableCell>
                  <TableCell isHeader>Capacité (Kg)</TableCell>
                  <TableCell isHeader>Produit Actuel</TableCell>
                  <TableCell isHeader>Agence</TableCell>
                  <TableCell isHeader>Entreprise</TableCell>
                  <TableCell isHeader>Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {citernes.data && citernes.data.length > 0 ? (
                  citernes.data.map((citerne) => (
                    <TableRow key={citerne.id}>
                      <TableCell>{citerne.name}</TableCell>
                      <TableCell>{citerne.type}</TableCell>
                      <TableCell>{citerne.product_type}</TableCell>
                      <TableCell>{citerne.capacity_liter} L</TableCell>
                      <TableCell>{citerne.capacity_kg} kg</TableCell>
                      <TableCell>{citerne.article ? citerne.article.name : 'N/A'}</TableCell>
                      <TableCell>{citerne.agency ? citerne.agency.name : 'N/A'}</TableCell>
                      <TableCell>{citerne.entreprise ? citerne.entreprise.name : 'N/A'}</TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        {/* Bouton Modifier qui ouvre la modal en mode édition */}
                        <button
                          onClick={() => openEditCiterneModal(citerne)}
                          className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-yellow-700 shadow-theme-xs hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-700 dark:bg-yellow-800 dark:text-yellow-400 dark:hover:bg-white/[0.03] dark:hover:text-yellow-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </button>
                        
                        {/* Bouton pour générer le stock, affiché seulement pour les citernes fixes */}
                        {citerne.type === 'fixed' && (
                          <button
                            onClick={() => handleCreateCiterneStock(citerne.id, citerne.name, citerne.current_product_id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:bg-green-800 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-200"
                          >
                            <FontAwesomeIcon icon={faBoxesStacked} /> Générer Stock
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucune citerne trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {(
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {citernes.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                        ${link.active
                          ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                          : link.url === null
                            ? 'bg-white border-gray-300 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
                        }`}
                      preserveState
                      preserveScroll
                      only={['citernes']}
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

      {/* Une seule modal de formulaire pour la création et la modification */}
      <CiterneFormModal
        isOpen={isCiterneFormModalOpen}
        onClose={closeCiterneFormModal}
        entreprises={entreprises}
        agencies={agencies}
        products={products}
        selectedCiterne={selectedCiterne} // Passe la citerne sélectionnée (sera null pour la création)
      />
    </>
  );
};

Citernes.layout = page => <DirLayout children={page} />;
export default Citernes;
