import React, { useState } from 'react';
import AppLayout from '../layout/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';

import CreateCityModal from '../components/Modals/CityModal';
import EditCityModal from '../components/Modals/EditCityModal';

// Fonction pour formater proprement l'argent
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
};

const City = ({ cities, regions }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenEditModal = (cityToEdit) => {
    setSelectedCity(cityToEdit);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setSelectedCity(null);
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Head title='Gestion des Villes' />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Configuration des Villes & Tarifs
        </h1>
        
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste Des Villes
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleOpenCreateModal} 
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} />
                Nouvelle Ville
              </button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader>Ville</TableCell>
                  <TableCell isHeader>Région</TableCell>
                  {/* NOUVELLE COLONNE */}
                  <TableCell isHeader className="text-right">Tarif Transport CSPH (par Tonne)</TableCell>
                  <TableCell isHeader className="text-center">Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cities.data.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="py-3">
                      <p className="font-bold text-gray-800 text-theme-sm dark:text-white/90">
                        {city.name}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      {city.region ? city.region.name : 'N/A'}
                    </TableCell>
                    
                    {/* AFFICHAGE DU COUT */}
                    <TableCell className="py-3 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${Number(city.transport_cost_per_tonne) !== 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {formatCurrency(city.transport_cost_per_tonne)}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      <button
                        onClick={() => handleOpenEditModal(city)} 
                        className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-3 py-2 text-theme-sm font-medium text-yellow-700 shadow-theme-xs hover:bg-yellow-50 transition-colors dark:border-yellow-700 dark:bg-gray-800 dark:text-yellow-400"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Modifier
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <nav className="flex justify-end gap-2 mt-4">
              {cities.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                    ${link.active
                      ? 'bg-blue-600 text-white border-blue-600 cursor-default' 
                      : link.url === null
                        ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 transition-colors' 
                    }`}
                  preserveState
                  preserveScroll
                  only={['cities']} // Modifié 'entreprises' en 'cities' pour éviter les bugs de scroll
                  onClick={(e) => {
                    if (!link.url) e.preventDefault();
                  }}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>

      <CreateCityModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} regions={regions} />

      {selectedCity && ( 
        <EditCityModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} city={selectedCity} regions={regions} />
      )}
    </>
  );
};

City.layout = page => <AppLayout children={page} />;
export default City;