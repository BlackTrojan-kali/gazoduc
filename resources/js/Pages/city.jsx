import React, { useState } from 'react'; // Import useState for modal control
import AppLayout from '../layout/AppLayout';
import { Head } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons'; // Ensure faEdit is imported

// Import your City modals
import CreateCityModal from '../components/Modals/CityModal'; // Adjust path if necessary
import EditCityModal from '../components/Modals/EditCityModal';   // Adjust path if necessary

const City = ({ cities, regions }) => {
  // State for Create City modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // State for Edit City modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // State to hold the city object selected for editing
  const [selectedCity, setSelectedCity] = useState(null);

  // Functions to open/close Create City modal
  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  // Functions to open/close Edit City modal
  const handleOpenEditModal = (cityToEdit) => {
    setSelectedCity(cityToEdit); // Set the city to be edited
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setSelectedCity(null); // Clear the selected city on close
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Head title='City' />
      Liste des Villes
      <br /><br />
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
                  Ville
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  De Région
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {cities.map((city) => (
                <TableRow key={city.id} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {city.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {/* Assuming 'city.region' is an object with a 'name' property from eager loading */}
                    {city.region ? city.region.name : 'N/A'}
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                    <button
                      onClick={() => handleOpenEditModal(city)} 
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Modifier
                    </button>
                    {/* Add other actions like delete button here if needed */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create City Modal */}
      <CreateCityModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} regions={regions} />

      {/* Edit City Modal */}
      {selectedCity && ( // Render only if a city is selected for editing
        <EditCityModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} city={selectedCity} regions={regions} />
      )}
    </>
  );
};

City.layout = page => <AppLayout children={page} />;
export default City;