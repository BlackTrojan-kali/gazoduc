import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import Modal from '../Modal';
import { usePage, useForm } from '@inertiajs/react';
import AddPackagesModal from './AddPackagesModal';

const BrouteFormModal = ({ isOpen, onClose, vehicles, drivers, agencies, articles }) => {
    const { auth } = usePage().props;
    const isDirection = auth.user.role?.name === 'direction';
    const userAgencyId = auth.user.agency?.id;

    const { data, setData, post, processing, reset, errors } = useForm({
        vehicle_id: null,
        driver_id: null,
        co_driver_id: null,
        departure_location_id: userAgencyId,
        arrival_location_id: null,
        departure_date: new Date().toISOString().slice(0, 10),
        arrival_date: '',
        status: 'en_cours',
        note: '',
        type: 'livraison',
        packages: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAddPackagesModalOpen, setIsAddPackagesModalOpen] = useState(false);

    useEffect(() => {
        if (!isDirection && userAgencyId) {
            setData('departure_location_id', userAgencyId);
        }
    }, [isDirection, userAgencyId]);

    const handleClose = () => {
        reset();
        setIsAddPackagesModalOpen(false);
        onClose();
    };

    const handleAddPackages = (newPackages) => {
        setData('packages', newPackages);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        post(route('broutes.store'), {
            onSuccess: () => {
                Swal.fire('Succès', 'Bordereau de route créé avec succès !', 'success');
                handleClose();
            },
            onError: (err) => {
                const errorMessage = err?.message || 'Une erreur est survenue. Veuillez vérifier les champs.';
                Swal.fire('Erreur', errorMessage, 'error');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const vehicleOptions = vehicles.map(v => ({ value: v.id, label: v.licence_plate }));
    const driverOptions = drivers.map(d => ({ value: d.id, label: d.name }));
    const agencyOptions = agencies.map(a => ({ value: a.id, label: a.name }));
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const customStyles = {
        control: (provided) => ({ ...provided, backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', borderColor: isDarkMode ? '#4b5563' : '#d1d5db' }),
        singleValue: (provided) => ({ ...provided, color: isDarkMode ? '#ffffff' : '#1f2937' }),
        input: (provided) => ({ ...provided, color: isDarkMode ? '#ffffff' : '#1f2937' }),
        placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
        menu: (provided) => ({ ...provided, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', zIndex: 9999 }),
        option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : (state.isFocused ? (isDarkMode ? '#3b82f6' : '#e5e7eb') : 'transparent'), color: state.isSelected || state.isFocused ? '#ffffff' : (isDarkMode ? '#e5e7eb' : '#1f2937') }),
    };

    const canOpenAddPackages = data.departure_location_id && data.arrival_location_id;

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} title="Créer un Bordereau de Route">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Agence de départ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Agence de départ <span className="text-red-500">*</span>
                            </label>
                            <Select
                                name="departure_location_id"
                                options={agencyOptions}
                                value={agencyOptions.find(opt => opt.value === data.departure_location_id)}
                                onChange={(selectedOption) => setData('departure_location_id', selectedOption?.value)}
                                className="mt-1"
                                placeholder="Sélectionner..."
                                isClearable={false}
                                isDisabled={!isDirection}
                                styles={customStyles}
                            />
                            {errors.departure_location_id && <div className="text-red-500 text-sm mt-1">{errors.departure_location_id}</div>}
                        </div>

                        {/* Agence d'arrivée */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Agence d'arrivée <span className="text-red-500">*</span>
                            </label>
                            <Select
                                name="arrival_location_id"
                                options={agencyOptions}
                                value={agencyOptions.find(opt => opt.value === data.arrival_location_id)}
                                onChange={(selectedOption) => setData('arrival_location_id', selectedOption?.value)}
                                className="mt-1"
                                placeholder="Sélectionner..."
                                styles={customStyles}
                            />
                            {errors.arrival_location_id && <div className="text-red-500 text-sm mt-1">{errors.arrival_location_id}</div>}
                        </div>

                        {/* Véhicule */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Véhicule <span className="text-red-500">*</span>
                            </label>
                            <Select
                                name="vehicle_id"
                                options={vehicleOptions}
                                value={vehicleOptions.find(opt => opt.value === data.vehicle_id)}
                                onChange={(selectedOption) => setData('vehicle_id', selectedOption?.value)}
                                className="mt-1"
                                placeholder="Sélectionner..."
                                styles={customStyles}
                            />
                            {errors.vehicle_id && <div className="text-red-500 text-sm mt-1">{errors.vehicle_id}</div>}
                        </div>

                        {/* Chauffeur */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Chauffeur <span className="text-red-500">*</span>
                            </label>
                            <Select
                                name="driver_id"
                                options={driverOptions}
                                value={driverOptions.find(opt => opt.value === data.driver_id)}
                                onChange={(selectedOption) => setData('driver_id', selectedOption?.value)}
                                className="mt-1"
                                placeholder="Sélectionner..."
                                styles={customStyles}
                            />
                            {errors.driver_id && <div className="text-red-500 text-sm mt-1">{errors.driver_id}</div>}
                        </div>

                        {/* Co-Chauffeur */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Co-Chauffeur
                            </label>
                            <Select
                                name="co_driver_id"
                                options={driverOptions}
                                value={driverOptions.find(opt => opt.value === data.co_driver_id)}
                                onChange={(selectedOption) => setData('co_driver_id', selectedOption?.value)}
                                className="mt-1"
                                placeholder="Sélectionner..."
                                isClearable
                                styles={customStyles}
                            />
                            {errors.co_driver_id && <div className="text-red-500 text-sm mt-1">{errors.co_driver_id}</div>}
                        </div>
                        
                        {/* Date de départ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Date de départ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="departure_date"
                                value={data.departure_date}
                                onChange={(e) => setData('departure_date', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            {errors.departure_date && <div className="text-red-500 text-sm mt-1">{errors.departure_date}</div>}
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Articles à ajouter</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Veuillez d'abord sélectionner les agences de départ et d'arrivée.</p>
                        <button
                            type="button"
                            onClick={() => setIsAddPackagesModalOpen(true)}
                            className={`mt-2 bg-purple-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg transition-colors duration-150 ${!canOpenAddPackages ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!canOpenAddPackages}
                        >
                            Ajouter des articles
                        </button>
                    </div>

                    {data.packages.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Articles ajoutés :</h4>
                            <ul className="mt-2 space-y-2">
                                {data.packages.map((pkg, index) => (
                                    <li key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                                        <span className="text-sm text-gray-800 dark:text-gray-200">
                                            {pkg.qty} x {pkg.article_name} (Départ : {pkg.departure_agency_name} &rarr; Arrivée : {pkg.arrival_agency_name})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700 mt-4">
                        <button
                            type="button"
                            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                            onClick={handleClose}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none"
                            disabled={isSubmitting || processing}
                        >
                            {isSubmitting ? 'Création...' : 'Créer le Bordereau'}
                        </button>
                    </div>
                </form>
            </Modal>
            
            <AddPackagesModal
                isOpen={isAddPackagesModalOpen}
                onClose={() => setIsAddPackagesModalOpen(false)}
                articles={articles}
                agencyOptions={agencyOptions}
                onAddPackages={handleAddPackages}
                departureAgencyId={data.departure_location_id}
                arrivalAgencyId={data.arrival_location_id}
            />
        </>
    );
};

export default BrouteFormModal;