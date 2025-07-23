import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';

// --- Importez la modale unifiée pour le formulaire de prix ---
import PriceFormModal from "../../components/Modals/Clients/PriceModal"; // Chemin corrigé pour la modale
import RegLayout from '../../layout/RegLayout/RegLayout';


const Price = ({ prices, clientCategories, articles, agencies }) => { // Props nécessaires
  // --- États pour contrôler l'ouverture de la modale unique ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null); // Pour stocker le prix à modifier

  // --- useForm d'Inertia pour la suppression ---
  const { delete: inertiaDelete, processing } = useForm();

  // --- Fonctions pour ouvrir/fermer la modale de formulaire ---
  const openCreateModal = () => {
    setSelectedPrice(null); // S'assure que nous sommes en mode création
    setIsFormModalOpen(true);
  };
  const openEditModal = (price) => {
    setSelectedPrice(price); // Définit le prix à éditer
    setIsFormModalOpen(true);
  };
  const closeFormModal = () => {
    setSelectedPrice(null); // Réinitialise le prix sélectionné
    setIsFormModalOpen(false);
  };

  // --- Fonction pour gérer la suppression d'un prix avec SweetAlert2 ---
  const handleDelete = (priceId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer ce prix. Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Assurez-vous que la route 'price.delete' est bien définie dans votre web.php
        inertiaDelete(route('price.delete', priceId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'Le prix a été supprimé avec succès.',
              'success'
            );
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression du prix. ' + (errors.message || 'Veuillez réessayer.'),
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title='Prix par Catégories' />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faDollarSign} className="mr-3 text-brand-600" />
                Liste des Prix par Catégories
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={openCreateModal} // Ouvre la modale en mode création
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Créer un Prix
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
                    Catégorie Client
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Agence
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Prix Principal
                  </TableCell>
                  {/* NOUVELLE COLONNE : Prix de la Consigne */}
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Prix Consigne
                  </TableCell>
                  {/* FIN NOUVELLE COLONNE */}
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date de Création
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {prices.data && prices.data.length > 0 ? (
                  prices.data.map((price) => (
                    <TableRow key={price.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {price.article ? price.article.name : 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {price.client_category ? price.client_category.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {price.agency ? price.agency.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price.price)}
                      </TableCell>
                      {/* AFFICHAGE DU PRIX DE LA CONSIGNE */}
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {price.consigne_price !== null && price.consigne_price !== undefined
                          ? new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price.consigne_price)
                          : 'N/A'} {/* Ou "Non applicable", "0 XAF", selon votre préférence */}
                      </TableCell>
                      {/* FIN AFFICHAGE PRIX CONSIGNE */}
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(price.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        <Button
                          onClick={() => openEditModal(price)} // Ouvre la modale en mode édition
                          variant="secondary"
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </Button>
                        <button
                          disabled={processing}
                          onClick={() => handleDelete(price.id)}
                          title="Supprimer ce prix"
                          className="text-red-600 hover:text-red-800 transition-colors"
                          type="button"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Supprimer
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun prix trouvé, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION --- */}
            {prices.links && prices.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {prices.links.map((link, index) => (
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
                      only={['prices']}
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

      {/* --- La Modale Unifiée pour les Prix --- */}
      <PriceFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        price={selectedPrice}
        clientCategories={clientCategories} // Passer .data si c'est un objet paginé ou collection
        articles={articles} // Passer .data si c'est un objet paginé ou collection
        agencies={agencies} // Passer .data si c'est un objet paginé ou collection
        routeName={selectedPrice ? "price.update" : "price.store"}
      />
      {/* --------------- */}
    </>
  );
};

Price.layout = page => <RegLayout children={page} />;
export default Price;