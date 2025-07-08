// resources/js/Pages/Region.jsx

import React, { useState } from 'react';
import AppLayout from '../layout/AppLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import Switch from '../components/form/switch/Switch';
import { Head, Link } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import CreateRegionModal from '../components/Modals/RegionModal';
import EditRegionModal from '../components/Modals/ModifierRegionModal';

const Region = ({ regions }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openEditModal = (region) => {
    setSelectedRegion(region);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => {
    setSelectedRegion(null);
    setIsEditModalOpen(false);
  };

  const handleArchive = (regionId) => {
    console.log(`Archiver/Désarchiver la région avec l'ID: ${regionId}, monsieur.`);
    // Logique Inertia.post ou Inertia.put ici
    // Vous aurez besoin d'utiliser useForm() d'Inertia ici pour envoyer la requête PUT/POST.
    // Par exemple:
    // const { put } = useForm({});
    // put(route('regions.archive', regionId));
  };

  return (
    <>
      <Head title='Region' />
      Liste des régions
      <br /><br />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Liste Des Régions
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
                  Régions
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Nombre De villes
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {regions.data.map((region) => (
                <TableRow key={region.id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {region.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {/* Utilise .length pour obtenir la taille du tableau */}
                    {region.city && Array.isArray(region.city) ? region.city.length : 0}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                    <button
                      onClick={() => openEditModal(region)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Modifier
                    </button>
                    {/* Si vous avez une action d'archivage/désarchivage pour les régions */}
                    {/* <Switch post={() => handleArchive(region.id)} defaultChecked={region.archived ? false : true}/> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

                    
                 <nav className="flex gap-2">
                          {regions.links.map((link, index) => (
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

      {/* Modale de création */}
      <CreateRegionModal isOpen={isCreateModalOpen} onClose={closeCreateModal} />

      {/* Modale de modification */}
      {selectedRegion && (
        <EditRegionModal isOpen={isEditModalOpen} onClose={closeEditModal} region={selectedRegion} />
      )}
    </>
  );
};

Region.layout = page => <AppLayout children={page} />;
export default Region;