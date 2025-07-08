import React, { useState } from 'react'; // Importez useState
import AppLayout from "../layout/AppLayout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'; // Importez faEdit et faTrash
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import { Head, useForm } from '@inertiajs/react'; // Importez useForm d'Inertia
import Swal from 'sweetalert2';
// import 'sweetalert2/dist/sweetalert2.min.css'; // Décommentez si vous n'avez pas de CSS global
// Importez vos modales de licence
import CreateLicenseModal from '../components/Modals/LicenceModal'; // Vérifiez le chemin
import EditLicenseModal from '../components/Modals/EditLicenceModal';   // Vérifiez le chemin
import { Link } from '@inertiajs/react';

const Licence = ({ licences }) => {
  // États pour contrôler les modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // État pour stocker l'objet licence sélectionné pour la modification
  const [selectedLicense, setSelectedLicense] = useState(null);

  // Pour la suppression avec Inertia
  const { delete: inertiaDelete } = useForm();

  // Fonctions pour ouvrir/fermer la modale de création
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  // Fonctions pour ouvrir/fermer la modale de modification
  const openEditModal = (license) => {
    setSelectedLicense(license); // Définit la licence à éditer
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedLicense(null); // Réinitialise la licence sélectionnée à la fermeture
    setIsEditModalOpen(false);
  };

  // Fonction pour gérer la suppression d'une licence
 const handleDelete = (licenseId, licenseName) => { // Passez le nom aussi
  Swal.fire({
    title: 'Êtes-vous sûr, monsieur ?',
    text: `Vous êtes sur le point de supprimer la licence "${licenseName}". Cette action est irréversible !`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33', // Couleur rouge pour supprimer
    cancelButtonColor: '#3085d6', // Couleur bleue pour annuler
    confirmButtonText: 'Oui, supprimer !',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      inertiaDelete(route('licenses.destroy', licenseId), {
        preserveScroll: true,
        onSuccess: () => {
          Swal.fire(
            'Supprimée !',
            'La licence a été supprimée avec succès.',
            'success'
          );
          // Inertia rafraîchit automatiquement la prop 'licences' après une suppression réussie
          // si votre contrôleur renvoie une Inertia::render après la suppression,
          // donc pas besoin de recharger explicitement la page ici.
        },
        onError: (errors) => {
          console.error('Erreur de suppression:', errors); // Pour le débogage
          Swal.fire(
            'Erreur !',
            'Une erreur est survenue lors de la suppression de la licence.',
            'error'
          );
        },
      });
    }
  });
};

  return (
    <>
      <Head title='Licence' />
      Liste des licences
      <br /><br />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Liste Des Licences
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal} 
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <FontAwesomeIcon icon={faPlus} />
              Créer
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              Voir tout
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Nom de la Licence
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Type
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
              {licences.data.map((licence) => (
                <TableRow key={licence.id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {licence.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {/* Affiche directement le type, qui est maintenant une chaîne de caractères */}
                    {licence.type}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {licence.description}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                    <button
                      onClick={() => openEditModal(licence)} 
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(licence.id)} 
                      className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                    >
                      <FontAwesomeIcon icon={faTrash} /> Supprimer
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

                    
                 <nav className="flex gap-2">
                          {licences.links.map((link, index) => (
                            <Link
                              key={index}
                              // link.url peut être null pour le lien courant ou les "dots" (...)
                              href={link.url || '#'}
                              className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                                ${link.active
                                  ? 'bg-blue-600 text-white border-blue-600 cursor-default' // Style pour la page active
                                  : link.url === null
                                    ? 'bg-white border-gray-300 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed' // Style pour les liens null (disabled/dots)
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-200' // Style pour les liens normaux
                                }`}
                              preserveState
                              preserveScroll
                              only={['entreprises']}
                              // Désactive le clic pour les liens 'null' (prev/next désactivé ou "...")
                              onClick={(e) => {
                                if (!link.url) e.preventDefault();
                              }}
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          ))}
                        </nav>
          
        </div>
      </div>

      {/* Modale de création de licence */}
      <CreateLicenseModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />

      {/* Modale de modification de licence */}
      {selectedLicense && ( // Rend la modale d'édition seulement si une licence est sélectionnée
        <EditLicenseModal isOpen={isEditModalOpen} onClose={closeEditModal} license={selectedLicense} />
      )}
    </>
  );
};

Licence.layout = page => <AppLayout children={page} />;
export default Licence;