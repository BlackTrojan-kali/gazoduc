import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Select from 'react-select';
import { useForm } from '@inertiajs/react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faFillDrip, faTrash, faCheckCircle, faListUl, faGasPump } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const CreateProductionModal = ({ 
    isOpen, 
    onClose, 
    availableBottles = [], // Les bouteilles (gaz_medical) avec stock = 1 en production (vides)
    citernes = []          // Les citernes sources disponibles
}) => {
    
    const [selectedItems, setSelectedItems] = useState([]);
    const [scanCode, setScanCode] = useState('');
    const [selectValue, setSelectValue] = useState(null);

    // Initialisation du formulaire
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        source_citerne_id: '',
        batch_number: '',
        items: [], // Contiendra les IDs des bouteilles remplies
    });

    // Met à jour la liste des IDs dans le formulaire quand le panier change
    useEffect(() => {
        setData('items', selectedItems.map(item => item.id));
    }, [selectedItems]);

    // Réinitialisation globale à l'ouverture de la modale
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
    const selectOptions = availableBottles
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

            const foundItem = availableBottles.find(a => a.code === code);

            if (foundItem) {
                if (selectedItems.some(i => i.id === foundItem.id)) {
                    Swal.fire({ icon: 'warning', title: 'Déjà ajouté', timer: 1000, showConfirmButton: false });
                } else {
                    setSelectedItems(prev => [foundItem, ...prev]);
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Bouteille introuvable', text: 'Cette bouteille n\'est pas disponible dans la zone de production.' });
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
            Swal.fire('Erreur', 'Veuillez scanner au moins une bouteille à remplir.', 'error');
            return;
        }

        // Remplacez 'gas_medical.production.store' par votre route de création de production
        post(route('gas_medical.production.store'), {
            onSuccess: () => {
                Swal.fire('Succès', 'La production a été enregistrée et les bouteilles sont remplies.', 'success');
                onClose();
            },
            onError: (err) => {
                Swal.fire('Erreur', err.error || 'Veuillez vérifier les informations saisies.', 'error');
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer une Production (Remplissage)" maxWidth="7xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* --- SECTION 1 : INFORMATIONS DE PRODUCTION --- */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon icon={faGasPump} /> Détails de la Production
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sélection de la Citerne */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Citerne Source <span className="text-red-500">*</span>
                            </label>
                            <select 
                                value={data.source_citerne_id}
                                onChange={e => setData('source_citerne_id', e.target.value)}
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
                                required
                            >
                                <option value="">Sélectionnez la citerne source...</option>
                                {citernes.map(citerne => (
                                    <option key={citerne.id} value={citerne.id}>
                                        {citerne.name} (Reste: {citerne.stock_current}L)
                                    </option>
                                ))}
                            </select>
                            {errors.source_citerne_id && <p className="text-red-500 text-xs mt-1">{errors.source_citerne_id}</p>}
                        </div>

                        {/* Numéro de Lot */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Numéro de Lot (Batch Number) <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={data.batch_number}
                                onChange={e => setData('batch_number', e.target.value)}
                                placeholder="Ex: LOT-2026-02-22"
                                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
                                required
                            />
                            {errors.batch_number && <p className="text-red-500 text-xs mt-1">{errors.batch_number}</p>}
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2 : SÉLECTION DES BOUTEILLES --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* PANNEAU DE GAUCHE : RECHERCHE */}
                    <div className="flex flex-col gap-6 border-r border-gray-200 dark:border-gray-700 pr-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBarcode} /> Scanner les bouteilles à remplir
                            </h4>
                            <input
                                type="text"
                                value={scanCode}
                                onChange={e => setScanCode(e.target.value)}
                                onKeyDown={handleScan}
                                placeholder="Scanner ici..."
                                className="w-full rounded-md border-gray-300 mb-4 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
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
                                <FontAwesomeIcon icon={faListUl} /> Bouteilles vides en stock ({availableBottles.length})
                            </h4>
                            <div className="max-h-[30vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800">
                                {availableBottles.map(art => {
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

                    {/* PANNEAU DE DROITE : PANIER DE PRODUCTION */}
                    <div className="flex flex-col">
                        <h4 className="text-lg font-bold mb-4 text-blue-600 flex items-center gap-2">
                            <FontAwesomeIcon icon={faFillDrip} /> 
                            Bouteilles remplies ({selectedItems.length})
                        </h4>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-blue-200 dark:border-blue-800/50 min-h-[40vh] overflow-y-auto">
                            {selectedItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                                    <FontAwesomeIcon icon={faFillDrip} size="2x" className="mb-2 opacity-30" />
                                    <p>Scannez les bouteilles que vous venez de remplir.</p>
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
                        className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {processing ? 'Enregistrement...' : 'Valider la production'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateProductionModal;