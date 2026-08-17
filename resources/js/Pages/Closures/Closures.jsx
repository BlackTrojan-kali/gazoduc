import React, { useState } from 'react'
import DirLayout from '../../layout/DirLayout/DirLayout'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table'
import CreateClosureModal from '../../components/Modals/Closures/CreateClosureModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/ui/button/Button';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import EditClosureModal from '../../components/Modals/Closures/EditClosureModal';
import useLicenceChoice from '../../hooks/useLicenceChoice';
import DirFuelLayout from '../../layout/DirFuelLayout/DirFuelLayout';

const PageContent = ({closures,agencies}) => {
  const [closure,setClosure] = useState({});
  const [isOpenEditModal,setIsOpenEditModal] = useState(false);
  const [isOpenCreateModal,setIsOpenCreateModal] = useState(false);
  const handleOpenCreateModal = ()=>{
     setIsOpenCreateModal(true)
    }
      const handleOpenEditModal = (closure)=>{
        setClosure(closure)
        setIsOpenEditModal(true)
    }
    const getDaysDiffBetweenDates = (dateInitial, dateFinal) =>
  (dateFinal - dateInitial) / (1000 * 3600 * 24);
    const {delete:destroy} = useForm({})

  // --- Fonction pour gérer la suppression d'une réception avec SweetAlert2 ---
    const handleDelete = (closureId) => {
      Swal.fire({
        title: 'Êtes-vous sûr, monsieur ?',
        text: 'Vous êtes sur le point de supprimer cette periode. Cette action est irréversible !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#676c75',
        confirmButtonText: 'Oui, supprimer !',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
         destroy(route('closures.delete',closureId));
        }
      });
    };
  return (
    <div>
      <Head title='Fermetures'/>
      <div className='p-6 rounded-md border border-gray-300 dark:border-slate-700 bg-white card dark:bg-slate-900 '>
      <div className='w-full py-3 flex justify-between'>
              <h1>Listes des Periodes de Cloture de Compte</h1>
        <div>
          
                        <button
                          onClick={handleOpenCreateModal} // Ouvre la modal en mode création
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                          Créer 
                        </button>
        </div>
      </div>

      <br />  
      <div className='max-w-full'>
        <Table>
         <TableHeader className="border-gray-400 dark:border-gray-800 border">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">ID</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">agence</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">Debut</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">Fin</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">Nombre de Jours</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-100">Actions</TableCell>
                 </TableRow>
              </TableHeader>
              <TableBody>
                {closures.data.length == 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={9} className="py-6 text-center text-gray-400">Aucune réception trouvée avec ces filtres, monsieur.</TableCell>
                                  </TableRow>
                                  ):

                closures.data.map(closure=>(
                  <TableRow key={closure.id}>
                    <TableCell  className="py-6 text-center text-gray-500 dark:text-gray-100">{closure.id}</TableCell>
                    <TableCell  className="py-6 text-center text-gray-500 dark:text-gray-100">{closure.agency.name}</TableCell>
                    <TableCell  className="py-6 text-center text-gray-500 dark:text-gray-100">{new Date(closure.starting_date).toLocaleDateString("fr-FR",{
                      year:"numeric",
                      month:"long",
                      day:"numeric",
                    })}</TableCell>
                    <TableCell className="py-6 text-center text-gray-500 dark:text-gray-100">{new Date(closure.ending_date).toLocaleDateString("fr-FR",{
                      year:"numeric",
                      month:"long",
                      day:"numeric"
                    })}</TableCell>
                    <TableCell className="py-6 text-center text-gray-500 dark:text-gray-100">

                      {
                        getDaysDiffBetweenDates(new Date(closure.starting_date), new Date(closure.ending_date))
                      }
                    </TableCell>
                    <TableCell className="py-6 text-center text-gray-500 dark:text-gray-100 gap-2"> 

                      <Button className="p-1 bg-red-500/95  hover:bg-red-600 border-red-200 border text-red-400" onClick={()=>handleDelete(closure.id)}>  <FontAwesomeIcon icon={faTrash}/></Button>
                     <Button className="p-1 ml-1" onClick={()=>handleOpenEditModal(closure)}>  <FontAwesomeIcon icon={faEdit}/></Button>
                  
                    </TableCell>
                  </TableRow>
                ))}
                
              </TableBody>
                      {/* --- CONTRÔLES DE PAGINATION D'INERTIA --- */}
            {closures.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {initialReceptions.links.map((link, index) => (
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
                      only={['receptions']}
                      onClick={(e) => {
                        if (!link.url) e.preventDefault();
                      }}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </nav>
            )}
              
        </Table>

      </div>
</div>
      <CreateClosureModal
       isOpenCreateModal={isOpenCreateModal} 
       setIsOpenCreateModal={setIsOpenCreateModal} 
       agencies={agencies}
       />
       <EditClosureModal
       isOpenEditModal={isOpenEditModal}
       setIsOpenEditModal={setIsOpenEditModal}
       agencies={agencies}
      closure={closure}
       />
    </div>
  )
}
const Closures = ({closures,agencies}) =>{
  const {DirLicence} = useLicenceChoice();
  if(DirLicence == "gaz"){
    return(
      <DirLayout>
        <PageContent closures={closures} agencies={agencies}/>
      </DirLayout>
    )
  }else{
    return(
      <DirFuelLayout>
        <PageContent closures={closures} agencies={agencies}/>
      </DirFuelLayout>
    )
  }
  
}
export default Closures