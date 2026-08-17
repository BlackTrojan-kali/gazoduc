import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; 
import Button from '../../ui/button/Button'; 
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLinkSlash, faGasPump } from '@fortawesome/free-solid-svg-icons'; 

/**
 * Modal pour retirer des pistolets (dissocier des citernes) d'une pompe.
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {object|null} pompe - L'objet pompe sélectionné (contient les pistolets liés dans pompe.pistolets).
 */
const PompeCiterneDissociationModal = ({ isOpen, onClose, pompe }) => {
    // Liste des IDs de citernes sélectionnées pour suppression
    const [selectedCiterneIds, setSelectedCiterneIds] = useState([]);
    
    // État du formulaire Inertia
    const { data, setData, post,  inertiaDelete, processing, errors } = useForm({
        citernes_to_dissociate: []
    });

    // ---------------------------------------------
    // 1. Logique d'initialisation
    // ---------------------------------------------
    
    useEffect(() => {
        if (isOpen) {
            setSelectedCiterneIds([]); 
            setData('citernes_to_dissociate', []);
        }
    }, [isOpen, pompe]);

    // Extraction des citernes actuellement liées via les pistolets
    const linkedCiternes = pompe?.pistolets 
        ? pompe.pistolets.map(pistolet => pistolet.citerne).filter(Boolean) 
        : [];

    // ---------------------------------------------
    // 2. Gestion des Checkbox
    // ---------------------------------------------

    const handleCheckboxChange = (id) => {
        const newSelected = selectedCiterneIds.includes(id)
            ? selectedCiterneIds.filter(cId => cId !== id)
            : [...selectedCiterneIds, id];
            
        setSelectedCiterneIds(newSelected);
        setData('citernes_to_dissociate', newSelected);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = linkedCiternes.map(c => c.id);
            setSelectedCiterneIds(allIds);
            setData('citernes_to_dissociate', allIds);
        } else {
            setSelectedCiterneIds([]);
            setData('citernes_to_dissociate', []);
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
            Swal.fire('Attention', 'Veuillez sélectionner au moins un pistolet à retirer.', 'warning');
            return;
        }

        // ATTENTION : Si tu as utilisé Route::delete dans ton web.php (Proposition 2), 
        // change "post(" par "inertiaDelete(". Sinon, garde "post(".
        post(route('pompes.pistolets.destroy', pompe.id), {
            preserveScroll: true,
            data: { // <-- TRÈS IMPORTANT pour une requête DELETE avec Inertia
                citernes_to_dissociate: selectedCiterneIds 
            },
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'Pistolets retirés !',
                    text: `${selectedCiterneIds.length} pistolet(s) supprimé(s) de l'îlot "${pompe.name}".`,
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (validationErrors) => {
                console.error("Erreurs de dissociation:", validationErrors);
                Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression des pistolets.', 'error');
            },
        });
    };

    if (!pompe) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Retirer des Pistolets : ${pompe.name}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-lg text-xs mb-2">
                    Sélectionnez les cuves que vous souhaitez déconnecter de cet îlot. <strong>Attention : Les pistolets correspondants seront physiquement supprimés du système.</strong>
                </div>

                {/* --- Section des Citernes Liées --- */}
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-3 bg-white dark:bg-slate-900">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                        <FontAwesomeIcon icon={faGasPump} />
                        Pistolets actuellement installés ({linkedCiternes.length})
                    </h3>

                    {linkedCiternes.length === 0 ? (
                        <p className="text-slate-500 italic text-sm text-center py-4">
                            Cet îlot n'a actuellement aucun pistolet installé.
                        </p>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded border border-red-100 dark:border-red-900/50">
                            {/* Checkbox "Tout cocher" */}
                            <div className="flex items-center p-3 border-b border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                                <input
                                    type="checkbox"
                                    id="selectAllDissociate"
                                    checked={allChecked}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    ref={input => {
                                        if (input) input.indeterminate = isIndeterminate;
                                    }}
                                    className="w-4 h-4 text-red-600 bg-white border-red-300 rounded focus:ring-red-500 cursor-pointer"
                                />
                                <label htmlFor="selectAllDissociate" className="ml-3 text-sm font-bold text-red-900 dark:text-red-300 cursor-pointer select-none">
                                    Tout sélectionner ({selectedCiterneIds.length} à supprimer)
                                </label>
                            </div>

                            {/* Conteneur défilant des checkboxes */}
                            <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {linkedCiternes.map((citerne) => (
                                    <div 
                                        key={citerne.id} 
                                        className={`flex items-center p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer ${selectedCiterneIds.includes(citerne.id) ? 'bg-red-50 dark:bg-red-900/30' : ''}`}
                                        onClick={() => handleCheckboxChange(citerne.id)}
                                    >
                                        <input
                                            id={`dissociate-citerne-${citerne.id}`}
                                            type="checkbox"
                                            checked={selectedCiterneIds.includes(citerne.id)}
                                            onChange={() => handleCheckboxChange(citerne.id)}
                                            className="w-4 h-4 text-red-600 bg-white border-red-300 rounded focus:ring-red-500 cursor-pointer"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <label 
                                            htmlFor={`dissociate-citerne-${citerne.id}`} 
                                            className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1 select-none flex justify-between items-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-bold">Pistolet relié à :</span>
                                                <span className="text-slate-500">{citerne.name}</span>
                                            </div>
                                            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                                {citerne.product_type}
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mr-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    <Button
                        type="submit"
                        variant="danger" 
                        disabled={processing || linkedCiternes.length === 0 || selectedCiterneIds.length === 0}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Suppression...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faLinkSlash} className="mr-2" />
                                Retirer les Pistolets ({selectedCiterneIds.length})
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PompeCiterneDissociationModal; 