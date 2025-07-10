import React, { useState } from 'react';
import DirLayout from '../../layout/DirLayout/DirLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faBoxesStacked, faOilCan } from '@fortawesome/free-solid-svg-icons'; // Ajout de faOilCan pour les citernes
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';

// Importez la nouvelle modal pour les citernes
import CreateCiterneModal from '../../components/Modals/Direction/CiternModal';

import Swal from 'sweetalert2';

const Citernes = ({ citernes, entreprises, products }) => { // Ajoutez 'products' aux props
  // Renommez les états pour qu'ils soient spécifiques aux citernes
  const [isCiterneModalOpen, setIsCiterneModalOpen] = useState(false);
  const [selectedCiterne, setSelectedCiterne] = useState(null); // Pour l'édition si vous l'ajoutez plus tard

  // useForm d'Inertia
  const { delete: inertiaDelete, post: inertiaPost } = useForm();
  const { props: { auth } } = usePage(); // Accédez aux données de l'utilisateur connecté via 'auth'

  // Fonctions pour ouvrir/fermer la modal de citerne
  const openCreateCiterneModal = () => {
    setSelectedCiterne(null); // S'assurer que c'est un mode création
    setIsCiterneModalOpen(true);
  };

  const closeCiterneModal = () => {
    setIsCiterneModalOpen(false);
    setSelectedCiterne(null);
    // Rechargez la page après une opération pour rafraîchir la liste des citernes
    window.location.reload();
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
        inertiaDelete(route('citernes.destroy', citerneId), { // Route pour supprimer une citerne
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimée !',
              'La citerne a été supprimée avec succès.',
              'success'
            );
            closeCiterneModal(); // Appelle la fonction de fermeture qui recharge la page
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

  // --- NOUVELLE FONCTION : Gérer la création de stocks pour une citerne ---
  // Note : La logique pour les stocks de citerne peut être différente de celle des articles.
  // Si c'est juste un stock "lié" à la citerne, l'ID de la citerne est la clé.
  // S'il s'agit d'un stock "pour un produit spécifique DANS cette citerne", alors article_id est aussi nécessaire.
  // Pour l'instant, je vais créer une version générique qui utilise l'ID de la citerne.
  const handleCreateCiterneStock = (citerneId, citerneName, currentProductId = null) => {
    const userEntrepriseId = auth.user.entreprise_id; // Assurez-vous que c'est bien 'entreprise_id' et non 'entreprice.id'
                                                       // selon la structure de `auth.user`
    if (!userEntrepriseId) {
      Swal.fire('Erreur', 'Impossible de déterminer l\'entreprise de l\'utilisateur connecté, monsieur.', 'error');
      return;
    }

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
        // Nouvelle route spécifique pour les stocks de citernes
        inertiaPost(route('citerne_stocks.create'), { // Assurez-vous que cette route existe
          citerne_id: citerneId,
          article_id: currentProductId, // Peut être null si le stock de citerne n'est pas lié à un produit spécifique ici
          entreprise_id: userEntrepriseId,
          // Vous pourriez ajouter d'autres champs de stock spécifiques aux citernes ici
        }, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Stock Citerne Initialisé !',
              `Le stock pour la citerne "${citerneName}" a été initialisé.`,
              'success'
            );
            closeCiterneModal();
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
                onClick={openCreateCiterneModal} // Appelle la fonction pour ouvrir la modal de citerne
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
                  citernes.data.map((citerne) => ( // Itérer sur 'citerne' et non 'article'
                    <TableRow key={citerne.id}>
                      <TableCell>{citerne.name}</TableCell>
                      <TableCell>{citerne.type}</TableCell>
                      <TableCell>{citerne.product_type}</TableCell>
                      <TableCell>{citerne.capacity_liter} L</TableCell>
                      <TableCell>{citerne.capacity_kg} kg</TableCell>
                      <TableCell>{citerne.current_product ? citerne.current_product.name : 'N/A'}</TableCell>
                      <TableCell>{citerne.agency ? citerne.agency.name : 'N/A'}</TableCell>
                      <TableCell>{citerne.entreprise ? citerne.entreprise.name : 'N/A'}</TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        {/* Bouton Modifier (pourrait ouvrir une modal d'édition de citerne) */}
                        <button
                          // onClick={() => openEditCiterneModal(citerne)} // Implémenter openEditCiterneModal si nécessaire
                          className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-yellow-700 shadow-theme-xs hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-700 dark:bg-yellow-800 dark:text-yellow-400 dark:hover:bg-white/[0.03] dark:hover:text-yellow-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </button>
                        {/* Bouton Supprimer une citerne */}
                        <button
                          onClick={() => handleDeleteCiterne(citerne.id, citerne.name)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Supprimer
                        </button>
                        {/* Bouton pour créer les stocks de cette citerne */}
                        <button
                          onClick={() => handleCreateCiterneStock(citerne.id, citerne.name, citerne.current_product_id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:bg-blue-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-200"
                        >
                          <FontAwesomeIcon icon={faOilCan} /> Initialiser Stock
                        </button>
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
            {citernes.links && citernes.links.length > 3 && (
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

      {/* La nouvelle modal de création de citerne */}
      <CreateCiterneModal
        isOpen={isCiterneModalOpen}
        onClose={closeCiterneModal}
        entreprises={[]}//entreprises}
        products={products} // Passez la liste des produits à la modal
        title="Créer une Nouvelle Citerne"
      />
    </>
  );
};

Citernes.layout = page => <DirLayout children={page} />;
export default Citernes;