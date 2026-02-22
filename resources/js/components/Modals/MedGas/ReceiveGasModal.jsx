// resources/js/Components/Modals/MedGas/ReceiveGasModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Select from 'react-select';
import { useForm, usePage } from '@inertiajs/react'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faArrowDown, faTrash, faCheckCircle, faIndustry, faUserTie, faListUl, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const ReceiveGasModal = ({ 
    isOpen, 
    onClose, 
    pendingMovements = [], // Liste des mouvements en attente de la production
    articlesOut = []       // Liste des articles de l'agence dont le stock magasin est à 0 (fournie par le contrôleur)
}) => {
    const { auth } = usePage().props;
    const userLocation = auth.user.role; // 'magasin' ou 'production'

    const [receptionType, setReceptionType] = useState('production');
    
    // On sépare les paniers pour éviter de mélanger les types si l'utilisateur change d'onglet
    const [selectedProductionItems, setSelectedProductionItems] = useState([]);
    const [selectedClientItems, setSelectedClientItems] = useState([]);

    const [scanCode, setScanCode] = useState('');
    const [selectValue, setSelectValue] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        reception_type: 'production',
        items: [],
    });

    const isProduction = receptionType === 'production';
    const activeSelectedItems = isProduction ? selectedProductionItems : selectedClientItems;

    // Met à jour le formulaire à chaque changement de panier ou d'onglet
    useEffect(() => {
        setData({
            reception_type: receptionType,
            items: isProduction 
                ? selectedProductionItems.map(item => item.mouvement_id)
                : selectedClientItems.map(item => item.article.id)
        });
    }, [selectedProductionItems, selectedClientItems, receptionType]);

    // Réinitialisation globale à l'ouverture de la modale
    useEffect(() => {
        if (isOpen) {
            setSelectedProductionItems([]);
            setSelectedClientItems([]);
            setScanCode('');
            setSelectValue(null);
            // Par défaut, le magasinier est sur "production"
            setReceptionType('production');
        }
    }, [isOpen]);

    // Génération dynamique des options pour la sélection manuelle
    const selectOptions = isProduction 
        ? pendingMovements
            .filter(mov => !selectedProductionItems.some(item => item.mouvement_id === mov.id))
            .map(mov => ({
                value: mov.id,
                label: `${mov.article.name} - [${mov.article.code}]`,
                itemData: { mouvement_id: mov.id, article: mov.article }
            }))
        : articlesOut
            .filter(art => !selectedClientItems.some(item => item.article.id === art.id))
            .map(art => ({
                value: art.id,
                label: `${art.name} - [${art.code}]`,
                itemData: { article: art }
            }));

    // --- GESTION DU SCANNER ---
    const handleScan = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const code = scanCode.trim();
            if (!code) return;

            let foundItem = null;

            if (isProduction) {
                const mov = pendingMovements.find(m => m.article.code === code);
                if (mov) foundItem = { mouvement_id: mov.id, article: mov.article };
            } else {
                const art = articlesOut.find(a => a.code === code);
                if (art) foundItem = { article: art };
            }

            if (foundItem) {
                const isAlreadyIn = isProduction
                    ? selectedProductionItems.some(i => i.mouvement_id === foundItem.mouvement_id)
                    : selectedClientItems.some(i => i.article.id === foundItem.article.id);

                if (isAlreadyIn) {
                    Swal.fire({ icon: 'warning', title: 'Déjà ajouté', timer: 1000, showConfirmButton: false });
                } else {
                    if (isProduction) {
                        setSelectedProductionItems(prev => [foundItem, ...prev]);
                    } else {
                        setSelectedClientItems(prev => [foundItem, ...prev]);
                    }
                }
            } else {
                Swal.fire({ 
                    icon: 'error', 
                    title: 'Bouteille introuvable', 
                    text: isProduction 
                        ? 'Cette bouteille ne fait pas partie des mouvements attendus depuis la production.' 
                        : 'Cette bouteille n\'appartient pas à votre agence ou est déjà enregistrée en stock au magasin.' 
                });
            }
            setScanCode('');
        }
    };

    // --- GESTION DE LA SÉLECTION MANUELLE ---
    const handleManualSelect = (selectedOption) => {
        if (selectedOption) {
            if (isProduction) {
                setSelectedProductionItems(prev => [selectedOption.itemData, ...prev]);
            } else {
                setSelectedClientItems(prev => [selectedOption.itemData, ...prev]);
            }
            setSelectValue(null);
        }
    };

    // --- GESTION DE LA SUPPRESSION D'UN ARTICLE DU PANIER ---
    const handleRemoveItem = (indexToRemove) => {
        if (isProduction) {
            setSelectedProductionItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
        } else {
            setSelectedClientItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('mouvements.receive_multiple'), {
            onSuccess: () => {
                Swal.fire('Succès', 'Réception enregistrée.', 'success');
                onClose();
            },
            onError: (err) => {
                Swal.fire('Erreur', err.error || 'Une erreur est survenue lors de la réception.', 'error');
            }
        });
    };

    const listToDisplay = isProduction ? pendingMovements : articlesOut;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Réception de Bouteilles" maxWidth="7xl">
            {/* ONGlets de navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    type="button"
                    className={`flex-1 py-3 font-bold text-sm uppercase transition-colors ${
                        isProduction ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => { setReceptionType('production'); setScanCode(''); }}
                >
                    <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" />
                    Flux : {userLocation === 'magasin' ? 'Production → Magasin' : 'Magasin → Production'}
                </button>
                
                {userLocation === 'magasin' && (
                    <button
                        type="button"
                        className={`flex-1 py-3 font-bold text-sm uppercase transition-colors ${
                            !isProduction ? 'border-b-2 border-green-500 text-green-600 bg-green-50' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => { setReceptionType('client'); setScanCode(''); }}
                    >
                        <FontAwesomeIcon icon={faUserTie} className="mr-2" />
                        Retour Client (Scan Global)
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* PANNEAU DE GAUCHE : RECHERCHE ET LISTE */}
                    <div className="flex flex-col gap-6 border-r border-gray-200 dark:border-gray-700 pr-6">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBarcode} /> 
                                {isProduction ? 'Scanner la livraison' : 'Rechercher une bouteille hors stock'}
                            </h4>
                            <input
                                type="text"
                                value={scanCode}
                                onChange={e => setScanCode(e.target.value)}
                                onKeyDown={handleScan}
                                placeholder="Scanner le code-barres ici..."
                                className="w-full rounded-md border-gray-300 mb-4 dark:bg-gray-700 dark:text-white focus:ring-blue-500"
                                autoFocus
                            />
                            
                            <div className="relative z-50">
                                <Select
                                    options={selectOptions}
                                    value={selectValue}
                                    onChange={handleManualSelect}
                                    placeholder={isProduction ? "Ou choisir dans la liste de transfert..." : "Rechercher par nom ou code..."}
                                    menuPortalTarget={document.body}
                                    styles={{ 
                                        control: (base, state) => ({
                                            ...base, minHeight: '42px', borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', backgroundColor: 'transparent'
                                        }),
                                        menuPortal: base => ({ ...base, zIndex: 99999999 }) 
                                    }}
                                    className="react-select-container text-gray-900"
                                    classNamePrefix="react-select"
                                    noOptionsMessage={() => "Aucune bouteille correspondante trouvée."}
                                />
                            </div>
                        </div>

                        {/* LISTE INDICATIVE : Affiche les articles attendus ou les articles hors stock */}
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-500 mb-2 flex items-center gap-2">
                                <FontAwesomeIcon icon={faListUl} /> 
                                {isProduction ? 'Attendu en réception' : 'Total des articles hors magasin'} ({listToDisplay.length})
                            </h4>
                            <div className="max-h-[30vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-gray-800">
                                {isProduction ? (
                                    pendingMovements.map(mov => {
                                        const isSelected = selectedProductionItems.some(i => i.mouvement_id === mov.id);
                                        return (
                                            <div key={mov.id} className={`flex justify-between p-1.5 text-sm ${isSelected ? 'line-through opacity-40 text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                <span>{mov.article.name}</span>
                                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{mov.article.code}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    articlesOut.map(art => {
                                        const isSelected = selectedClientItems.some(i => i.article.id === art.id);
                                        return (
                                            <div key={art.id} className={`flex justify-between p-1.5 text-sm ${isSelected ? 'line-through opacity-40 text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                <span>{art.name}</span>
                                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{art.code}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PANNEAU DE DROITE : PANIER */}
                    <div className="flex flex-col">
                        <h4 className="text-lg font-bold mb-4 text-green-600 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCheckCircle} /> 
                            Bouteilles validées pour réception ({activeSelectedItems.length})
                        </h4>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[40vh] overflow-y-auto">
                            {activeSelectedItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                                    <FontAwesomeIcon icon={faArrowDown} size="2x" className="mb-2 opacity-30" />
                                    <p>Scannez ou sélectionnez des bouteilles à réceptionner.</p>
                                </div>
                            ) : (
                                activeSelectedItems.map((item, index) => (
                                    <div key={index} className="p-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 m-2 rounded shadow-sm">
                                        <div>
                                            <div className="font-bold text-gray-800 dark:text-white">{item.article.name}</div>
                                            <div className="text-xs font-mono text-gray-500">{item.article.code}</div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveItem(index)} 
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                            title="Retirer de la sélection"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* PIED DE MODALE */}
                <div className="flex justify-end mt-6 gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        disabled={processing || activeSelectedItems.length === 0} 
                        className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faCheckCircle} />
                        {processing ? 'Enregistrement...' : 'Valider l\'entrée au magasin'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ReceiveGasModal;