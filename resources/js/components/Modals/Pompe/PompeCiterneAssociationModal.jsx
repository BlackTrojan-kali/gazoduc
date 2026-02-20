import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; 
import Button from '../../ui/button/Button'; 
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLink, faCheckCircle, faCircle, faGasPump, faLayerGroup } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal pour associer une pompe à une ou plusieurs citernes.
 * Design refait : Style "Cartes Sélectionnables"
 */
const PompeCiterneAssociationModal = ({ isOpen, onClose, pompe, allCiternes }) => {
    // Liste des IDs de citernes sélectionnées
    const [selectedCiterneIds, setSelectedCiterneIds] = useState([]);
    
    const { post, processing } = useForm({});

    // ---------------------------------------------
    // 1. Initialisation
    // ---------------------------------------------
    useEffect(() => {
        if (isOpen) {
            setSelectedCiterneIds([]); 
        }
    }, [isOpen, pompe]);

    // ---------------------------------------------
    // 2. Filtrage (Logique conservée)
    // ---------------------------------------------
    const availableCiternes = useMemo(() => {
        if (!pompe || !allCiternes) return [];
        const associatedIds = pompe.cuves.map(cuve => cuve.id);
        return allCiternes.filter(citerne => {
            const isAssociated = associatedIds.includes(citerne.id);
            const isSameAgency = pompe.agency_id === citerne.agency_id;
            return !isAssociated && isSameAgency;
        });
    }, [pompe, allCiternes]);

    // ---------------------------------------------
    // 3. Gestion de la sélection
    // ---------------------------------------------
    const handleToggleCiterne = (id) => {
        setSelectedCiterneIds(prevIds => {
            if (prevIds.includes(id)) {
                return prevIds.filter(cId => cId !== id);
            } else {
                return [...prevIds, id];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedCiterneIds.length === availableCiternes.length) {
            setSelectedCiterneIds([]); // Tout désélectionner
        } else {
            setSelectedCiterneIds(availableCiternes.map(c => c.id)); // Tout sélectionner
        }
    };
    
    // ---------------------------------------------
    // 4. Soumission
    // ---------------------------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!pompe || selectedCiterneIds.length === 0) {
            Swal.fire('Attention', 'Veuillez sélectionner au moins une citerne.', 'warning');
            return;
        }

        post(route('pompes.associate-citernes', {pompe: pompe.id, citernes_to_associate: selectedCiterneIds} ), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'Association réussie !',
                    text: `La pompe "${pompe.name}" a été associée avec succès.`,
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: (err) => {
                console.error(err);
                Swal.fire('Erreur', 'Erreur lors de l\'association.', 'error');
            },
        });
    };

    if (!pompe) return null;

    // Calculs pour l'interface
    const allSelected = availableCiternes.length > 0 && selectedCiterneIds.length === availableCiternes.length;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faGasPump} className="text-blue-600" />
                    <span>Associer des Cuves à : {pompe.name}</span>
                </div>
            }
            maxWidth="2xl" // Modal un peu plus large pour la grille
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                
                {/* En-tête informatif */}
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300 flex justify-between items-center">
                        <span>Agence : <strong>{pompe.agency ? pompe.agency.name : 'N/A'}</strong></span>
                        <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 shadow-sm">
                            {availableCiternes.length} cuve(s) dispo.
                        </span>
                    </p>
                </div>

                {/* --- Zone de Sélection (Grille) --- */}
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Sélectionnez les citernes
                        </h3>
                        
                        {availableCiternes.length > 0 && (
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline transition-colors"
                            >
                                {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                            </button>
                        )}
                    </div>

                    {availableCiternes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <FontAwesomeIcon icon={faLayerGroup} className="text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm">Aucune citerne disponible pour association.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                            {availableCiternes.map((citerne) => {
                                const isSelected = selectedCiterneIds.includes(citerne.id);
                                return (
                                    <div
                                        key={citerne.id}
                                        onClick={() => handleToggleCiterne(citerne.id)}
                                        className={`
                                            relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 ease-in-out group
                                            flex items-start justify-between
                                            ${isSelected 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-md transform scale-[1.01]' 
                                                : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-700 dark:text-blue-200' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {citerne.name}
                                            </span>
                                            
                                            {/* Badge Type de produit */}
                                            <span className={`
                                                inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit
                                                ${citerne.product_type?.toLowerCase().includes('gasoil') 
                                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                                    : 'bg-green-100 text-green-800 border border-green-200'
                                                }
                                            `}>
                                                {citerne.product_type}
                                            </span>
                                        </div>

                                        {/* Icone Checkbox visuelle */}
                                        <div className={`
                                            mt-1 text-xl transition-colors
                                            ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300 dark:text-gray-600 group-hover:text-blue-300'}
                                        `}>
                                            <FontAwesomeIcon icon={isSelected ? faCheckCircle : faCircle} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- Pied de page (Actions) --- */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing || availableCiternes.length === 0 || selectedCiterneIds.length === 0}
                        className="min-w-[140px]"
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Traitement...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faLink} className="mr-2" />
                                Associer ({selectedCiterneIds.length})
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PompeCiterneAssociationModal;