import React, { useState } from 'react';
import AppLayout from '../layout/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Badge from '../components/ui/badge/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons'; // Assurez-vous que faEdit est importé

// Importe les modales
import CreateCompanyModal from "../components/Modals/EntrePriseModal"; // Modale de création d'entreprise
import EditCompanyModal from "../components/Modals/ModifierEntrepriseModal"; // <--- IMPORTE LA MODALE D'ÉDITION ICI
import Switch from '../components/form/switch/Switch';

const Dashboard = ({ entreprises }) => {
  const { auth } = usePage().props;

  // États pour gérer l'ouverture/fermeture des modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Pour la modale de création
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);     // Pour la modale de modification
  const [selectedCompany, setSelectedCompany] = useState(null);       // Pour stocker l'entreprise à modifier

  // Fonctions pour la modale de création
  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  // Fonctions pour la modale de modification
  const handleOpenEditModal = (entreprise) => {
    setSelectedCompany(entreprise); // Définit l'entreprise à éditer
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setSelectedCompany(null); // Réinitialise l'entreprise sélectionnée
    setIsEditModalOpen(false);
  };

  const { put } = useForm();
  const handleArchive = (idCom) => {
    // Note: Assurez-vous que la route 'company.archive' est bien définie dans votre web.php
    // et qu'elle gère le basculement de l'état 'archived' de l'entreprise.
    put(route("company.archive", idCom), {
      preserveScroll: true,
      onSuccess: () => {
        // Optionnel: feedback visuel ou rechargement partiel si nécessaire
      }
    });
  };

  return (
    <div className='text-3xl '>
      <Head title='Dashboard' />
      Bienvenue Monsieur, {auth.user.first_name}
      <br /><br />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Liste Des Entreprises
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal} // Ouvre la modale de création
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <FontAwesomeIcon
                className="stroke-current fill-white dark:fill-gray-800"
                width="20"
                height="20"
                icon={faPlus}
              />
              Créer
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              Voir tout
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Entreprise
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Nombre D'agence
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Licence
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Statut
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {entreprises.map((entreprise) => (
                <TableRow key={entreprise.id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                        {/* Assurez-vous que entreprise.logo_path contient le chemin complet et correct */}
                        <img
                          src={`images/clients/${entreprise.logo_path}`} // Utilisez directement le chemin complet de logo_path
                          className="h-[50px] w-[50px] object-cover" // Utilisez object-cover pour éviter les déformations
                          alt={entreprise.name}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {entreprise.name}
                        </p>
                        <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                          {entreprise.code} {/* Afficher le code de l'entreprise */}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {entreprise.agencies_count !== undefined ? entreprise.agencies_count : 0}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {entreprise.license_status || 'N/A'} {/* Exemple pour la licence */}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        entreprise.archived
                          ? "error"
                          : "success"
                      }
                    >
                      {entreprise.archived ? "Archivée" : "Active"}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                    {/* Bouton de téléchargement */}
                    <Link
                      href={`/companies/${entreprise.id}/download`} // Exemple de route pour le téléchargement
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                    </Link>

                    {/* Bouton d'édition */}
                    <button
                      onClick={() => handleOpenEditModal(entreprise)} // Ouvre la modale d'édition avec l'entreprise sélectionnée
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>

                    {/* Switch pour archiver/activer */}
                    <Switch
                      checked={!entreprise.archived} // L'état coché signifie 'actif' (non archivé)
                      onChange={() => handleArchive(entreprise.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modale de création d'entreprise */}
      <CreateCompanyModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} />

      {/* Modale de modification d'entreprise */}
      {selectedCompany && ( // Rendre la modale de modification seulement si une entreprise est sélectionnée
        <EditCompanyModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} company={selectedCompany} />
      )}
    </div>
  );
};

Dashboard.layout = (page) => <AppLayout children={page} />;
export default Dashboard;