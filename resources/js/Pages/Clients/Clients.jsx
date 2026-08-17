import React, { useState, useMemo } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faUsers, faFileExcel, faUpload, faTimes, faFileCsv, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table'; 
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button'; 
import Select from 'react-select';
import ClientFormModal from "../../components/Modals/Clients/ClientModal"; 

// Layouts
import RegLayout from '../../layout/RegLayout/RegLayout';
import ComLayout from '../../layout/ComLayout/ComLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';
import DirFuelLayout from '../../layout/DirFuelLayout/DirFuelLayout';
import useLicenceChoice from '../../hooks/useLicenceChoice';

// --- MODAL IMPORT (Corrigée) -----------------------------------------------------------
const ImportClientModal = ({ isOpen, onClose }) => {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        import_file: null
    });

    const handleFileChange = (e) => {
        setData('import_file', e.target.files[0]);
        clearErrors('import_file');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.import_file) {
            Swal.fire('Attention', "Veuillez sélectionner un fichier.", 'warning');
            return;
        }

        post(route('client.import'), {
            onSuccess: () => {
                Swal.fire('Succès', 'Importation terminée.', 'success');
                reset();
                onClose();
            },
            onError: () => {
                // Le backend renvoie souvent les erreurs dans un flash ou error bag
                // Ici on laisse l'utilisateur voir les erreurs affichées sous l'input
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl dark:bg-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Importer des Clients</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm dark:bg-blue-900/30 dark:text-blue-300">
                            <p className="font-semibold">Format attendu : .xlsx, .xls ou .csv</p>
                            <p className="mt-1 text-xs">Colonnes : Nom, Type de Client, Catégorie, Agence, Téléphone, Email, Adresse, NUI.</p>
                        </div>

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FontAwesomeIcon icon={faUpload} className="mb-3 text-2xl text-gray-400" />
                                <p className="mb-1 text-sm text-gray-500 font-medium">Cliquez pour ajouter le fichier</p>
                                <p className="text-xs text-gray-400">Max 5 Mo</p>
                            </div>
                            <input type="file" className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
                        </label>

                        {data.import_file && (
                            <div className="text-sm text-center text-green-600 font-semibold bg-green-50 py-2 rounded">
                                {data.import_file.name}
                            </div>
                        )}

                        {errors.import_file && (
                            <div className="text-sm text-center text-red-500 bg-red-50 py-2 rounded">
                                {errors.import_file}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={processing || !data.import_file}>
                            {processing ? 'Chargement...' : 'Importer les données'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- COMPOSANT PAGE CONTENT -----------------------------------------------------------
const PageContent = ({ clients, clientCategories, agencies, userRole }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const { delete: destroy } = useForm();

    // --- FILTRES ---
    const [searchName, setSearchName] = useState('');
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // --- FILTRAGE LOCAL (Pour l'affichage instantané) ---
    const filteredClients = useMemo(() => {
        const list = clients?.data || [];
        return list.filter((client) => {
            const matchesName = client.name?.toLowerCase().includes(searchName.toLowerCase()) || 
                                client.NUI?.toLowerCase().includes(searchName.toLowerCase());
            const matchesAgency = selectedAgency ? client.agency_id === selectedAgency.value : true;
            const matchesCategory = selectedCategory ? client.client_category_id === selectedCategory.value : true;
            return matchesName && matchesAgency && matchesCategory;
        });
    }, [searchName, selectedAgency, selectedCategory, clients]);

    // --- SUPPRESSION ---
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Confirmation',
            text: "Voulez-vous vraiment archiver ce client ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('client.destroy', id), {
                    onSuccess: () => Swal.fire('Supprimé!', 'Client archivé avec succès.', 'success'),
                    onError: () => Swal.fire('Erreur', 'Impossible de supprimer.', 'error')
                });
            }
        });
    };

    // --- EXPORT ---
    const handleExportExcel = () => {
        window.location.href = route('client.export');
    };

    return (
        <>
            <Head title="Gestion des Clients" />

            <div className="p-6 space-y-6">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <span className="bg-brand-100 text-brand-600 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faUsers} />
                            </span>
                            Clients
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 ml-1">Base de données centralisée des partenaires</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                            <FontAwesomeIcon icon={faUpload} className="mr-2" /> Importer
                        </Button>
                        
                        <Button variant="success" onClick={handleExportExcel}>
                            <FontAwesomeIcon icon={faFileExcel} className="mr-2" /> Exporter
                        </Button>

                        <Button onClick={() => { setSelectedClient(null); setIsFormModalOpen(true); }}>
                            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Nouveau Client
                        </Button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    
                    {/* --- BARRE DE FILTRES --- */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <FontAwesomeIcon icon={faSearch} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher nom ou NUI..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600"
                                />
                            </div>

                            <Select
                                placeholder="Filtrer par Agence"
                                isClearable
                                options={agencies.map(a => ({ label: a.name, value: a.id }))}
                                value={selectedAgency}
                                onChange={setSelectedAgency}
                                classNamePrefix="react-select"
                            />

                            <Select
                                placeholder="Filtrer par Catégorie"
                                isClearable
                                options={clientCategories.map(c => ({ label: c.name, value: c.id }))}
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                classNamePrefix="react-select"
                            />
                        </div>
                    </div>

                    {/* --- TABLEAU --- */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                                    <TableCell isHeader>Nom / NUI</TableCell>
                                    <TableCell isHeader>Type</TableCell>
                                    <TableCell isHeader>Catégorie</TableCell>
                                    <TableCell isHeader>Agence</TableCell>
                                    <TableCell isHeader>Coordonnées</TableCell>
                                    <TableCell isHeader>Adresse</TableCell>
                                    <TableCell isHeader className="text-right">Actions</TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredClients.length > 0 ? (
                                    filteredClients.map((client) => (
                                        <TableRow key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            {/* NOM & NUI */}
                                            <TableCell>
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">{client.name}</div>
                                                {client.NUI && (
                                                    <div className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                                                        NUI: {client.NUI}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* TYPE */}
                                            <TableCell className="text-gray-600">
                                                {client.client_type || <span className="text-gray-300 italic">-</span>}
                                            </TableCell>

                                            {/* CATÉGORIE */}
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                    ${client.category?.name === 'client comptoir' 
                                                        ? 'bg-gray-100 text-gray-800' 
                                                        : 'bg-brand-50 text-brand-700 dark:bg-blue-900 dark:text-blue-200'}`}>
                                                    {client.category?.name || 'Standard'}
                                                </span>
                                            </TableCell>

                                            {/* AGENCE */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    {client.agency?.name || 'N/A'}
                                                </div>
                                            </TableCell>

                                            {/* TÉLÉPHONE & EMAIL (Groupés pour gagner de la place) */}
                                            <TableCell>
                                                <div className="text-sm">
                                                    {client.phone_number ? (
                                                        <div className="text-gray-800 font-medium">{client.phone_number}</div>
                                                    ) : <div className="text-gray-300 italic">Sans tél.</div>}
                                                    
                                                    {client.email_address && (
                                                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={client.email_address}>
                                                            {client.email_address}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* ADRESSE */}
                                            <TableCell className="text-sm text-gray-600 max-w-[150px] truncate" title={client.address}>
                                                {client.address || '-'}
                                            </TableCell>

                                            {/* ACTIONS */}
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => { setSelectedClient(client); setIsFormModalOpen(true); }}
                                                        title="Modifier les infos"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="text-blue-600" />
                                                    </Button>

                                                    {userRole !== 'commercial' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            onClick={() => handleDelete(client.id)}
                                                            title="Archiver ce client"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="text-red-500 hover:text-red-700" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-200 mb-3" />
                                                <p>Aucun client trouvé pour ces critères.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {clients.links && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                           {/* Composant de pagination ici */}
                        </div>
                    )}
                </div>
            </div>

            {/* MODALES */}
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
            />
        </>
    );
};

// --- MAIN COMPONENT & LAYOUT ---
const ClientIndex = (props) => {
    const { auth } = usePage().props;
    const { DirLicence } = useLicenceChoice();

    let Layout = RegLayout;

    if (auth.user.role === "commercial") {
        Layout = ComLayout;
    } else if (auth.user.role === "direction") {
        Layout = (DirLicence === "gaz") ? DirLayout : DirFuelLayout;
    } else if (auth.user.role === "controleur") {
        Layout = RegLayout;
    }

    return (
        <Layout>
            <PageContent 
                {...props} 
                userRole={auth.user.role} 
            />
        </Layout>
    );
};

export default ClientIndex;