import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faUsers, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import ClientFormModal from "../../components/Modals/Clients/ClientModal";
import RegLayout from '../../layout/RegLayout/RegLayout';
import ComLayout from '../../layout/ComLayout/ComLayout';

// Ajout de la prop 'userRole' pour gérer l'affichage conditionnel
const PageContent = ({ clients, clientCategories, userRole }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { delete: inertiaDelete, processing } = useForm();

  const openCreateModal = () => {
    setSelectedClient(null);
    setIsFormModalOpen(true);
  };
  const openEditModal = (client) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };
  const closeFormModal = () => {
    setSelectedClient(null);
    setIsFormModalOpen(false);
  };

  // Remplacement de window.alert par Swal
  const handleDelete = (clientId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer ce client. Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('client.destroy', clientId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'Le client a été supprimé avec succès.',
              'success'
            );
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression du client. ' + (errors.message || 'Veuillez réessayer.'),
              'error'
            );
          },
        });
      }
    });
  };

  // Nouvelle fonction pour l'exportation CSV
  const handleExportCsv = () => {
    if (!clients.data || clients.data.length === 0) {
      Swal.fire('Information', 'Aucune donnée client à exporter.', 'info');
      return;
    }

    // Définir les en-têtes du fichier CSV
    const headers = ["Nom", "Type de Client", "Catégorie", "Téléphone", "Email", "Adresse", "NUI"];
    // Formater les données
    const csvContent = clients.data.map(client => {
      const categoryName = client.category ? client.category.name : 'N/A';
      return `"${client.name}","${client.client_type || 'N/A'}","${categoryName}","${client.phone_number || 'N/A'}","${client.email_address || 'N/A'}","${client.address || 'N/A'}","${client.NUI || 'N/A'}"`;
    });

    // Créer la chaîne CSV complète
    const csvString = [
      headers.join(','),
      ...csvContent
    ].join('\n');

    // Créer un lien de téléchargement
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'clients.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire('Succès', 'Les données ont été exportées en CSV.', 'success');
  };

  return (
    <>
      <Head title='Clients' />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faUsers} className="mr-3 text-brand-600" />
                Liste des Clients
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faFileCsv} />
                Exporter CSV
              </Button>
              <Button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300  px-4 py-2.5 text-theme-sm font-medium  shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Créer un Client
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
                    Type de Client
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Catégorie
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Téléphone
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Email
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Adresse
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    NUI
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {clients.data && clients.data.length > 0 ? (
                  clients.data.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {client.name}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {client.client_type || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {client.category ? client.category.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {client.phone_number || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {client.email_address || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {client.address || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {client.NUI || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        <Button
                          onClick={() => openEditModal(client)}
                          variant="secondary"
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </Button>
                        {/* Condition pour masquer le bouton de suppression si le rôle est 'commercial' */}
                        {userRole !== "commercial" && (
                          <button
                            disabled={processing}
                            onClick={() => handleDelete(client.id)}
                            title="Supprimer ce client"
                            className="text-red-600 hover:text-red-800 transition-colors"
                            type="button"
                          >
                            <FontAwesomeIcon icon={faTrash} /> Supprimer
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun client trouvé, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION --- */}
            {clients.links && clients.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {clients.links.map((link, index) => (
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
                      only={['clients']}
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

      {/* --- La Modale Unifiée pour les Clients --- */}
      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        client={selectedClient}
        clientCategories={clientCategories}
        routeName={selectedClient ? "client.update" : "client.store"}
      />
      {/* --------------- */}
    </>
  );
};
const ClientIndex = ({clients,clientCategories})=>{
  const {auth}= usePage().props
  if(auth.user.role =="controleur"){
    return (
      <RegLayout>
        {/* Ajout de la prop userRole */}
        <PageContent clients={clients} clientCategories={clientCategories} userRole={auth.user.role}/>
      </RegLayout>
    )
  }
  if(auth.user.role == "commercial"){
    return(
      <ComLayout>
        {/* Ajout de la prop userRole */}
        <PageContent clients={clients} clientCategories={clientCategories} userRole={auth.user.role}/>
      </ComLayout>
    )
  }
}
export default ClientIndex;
