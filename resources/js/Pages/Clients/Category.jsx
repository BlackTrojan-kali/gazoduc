import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faListAlt } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';

// --- Importez la modale unifiée ---
import ClientCategoryFormModal from "../../components/Modals/Clients/CategoryModal";
import RegLayout from '../../layout/RegLayout/RegLayout';


const ClientCategoryIndex = ({ clientCategories }) => {
  // --- États pour contrôler l'ouverture de la modale unique ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // Pour stocker la catégorie à modifier

  // --- useForm d'Inertia pour la suppression ---
  const { delete: inertiaDelete, processing } = useForm();

  // --- Fonctions pour ouvrir/fermer la modale de formulaire ---
  const openCreateModal = () => {
    setSelectedCategory(null); // S'assure que nous sommes en mode création
    setIsFormModalOpen(true);
  };
  const openEditModal = (category) => {
    setSelectedCategory(category); // Définit la catégorie à éditer
    setIsFormModalOpen(true);
  };
  const closeFormModal = () => {
    setSelectedCategory(null); // Réinitialise la catégorie sélectionnée
    setIsFormModalOpen(false);
  };

  // --- Fonction pour gérer la suppression d'une catégorie avec SweetAlert2 ---
  const handleDelete = (categoryId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer cette catégorie de client. Cette action est irréversible et pourrait affecter les clients associés !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('cat.delete', categoryId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimée !',
              'La catégorie a été supprimée avec succès.',
              'success'
            );
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de la catégorie. ' + (errors.message || 'Veuillez réessayer.'),
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title='Catégories Clients' />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faListAlt} className="mr-3 text-brand-600" />
                Liste des Catégories de Clients
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={openCreateModal} // Ouvre la modale en mode création
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Créer une Catégorie
              </Button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nom
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Description
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date de Création
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {clientCategories.data && clientCategories.data.length > 0 ? (
                  clientCategories.data.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {category.name}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {category.description || 'Aucune description'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(category.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        <Button
                          onClick={() => openEditModal(category)} // Ouvre la modale en mode édition
                          variant="secondary"
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </Button>
                        <button
                          disabled={processing}
                          onClick={() => handleDelete(category.id)}
                          title="Supprimer cette catégorie"
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
                    <TableCell colSpan={4} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucune catégorie de client trouvée, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION --- */}
            {clientCategories.links && clientCategories.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {clientCategories.links.map((link, index) => (
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
                      only={['clientCategories']}
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

      {/* --- La Modale Unifiée --- */}
      {/* Elle est toujours rendue, mais sa visibilité est contrôlée par isOpen */}
      <ClientCategoryFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        category={selectedCategory} // Passe la catégorie (sera null pour la création)
        routeName={selectedCategory ? "cat.update" : "cat.store"} // Adapte la route
      />
      {/* --------------- */}
    </>
  );
};

ClientCategoryIndex.layout = page => <RegLayout children={page} />;
export default ClientCategoryIndex;