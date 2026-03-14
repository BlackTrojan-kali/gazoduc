import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; // Ajustez le chemin vers votre composant Modal
import Button from '../../../ui/button/Button'; // Ajustez le chemin vers votre composant Button
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faPlus } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal pour créer ou modifier une bouteille de gaz (Cylinder).
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {object|null} cylinder - L'objet bouteille sélectionné (null si mode création).
 * @param {Array} cylinderTypes - Liste des formats d'emballages.
 * @param {Array} agencies - Liste des agences/sites.
 * @param {Array} gases - Liste des gaz disponibles.
 */
const CylinderModal = ({ isOpen, onClose, cylinder = null, cylinderTypes = [], agencies = [], gases = [] }) => {
    // Initialisation du formulaire Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        serial_number: '',
        barcode: '',
        cylinder_type_id: '',
        current_agency_id: '', // NOUVEAU
        gas_id: '',            // NOUVEAU
        tare_weight: '',
        last_test_date: '',
        status: 'Vide_Usine', // Une nouvelle bouteille entre souvent vide
    });

    // ---------------------------------------------
    // 1. Logique d'initialisation et de réinitialisation
    // ---------------------------------------------
    useEffect(() => {
        if (isOpen) {
            if (cylinder) {
                // Formatage de la date pour le champ <input type="date"> (YYYY-MM-DD)
                const formattedDate = cylinder.last_test_date 
                    ? new Date(cylinder.last_test_date).toISOString().split('T')[0] 
                    : '';

                // Mode Édition : Remplissage des champs
                setData({
                    serial_number: cylinder.serial_number || '',
                    barcode: cylinder.barcode || '',
                    cylinder_type_id: cylinder.cylinder_type_id || '',
                    current_agency_id: cylinder.current_agency_id || '', // NOUVEAU
                    gas_id: cylinder.gas_id || '',                       // NOUVEAU
                    tare_weight: cylinder.tare_weight || '',
                    last_test_date: formattedDate,
                    status: cylinder.status || 'Vide_Usine',
                });
            } else {
                // Mode Création : Remise à zéro
                reset();
                // Sélections par défaut pour faire gagner du temps s'il n'y a qu'un seul choix
                if (cylinderTypes.length === 1) setData('cylinder_type_id', cylinderTypes[0].id);
                if (agencies.length === 1) setData('current_agency_id', agencies[0].id);
                if (gases.length === 1) setData('gas_id', gases[0].id);
            }
            clearErrors();
        }
    }, [isOpen, cylinder, cylinderTypes, agencies, gases]);

    // ---------------------------------------------
    // 2. Soumission du Formulaire
    // ---------------------------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        const requestOptions = {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: cylinder ? 'Bouteille mise à jour !' : 'Bouteille ajoutée !',
                    text: cylinder 
                        ? `Les paramètres de la bouteille N° ${data.serial_number} ont été mis à jour.` 
                        : `La bouteille N° ${data.serial_number} a été enregistrée dans le parc.`,
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (validationErrors) => {
                console.error("Erreurs de validation:", validationErrors);
                Swal.fire('Erreur de saisie', 'Veuillez vérifier les champs signalés en rouge.', 'error');
            },
        };

        if (cylinder) {
            put(route('cylinders.update', cylinder.id), requestOptions);
        } else {
            post(route('cylinders.store'), requestOptions);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={cylinder ? `Modifier la bouteille : ${cylinder.serial_number}` : 'Enregistrer une nouvelle bouteille'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* --- Section 1 : Traçabilité --- */}
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b dark:border-gray-700 pb-1">
                    Traçabilité & Identification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Numéro de Série */}
                    <div>
                        <label htmlFor="serial_number" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            N° de Série gravé <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="serial_number"
                            value={data.serial_number}
                            onChange={(e) => setData('serial_number', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.serial_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: SN-2026-8945"
                            required
                        />
                        {errors.serial_number && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.serial_number}</p>}
                    </div>

                    {/* Code Barres / QR */}
                    <div>
                        <label htmlFor="barcode" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Code-barres / Tag RFID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="barcode"
                            value={data.barcode}
                            onChange={(e) => setData('barcode', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.barcode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Scanner le code ici..."
                            required
                        />
                        {errors.barcode && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.barcode}</p>}
                    </div>

                    {/* Format / Type d'emballage */}
                    <div className="sm:col-span-2">
                        <label htmlFor="cylinder_type_id" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Format de la bouteille <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="cylinder_type_id"
                            value={data.cylinder_type_id}
                            onChange={(e) => setData('cylinder_type_id', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.cylinder_type_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            required
                        >
                            <option value="">-- Sélectionner un format (ex: B50, B20) --</option>
                            {cylinderTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name} ({type.water_capacity_liters}L - {type.working_pressure_bars} Bars)
                                </option>
                            ))}
                        </select>
                        {errors.cylinder_type_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cylinder_type_id}</p>}
                    </div>
                </div>

                {/* --- NOUVEAU : Section Affectation (Multi-site & Gaz) --- */}
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 border-b dark:border-gray-700 pb-1">
                    Affectation Industrielle
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Affectation Gaz */}
                    <div>
                        <label htmlFor="gas_id" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gaz Exclusif Affecté
                        </label>
                        <select
                            id="gas_id"
                            value={data.gas_id}
                            onChange={(e) => setData('gas_id', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.gas_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            <option value="">-- Aucun / Mixte --</option>
                            {gases.map((gas) => (
                                <option key={gas.id} value={gas.id}>{gas.name}</option>
                            ))}
                        </select>
                        {errors.gas_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gas_id}</p>}
                    </div>

                    {/* Agence / Site */}
                    <div>
                        <label htmlFor="current_agency_id" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Site / Agence Actuelle
                        </label>
                        <select
                            id="current_agency_id"
                            value={data.current_agency_id}
                            onChange={(e) => setData('current_agency_id', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.current_agency_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        >
                            <option value="">-- Non Assignée (En transit/Client) --</option>
                            {agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>{agency.name}</option>
                            ))}
                        </select>
                        {errors.current_agency_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.current_agency_id}</p>}
                    </div>
                </div>

                {/* --- Section 2 : Caractéristiques physiques & Statut --- */}
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 border-b dark:border-gray-700 pb-1">
                    Données Techniques & Statut
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Poids Tare */}
                    <div>
                        <label htmlFor="tare_weight" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tare de la bouteille (Kg) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="tare_weight"
                            step="0.01"
                            min="1"
                            value={data.tare_weight}
                            onChange={(e) => setData('tare_weight', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.tare_weight ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: 52.5"
                            required
                        />
                        {errors.tare_weight && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tare_weight}</p>}
                    </div>

                    {/* Date d'épreuve (Test) */}
                    <div>
                        <label htmlFor="last_test_date" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Date de dernière épreuve <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="last_test_date"
                            value={data.last_test_date}
                            onChange={(e) => setData('last_test_date', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.last_test_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            required
                        />
                        {errors.last_test_date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_test_date}</p>}
                    </div>

                    {/* Statut Physique Actuel */}
                    <div className="sm:col-span-2">
                        <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Statut physique actuel <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="Vide_Usine">Vide à l'usine centrale</option>
                            <option value="Pleine_Usine">Pleine à l'usine (Prête expédition)</option>
                            <option value="Pleine_Agence">Pleine en Agence (Stock local)</option>
                            <option value="En_Transit">En Transit (Camion)</option>
                            <option value="Chez_Client">Chez le Client (Consignée)</option>
                            <option value="En_Maintenance">En Maintenance (Contrôle / Peinture)</option>
                            <option value="Rebut">Rebut (Détruite / Réformée)</option>
                        </select>
                        {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
                    </div>
                </div>

                {/* --- Boutons d'action --- */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={cylinder ? faSave : faPlus} className="mr-2" />
                                {cylinder ? 'Mettre à jour' : 'Enregistrer la bouteille'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CylinderModal;