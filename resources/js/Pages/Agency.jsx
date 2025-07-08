import React, { useState } from 'react'; // Importez useState
import AppLayout from '../layout/AppLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react'; // Importez useForm et usePage
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';

// --- Importez les modales que nous avons créées ---
import CreateAgenceModal from "../components/Modals/AgencyModal";
import EditAgenceModal from "../components/Modals/EditAgencyModal";
// --- Importez SweetAlert2 ---
import Swal from 'sweetalert2';
// Optionnel : import 'sweetalert2/dist/sweetalert2.min.css';

const Agency = ({ agencies, entreprises, licences, regions, cities }) => {
  // --- États pour contrôler l'ouverture des modales ---
  const [isCreateAgenceModalOpen, setIsCreateAgenceModalOpen] = useState(false);
  const [isEditAgenceModalOpen, setIsEditAgenceModalOpen] = useState(false);
  const [selectedAgence, setSelectedAgence] = useState(null); // Pour stocker l'agence à modifier

  // --- useForm d'Inertia pour la suppression ---
  const { delete: inertiaDelete } = useForm();

  // --- Fonctions pour ouvrir/fermer la modale de création ---
  const openCreateModal = () => setIsCreateAgenceModalOpen(true);
  const closeCreateModal = () => setIsCreateAgenceModalOpen(false);

  // --- Fonctions pour ouvrir/fermer la modale de modification ---
  const openEditModal = (agence) => {
    setSelectedAgence(agence); // Définit l'agence à éditer
    setIsEditAgenceModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedAgence(null); // Réinitialise l'agence sélectionnée
    setIsEditAgenceModalOpen(false);
  };

  // --- Fonction pour gérer la suppression d'une agence avec SweetAlert2 ---
  const handleDelete = (agenceId, agenceName) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer l'agence "${agenceName}". Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('agencies.destroy', agenceId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimée !',
              'L\'agence a été supprimée avec succès.',
              'success'
            );
            // Inertia rafraîchit automatiquement la prop 'agencies' si votre contrôleur gère la redirection
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de l\'agence.',
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title='Agences' /> {/* Titre de la page mis à jour */}
      Liste des agences
      <br /><br />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Liste Des Agences
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal} // Appel à la fonction d'ouverture de la modale de création
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
                  Nom Agence
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Entreprise
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Licence
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Région
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Ville
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Adresse
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {agencies.data && agencies.data.length > 0 ? ( // Vérifiez si agencies.data existe et n'est pas vide
                agencies.data.map((agency) => (
                  <TableRow key={agency.id} className="">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {agency.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {agency.entreprise ? agency.entreprise.name : 'N/A'} {/* Accès sécurisé à entreprise.name */}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {agency.licence ? agency.licence.name : 'N/A'} {/* Accès sécurisé à licence.name */}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {agency.region ? agency.region.name : 'N/A'} {/* Accès sécurisé à region.name */}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {agency.city ? agency.city.name : 'N/A'} {/* Accès sécurisé à city.name */}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {agency.address}
                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                      <button
                        onClick={() => openEditModal(agency)} // Appel à la fonction d'ouverture de la modale de modification
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(agency.id, agency.name)} // Appel à la fonction de suppression
                        className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Supprimer
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-3 text-center text-gray-500 dark:text-gray-400">
                    Aucune agence trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* --- CONTRÔLES DE PAGINATION --- */}
          {agencies.links && agencies.links.length > 3 && ( // Vérifie si la pagination est nécessaire
            <nav className="flex justify-end mt-4"> {/* Aligné à droite */}
              <div className="flex gap-2">
                {agencies.links.map((link, index) => (
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
                    preserveState // Maintenir l'état de la page React lors de la navigation
                    preserveScroll // Maintenir la position de défilement
                    only={['agencies']} // Assurez-vous que c'est 'agencies' pour rafraîchir uniquement cette prop
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

      {/* --- Les Modales --- */}
      <CreateAgenceModal
        isOpen={isCreateAgenceModalOpen}
        onClose={closeCreateModal}
         entreprises={entreprises} licences={licences} regions={regions} cities={cities}
      />

      {selectedAgence && ( // Rendre la modale d'édition seulement si une agence est sélectionnée
        <EditAgenceModal
          isOpen={isEditAgenceModalOpen}
          onClose={closeEditModal}
          agence={selectedAgence}

         entreprises={entreprises} licences={licences} regions={regions} cities={cities}
      
        />
      )}
      {/* --------------- */}
    </>
  );
};

Agency.layout = page => <AppLayout children={page} />;
export default Agency;