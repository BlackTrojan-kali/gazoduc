import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Select from 'react-select';
import { useForm } from '@inertiajs/react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faTools, faTrash, faCheckCircle, faListUl, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const MaintenanceGasModal = ({ 
    isOpen, 
    onClose, 
    availableArticles = [] // Bouteilles avec stock = 1 en production
}) => {
    
    const [selectedItems, setSelectedItems] = useState([]);
    const [scanCode, setScanCode] = useState('');
    const [selectValue, setSelectValue] = useState(null);

    // Initialisation du formulaire
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        items: [],
        type: 'epreuve', // Valeur par défaut
        provider: '',
        start_date: new Date().toISOString().split('T')[0], // Date du jour par défaut
        cost: '',
        observations: ''
    });

    // Met à jour la liste des IDs dans le formulaire quand le panier change
    useEffect(() => {
        setData('items', selectedItems.map(item => item.id));
    }, [selectedItems]);

    // Réinitialisation à l'ouverture de la modale
    useEffect(() => {
        if (isOpen) {
            setSelectedItems([]);
            setScanCode('');
            setSelectValue(null);
            reset();
            clearErrors();
        }
    }, [isOpen]);

    // --- Options pour la sélection manuelle ---
    const selectOptions = availableArticles
        .filter(art => !selectedItems.some(item => item.id === art.id))
        .map(art => ({
            value: art.id,
            label: `${art.name} - [${art.code}]`,
            itemData: art
        }));

    // --- GESTION DU SCANNER ---
    const handleScan = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const code = scanCode.trim();
            if (!code) return;

            const foundItem = availableArticles.find(a => a.code === code);

            if (foundItem) {
                if (selectedItems.some(i => i.id === foundItem.id)) {
                    Swal.fire({ icon: 'warning', title: 'Déjà ajouté', timer: 1000, showConfirmButton: false });
                } else {
                    setSelectedItems(prev => [foundItem, ...prev]);
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Bouteille introuvable', text: 'Cette bouteille n\'est pas disponible en production.' });
            }
            setScanCode('');
        }
    };

    const handleManualSelect = (selectedOption) => {
        if (selectedOption) {
            setSelectedItems(prev => [selectedOption.itemData, ...prev]);
            setSelectValue(null); 
        }
    };

    const handleRemoveItem = (indexToRemove) => {
        setSelectedItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (selectedItems.length === 0) {
            Swal.fire('Erreur', 'Veuillez sélectionner au moins une bouteille.', 'error');
            return;
        }

        // Remplacez 'gas_medical.maintenance.store' par le nom de route que vous créerez dans web.php
        post(route('gas_medical.maintenance.store'), {
            onSuccess: () => {
                Swal.fire('Succès', 'Les bouteilles ont été envoyées en maintenance.', 'success');
                onClose();
            },
            onError: (err) => {
                Swal.fire('Erreur', err.error || 'Veuillez vérifier les informations saisies.', 'error');
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Envoyer en Maintenance" maxWidth="7xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* --- SECTION 1 : INFORMATIONS DE MAINTENANCE --- */}
                <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800">
                    <h4 className="font-bold text-orange-800 dark:text-orange-400 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faTools} /> Détails de l'intervention
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type d'intervention <span className="text-red-500">*</span></label>
                            <select 
                                value={data.type}
                                onChange={e => setData('type', e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="epreuve">Épreuve hydraulique</option>
                                <option value="peinture">Peinture</option>
                                <option value="reparation_vanne">Réparation Vanne / Robinet</option>
                                <option value="autre">Autre</option>
                            </select>
                            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prestataire / Service</label>
                            <input 
                                type="text" 
                                value={data.provider}
                                onChange={e => setData('provider', e.target.value)}
                                placeholder="Nom de l'entreprise..."
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'envoi <span className="text-red-500">*</span></label>
                            <input 
                                type="date" 
                                value={data.start_date}
                                onChange={e => setData('start_date', e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            />
                            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                        </div>

                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observations particulières</label>
                            <textarea 
                                value={data.observations}
                                onChange={e => setData('observations', e.target.value)}
                                placeholder="Précisez la raison de l'envoi si nécessaire..."
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                rows="2"
                            />
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2 : SÉLECTION DES BOUTEILLES --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* PANNEAU DE GAUCHE : RECHERCHE */}
                    <div className="flex flex-col gap-6 border-r border-gray-200 dark:border-gray-700 pr-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                            <h4 className="font-bold mb-4 flex items-center gap-2"><FontAwesomeIcon icon={faBarcode} /> Scanner les bouteilles</h4>
                            <input
                                type="text"
                                value={scanCode}
                                onChange={e => setScanCode(e.target.value)}
                                onKeyDown={handleScan}
                                placeholder="Scanner ici..."
                                className="w-full rounded-md border-gray-300 mb-4 dark:bg-gray-700 dark:text-white"
                                autoFocus
                            />
                            
                            <div className="relative z-50">
                                <Select
                                    options={selectOptions}
                                    value={selectValue}
                                    onChange={handleManualSelect}
                                    placeholder="Ou choisir manuellement..."
                                    menuPortalTarget={document.body}
                                    styles={{ 
                                        control: (base, state) => ({
                                            ...base, minHeight: '42px', borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', backgroundColor: 'transparent'
                                        }),
                                        menuPortal: base => ({ ...base, zIndex: 99999999 }) 
                                    }}
                                    className="react-select-container text-gray-900"
                                    classNamePrefix="react-select"
                                    noOptionsMessage={() => "Aucune bouteille disponible."}
                                />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-gray-500 mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faListUl} /> Bouteilles en Production ({availableArticles.length})
                            </h4>
                            <div className="max-h-[30vh] overflow-y-auto border rounded-md p-2 bg-white dark:bg-gray-800">
                                {availableArticles.map(art => {
                                    const isSelected = selectedItems.some(i => i.id === art.id);
                                    return (
                                        <div key={art.id} className={`flex justify-between p-1.5 text-sm ${isSelected ? 'line-through opacity-40 text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                            <span>{art.name}</span>
                                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{art.code}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* PANNEAU DE DROITE : PANIER DE MAINTENANCE */}
                    <div className="flex flex-col">
                        <h4 className="text-lg font-bold mb-4 text-orange-600 flex items-center gap-2">
                            <FontAwesomeIcon icon={faClipboardList} /> 
                            Lot à envoyer ({selectedItems.length})
                        </h4>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-orange-200 dark:border-orange-800/50 min-h-[40vh] overflow-y-auto">
                            {selectedItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                                    <FontAwesomeIcon icon={faTools} size="2x" className="mb-2 opacity-30" />
                                    <p>Scannez les bouteilles nécessitant une maintenance.</p>
                                </div>
                            ) : (
                                selectedItems.map((item, index) => (
                                    <div key={index} className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 m-2 rounded shadow-sm">
                                        <div>
                                            <div className="font-bold text-gray-800 dark:text-white">{item.name}</div>
                                            <div className="text-xs font-mono text-gray-500">{item.code}</div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveItem(index)} 
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6 gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        disabled={processing || selectedItems.length === 0} 
                        className="px-6 py-2 bg-orange-600 text-white rounded font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faTools} />
                        {processing ? 'Enregistrement...' : 'Confirmer l\'envoi'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default MaintenanceGasModal;