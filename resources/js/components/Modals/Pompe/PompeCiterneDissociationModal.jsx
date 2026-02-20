import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; 
import Button from '../../ui/button/Button'; 
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLinkSlash, faGasPump, faCheckCircle, faCircle, faUnlink } from '@fortawesome/free-solid-svg-icons';

/**
 * Modal pour DISSOCIER des citernes d'une pompe.
 * Design refait : Style "Cartes Sélectionnables" (Thème Rouge/Danger)
 */
const PompeCiterneDissociationModal = ({ isOpen, onClose, pompe }) => {
    // Liste des IDs de citernes sélectionnées (à DISSOCIER)
    const [selectedCiterneIds, setSelectedCiterneIds] = useState([]);
    
    // État du formulaire Inertia
    const { post, processing } = useForm({});

    // ---------------------------------------------
    // 1. Initialisation
    // ---------------------------------------------
    useEffect(() => {
        if (isOpen) {
            setSelectedCiterneIds([]); 
        }
    }, [isOpen]);

    // Les citernes disponibles sont celles déjà liées
    const linkedCiternes = pompe?.cuves || [];

    // ---------------------------------------------
    // 2. Gestion de la sélection
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
        if (selectedCiterneIds.length === linkedCiternes.length) {
            setSelectedCiterneIds([]); // Tout désélectionner
        } else {
            setSelectedCiterneIds(linkedCiternes.map(c => c.id)); // Tout sélectionner
        }
    };
    
    // ---------------------------------------------
    // 3. Soumission
    // ---------------------------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!pompe || selectedCiterneIds.length === 0) {
            Swal.fire('Attention', 'Veuillez sélectionner au moins une citerne à dissocier.', 'warning');
            return;
        }

        post(route('pompes.dissociate-citernes', {
            pompe: pompe.id,
            citernes_to_dissociate: selectedCiterneIds, 
        }), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'Dissociation réussie !',
                    text: `La pompe "${pompe.name}" a été dissociée de ${selectedCiterneIds.length} citerne(s).`,
                    showConfirmButton: false,
                    timer: 2000
                });
            },
            onError: (err) => {
                console.error("Erreurs:", err);
                Swal.fire('Erreur', 'Une erreur est survenue lors de la dissociation.', 'error');
            },
        });
    };

    if (!pompe) return null;

    // Calculs pour l'interface
    const allSelected = linkedCiternes.length > 0 && selectedCiterneIds.length === linkedCiternes.length;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <FontAwesomeIcon icon={faLinkSlash} />
                    <span>Dissocier des Cuves : {pompe.name}</span>
                </div>
            }
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                
                {/* En-tête informatif / Avertissement */}
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                    <p className="text-sm text-red-800 dark:text-red-300 flex justify-between items-center">
                        <span>Sélectionnez les cuves à <strong>retirer</strong> de cette pompe.</span>
                        <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-red-200 dark:border-red-700 shadow-sm text-red-600">
                            {linkedCiternes.length} liée(s) actuellement
                        </span>
                    </p>
                </div>

                {/* --- Zone de Sélection (Grille) --- */}
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Cuves liées
                        </h3>
                        
                        {linkedCiternes.length > 0 && (
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 hover:underline transition-colors"
                            >
                                {allSelected ? 'Tout désélectionner' : 'Tout sélectionner pour retrait'}
                            </button>
                        )}
                    </div>

                    {linkedCiternes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <FontAwesomeIcon icon={faGasPump} className="text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm">Cette pompe n'est liée à aucune citerne.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                            {linkedCiternes.map((citerne) => {
                                const isSelected = selectedCiterneIds.includes(citerne.id);
                                return (
                                    <div
                                        key={citerne.id}
                                        onClick={() => handleToggleCiterne(citerne.id)}
                                        className={`
                                            relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-200 ease-in-out group
                                            flex items-start justify-between
                                            ${isSelected 
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-400 shadow-md transform scale-[1.01]' 
                                                : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-red-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-sm mb-1 ${isSelected ? 'text-red-700 dark:text-red-200' : 'text-gray-700 dark:text-gray-200'}`}>
                                                {citerne.name}
                                            </span>
                                            
                                            {/* Badge Type de produit */}
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 w-fit">
                                                {citerne.product_type}
                                            </span>
                                        </div>

                                        {/* Icone Checkbox visuelle (Style Danger) */}
                                        <div className={`
                                            mt-1 text-xl transition-colors
                                            ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-300 dark:text-gray-600 group-hover:text-red-300'}
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
                        variant="danger" // Rouge car action destructrice
                        disabled={processing || linkedCiternes.length === 0 || selectedCiterneIds.length === 0}
                        className="min-w-[140px]"
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Dissociation...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faUnlink} className="mr-2" />
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