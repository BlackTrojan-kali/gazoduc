// resources/js/Pages/Driver.jsx

import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faUserTie } from '@fortawesome/free-solid-svg-icons'; // Icône pour les chauffeurs
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';

// --- Importez la modale unifiée pour le formulaire des chauffeurs ---
import DriverFormModal from "../../components/Modals/Tranferts/DriverModal";
import RegLayout from '../../layout/RegLayout/RegLayout';

// --- Importez votre composant Switch ---
import Switch from '../../components/form/switch/Switch'; // Ajustez ce chemin si nécessaire


const Driver = ({ drivers }) => { // La prop 'drivers' contiendra la liste des chauffeurs paginée
  // --- États pour contrôler l'ouverture de la modale unique ---
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null); // Pour stocker le chauffeur à modifier

  // --- useForm d'Inertia pour les actions (archivage/mise à jour) ---
  const { put, processing } = useForm();

  // --- Fonctions pour ouvrir/fermer la modale de formulaire ---
  const openCreateModal = () => {
    setSelectedDriver(null); // S'assure que nous sommes en mode création
    setIsFormModalOpen(true);
  };
  const openEditModal = (driver) => {
    setSelectedDriver(driver); // Définit le chauffeur à éditer
    setIsFormModalOpen(true);
  };
  const closeFormModal = () => {
    setSelectedDriver(null); // Réinitialise le chauffeur sélectionné
    setIsFormModalOpen(false);
  };

  // --- Fonction pour gérer l'archivage/désarchivage d'un chauffeur ---
  const handleArchiveToggle = (driverId, currentArchivedState) => {
    const newArchivedState = !currentArchivedState; // Inverser l'état actuel

    Swal.fire({
      title: 'Confirmer l\'action, monsieur ?',
      text: `Voulez-vous vraiment ${newArchivedState ? 'archiver' : 'désarchiver'} ce chauffeur ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: newArchivedState ? 'Oui, Archiver !' : 'Oui, Désarchiver !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Envoi de la requête PUT à votre route de mise à jour des chauffeurs
        put(route('drivers.archive', driverId), { // Assurez-vous d'avoir cette route Laravel
          data: { archived: newArchivedState }, // Envoyer l'état archivé mis à jour
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Succès !',
              `Le chauffeur a été ${newArchivedState ? 'archivé' : 'désarchivé'} avec succès.`,
              'success'
            );
          },
          onError: (errors) => {
            console.error('Erreur d\'archivage:', errors);
            Swal.fire(
              'Erreur !',
              `Une erreur est survenue lors de l'${newArchivedState ? 'archivage' : 'désarchivage'} du chauffeur. ${errors.message || 'Veuillez réessayer.'}`,
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title='Liste des Chauffeurs' />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faUserTie} className="mr-3 text-brand-600" />
                Liste des Chauffeurs
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Ajouter un Chauffeur
              </Button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nom Complet
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Numéro de Permis
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Expiration Permis
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Téléphone
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Adresse
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Archivé
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {drivers.data && drivers.data.length > 0 ? (
                  drivers.data.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {driver.name}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {driver.licence_number}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(driver.licence_expiry).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {driver.phone_number}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {driver.address}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {driver.archived ? 'Oui' : 'Non'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex items-center dark:text-gray-400">
                        <Button
                          onClick={() => openEditModal(driver)}
                          variant="secondary"
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </Button>
                        {/* Utilisation du composant Switch pour archiver/désarchiver */}
                        <Switch
                          label={driver.archived ? "Désarchiver" : "Archiver"}
                          defaultChecked={driver.archived}
                          disabled={processing}
                          onChange={() => handleArchiveToggle(driver.id, driver.archived)}
                          color={driver.archived ? "gray" : "blue"}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun chauffeur trouvé, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION --- */}
            {drivers.links && drivers.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {drivers.links.map((link, index) => (
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
                      only={['drivers']} // Ajustez pour ne recharger que les données 'drivers'
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

      {/* --- La Modale Unifiée pour les Chauffeurs --- */}
      <DriverFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        driver={selectedDriver} // Passe le chauffeur sélectionné pour l'édition
        routeName={selectedDriver ? "drivers.update" : "drivers.store"} // Routes Laravel pour chauffeurs
      />
      {/* --------------- */}
    </>
  );
};

Driver.layout = page => <RegLayout children={page} />;
export default Driver;