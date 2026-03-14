import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; // Ajustez le chemin vers votre composant Modal
import Button from '../../../ui/button/Button'; // Ajustez le chemin vers votre composant Button
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faPlus } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal pour créer ou modifier un type d'emballage (format de bouteille).
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {object|null} cylinderType - L'objet type sélectionné (null si mode création).
 */
const CylinderTypeModal = ({ isOpen, onClose, cylinderType = null }) => {
    // Initialisation du formulaire Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        water_capacity_liters: '',
        working_pressure_bars: '',
        description: '',
    });

    // ---------------------------------------------
    // 1. Logique d'initialisation et de réinitialisation
    // ---------------------------------------------
    useEffect(() => {
        if (isOpen) {
            if (cylinderType) {
                // Mode Édition : Remplissage des champs
                setData({
                    name: cylinderType.name || '',
                    water_capacity_liters: cylinderType.water_capacity_liters || '',
                    working_pressure_bars: cylinderType.working_pressure_bars || '',
                    description: cylinderType.description || '',
                });
            } else {
                // Mode Création : Remise à zéro
                reset();
            }
            clearErrors();
        }
    }, [isOpen, cylinderType]);

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
                    title: cylinderType ? 'Mise à jour réussie !' : 'Création réussie !',
                    text: cylinderType 
                        ? `Le format "${data.name}" a été mis à jour.` 
                        : `Le format "${data.name}" a été ajouté avec succès.`,
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (validationErrors) => {
                console.error("Erreurs de validation:", validationErrors);
                Swal.fire('Erreur de validation', 'Veuillez vérifier les champs du formulaire.', 'error');
            },
        };

        if (cylinderType) {
            put(route('cylinder-types.update', cylinderType.id), requestOptions);
        } else {
            post(route('cylinder-types.store'), requestOptions);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={cylinderType ? `Modifier le format : ${cylinderType.name}` : 'Ajouter un format de bouteille'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* --- Section des Champs du Formulaire --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Nom du Format */}
                    <div className="sm:col-span-2">
                        <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nom du format <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: B50, B20, B10..."
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                    </div>

                    {/* Capacité en eau (Litres) */}
                    <div>
                        <label htmlFor="water_capacity_liters" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Capacité en eau (Litres) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="water_capacity_liters"
                            step="0.1"
                            min="0.1"
                            value={data.water_capacity_liters}
                            onChange={(e) => setData('water_capacity_liters', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.water_capacity_liters ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: 50"
                            required
                        />
                        {errors.water_capacity_liters && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.water_capacity_liters}</p>}
                    </div>

                    {/* Pression de service (Bars) */}
                    <div>
                        <label htmlFor="working_pressure_bars" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Pression de service (Bars) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="working_pressure_bars"
                            step="1"
                            min="1"
                            value={data.working_pressure_bars}
                            onChange={(e) => setData('working_pressure_bars', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.working_pressure_bars ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: 200"
                            required
                        />
                        {errors.working_pressure_bars && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.working_pressure_bars}</p>}
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                        <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description technique
                        </label>
                        <textarea
                            id="description"
                            rows="2"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.description ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Notes éventuelles..."
                        ></textarea>
                        {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
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
                                {cylinderType ? 'Mise à jour...' : 'Enregistrement...'}
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={cylinderType ? faSave : faPlus} className="mr-2" />
                                {cylinderType ? 'Mettre à jour' : 'Ajouter le format'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CylinderTypeModal;