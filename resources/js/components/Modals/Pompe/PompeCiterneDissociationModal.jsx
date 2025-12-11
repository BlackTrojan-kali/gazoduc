import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Ajustez le chemin
import Button from '../../ui/button/Button'; // Ajustez le chemin
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faMinusCircle, faLinkSlash } from '@fortawesome/free-solid-svg-icons'; // Ajout de faLinkSlash

/**
 * Modal pour DISSOCIER des citernes d'une pompe.
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {object|null} pompe - L'objet pompe sélectionné (DOIT contenir les cuves liées dans pompe.cuves).
 */
const PompeCiterneDissociationModal = ({ isOpen, onClose, pompe }) => {
    // Liste des IDs de citernes sélectionnées (à DISSOCIER)
    const [selectedCiterneIds, setSelectedCiterneIds] = useState([]);
    
    // État du formulaire Inertia
    const { post, processing, errors } = useForm({});

    // ---------------------------------------------
    // 1. Logique d'initialisation et de réinitialisation
    // ---------------------------------------------
    
    useEffect(() => {
        if (isOpen) {
            // Réinitialiser les sélections à chaque ouverture
            setSelectedCiterneIds([]); 
        }
    }, [isOpen]);

    // Les citernes disponibles à la dissociation sont celles déjà liées à la pompe.
    const linkedCiternes = pompe?.cuves || [];

    // ---------------------------------------------
    // 2. Gestion des Checkbox
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
            // Sélectionner tous les IDs liés
            setSelectedCiterneIds(linkedCiternes.map(c => c.id));
        } else {
            // Tout désélectionner
            setSelectedCiterneIds([]);
        }
    };
    
    const allChecked = selectedCiterneIds.length === linkedCiternes.length && linkedCiternes.length > 0;
    const isIndeterminate = selectedCiterneIds.length > 0 && !allChecked;
    
    // ---------------------------------------------
    // 3. Soumission du Formulaire
    // ---------------------------------------------

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!pompe || selectedCiterneIds.length === 0) {
            Swal.fire('Attention', 'Veuillez sélectionner au moins une citerne à dissocier.', 'warning');
            return;
        }

        // Inertia POST (ou DELETE, mais POST avec méthode _method: DELETE est commun) vers le contrôleur
        // Nous allons utiliser un POST vers une nouvelle route de dissociation pour plus de clarté dans le contrôleur.
        post(route('pompes.dissociate-citernes', {pompe:pompe.id,
            citernes_to_dissociate: selectedCiterneIds, }), {
            preserveScroll: true,
            // Données à envoyer au contrôleur (un tableau d'IDs de citernes à retirer)
            
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'Dissociation réussie !',
                    text: `La pompe "${pompe.name}" a été dissociée de ${selectedCiterneIds.length} citerne(s).`,
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (validationErrors) => {
                console.error("Erreurs de dissociation:", validationErrors);
                Swal.fire('Erreur', 'Une erreur est survenue lors de la dissociation. (Vérifiez la console)', 'error');
            },
        });
    };


    if (!pompe) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Dissocier des Cuves de la Pompe : ${pompe.name}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sélectionnez les cuves que vous souhaitez **retirer** de cette pompe.
                </p>

                {/* --- Section des Citernes --- */}
                <div className="border border-red-200 dark:border-red-700 rounded-lg p-3 bg-red-50 dark:bg-red-900/10">
                    <h3 className="text-md font-semibold mb-2 text-red-700 dark:text-red-400">Cuves actuellement liées ({linkedCiternes.length})</h3>

                    {linkedCiternes.length === 0 ? (
                        <p className="text-red-500 italic text-sm">
                            Cette pompe n'est actuellement liée à **aucune** citerne.
                        </p>
                    ) : (
                        <>
                            {/* Checkbox "Tout cocher" */}
                            <div className="flex items-center pb-2 mb-2 border-b border-red-200 dark:border-red-700">
                                <input
                                    type="checkbox"
                                    id="selectAllDissociate"
                                    checked={allChecked}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    ref={input => {
                                        if (input) input.indeterminate = isIndeterminate;
                                    }}
                                    // Style de la checkbox adapté à la dissociation (Rouge)
                                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                />
                                <label htmlFor="selectAllDissociate" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer">
                                    Tout Cocher / Décocher ({selectedCiterneIds.length} sélectionné(s) pour suppression)
                                </label>
                            </div>

                            {/* Conteneur défilant des checkboxes */}
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {linkedCiternes.map((citerne) => (
                                    <div key={citerne.id} className="flex items-center">
                                        <input
                                            id={`dissociate-citerne-${citerne.id}`}
                                            type="checkbox"
                                            checked={selectedCiterneIds.includes(citerne.id)}
                                            onChange={() => handleCheckboxChange(citerne.id)}
                                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                        />
                                        <label 
                                            htmlFor={`dissociate-citerne-${citerne.id}`} 
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
                        variant="danger" // Utilisation d'un style "danger" pour la dissociation
                        disabled={processing || linkedCiternes.length === 0 || selectedCiterneIds.length === 0}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Dissociation...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faLinkSlash} className="mr-2" />
                                Dissocier ({selectedCiterneIds.length})
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PompeCiterneDissociationModal;