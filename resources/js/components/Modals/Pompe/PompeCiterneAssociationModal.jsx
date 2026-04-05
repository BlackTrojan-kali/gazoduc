import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; 
import Button from '../../ui/button/Button'; 
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faPlug } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal pour créer des pistolets sur une pompe en la reliant à des citernes.
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {object|null} pompe - L'objet pompe sélectionné (contient les pistolets dans pompe.pistolets).
 * @param {Array<{id: number, name: string, product_type: string, agency_id: number}>} allCiternes - Liste de toutes les citernes disponibles.
 */
const PompeCiterneAssociationModal = ({ isOpen, onClose, pompe, allCiternes }) => {
    // Liste des IDs de citernes sélectionnées
    const [selectedCiterneIds, setSelectedCiterneIds] = useState([]);
    
    // État du formulaire Inertia
    const { data, setData, post, processing, errors } = useForm({
        citernes_to_associate: []
    });

    // ---------------------------------------------
    // 1. Logique d'initialisation
    // ---------------------------------------------
    
    useEffect(() => {
        if (isOpen) {
            setSelectedCiterneIds([]); 
            setData('citernes_to_associate', []);
        }
    }, [isOpen, pompe]);

    // ---------------------------------------------
    // 2. Filtrage des Citernes (Mise à jour logique Pistolets)
    // ---------------------------------------------

    const availableCiternes = useMemo(() => {
        if (!pompe || !allCiternes) return [];
        
        // NOUVEAU : On extrait les IDs des citernes déjà reliées via les pistolets de cette pompe
        const associatedIds = pompe.pistolets ? pompe.pistolets.map(pistolet => pistolet.citerne_id) : [];

        // On filtre : on n'affiche que les citernes qui ne sont PAS déjà associées
        return allCiternes.filter(citerne => {
            const isAssociated = associatedIds.includes(citerne.id);
            // On limite aux citernes de la même station (agence)
            const isSameAgency = pompe.agency_id === citerne.agency_id;

            return !isAssociated && isSameAgency;
        });
    }, [pompe, allCiternes]);

    // ---------------------------------------------
    // 3. Gestion des Checkbox
    // ---------------------------------------------

    const handleCheckboxChange = (id) => {
        const newSelected = selectedCiterneIds.includes(id)
            ? selectedCiterneIds.filter(cId => cId !== id)
            : [...selectedCiterneIds, id];
            
        setSelectedCiterneIds(newSelected);
        setData('citernes_to_associate', newSelected);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const allIds = availableCiternes.map(c => c.id);
            setSelectedCiterneIds(allIds);
            setData('citernes_to_associate', allIds);
        } else {
            setSelectedCiterneIds([]);
            setData('citernes_to_associate', []);
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
            Swal.fire('Attention', 'Veuillez sélectionner au moins une cuve à relier.', 'warning');
            return;
        }

        // Correction de la requête Inertia : le payload (data) se passe dans le 2ème argument de post()
        post(route('pompes.pistolets.store', pompe.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'Pistolets créés !',
                    text: `${selectedCiterneIds.length} pistolet(s) configuré(s) pour l'îlot "${pompe.name}".`,
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (validationErrors) => {
                console.error("Erreurs d'association:", validationErrors);
                Swal.fire('Erreur', 'Une erreur est survenue lors de la création des pistolets.', 'error');
            },
        });
    };

    if (!pompe) return null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Ajouter des Pistolets : ${pompe.name}`}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-3 rounded-lg text-xs mb-2">
                    Sélectionnez les cuves souterraines auxquelles vous souhaitez relier cet îlot. <strong>Un pistolet de distribution sera automatiquement créé pour chaque cuve sélectionnée.</strong>
                </div>

                {/* --- Section des Citernes --- */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <FontAwesomeIcon icon={faPlug} className="text-slate-400" />
                        Cuves disponibles (Station {pompe.agency ? pompe.agency.name : 'N/A'})
                    </h3>

                    {availableCiternes.length === 0 ? (
                        <p className="text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded italic text-sm text-center">
                            Toutes les cuves de cette station sont déjà reliées à cet îlot, ou aucune cuve n'a été créée pour cette station.
                        </p>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                            {/* Checkbox "Tout cocher" */}
                            <div className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={allChecked}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    ref={input => {
                                        if (input) input.indeterminate = isIndeterminate;
                                    }}
                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <label htmlFor="selectAll" className="ml-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                    Tout Cocher ({selectedCiterneIds.length} sélectionné(s))
                                </label>
                            </div>

                            {/* Conteneur défilant des checkboxes */}
                            <div className="max-h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {availableCiternes.map((citerne) => (
                                    <div 
                                        key={citerne.id} 
                                        className={`flex items-center p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${selectedCiterneIds.includes(citerne.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        onClick={() => handleCheckboxChange(citerne.id)}
                                    >
                                        <input
                                            id={`citerne-${citerne.id}`}
                                            type="checkbox"
                                            checked={selectedCiterneIds.includes(citerne.id)}
                                            onChange={() => handleCheckboxChange(citerne.id)}
                                            className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            onClick={(e) => e.stopPropagation()} 
                                        />
                                        <label 
                                            htmlFor={`citerne-${citerne.id}`} 
                                            className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1 select-none flex justify-between"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span>{citerne.name}</span>
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
                        variant="primary"
                        disabled={processing || selectedCiterneIds.length === 0}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Création en cours...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                Créer les Pistolets ({selectedCiterneIds.length})
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PompeCiterneAssociationModal;