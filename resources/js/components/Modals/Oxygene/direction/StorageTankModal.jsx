import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; // Ajustez le chemin vers votre composant Modal
import Button from '../../../ui/button/Button'; // Ajustez le chemin vers votre composant Button
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faPlus } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal pour créer ou modifier une cuve (Storage Tank).
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {object|null} storageTank - L'objet cuve sélectionné (null si mode création).
 * @param {Array} gases - Liste des gaz disponibles pour le select.
 * @param {Array} agencies - Liste des agences (sites) disponibles pour le select.
 */
const StorageTankModal = ({ isOpen, onClose, storageTank = null, gases = [], agencies = [] }) => {
    // Initialisation du formulaire Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        reference_code: '',
        agency_id: '',
        gas_id: '',
        status: 'Operationnelle', // Statut par défaut
        max_capacity: '',
        current_volume: '',
        safe_minimum_level: '',
    });

    // ---------------------------------------------
    // 1. Logique d'initialisation et de réinitialisation
    // ---------------------------------------------
    useEffect(() => {
        if (isOpen) {
            if (storageTank) {
                // Mode Édition : Remplissage des champs
                setData({
                    reference_code: storageTank.reference_code || '',
                    agency_id: storageTank.agency_id || '',
                    gas_id: storageTank.gas_id || '',
                    status: storageTank.status || 'Operationnelle',
                    max_capacity: storageTank.max_capacity || '',
                    current_volume: storageTank.current_volume || '',
                    safe_minimum_level: storageTank.safe_minimum_level || '',
                });
            } else {
                // Mode Création : Remise à zéro
                reset();
                // Si une seule agence existe, on la sélectionne par défaut pour faire gagner du temps
                if (agencies.length === 1) {
                    setData('agency_id', agencies[0].id);
                }
            }
            clearErrors();
        }
    }, [isOpen, storageTank, agencies]);

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
                    title: storageTank ? 'Cuve mise à jour !' : 'Cuve ajoutée !',
                    text: storageTank 
                        ? `Les paramètres de la cuve "${data.reference_code}" ont été mis à jour.` 
                        : `La nouvelle cuve "${data.reference_code}" a été enregistrée.`,
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (validationErrors) => {
                console.error("Erreurs de validation:", validationErrors);
                Swal.fire('Erreur de saisie', 'Veuillez vérifier les champs en rouge.', 'error');
            },
        };

        if (storageTank) {
            put(route('storage-tanks.update', storageTank.id), requestOptions);
        } else {
            post(route('storage-tanks.store'), requestOptions);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={storageTank ? `Modifier la cuve : ${storageTank.reference_code}` : 'Ajouter une nouvelle cuve'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* --- Section 1 : Identification --- */}
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b dark:border-gray-700 pb-1">
                    Identification & Localisation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Code de Référence */}
                    <div>
                        <label htmlFor="reference_code" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Code de référence <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="reference_code"
                            value={data.reference_code}
                            onChange={(e) => setData('reference_code', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.reference_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: CUV-OXY-01"
                            required
                        />
                        {errors.reference_code && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reference_code}</p>}
                    </div>

                    {/* Statut */}
                    <div>
                        <label htmlFor="status" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Statut opérationnel <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="Operationnelle">Opérationnelle</option>
                            <option value="En_Maintenance">En Maintenance</option>
                            <option value="Hors_Service">Hors Service</option>
                        </select>
                        {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
                    </div>

                    {/* Agence (Site) */}
                    <div>
                        <label htmlFor="agency_id" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Site / Agence <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="agency_id"
                            value={data.agency_id}
                            onChange={(e) => setData('agency_id', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.agency_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            required
                        >
                            <option value="">-- Sélectionner une agence --</option>
                            {agencies.map((agency) => (
                                <option key={agency.id} value={agency.id}>{agency.name}</option>
                            ))}
                        </select>
                        {errors.agency_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.agency_id}</p>}
                    </div>

                    {/* Type de Gaz */}
                    <div>
                        <label htmlFor="gas_id" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type de Gaz stocké <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="gas_id"
                            value={data.gas_id}
                            onChange={(e) => setData('gas_id', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.gas_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            required
                        >
                            <option value="">-- Sélectionner un gaz --</option>
                            {gases.map((gas) => (
                                <option key={gas.id} value={gas.id}>{gas.name}</option>
                            ))}
                        </select>
                        {errors.gas_id && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gas_id}</p>}
                    </div>
                </div>

                {/* --- Section 2 : Volumes et Niveaux --- */}
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-4 border-b dark:border-gray-700 pb-1">
                    Volumes & Capacités
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Capacité Maximale */}
                    <div>
                        <label htmlFor="max_capacity" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Capacité Max. <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="max_capacity"
                            step="0.01"
                            min="1"
                            value={data.max_capacity}
                            onChange={(e) => setData('max_capacity', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.max_capacity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: 10000"
                            required
                        />
                        {errors.max_capacity && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.max_capacity}</p>}
                    </div>

                    {/* Volume Actuel */}
                    <div>
                        <label htmlFor="current_volume" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Volume Actuel <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="current_volume"
                            step="0.01"
                            min="0"
                            value={data.current_volume}
                            onChange={(e) => setData('current_volume', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.current_volume ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: 5000"
                            required
                        />
                        {errors.current_volume && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.current_volume}</p>}
                    </div>

                    {/* Seuil de Sécurité */}
                    <div>
                        <label htmlFor="safe_minimum_level" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Seuil d'alerte <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="safe_minimum_level"
                            step="0.01"
                            min="0"
                            value={data.safe_minimum_level}
                            onChange={(e) => setData('safe_minimum_level', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.safe_minimum_level ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: 1500"
                            required
                        />
                        {errors.safe_minimum_level && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.safe_minimum_level}</p>}
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
                                <FontAwesomeIcon icon={storageTank ? faSave : faPlus} className="mr-2" />
                                {storageTank ? 'Mettre à jour' : 'Ajouter la cuve'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default StorageTankModal;