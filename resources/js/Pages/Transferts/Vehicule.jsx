import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTruck } from '@fortawesome/free-solid-svg-icons'; // faTrash n'est plus nécessaire ici
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';

// --- Importez la modale unifiée pour le formulaire des véhicules ---
import VehicleFormModal from "../../components/Modals/Tranferts/VehiculeModal";
import RegLayout from '../../layout/RegLayout/RegLayout';

// --- Importez votre composant Switch ---
import Switch from '../../components/form/switch/Switch'; // Ajustez ce chemin si nécessaire
import DirLayout from '../../layout/DirLayout/DirLayout';


const PageContent = ({ vehicles }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // useForm d'Inertia pour l'archivage (peut réutiliser 'put' ou créer une instance séparée si besoin)
  // Utilisons une instance séparée pour plus de clarté pour l'action d'archivage.
  const { put, processing } = useForm();

  const openCreateModal = () => {
    setSelectedVehicle(null);
    setIsFormModalOpen(true);
  };
  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsFormModalOpen(true);
  };
  const closeFormModal = () => {
    setSelectedVehicle(null);
    setIsFormModalOpen(false);
  };

  // --- Nouvelle fonction pour gérer l'archivage/désarchivage ---
  const handleArchiveToggle = (vehicleId, currentArchivedState) => {
    const newArchivedState = !currentArchivedState; // Inverser l'état actuel

    // Afficher une confirmation avec SweetAlert2
    Swal.fire({
      title: 'Confirmer l\'action, monsieur ?',
      text: `Voulez-vous vraiment ${newArchivedState ? 'archiver' : 'désarchiver'} ce véhicule ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: newArchivedState ? 'Oui, Archiver !' : 'Oui, Désarchiver !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Envoi de la requête PUT à votre route de mise à jour.
        // Assurez-vous d'avoir une route 'vehicle.archive' ou 'vehicle.update' qui gère le champ 'archived'.
        // Si votre route 'vehicle.update' prend un champ 'archived', vous pouvez l'utiliser.
        put(route('vehicle.archive', vehicleId), {
          data: { archived: newArchivedState }, // Envoyer l'état archivé mis à jour
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Succès !',
              `Le véhicule a été ${newArchivedState ? 'archivé' : 'désarchivé'} avec succès.`,
              'success'
            );
          },
          onError: (errors) => {
            console.error('Erreur d\'archivage:', errors);
            Swal.fire(
              'Erreur !',
              `Une erreur est survenue lors de l'${newArchivedState ? 'archivage' : 'désarchivage'} du véhicule. ${errors.message || 'Veuillez réessayer.'}`,
              'error'
            );
          },
        });
      }
    });
  };


  return (
    <>
      <Head title='Liste des Véhicules' />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faTruck} className="mr-3 text-brand-600" />
                Liste des Véhicules
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Ajouter un Véhicule
              </Button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Plaque d'Immatriculation
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Capacité (Litres)
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Type de Propriétaire
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Archivé
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
                {vehicles.data && vehicles.data.length > 0 ? (
                  vehicles.data.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {vehicle.licence_plate}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {vehicle.type}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {vehicle.capacity_liters !== null && vehicle.capacity_liters !== ''
                          ? `${vehicle.capacity_liters} L`
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {vehicle.owner_type}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {/* Affichage direct du statut archivé */}
                        {vehicle.archived ? 'Oui' : 'Non'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(vehicle.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex items-center dark:text-gray-400">
                        <Button
                          onClick={() => openEditModal(vehicle)}
                          variant="secondary"
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </Button>
                        {/* Utilisation du composant Switch pour archiver/désarchiver */}
                        <Switch
                          label={vehicle.archived ? "Désarchiver" : "Archiver"}
                          defaultChecked={vehicle.archived} // L'état initial du switch est basé sur le véhicule
                          disabled={processing} // Désactive le switch pendant le traitement
                          onChange={() => handleArchiveToggle(vehicle.id, vehicle.archived)}
                          color={vehicle.archived ? "gray" : "blue"} // Change la couleur du switch
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun véhicule trouvé, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION --- */}
            {vehicles.links && vehicles.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {vehicles.links.map((link, index) => (
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
                      only={['vehicles']}
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

      {/* --- La Modale Unifiée pour les Véhicules --- */}
      <VehicleFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        vehicle={selectedVehicle}
        routeName={selectedVehicle ? "vehicle.update" : "vehicle.store"}
      />
      {/* --------------- */}
    </>
  );
};

const Vehicle = ({ vehicles }) =>{ 
    const {auth} = usePage().props
    if(auth.user.role == "controleur"){
      return(
        <RegLayout>
          <PageContent vehicles={vehicles}/>
        </RegLayout>
  )
}
    if(auth.user.role == "direction"){
       return(
       <DirLayout>
          <PageContent vehicles={vehicles}/>
        </DirLayout>
        )};
  }
export default Vehicle;