import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; // Ajustez le chemin vers votre composant Modal
import Button from '../../../ui/button/Button'; // Ajustez le chemin vers votre composant Button
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faPlus } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal pour créer ou modifier un gaz dans le catalogue.
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {object|null} gas - L'objet gaz sélectionné (null si mode création).
 */
const GasModal = ({ isOpen, onClose, gas = null }) => {
    // Initialisation du formulaire Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        category: 'Industriel', // Valeur par défaut
        un_code: '',
        description: '',
    });

    // ---------------------------------------------
    // 1. Logique d'initialisation et de réinitialisation
    // ---------------------------------------------
    useEffect(() => {
        if (isOpen) {
            if (gas) {
                // Mode Édition : Remplissage des champs avec les données existantes
                setData({
                    name: gas.name || '',
                    category: gas.category || 'Industriel',
                    un_code: gas.un_code || '',
                    description: gas.description || '',
                });
            } else {
                // Mode Création : Remise à zéro
                reset();
            }
            clearErrors();
        }
    }, [isOpen, gas]);

    // ---------------------------------------------
    // 2. Soumission du Formulaire
    // ---------------------------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        // Options communes pour les requêtes Inertia
        const requestOptions = {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: gas ? 'Mise à jour réussie !' : 'Création réussie !',
                    text: gas ? `Le gaz "${data.name}" a été mis à jour.` : `Le gaz "${data.name}" a été ajouté au catalogue.`,
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (validationErrors) => {
                console.error("Erreurs de validation:", validationErrors);
                // On affiche une alerte globale si des erreurs existent
                Swal.fire('Erreur de validation', 'Veuillez vérifier les champs du formulaire.', 'error');
            },
        };

        if (gas) {
            // Requête PUT pour la modification
            put(route('gases.update', gas.id), requestOptions);
        } else {
            // Requête POST pour la création
            post(route('gases.store'), requestOptions);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={gas ? `Modifier le Gaz : ${gas.name}` : 'Ajouter un nouveau Gaz'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* --- Section des Champs du Formulaire --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Nom du Gaz */}
                    <div className="sm:col-span-2">
                        <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nom du gaz <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: Oxygène, Azote liquide..."
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                    </div>

                    {/* Catégorie */}
                    <div>
                        <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Catégorie <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="Industriel">Industriel</option>
                            <option value="Médical">Médical</option>
                            <option value="Alimentaire">Alimentaire</option>
                            <option value="Spécial">Spécial</option>
                        </select>
                        {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
                    </div>

                    {/* Code ONU */}
                    <div>
                        <label htmlFor="un_code" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Code ONU
                        </label>
                        <input
                            type="text"
                            id="un_code"
                            value={data.un_code}
                            onChange={(e) => setData('un_code', e.target.value)}
                            className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:text-white ${errors.un_code ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            placeholder="Ex: 1072"
                        />
                        {errors.un_code && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.un_code}</p>}
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                        <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description technique
                        </label>
                        <textarea
                            id="description"
                            rows="3"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Informations supplémentaires, consignes de sécurité..."
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
                    
                    {/* Utilisation de votre composant Button personnalisé */}
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                {gas ? 'Mise à jour...' : 'Enregistrement...'}
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={gas ? faSave : faPlus} className="mr-2" />
                                {gas ? 'Mettre à jour' : 'Ajouter le gaz'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default GasModal;