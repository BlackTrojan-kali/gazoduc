import React, { useState } from 'react'; // Importe useState
import AppLayout from '../layout/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table'; // Vérifiez le chemin si 'Components' est avec un 's' majuscule
import Badge from '../components/ui/badge/Badge'; // Vérifiez le chemin
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons'; // Ajoute faPlus pour le bouton "Créer"

// Importe le nouveau composant de la modale
import CreateCompanyModal from "../components/Modals/EntrePriseModal"; // <--- IMPORTE ICI
import Switch from '../components/form/switch/Switch';

const Dashboard = ({entreprises}) => {
  const { auth } = usePage().props;
  // State pour gérer l'ouverture/fermeture de la modale
  const [isModalOpen, setIsModalOpen] = useState(false);


  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const {put} = useForm()
  const handleArchive = (idCom)=>{
    put(route("company.archive",idCom))
  }

  return (
    <div className='text-3xl '>
      <Head title='Dashboard'/>
      Bienvenue Mr, {auth.user.first_name} {/* Utilisez auth.user.name si first_name n'existe pas */}
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
                  onClick={handleOpenModal} // <--- ACTIVE LA MODALE AU CLIC
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <FontAwesomeIcon
                    className="stroke-current fill-white dark:fill-gray-800"
                    width="20"
                    height="20"
                    icon={faPlus} // <--- UTILISE L'ICONE PLUS
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
                            <img
                              src={`/images/clients/${entreprise.logo_path}`}
                              className="h-[50px] w-[50px]"
                              alt={entreprise.name}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {entreprise.name}
                            </p>
                            <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                              
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {0}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {0}
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
                          {entreprise.archived ? "archived":"active"}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        {/* Ajoutez vos actions ici, par exemple: */}
                        <Link
                  top="/"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <FontAwesomeIcon
                    className="stroke-current fill-white dark:fill-gray-800"
                    width="20"
                    height="20"
                    icon={faDownload} // <--- UTILISE L'ICONE PLUS
                  />
                </Link>
              
              <Switch post={()=>handleArchive(entreprise.id)} defaultChecked={entreprise.archived ? false : true}/>
                        {/* <Link href={`/companies/${product.id}/edit`} className="text-blue-500 hover:underline">Modifier</Link> */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

      {/* La modale est rendue ici */}
      <CreateCompanyModal isOpen={isModalOpen} onClose={handleCloseModal} />
     </div>
  );
};

Dashboard.layout = (page) => <AppLayout children={page}/>;
export default Dashboard;