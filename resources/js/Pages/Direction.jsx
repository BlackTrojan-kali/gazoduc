import React, { useState } from 'react'; // Importez useState
import AppLayout from "../layout/AppLayout";
import { Head, Link, useForm, usePage } from '@inertiajs/react'; // Importez useForm et usePage
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';


// --- Importez les modales de création et de modification d'utilisateur ---
import CreateUserModal from "../components/Modals/UserModal";
import EditUserModal from "../components/Modals/EditUserModal";
import Badge from '../components/ui/badge/Badge';
import Switch from '../components/form/switch/Switch';

const Direction = ({ ceos, roles,entreprises }) => {
  // --- États pour contrôler l'ouverture des modales ---
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Pour stocker le PDG à modifier

  // --- useForm d'Inertia pour la suppression ---
  const { put } = useForm();

  // --- Fonctions pour ouvrir/fermer la modale de création d'utilisateur ---
  const openCreateUserModal = () => setIsCreateUserModalOpen(true);
  const closeCreateUserModal = () => setIsCreateUserModalOpen(false);

  // --- Fonctions pour ouvrir/fermer la modale de modification d'utilisateur ---
  const openEditUserModal = (user) => {
    setSelectedUser(user); // Définit le PDG à éditer
    setIsEditUserModalOpen(true);
  };
  const closeEditUserModal = () => {
    setSelectedUser(null); // Réinitialise le PDG sélectionné
    setIsEditUserModalOpen(false);
  };
  // --- Fonction pour gérer la archive d'un PDG avec SweetAlert2 ---


  const handleArchive = (idceo) => {
    // Note: Assurez-vous que la route 'company.archive' est bien définie dans votre web.php
    // et qu'elle gère le basculement de l'état 'archived' de l'entreprise.
    put(route("direction.archive", idceo), {
      preserveScroll: true,
      onSuccess: () => {
        // Optionnel: feedback visuel ou rechargement partiel si nécessaire
      }
    });
  };
  return (
    <>
      <Head title='Directeurs' />
      Liste des Directeurs
      <br /><br />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Liste Des Directeurs
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateUserModal} // Ouvre la modale de création d'utilisateur
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <FontAwesomeIcon icon={faPlus} />
              Créer
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Nom et Prénom
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Entreprise
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Nombre D'agence
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Code
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  State
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Rôle
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {ceos.data && ceos.data.length > 0 ? (
                ceos.data.map((ceo) => (
                  <TableRow key={ceo.id} className="">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {ceo.first_name} {ceo.last_name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {ceo.entreprise ? ceo.entreprise.name : 'N/A'}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {ceo.entreprise && ceo.entreprise.agency ? ceo.entreprise.agency.length : 0} {/* Accès sécurisé à agencies.length */}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {ceo.code || 'N/A'}
                    </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        ceo.archived
                          ? "error"
                          : "success"
                      }
                    >
                      {ceo.archived ? "Archivée" : "Active"}
                    </Badge>
                  </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {ceo.role ? ceo.role.name : 'N/A'}
                    </TableCell>

                    <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                      <button
                        onClick={() => openEditUserModal(ceo)} // Ouvre la modale de modification d'utilisateur
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Modifier
                      </button>
                     
                    {/* Switch pour archiver/activer */}
                    <Switch
                      checked={ceo.archived} // L'état coché signifie 'actif' (non archivé)
                      onChange={() => handleArchive(ceo.id)}
                    />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-3 text-center text-gray-500 dark:text-gray-400">
                    Aucun PDG trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* --- CONTRÔLES DE PAGINATION --- */}
          {ceos.links && ceos.links.length > 3 && (
            <nav className="flex justify-end mt-4">
              <div className="flex gap-2">
                {ceos.links.map((link, index) => (
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
                    only={['ceos']}
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
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={closeCreateUserModal}
        agencies={[]}
        roles={roles}
        entreprises={entreprises}
        routeName={"direction.store"}
      />

      {selectedUser && ( // Rendre la modale d'édition seulement si un PDG est sélectionné
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={closeEditUserModal}
          user={selectedUser}
          entreprises={entreprises}
          roles={roles}
          agencies={[]}
          routeName={"direction.update"}
        />
      )}
      {/* --------------- */}
    </>
  );
};

Direction.layout = page => <AppLayout children={page} />;
export default Direction;