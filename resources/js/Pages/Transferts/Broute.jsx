import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPrint, faRoute, faInfoCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';

import RoadbillFormModal from "../../components/Modals/Tranferts/RoadBillModal";
import MagLayout from '../../layout/MagLayout/MagLayout';

const Broute = ({ roadbills, vehicles, drivers, agencies, articles, userAgencyId }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRoadbill, setSelectedRoadbill] = useState(null);
  const {auth} = usePage().props;
  const openCreateModal = () => {
    setSelectedRoadbill(null);
    setIsFormModalOpen(true);
  };
  
  // Cette fonction n'est plus appelée par un bouton cliquable
  // mais nous la gardons pour la logique de la modale au cas où
  const openEditModal = (roadbill) => {
    setSelectedRoadbill(roadbill);
    setIsFormModalOpen(true);
  };
  
  const closeFormModal = () => {
    setSelectedRoadbill(null);
    setIsFormModalOpen(false);
  };

  const handlePrintToPdf = (roadbill) => {
    // Redirection vers l'URL de téléchargement du PDF
    window.location.href = route('broutes.download-pdf', { id: roadbill.id });
  };

  const handleDelete = (roadbill) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: "La suppression de ce bordereau réintègrera les articles au stock de départ. Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Envoi de la requête de suppression via Inertia
        router.delete(route('broutes.destroy', { id: roadbill.id }));
      }
    });
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'en_cours':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">En cours</span>;
      case 'annulee':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">Annulée</span>;
      case 'termine':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Terminée</span>;
      default:
        return status;
    }
  };

  const findNameById = (id, list, key = 'name') => {
    const item = list.find(item => item.id === id);
    return item ? item[key] : 'N/A';
  };

  return (
    <>
      <Head title='Liste des Bordereaux de Route' />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faRoute} className="mr-3 text-brand-600" />
                Liste des Bordereaux de Route
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Ajouter un Bordereau
              </Button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Véhicule
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Chauffeur
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Co-Chauffeur
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Départ
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Arrivée
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date Départ
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date Arrivée
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Statut
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Note
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {roadbills.data && roadbills.data.length > 0 ? (
                  roadbills.data.map((roadbill) => (
                    <TableRow key={roadbill.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {roadbill.vehicule? roadbill.vehicule.licence_plate : "N/A"}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {roadbill.chauffeur? roadbill.chauffeur.name : "N/A"}                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                         {roadbill.co_chauffeur? roadbill.co_chauffeur.name : "N/A"}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {findNameById(roadbill.departure_location_id, agencies)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {findNameById(roadbill.arrival_location_id, agencies)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(roadbill.departure_date).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {roadbill.arrival_date ? new Date(roadbill.arrival_date).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatStatus(roadbill.status)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {roadbill.type}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {roadbill.note || 'Aucune'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex items-center dark:text-gray-400">
                        {/* NOUVEAUTÉ : Bouton pour imprimer en PDF */}
                        <Button
                          onClick={() => handlePrintToPdf(roadbill)}
                          variant="secondary"
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                          <FontAwesomeIcon icon={faPrint} /> Imprimer en PDF
                        </Button>
                        {roadbill.articles && roadbill.articles.length > 0 && (
                            <Button
                                onClick={() => Swal.fire({
                                    title: 'Articles Transférés',
                                    html: roadbill.articles.map(item => `<p>${item.name}: ${item.pivot.quantity} ${item.unit}</p>`).join(''),
                                    icon: 'info',
                                    confirmButtonText: 'Fermer'
                                })}
                                variant="secondary"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                            >
                                <FontAwesomeIcon icon={faInfoCircle} /> Articles
                            </Button>
                        )}
                        {/* Condition pour afficher le bouton de suppression */}
                        {roadbill.departure_location_id === auth.user.agency.id && (
                           <Button
                             onClick={() => handleDelete(roadbill)}
                             variant="danger"
                             className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-red-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-red-600 dark:border-red-600"
                           >
                             <FontAwesomeIcon icon={faTrash} /> Supprimer
                           </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun bordereau de route trouvé, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION --- */}
            {roadbills.links && roadbills.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {roadbills.links.map((link, index) => (
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
                      only={['roadbills']}
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

      {/* La Modale Unifiée pour les Bordereaux de Route */}
      <RoadbillFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        roadbill={selectedRoadbill}
        routeName={selectedRoadbill ? "roadbills.update" : "broutes.store"}
        vehicles={vehicles}
        drivers={drivers}
        agencies={agencies}
        articles={articles}
      />
    </>
  );
};

Broute.layout = page => <MagLayout children={page} />;
export default Broute;
