import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Ajustez le chemin
import Button from '../../ui/button/Button'; // Ajustez le chemin
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal pour associer une pompe à une ou plusieurs citernes.
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {object|null} pompe - L'objet pompe sélectionné (contient les cuves déjà liées dans pompe.cuves).
 * @param {Array<{id: number, name: string, product_type: string, agency_id: number}>} allCiternes - Liste de toutes les citernes disponibles.
 */
const PompeCiterneAssociationModal = ({ isOpen, onClose, pompe, allCiternes }) => {
    // Liste des IDs de citernes sélectionnées (à associer)
    const [selectedCiterneIds, setSelectedCiterneIds] = useState([]);
    
    // État du formulaire Inertia pour l'envoi de la requête
    const { post, processing, errors } = useForm({});

    // ---------------------------------------------
    // 1. Logique d'initialisation et de réinitialisation
    // ---------------------------------------------
    
    useEffect(() => {
        if (isOpen) {
            // Réinitialiser les sélections à chaque ouverture
            setSelectedCiterneIds([]); 
        }
    }, [isOpen, pompe]);

    // ---------------------------------------------
    // 2. Filtrage des Citernes (Logique Clé)
    // ---------------------------------------------

    const availableCiternes = useMemo(() => {
        if (!pompe || !allCiternes) return [];
        
        // Liste des IDs des cuves déjà associées à cette pompe
        const associatedIds = pompe.cuves.map(cuve => cuve.id);

        // On filtre : on n'affiche que les citernes qui ne sont PAS déjà associées
        return allCiternes.filter(citerne => {
            // 1. Vérifie si la citerne est déjà associée à la pompe sélectionnée
            const isAssociated = associatedIds.includes(citerne.id);

            // 2. OPTIONNEL: On peut aussi limiter aux citernes de la même agence pour une meilleure cohérence
            const isSameAgency = pompe.agency_id === citerne.agency_id;

            return !isAssociated && isSameAgency;
        });
    }, [pompe, allCiternes]);

    // ---------------------------------------------
    // 3. Gestion des Checkbox
    // ---------------------------------------------

    const handleCheckboxChange = (id) => {
        setSelectedCiterneIds(prevIds => {
            if (prevIds.includes(id)) {
                // Désélectionner
                return prevIds.filter(cId => cId !== id);
            } else {
                // Sélectionner
                return [...prevIds, id];
            }
        });
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            // Sélectionner tous les IDs disponibles
            setSelectedCiterneIds(availableCiternes.map(c => c.id));
        } else {
            // Tout désélectionner
            setSelectedCiterneIds([]);
        }
    };
    
    const allChecked = selectedCiterneIds.length === availableCiternes.length && availableCiternes.length > 0;
    const isIndeterminate = selectedCiterneIds.length > 0 && !allChecked;
    
    // ---------------------------------------------
    // 4. Soumission du Formulaire
    // ---------------------------------------------

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!pompe || selectedCiterneIds.length === 0) {
            Swal.fire('Attention', 'Veuillez sélectionner au moins une citerne à associer.', 'warning');
            return;
        }
        // Inertia POST vers le contrôleur pour l'association
        post(route('pompes.associate-citernes', {pompe:pompe.id,citernes_to_associate: selectedCiterneIds} ), {
            preserveScroll: true,
            // Données à envoyer au contrôleur (un tableau d'IDs de citernes)
            
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'Association réussie !',
                    text: `La pompe "${pompe.name}" a été associée à ${selectedCiterneIds.length} citerne(s).`,
                    showConfirmButton: false,
                    timer: 3000
                });
                // Note: Le contrôleur devra s'assurer de renvoyer la nouvelle liste des pompes
                // ou d'utiliser un 'flash' pour déclencher une actualisation côté client.
            },
            onError: (validationErrors) => {
                console.error("Erreurs d'association:", validationErrors);
                Swal.fire('Erreur', 'Une erreur est survenue lors de l\'association. (Vérifiez la console)', 'error');
            },
        });
    };


    if (!pompe) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Associer des Cuves à la Pompe : ${pompe.name}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Information sur la pompe sélectionnée */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Agence : **{pompe.agency ? pompe.agency.name : 'N/A'}**
                </p>

                {/* --- Section des Citernes --- */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <h3 className="text-md font-semibold mb-2 dark:text-white">Citernes disponibles (non encore liées)</h3>

                    {availableCiternes.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">
                            Toutes les citernes de cette agence sont déjà associées à cette pompe, ou aucune citerne n'est disponible.
                        </p>
                    ) : (
                        <>
                            {/* Checkbox "Tout cocher" */}
                            <div className="flex items-center pb-2 mb-2 border-b border-gray-200 dark:border-gray-700">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={allChecked}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    // Utilisation de l'état indeterminate pour le style
                                    ref={input => {
                                        if (input) input.indeterminate = isIndeterminate;
                                    }}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                />
                                <label htmlFor="selectAll" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                                    Tout Cocher / Décocher ({selectedCiterneIds.length} sélectionné(s))
                                </label>
                            </div>

                            {/* Conteneur défilant des checkboxes */}
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {availableCiternes.map((citerne) => (
                                    <div key={citerne.id} className="flex items-center">
                                        <input
                                            id={`citerne-${citerne.id}`}
                                            type="checkbox"
                                            checked={selectedCiterneIds.includes(citerne.id)}
                                            onChange={() => handleCheckboxChange(citerne.id)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                        />
                                        <label 
                                            htmlFor={`citerne-${citerne.id}`} 
                                            className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                        >
                                            **{citerne.name}** ({citerne.product_type})
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing || availableCiternes.length === 0}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Association...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Associer les Citernes ({selectedCiterneIds.length})
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PompeCiterneAssociationModal;