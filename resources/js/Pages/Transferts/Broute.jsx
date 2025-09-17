// resources/js/Pages/Broute.jsx

import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faTruck, faDownload, faCheckCircle, faTrash, faFilter, faSync, faBoxes } from '@fortawesome/free-solid-svg-icons'; // Ajout de faBoxes
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import RegLayout from '../../layout/RegLayout/RegLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';
import BrouteFormModal from '../../components/Modals/Tranferts/RoadBillModal';
import BrouteDetailsModal from '../../components/Modals/Tranferts/AddPackagesModal';
import Select from 'react-select';

const PageContent = ({ roadbills, vehicles, drivers, agencies, articles }) => {
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRoadbill, setSelectedRoadbill] = useState(null);

    const { post, processing } = useForm();
    const { auth } = usePage().props;
    const userRole = auth.user.role;
    const userAgencyId = auth.user.agency?.id;

    // --- State for filters ---
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        departureAgency: userRole === 'direction' ? null : { value: userAgencyId, label: agencies.find(a => a.id === userAgencyId)?.name },
        arrivalAgency: null,
        status: null
    });

    const statusOptions = [
        { value: 'en_cours', label: 'En Cours' },
        { value: 'termine', label: 'Terminé' }
    ];

    const agencyOptions = useMemo(() => {
        return agencies.map(agency => ({ value: agency.id, label: agency.name }));
    }, [agencies]);

    // Filtered list of roadbills
    const filteredRoadbills = useMemo(() => {
        let list = roadbills.data;

        if (filters.startDate) {
            list = list.filter(rb => new Date(rb.departure_date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            list = list.filter(rb => new Date(rb.departure_date) <= new Date(filters.endDate));
        }

        if (filters.departureAgency) {
            list = list.filter(rb => rb.departure_location_id === filters.departureAgency.value);
        }

        if (filters.arrivalAgency) {
            list = list.filter(rb => rb.arrival_location_id === filters.arrivalAgency.value);
        }

        if (filters.status) {
            list = list.filter(rb => rb.status === filters.status.value);
        }

        return list;
    }, [roadbills.data, filters]);

    // Handlers for modal opening/closing
    const openCreateModal = () => {
        setSelectedRoadbill(null);
        setIsFormModalOpen(true);
    };

    const closeFormModal = () => {
        setSelectedRoadbill(null);
        setIsFormModalOpen(false);
    };

    const openDetailsModal = (roadbill) => {
        setSelectedRoadbill(roadbill);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setSelectedRoadbill(null);
        setIsDetailsModalOpen(false);
    };

    // Function to handle PDF download
    const handleDownloadPdf = (roadbillId) => {
        window.open(route('broutes.download-pdf', roadbillId), '_blank');
    };

    // Function to handle bordereau validation
    const handleValidate = (roadbill) => {
        Swal.fire({
            title: 'Confirmer la validation, monsieur ?',
            text: `Voulez-vous vraiment valider le bordereau de route #${roadbill.id} ? Cette action est irréversible et mettra à jour le stock de l'agence de destination.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, Valider !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('broutes.validate', roadbill.id), {}, {
                    onSuccess: () => {
                        Swal.fire('Succès !', 'Le bordereau a été validé avec succès.', 'success');
                    },
                    onError: (errors) => {
                        Swal.fire('Erreur !', 'Une erreur est survenue lors de la validation.', 'error');
                        console.error("Validation error:", errors);
                    },
                    preserveScroll: true
                });
            }
        });
    };

    // Function to handle bordereau deletion
    const handleDelete = (roadbillId) => {
        Swal.fire({
            title: 'Confirmer la suppression, monsieur ?',
            text: "Voulez-vous vraiment supprimer ce bordereau de route ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, Supprimer !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('broutes.destroy', roadbillId), {}, {
                    onSuccess: () => {
                        Swal.fire('Succès !', 'Le bordereau a été supprimé avec succès.', 'success');
                    },
                    onError: (errors) => {
                        Swal.fire('Erreur !', 'Une erreur est survenue lors de la suppression.', 'error');
                        console.error("Deletion error:", errors);
                    },
                    preserveScroll: true
                });
            }
        });
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            departureAgency: userRole === 'direction' ? null : { value: userAgencyId, label: agencies.find(a => a.id === userAgencyId)?.name },
            arrivalAgency: null,
            status: null
        });
    };
    
    // Custom styles for React-Select
    const customStyles = useMemo(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        return {
            control: (provided) => ({ ...provided, backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', borderColor: isDarkMode ? '#4b5563' : '#d1d5db' }),
            singleValue: (provided) => ({ ...provided, color: isDarkMode ? '#ffffff' : '#1f2937' }),
            input: (provided) => ({ ...provided, color: isDarkMode ? '#ffffff' : '#1f2937' }),
            placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
            menu: (provided) => ({ ...provided, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', zIndex: 9999 }),
            option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : (state.isFocused ? (isDarkMode ? '#3b82f6' : '#e5e7eb') : 'transparent'), color: state.isSelected || state.isFocused ? '#ffffff' : (isDarkMode ? '#e5e7eb' : '#1f2937') }),
        };
    }, []);

    return (
        <>
            <Head title="Bordereaux de Route" />
            <div className="p-6">
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                                <FontAwesomeIcon icon={faTruck} className="mr-3 text-brand-600" />
                                Liste des Bordereaux de Route
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            {userRole === 'magasin' && (
                                <Button onClick={openCreateModal}>
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Créer un Bordereau
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* --- Filtres de Recherche --- */}
                    <div className="p-4 mb-6 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <FontAwesomeIcon icon={faFilter} className="text-brand-600" />
                            Filtres de Recherche
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Date de Départ (début)</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Date de Départ (fin)</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Agence de Départ</label>
                                <Select
                                    name="departureAgency"
                                    options={agencyOptions}
                                    value={filters.departureAgency}
                                    onChange={(selectedOption) => handleFilterChange('departureAgency', selectedOption)}
                                    isClearable
                                    placeholder="Toutes les agences"
                                    isDisabled={userRole !== 'direction'}
                                    styles={customStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Agence d'Arrivée</label>
                                <Select
                                    name="arrivalAgency"
                                    options={agencyOptions}
                                    value={filters.arrivalAgency}
                                    onChange={(selectedOption) => handleFilterChange('arrivalAgency', selectedOption)}
                                    isClearable
                                    placeholder="Toutes les agences"
                                    styles={customStyles}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Statut</label>
                                <Select
                                    name="status"
                                    options={statusOptions}
                                    value={filters.status}
                                    onChange={(selectedOption) => handleFilterChange('status', selectedOption)}
                                    isClearable
                                    placeholder="Tous les statuts"
                                    styles={customStyles}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button onClick={handleResetFilters} variant="secondary">
                                <FontAwesomeIcon icon={faSync} className="mr-2" />
                                Réinitialiser les filtres
                            </Button>
                        </div>
                    </div>

                    {/* --- Tableau des bordereaux --- */}
                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                <TableRow>
                                    <TableCell isHeader>ID</TableCell>
                                    <TableCell isHeader>Véhicule</TableCell>
                                    <TableCell isHeader>Chauffeur</TableCell>
                                    <TableCell isHeader>Agence de Départ</TableCell>
                                    <TableCell isHeader>Agence d'Arrivée</TableCell>
                                    <TableCell isHeader>Statut</TableCell>
                                    <TableCell isHeader>Date de Départ</TableCell>
                                    <TableCell isHeader>Actions</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredRoadbills.length > 0 ? (
                                    filteredRoadbills.map((roadbill) => (
                                        <TableRow key={roadbill.id}>
                                            <TableCell className="py-3 font-medium">{roadbill.id}</TableCell>
                                            <TableCell className="py-3">{roadbill.vehicule.name}</TableCell>
                                            <TableCell className="py-3">{roadbill.chauffeur.name}</TableCell>
                                            <TableCell className="py-3">{roadbill.departure.name}</TableCell>
                                            <TableCell className="py-3">{roadbill.arrival.name}</TableCell>
                                            <TableCell className="py-3">{roadbill.status}</TableCell>
                                            <TableCell className="py-3">{new Date(roadbill.departure_date).toLocaleDateString()}</TableCell>
                                            <TableCell className="py-3 flex items-center gap-2">
                                                <Button onClick={() => openDetailsModal(roadbill)} variant="secondary">
                                                    <FontAwesomeIcon icon={faEye} />
                                                </Button>
                                                {/* Ajout du bouton "Produits" */}
                                                <Link href={route('broutes.packages.index', roadbill.id)}>
                                                    <Button variant="secondary" className="px-3 py-2">
                                                        <FontAwesomeIcon icon={faBoxes} />
                                                    </Button>
                                                </Link>
                                                <Button onClick={() => handleDownloadPdf(roadbill.id)} variant="secondary">
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </Button>
                                                {roadbill.status === 'en_cours' && auth.user.agency_id === roadbill.arrival_location_id && (
                                                    <Button onClick={() => handleValidate(roadbill)} variant="success">
                                                        <FontAwesomeIcon icon={faCheckCircle} /> Valider
                                                    </Button>
                                                )}
                                                {roadbill.status === 'en_cours' && auth.user.agency_id === roadbill.departure_location_id && (
                                                    <Button onClick={() => handleDelete(roadbill.id)} variant="danger">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-3 text-center">
                                            Aucun bordereau de route trouvé, monsieur.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {/* Pagination is handled by Inertia, but we filter the data displayed */}
                        {roadbills.links && roadbills.links.length > 3 && (
                            <nav className="flex justify-end mt-4">
                                <div className="flex gap-2">
                                    {roadbills.links.map((link, index) => (
                                        <Link key={index} href={link.url || '#'}
                                            className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm ${link.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                            preserveState preserveScroll only={['roadbills']}>
                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                        </Link>
                                    ))}
                                </div>
                            </nav>
                        )}
                    </div>
                </div>
            </div>

            <BrouteFormModal
                isOpen={isFormModalOpen}
                onClose={closeFormModal}
                agencies={agencies}
                vehicles={vehicles}
                drivers={drivers}
                articles={articles}
            />

            <BrouteDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={closeDetailsModal}
                roadbill={selectedRoadbill}
            />
        </>
    );
};

const Broute = ({ roadbills, vehicles, drivers, agencies, articles }) => {
    const { auth } = usePage().props;
    const userRole = auth.user.role;

    const pageContent = <PageContent {...{ roadbills, vehicles, drivers, agencies, articles }} />;

    if (userRole === "controleur" || userRole === "magasin") {
        return <RegLayout>{pageContent}</RegLayout>;
    }

    if (userRole === "direction") {
        return <DirLayout>{pageContent}</DirLayout>;
    }

    return null;
};

export default Broute;