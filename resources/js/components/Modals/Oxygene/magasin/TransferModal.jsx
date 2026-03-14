import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Select from 'react-select';
import Modal from '../../Modal'; 
import Button from '../../../ui/button/Button'; 
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTruckFast, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const TransferModal = ({ isOpen, onClose, agencies = [], vehicules = [], drivers = [], cylinderTypes = [], availableCylinders = [] }) => {
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        destination_agency_id: '',
        vehicule_id: '',
        driver_id: '',
        notes: '',
        selection_mode: 'auto',
        auto_type_id: '',
        auto_state: 'Pleine_Usine',
        auto_quantity: '',
        manual_cylinders: [], 
    });

    const [selectedCylindersDetails, setSelectedCylindersDetails] = useState([]);

    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setSelectedCylindersDetails([]);
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.selection_mode === 'manual' && data.manual_cylinders.length === 0) {
            Swal.fire('Sélection vide', 'Veuillez sélectionner au moins une bouteille pour le transfert.', 'warning');
            return;
        }

        post(route('mag-med.dispatch.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                onClose();
                const successMsg = page.props.flash?.success || 'Le transfert a été validé et le camion est en route.';
                Swal.fire({
                    icon: 'success',
                    title: 'Départ confirmé !',
                    text: successMsg,
                    showConfirmButton: true,
                    confirmButtonColor: '#0d9488'
                });
            },
            onError: (validationErrors) => {
                if (validationErrors.error) {
                    Swal.fire('Erreur de stock', validationErrors.error, 'error');
                } else {
                    Swal.fire('Erreur de saisie', 'Veuillez vérifier les champs signalés en rouge.', 'error');
                }
            },
        });
    };

    // --- 1. PRÉPARATION DES OPTIONS POUR REACT-SELECT ---
    
    const agencyOptions = agencies.map(a => ({ value: a.id, label: a.name }));
    const vehiculeOptions = vehicules.map(v => ({ value: v.id, label: `${v.licence_plate} (${v.brand})` }));
    const driverOptions = drivers.map(d => ({ value: d.id, label: `${d.first_name} ${d.last_name}` }));
    const typeOptions = cylinderTypes.map(t => ({ value: t.id, label: t.name }));
    
    const stateOptions = [
        { value: 'Pleine_Usine', label: "Pleine à l'usine" },
        { value: 'Vide_Usine', label: "Vide à l'usine" },
        { value: 'Pleine_Agence', label: "Pleine en Agence" },
        { value: 'En_Maintenance', label: "En Maintenance" }
    ];

    const cylinderOptions = availableCylinders.map(cyl => ({
        value: cyl.id,
        label: `[${cyl.barcode}] ${cyl.serial_number} - ${cyl.status.replace('_', ' ')}`,
        cylinderInfo: cyl 
    }));

    // --- 2. GESTION DES CHANGEMENTS DE REACT-SELECT ---

    // Gère le multiselect manuel de manière contrôlée
    const handleManualSelection = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
        setData('manual_cylinders', selectedIds);
        
        const details = selectedOptions ? selectedOptions.map(opt => opt.cylinderInfo) : [];
        setSelectedCylindersDetails(details);
    };

    // --- 3. STYLES CORRIGÉS POUR LA MODALE ---
    // On force un z-index extrême pour que le menu de React-Select passe TOUJOURS au-dessus de la modale
    const customSelectStyles = {
        menuPortal: base => ({ ...base, zIndex: 99999999 }),
        control: (base, state) => ({ 
            ...base, 
            minHeight: '42px', 
            borderRadius: '0.5rem',
            borderColor: state.isFocused ? '#0d9488' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #0d9488' : 'none',
            '&:hover': { borderColor: '#0d9488' }
        })
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Nouveau transfert inter-agences"
            maxWidth="5xl" 
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex flex-col lg:flex-row gap-8 flex-1">
                    
                    {/* --- COLONNE DE GAUCHE : Formulaire --- */}
                    <div className={`flex-1 space-y-5 transition-all ${data.selection_mode === 'manual' ? 'lg:w-1/2' : 'w-full'}`}>
                        
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 border-b dark:border-gray-700 pb-1">
                                Informations de Transport
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                
                                {/* React-Select : Destination */}
                                <div className="sm:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Agence de destination <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={agencyOptions}
                                        value={agencyOptions.find(opt => opt.value === data.destination_agency_id) || null}
                                        onChange={(opt) => setData('destination_agency_id', opt ? opt.value : '')}
                                        placeholder="Rechercher une agence..."
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        isClearable
                                    />
                                    {errors.destination_agency_id && <p className="mt-1 text-xs text-red-600">{errors.destination_agency_id}</p>}
                                </div>

                                {/* React-Select : Véhicule */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Véhicule affecté <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={vehiculeOptions}
                                        value={vehiculeOptions.find(opt => opt.value === data.vehicule_id) || null}
                                        onChange={(opt) => setData('vehicule_id', opt ? opt.value : '')}
                                        placeholder="Camion..."
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        isClearable
                                    />
                                    {errors.vehicule_id && <p className="mt-1 text-xs text-red-600">{errors.vehicule_id}</p>}
                                </div>

                                {/* React-Select : Chauffeur */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Chauffeur <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={driverOptions}
                                        value={driverOptions.find(opt => opt.value === data.driver_id) || null}
                                        onChange={(opt) => setData('driver_id', opt ? opt.value : '')}
                                        placeholder="Chauffeur..."
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        isClearable
                                    />
                                    {errors.driver_id && <p className="mt-1 text-xs text-red-600">{errors.driver_id}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Notes ou instructions (Optionnel)
                                    </label>
                                    <textarea
                                        rows="2"
                                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                                        placeholder="Ex: Attention au déchargement..."
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-2 border-b dark:border-gray-700 pb-1">
                                Chargement du camion
                            </h4>
                            
                            <div className="flex gap-4 mb-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" className="form-radio text-teal-600 focus:ring-teal-500" value="auto" checked={data.selection_mode === 'auto'} onChange={() => setData('selection_mode', 'auto')} />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Sélection Automatique</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" className="form-radio text-teal-600 focus:ring-teal-500" value="manual" checked={data.selection_mode === 'manual'} onChange={() => setData('selection_mode', 'manual')} />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Sélection Manuelle</span>
                                </label>
                            </div>

                            {/* MODE AUTO */}
                            {data.selection_mode === 'auto' && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-teal-200 bg-teal-50 dark:bg-gray-800 dark:border-teal-800 p-4 rounded-lg">
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Format *</label>
                                        <Select
                                            options={typeOptions}
                                            value={typeOptions.find(opt => opt.value === data.auto_type_id) || null}
                                            onChange={(opt) => setData('auto_type_id', opt ? opt.value : '')}
                                            placeholder="Ex: B12..."
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">État ciblé *</label>
                                        <Select
                                            options={stateOptions}
                                            value={stateOptions.find(opt => opt.value === data.auto_state) || null}
                                            onChange={(opt) => setData('auto_state', opt ? opt.value : '')}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">Quantité *</label>
                                        <input type="number" min="1" className="w-full h-[42px] bg-white border border-gray-300 text-gray-900 text-sm rounded-lg px-3 dark:bg-gray-700 dark:text-white focus:ring-teal-500 focus:border-teal-500 outline-none" value={data.auto_quantity} onChange={e => setData('auto_quantity', e.target.value)} required placeholder="Ex: 50" />
                                    </div>
                                </div>
                            )}

                            {/* MODE MANUEL */}
                            {data.selection_mode === 'manual' && (
                                <div className="border border-blue-200 bg-blue-50 dark:bg-gray-800 dark:border-blue-800 p-4 rounded-lg">
                                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Recherchez et sélectionnez les bouteilles <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        isMulti
                                        name="cylinders"
                                        options={cylinderOptions}
                                        value={cylinderOptions.filter(opt => data.manual_cylinders.includes(opt.value))} // <-- CORRECTION CRUCIALE ICI
                                        className="text-sm react-select-container"
                                        classNamePrefix="select"
                                        placeholder="Taper le code-barres ou N° de série..."
                                        onChange={handleManualSelection}
                                        noOptionsMessage={() => "Aucune bouteille trouvée"}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed" // <-- CORRECTION CRUCIALE ICI (Évite le bug de la modale)
                                        styles={customSelectStyles}
                                    />
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                        <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                        Utilisez votre douchette ou tapez au clavier.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- COLONNE DE DROITE : Liste des bouteilles --- */}
                    {data.selection_mode === 'manual' && (
                        <div className="lg:w-1/2 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-inner">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Aperçu du chargement</h4>
                                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300 shadow-sm">
                                    {selectedCylindersDetails.length} Bouteille(s)
                                </span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-2 min-h-[250px] max-h-[400px]">
                                {selectedCylindersDetails.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-10">
                                        <svg className="w-16 h-16 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <p className="text-sm font-medium">Le camion est vide</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {selectedCylindersDetails.map((cyl, index) => (
                                            <li key={index} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors rounded-md">
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold text-xs">
                                                            {index + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate dark:text-white font-mono">
                                                            {cyl.barcode}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                                                            SN: {cyl.serial_number} <span className="mx-1">•</span> {cyl.cylinder_type ? cyl.cylinder_type.name : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="inline-flex items-center">
                                                        <span className="bg-gray-100 text-gray-800 text-[10px] font-semibold px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-300">
                                                            {cyl.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Boutons d'action --- */}
                <div className="flex justify-end pt-5 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                        className="px-6 shadow-md"
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Création en cours...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faTruckFast} className="mr-2" />
                                Confirmer le départ du camion
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TransferModal;