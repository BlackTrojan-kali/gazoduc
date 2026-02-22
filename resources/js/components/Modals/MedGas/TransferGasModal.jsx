// resources/js/Components/Modals/MedGas/TransferGasModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; // Vérifiez le chemin
import Select from 'react-select';
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faArrowRight, faTrash, faExchangeAlt, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const TransferGasModal = ({ 
    isOpen, 
    onClose, 
    availableArticles = [], 
    currentStorage = 'magasin' 
}) => {
    
    const allServices = ['magasin', 'production', 'commercial'];
    const destinationOptions = allServices.filter(service => service !== currentStorage);

    const [selectedItems, setSelectedItems] = useState([]);
    const [scanCode, setScanCode] = useState('');
    
    // NOUVEAU : Un état dédié pour le champ de sélection manuel
    const [selectValue, setSelectValue] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        destination_location: destinationOptions[0] || '',
        article_ids: [],
    });

    useEffect(() => {
        setData('article_ids', selectedItems.map(item => item.id));
    }, [selectedItems]);

    useEffect(() => {
        if (isOpen) {
            setSelectedItems([]);
            setScanCode('');
            setSelectValue(null);
            reset();
        }
    }, [isOpen]);

    const selectOptions = availableArticles
        .filter(article => !selectedItems.some(item => item.id === article.id))
        .map(article => ({
            value: article.id,
            label: `${article.name} - [Code: ${article.code}]`,
            article: article 
        }));

    const handleScan = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            
            if (!scanCode.trim()) return;

            const foundArticle = availableArticles.find(a => a.code === scanCode.trim());

            if (foundArticle) {
                if (selectedItems.some(item => item.id === foundArticle.id)) {
                    Swal.fire({ icon: 'warning', title: 'Déjà ajouté', text: 'Cette bouteille est déjà dans la liste.', timer: 1500, showConfirmButton: false });
                } else {
                    // Utilisation de la fonction de rappel pour un état toujours à jour
                    setSelectedItems(prev => [foundArticle, ...prev]); 
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Introuvable', text: 'Aucune bouteille trouvée avec ce code dans votre stock actuel.', timer: 2000 });
            }
            setScanCode(''); 
        }
    };

    // CORRECTION : Gestion plus robuste de l'ajout manuel
    const handleManualSelect = (selectedOption) => {
        if (selectedOption) {
            setSelectedItems(prev => {
                // Sécurité supplémentaire anti-doublon
                if (prev.some(item => item.id === selectedOption.article.id)) return prev;
                return [selectedOption.article, ...prev];
            });
            // On vide visuellement le select après avoir ajouté l'article au panier
            setSelectValue(null);
        }
    };

    const handleRemoveItem = (idToRemove) => {
        setSelectedItems(selectedItems.filter(item => item.id !== idToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (selectedItems.length === 0) {
            Swal.fire('Erreur', 'Veuillez ajouter au moins une bouteille à transférer.', 'error');
            return;
        }

        post(route('mouvements.transfer_multiple'), {
            preserveScroll: true,
            onSuccess: () => {
                Swal.fire('Succès', 'Le transfert a été effectué.', 'success');
                onClose();
            }
        });
    };

    // CORRECTION MAJEURE : zIndex passé à 99999999 pour surpasser la modale
    const customStyles = {
        control: (base, state) => ({
            ...base, 
            minHeight: '42px', 
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', 
            backgroundColor: 'transparent'
        }),
        menuPortal: base => ({ ...base, zIndex: 99999999 }) 
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transférer des Bouteilles" maxWidth="7xl">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* PANNEAU GAUCHE : SAISIE & SÉLECTION */}
                    <div className="flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 pb-6 lg:pb-0 lg:pr-6">
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 uppercase tracking-wide">
                                Service Destinataire
                            </label>
                            <select
                                value={data.destination_location}
                                onChange={(e) => setData('destination_location', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            >
                                {destinationOptions.map(option => (
                                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Scanner le code-barres
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faBarcode} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={scanCode}
                                    onChange={(e) => setScanCode(e.target.value)}
                                    onKeyDown={handleScan}
                                    placeholder="Scannez et appuyez sur Entrée..."
                                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Appuyez sur la touche "Entrée" après avoir scanné.</p>
                        </div>

                        <div className="flex items-center text-gray-400 font-bold uppercase text-sm">
                            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                            <span className="px-3">OU</span>
                            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
                        </div>

                        {/* Ajout Manuel par Nom corrigé */}
                        <div className="relative z-50">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sélection manuelle (Nom ou Code)
                            </label>
                            <Select
                                options={selectOptions}
                                onChange={handleManualSelect}
                                value={selectValue} // Utilisation du state dédié
                                placeholder="Chercher une bouteille..."
                                styles={customStyles}
                                menuPortalTarget={document.body}
                                className="react-select-container text-gray-900"
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Aucune bouteille disponible."}
                            />
                        </div>
                    </div>

                    {/* PANNEAU DROITE : PANIER DES BOUTEILLES À TRANSFÉRER */}
                    <div className="flex flex-col h-[50vh] lg:h-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faBoxOpen} />
                                Liste de transfert
                            </h4>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                {selectedItems.length} bouteille(s)
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            {selectedItems.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedItems.map((item, index) => (
                                        <li key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-200 dark:bg-gray-700 w-8 h-8 rounded flex items-center justify-center font-bold text-gray-500 dark:text-gray-400 text-xs">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{item.code}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                                title="Retirer de la liste"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                                    <FontAwesomeIcon icon={faArrowRight} size="2x" className="mb-2 opacity-30" />
                                    <p>Scannez ou sélectionnez des bouteilles à gauche pour les ajouter à cette liste de transfert.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                <div className="flex items-center justify-end mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 gap-3 relative z-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 font-bold py-2 px-6 rounded shadow-sm transition duration-150"
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={processing || selectedItems.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FontAwesomeIcon icon={faExchangeAlt} />
                        {processing ? 'Enregistrement...' : 'Valider le transfert'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default TransferGasModal;