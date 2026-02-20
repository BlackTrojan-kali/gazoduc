// resources/js/components/Modals/Vehicles/VehicleModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Select from 'react-select'; // IMPORTANT : npm install react-select
import Modal from '../Modal';
import Form from '../../form/Form';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faGasPump, faTruck, faSatelliteDish } from '@fortawesome/free-solid-svg-icons';

/**
 * Styles personnalisés pour React-Select afin de coller au thème Tailwind (Dark/Light)
 */
const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: 'var(--bg-input)', // Adapter selon votre config CSS ou laisser blanc/gris
        borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', // Blue-500 ou Gray-300
        padding: '2px',
        borderRadius: '0.375rem', // rounded-md
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : null,
        '&:hover': { borderColor: '#3b82f6' }
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999, // S'assurer que le menu passe au-dessus de tout
    }),
    // Optionnel : Gestion simplifiée du dark mode via JS si nécessaire
    // Si vous avez un contexte de thème, utilisez-le ici.
};

const VehicleFormModal = ({ isOpen, onClose, vehicle, routeName, gpsDevices = [] }) => {
    
    // Transformation des gpsDevices pour React-Select
    const gpsOptions = gpsDevices.map(device => ({
        value: device.id,
        label: `${device.name || device.imei} (${device.imei})` // Affiche Nom ou IMEI
    }));

    const { data, setData, post, put, processing, errors, reset, recentlySuccessful } = useForm({
        licence_plate: '',
        brand: '',
        type: '',
        capacity_liters: '',
        owner_type: '',
        
        // --- Tracking ---
        gps_device_id: '', // Nouveau champ
        tank_capacity: '',
        theft_threshold_percentage: '',
        fuel_type: '',
    });

    // --- Options pour les Selects ---
    const vehicleTypeOptions = [
        { value: 'Camion-citerne', label: 'Camion-citerne' },
        { value: 'Camion-plateau', label: 'Camion-plateau' },
        { value: 'Tracteur Routier', label: 'Tracteur Routier' },
        { value: 'Fourgon', label: 'Fourgon' },
        { value: 'Utilitaire', label: 'Véhicule utilitaire' },
        { value: 'Pickup', label: 'Pickup 4x4' },
        { value: 'Moto', label: 'Moto' },
        { value: 'Engin', label: 'Engin de chantier' },
        { value: 'Autre', label: 'Autre' },
    ];

    const ownerTypeOptions = [
        { value: 'Propre', label: 'Propre à l\'entreprise' },
        { value: 'Location', label: 'En location' },
        { value: 'Tiers', label: 'Appartient à un tiers' },
    ];

    const fuelTypeOptions = [
        { value: 'Diesel', label: 'Diesel (Gasoil)' },
        { value: 'Essence', label: 'Essence (Super)' },
        { value: 'Hybride', label: 'Hybride' },
        { value: 'Electrique', label: 'Électrique' },
    ];

    // --- Initialisation ---
    useEffect(() => {
        if (isOpen) {
            if (vehicle) {
                setData({
                    licence_plate: vehicle.licence_plate || '',
                    brand: vehicle.brand || '',
                    type: vehicle.type || '',
                    capacity_liters: vehicle.capacity_liters || '',
                    owner_type: vehicle.owner_type || '',
                    
                    // Tracking
                    gps_device_id: vehicle.gps_device_id || '', // Nullable
                    tank_capacity: vehicle.tank_capacity || '',
                    theft_threshold_percentage: vehicle.theft_threshold_percentage || '',
                    fuel_type: vehicle.fuel_type || '',
                });
            } else {
                reset();
            }
        }
    }, [isOpen, vehicle, reset, setData]);

    useEffect(() => {
        if (recentlySuccessful) {
            reset();
            onClose();
        }
    }, [recentlySuccessful, reset, onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Routes Ziggy
        if (vehicle) {
            put(route(routeName, vehicle.id), { preserveScroll: true });
        } else {
            post(route(routeName), { preserveScroll: true });
        }
    };

    // Helper pour trouver l'objet {value, label} actuel pour React-Select
    const getValue = (options, val) => {
        return options.find(o => o.value === val) || null;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={vehicle ? "Modifier le Véhicule" : "Créer un Nouveau Véhicule"}>
            <Form onSubmit={handleSubmit} className="space-y-5">
                
                {/* === SECTION 1 : INFORMATIONS GÉNÉRALES === */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faTruck} /> Informations Générales
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Immatriculation */}
                        <div>
                            <Label htmlFor="vehicle-licence_plate">Immatriculation <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                id="vehicle-licence_plate"
                                value={data.licence_plate}
                                onChange={(e) => setData('licence_plate', e.target.value)}
                                disabled={processing}
                                error={!!errors.licence_plate}
                                hint={errors.licence_plate}
                                placeholder="Ex: LT-123-AB"
                                required
                            />
                        </div>

                        {/* Marque */}
                        <div>
                            <Label htmlFor="brand">Marque <span className="text-red-500">*</span></Label>
                            <Input
                                type="text"
                                id="brand"
                                value={data.brand}
                                onChange={(e) => setData('brand', e.target.value)}
                                disabled={processing}
                                error={!!errors.brand}
                                hint={errors.brand}
                                placeholder="Ex: Toyota"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Type de Véhicule (React-Select) */}
                        <div>
                            <Label>Type de Véhicule <span className="text-red-500">*</span></Label>
                            <Select
                                options={vehicleTypeOptions}
                                value={getValue(vehicleTypeOptions, data.type)}
                                onChange={(val) => setData('type', val ? val.value : '')}
                                isDisabled={processing}
                                styles={customSelectStyles}
                                placeholder="Sélectionner..."
                                isClearable
                            />
                            {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                        </div>

                        {/* Propriétaire (React-Select) */}
                        <div>
                            <Label>Propriétaire <span className="text-red-500">*</span></Label>
                            <Select
                                options={ownerTypeOptions}
                                value={getValue(ownerTypeOptions, data.owner_type)}
                                onChange={(val) => setData('owner_type', val ? val.value : '')}
                                isDisabled={processing}
                                styles={customSelectStyles}
                                placeholder="Sélectionner..."
                            />
                            {errors.owner_type && <div className="text-red-500 text-sm mt-1">{errors.owner_type}</div>}
                        </div>
                    </div>

                    {/* Capacité Chargement */}
                    <div>
                        <Label>Capacité de Chargement (Marchandise)</Label>
                        <div className="flex items-center">
                            <Input
                                type="number"
                                value={data.capacity_liters}
                                onChange={(e) => setData('capacity_liters', e.target.value)}
                                disabled={processing}
                                error={!!errors.capacity_liters}
                                min="0"
                                step="any"
                                placeholder="Optionnel"
                            />
                            <span className="ml-2 text-gray-500 text-sm">Litres</span>
                        </div>
                    </div>
                </div>

                {/* === SECTION 2 : TRACKING & CARBURANT === */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-bold text-gray-500 uppercase border-b pb-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faGasPump} /> Tracking & Carburant
                    </h3>

                    {/* Champ GPS Device (React-Select) - TRES IMPORTANT */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800">
                        <Label className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                            <FontAwesomeIcon icon={faSatelliteDish} /> Boîtier GPS Associé
                        </Label>
                        <Select
                            options={gpsOptions}
                            value={getValue(gpsOptions, data.gps_device_id)}
                            onChange={(val) => setData('gps_device_id', val ? val.value : '')}
                            isDisabled={processing}
                            styles={customSelectStyles}
                            placeholder="Rechercher un boîtier (IMEI ou Nom)..."
                            isClearable // Permet de dissocier un GPS (nullable)
                            noOptionsMessage={() => "Aucun boîtier disponible"}
                        />
                         {errors.gps_device_id && <div className="text-red-500 text-sm mt-1">{errors.gps_device_id}</div>}
                         <p className="text-xs text-gray-500 mt-1">Laissez vide si le véhicule n'a pas encore de tracker.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Type Carburant (React-Select) */}
                        <div className="md:col-span-1">
                            <Label>Carburant</Label>
                            <Select
                                options={fuelTypeOptions}
                                value={getValue(fuelTypeOptions, data.fuel_type)}
                                onChange={(val) => setData('fuel_type', val ? val.value : '')}
                                isDisabled={processing}
                                styles={customSelectStyles}
                                placeholder="Type..."
                                isClearable
                            />
                            {errors.fuel_type && <div className="text-red-500 text-sm mt-1">{errors.fuel_type}</div>}
                        </div>

                        {/* Réservoir Moteur */}
                        <div className="md:col-span-1">
                            <Label>Réservoir Moteur</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={data.tank_capacity}
                                    onChange={(e) => setData('tank_capacity', e.target.value)}
                                    disabled={processing}
                                    error={!!errors.tank_capacity}
                                    min="0"
                                    step="0.1"
                                    placeholder="Ex: 400"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">L</div>
                            </div>
                        </div>

                        {/* Seuil Alerte */}
                        <div className="md:col-span-1">
                            <Label>Seuil Vol</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={data.theft_threshold_percentage}
                                    onChange={(e) => setData('theft_threshold_percentage', e.target.value)}
                                    disabled={processing}
                                    error={!!errors.theft_threshold_percentage}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="Ex: 5"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        className="text-red-500 font-bold uppercase px-6 py-2 text-sm mr-2 hover:bg-red-50 rounded transition"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? (
                            <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Traitement...</>
                        ) : (
                            vehicle ? 'Enregistrer' : 'Créer'
                        )}
                    </button>
                </div>
            </Form>
        </Modal>
    );
};

export default VehicleFormModal;