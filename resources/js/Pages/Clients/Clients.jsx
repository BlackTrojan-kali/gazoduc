// Code complet corrigé avec filtres frontend (nom, agence, catégorie)

import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faUsers, faFileCsv, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Select from 'react-select';
import ClientFormModal from "../../components/Modals/Clients/ClientModal";
import RegLayout from '../../layout/RegLayout/RegLayout';
import ComLayout from '../../layout/ComLayout/ComLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';
import DirFuelLayout from '../../layout/DirFuelLayout/DirFuelLayout';
import useLicenceChoice from '../../hooks/useLicenceChoice';

// --- MODAL IMPORT CSV ------------------------------------------------------------------
const ImportClientModal = ({ isOpen, onClose, importForm }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) importForm.setData('import_file', file);
  };

  const handleSubmit = () => {
    if (!importForm.data.import_file) {
      Swal.fire('Attention !', "Veuillez sélectionner un fichier CSV avant d'importer.", 'warning');
      return;
    }

    importForm.post(route('client.import'), {
      onSuccess: () => {
        Swal.fire('Importation réussie !', 'Les clients ont été importés avec succès.', 'success');
        onClose();
      },
      onError: (errors) => {
        let errorMessage = 'Erreur lors de l\'importation du fichier.';
        if (errors?.import_file) errorMessage = errors.import_file;
        Swal.fire('Erreur !', errorMessage, 'error');
      },
      onFinish: () => importForm.reset(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="flex items-start justify-between pb-3 border-b border-gray-300 dark:border-gray-700">
          <h3 className="text-xl font-semibold">Importer un fichier CSV</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">Sélectionnez un fichier CSV valide.</p>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer">
            <FontAwesomeIcon icon={faUpload} className="mb-2 text-gray-400" />
            <p className="text-sm">Cliquez ou glissez-déposez</p>
            {importForm.data.import_file && (
              <p className="text-sm mt-2">Fichier sélectionné : <strong>{importForm.data.import_file.name}</strong></p>
            )}
            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
          </label>

          {importForm.errors.import_file && (
            <p className="text-red-500 text-sm mt-2">{importForm.errors.import_file}</p>
          )}
        </div>

        <div className="flex justify-end pt-3 border-t border-gray-300 dark:border-gray-700 gap-2">
          <Button onClick={handleSubmit} disabled={importForm.processing || !importForm.data.import_file}>
            Importer
          </Button>
          <Button onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </div>
  );
};

// --- PAGE CONTENT --------------------------------------------------------------------
const PageContent = ({ clients, clientCategories, agencies, userRole }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const { delete: inertiaDelete, processing: deleteProcessing } = useForm();
  const importForm = useForm({ import_file: null });

  // --- FILTRES -----------------------------------------------------------
  const [searchName, setSearchName] = useState('');
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredClients = useMemo(() => {
    return clients.data.filter((client) => {
      const matchesName = client.name?.toLowerCase().includes(searchName.toLowerCase());
      const matchesAgency = selectedAgency ? client.agency_id === selectedAgency.value : true;
      const matchesCategory = selectedCategory ? client.category_id === selectedCategory.value : true;
      return matchesName && matchesAgency && matchesCategory;
    });
  }, [searchName, selectedAgency, selectedCategory, clients.data]);

  // --- Action supprimer
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Confirmer',
      text: 'Voulez-vous supprimer ce client ?',
      icon: 'warning',
      showCancelButton: true,
    }).then((r) => {
      if (r.isConfirmed) {
        inertiaDelete(route('client.destroy', id));
      }
    });
  };

  // --- Export CSV

  const handleExportCsv = () => {
    if (!clients.data || clients.data.length === 0) {
      Swal.fire('Information', 'Aucune donnée client à exporter.', 'info');
      return;
    }

    const headers = ["Nom", "Type de Client", "Catégorie","Agence", "Téléphone", "Email", "Adresse", "NUI"];
    const csvContent = clients.data.map(client => {
      const categoryName = client.category ? client.category.name : 'N/A';
      const agencyName = client.agency ? client.agency.name : 'N/A';
      return `"${client.name}","${client.client_type || 'N/A'}","${categoryName}","${agencyName}","${client.phone_number || 'N/A'}","${client.email_address || 'N/A'}","${client.address || 'N/A'}","${client.NUI || 'N/A'}"`;
    });

    const csvString = [
      headers.join(','),
      ...csvContent
    ].join('\n');

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
      <Head title="Clients" />

      <div className="p-6">
        <div className="bg-white rounded-xl border p-6 dark:bg-white/5">

          {/* --- FILTRES --- */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <input
              type="text"
              placeholder="Rechercher un nom..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border rounded-lg p-2 w-full"
            />

            <Select
              placeholder="Filtrer par agence"
              isClearable
              className='text-black'
              options={agencies.map(a => ({ label: a.name, value: a.id }))}
              value={selectedAgency}
              onChange={setSelectedAgency}
            />

            <Select
              placeholder="Filtrer par catégorie"
              isClearable
              options={clientCategories.map(c => ({ label: c.name, value: c.id }))}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>

          {/* --- BOUTONS TOP --- */}
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">
              <FontAwesomeIcon icon={faUsers} className="mr-2 text-brand-600" />
              Liste des Clients
            </h3>

            <div className="flex gap-3">
              <Button onClick={() => setIsImportModalOpen(true)}>
                <FontAwesomeIcon icon={faUpload} /> Importer CSV
              </Button>

              <Button onClick={handleExportCsv}>
                <FontAwesomeIcon icon={faFileCsv} /> Exporter CSV
              </Button>

              <Button onClick={() => { setSelectedClient(null); setIsFormModalOpen(true); }}>
                <FontAwesomeIcon icon={faPlus} /> Nouveau Client
              </Button>
            </div>
          </div>

          {/* --- TABLEAU --- */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Nom</TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Catégorie</TableCell>
                  <TableCell isHeader>Agence</TableCell>
                  <TableCell isHeader>Téléphone</TableCell>
                  <TableCell isHeader>Email</TableCell>
                  <TableCell isHeader>Adresse</TableCell>
                  <TableCell isHeader>NUI</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredClients.length ? (
                  filteredClients.map(c => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name ? c.name :" N/A"}</TableCell>
                      <TableCell>{c.client_type ? c.client_type :" N/A"}</TableCell>
                      <TableCell>{c.category?.name ? c.category.name :" N/A"}</TableCell>
                      <TableCell>{c.agency?.name ? c.agency.name :" N/A"}</TableCell>
                      <TableCell>{c.phone_number ? c.phone_number :" N/A"}</TableCell>
                      <TableCell>{c.email_address ? c.email_address :" N/A"}</TableCell>
                      <TableCell>{c.address ? c.address :" N/A"}</TableCell>
                      <TableCell>{c.NUI ? c.NUI :" N/A"}</TableCell>

                      <TableCell className="flex gap-2">
                        <Button onClick={() => { setSelectedClient(c); setIsFormModalOpen(true); }}>
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>

                        {userRole !== 'commercial' && (
                          <button className="text-red-600" onClick={() => handleDelete(c.id)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">Aucun client trouvé</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <ClientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        client={selectedClient}
        clientCategories={clientCategories}
        agencies={agencies}
        routeName={selectedClient ? 'client.update' : 'client.store'}
      />

      <ImportClientModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        importForm={importForm}
      />
    </>
  );
};

const ClientIndex = ({clients,clientCategories,agencies})=>{
  const {auth}= usePage().props
  const {DirLicence} = useLicenceChoice()
  if(auth.user.role === "controleur"){
    return (
      <RegLayout>
        <PageContent clients={clients} clientCategories={clientCategories} userRole={auth.user.role} agencies={agencies}/>
      </RegLayout>
    )
  }
  if(auth.user.role === "commercial"){
    return(
      <ComLayout>
        <PageContent clients={clients} clientCategories={clientCategories} userRole={auth.user.role}  agencies={agencies}/>
      </ComLayout>
    )
  }

  if(auth.user.role === "direction"){
      if(DirLicence == "gaz"){
    return(
      <DirLayout>
        <PageContent clients={clients} clientCategories={clientCategories} userRole={auth.user.role} agencies={agencies}/>
      </DirLayout>
    )
  }else{
    return(
      <DirFuelLayout>
        <PageContent clients={clients} clientCategories={clientCategories} userRole={auth.user.role} agencies={agencies}/>
      </DirFuelLayout>
    )
  }
  }
}
export default ClientIndex;