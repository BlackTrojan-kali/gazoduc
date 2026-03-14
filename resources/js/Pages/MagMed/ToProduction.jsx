import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import MagMedLayout from '../../layout/MagMedLayout/MagMedLayout';
import axios from 'axios'; 

export default function ToProduction({ activeBatches, availableEmptyCylinders }) {
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [barcode, setBarcode] = useState('');
    const [scannedCylinders, setScannedCylinders] = useState([]);
    
    // --- NOUVEAUX ÉTATS POUR L'AUTOCOMPLÉTION ET LE MODE ---
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isManualMode, setIsManualMode] = useState(false); // Bascule entre Douchette / Manuel
    
    // Séparation des références pour éviter les bugs de focus
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Garde le focus sur le champ de scan après chaque scan (uniquement si on est en mode douchette)
    useEffect(() => {
        if (!isManualMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [scannedCylinders, isManualMode]);

    // Fermer les suggestions si on clique en dehors du menu déroulant
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Gestion de la saisie et appel API pour les suggestions
    const handleInputChange = (e) => {
        const value = e.target.value;
        setBarcode(value);

        // Si on est en mode "Douchette", on ne fait pas de suggestions 
        if (!isManualMode) return;

        // Vider le timeout précédent pour éviter de spammer le serveur (Debounce)
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.trim().length > 1) {
            // Attendre 300ms après la dernière frappe avant d'appeler l'API
            searchTimeoutRef.current = setTimeout(() => {
                axios.get(route('mag-med.api.search'), { params: { q: value } })
                    .then(response => {
                        setSuggestions(response.data);
                        setShowSuggestions(true);
                    })
                    .catch(error => console.error("Erreur de recherche :", error));
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Quand l'utilisateur clique sur une suggestion
    const handleSuggestionClick = (selectedBarcode) => {
        setBarcode(selectedBarcode);
        setShowSuggestions(false);
        if (inputRef.current) {
            inputRef.current.focus(); // On remet le focus pour qu'il puisse cliquer sur "Valider"
        }
    };

    // Gère la validation (douchette = Entrée, ou clic manuel sur "Valider")
    const handleScanSubmit = (e) => {
        e.preventDefault();
        
        if (!selectedBatchId) {
            alert("Veuillez d'abord sélectionner un lot de production !");
            return;
        }

        const currentBarcode = barcode.trim();
        
        if (currentBarcode !== '') {
            // Vider le champ et cacher les suggestions IMMÉDIATEMENT
            setBarcode('');
            setShowSuggestions(false);
            setSuggestions([]);

            // Appel au backend
            router.post('/mag-med/production/scan', {
                barcode: currentBarcode,
                batch_id: selectedBatchId
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const successMessage = page.props.flash?.success || "Pleine_Usine";
                    setScannedCylinders(prev => [
                        { barcode: currentBarcode, type: 'success', message: successMessage }, 
                        ...prev
                    ]);
                },
                onError: (errors) => {
                    const errorMessage = errors.barcode || "Erreur de scan";
                    setScannedCylinders(prev => [
                        { barcode: currentBarcode, type: 'error', message: errorMessage }, 
                        ...prev
                    ]);
                }
            });
        }
    };

    return (
        <MagMedLayout>
            <Head title="Envoi en Production" />

            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Envoi en Production (Enfûtage)</h1>
                    <p className="text-gray-600">Bouteilles vides disponibles : <span className="font-bold text-blue-600">{availableEmptyCylinders}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Colonne de gauche : Configuration et Scan */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Sélection du Lot */}
                    <div className="bg-white p-6 rounded-lg shadow border-t-4 border-teal-500">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            1. Sélectionnez le Lot de Production en cours
                        </label>
                        <select 
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                        >
                            <option value="">-- Choisir un lot --</option>
                            {activeBatches.map(batch => (
                                <option key={batch.id} value={batch.id}>
                                    Lot #{batch.id} - {batch.gas ? batch.gas.name : 'Gaz inconnu'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Zone de Scan ou Saisie Manuelle */}
                    <div className={`bg-white p-6 rounded-lg shadow transition-colors ${selectedBatchId ? 'border-2 border-green-400' : 'opacity-50 pointer-events-none'}`}>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                2. Scannez ou saisissez
                            </label>
                            
                            {/* Toggle pour basculer entre mode Douchette et mode Manuel */}
                            <label className="inline-flex items-center cursor-pointer">
                                <span className="mr-2 text-xs text-gray-500 font-medium">Mode Douchette</span>
                                <div className="relative">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only" 
                                        checked={isManualMode} 
                                        onChange={() => setIsManualMode(!isManualMode)} 
                                    />
                                    <div className="block bg-gray-200 w-10 h-6 rounded-full transition-colors duration-300"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${isManualMode ? 'translate-x-4 bg-teal-500' : ''}`}></div>
                                </div>
                                <span className="ml-2 text-xs font-medium text-teal-600">Saisie Manuelle</span>
                            </label>
                        </div>
                        
                        {/* Conteneur avec la référence dropdownRef pour détecter les clics à l'extérieur */}
                        <div className="relative" ref={dropdownRef}>
                            <form onSubmit={handleScanSubmit} className="mt-1 flex rounded-md shadow-sm">
                                <input
                                    ref={inputRef} // La référence inputRef est ici !
                                    type="text"
                                    className="focus:ring-green-500 focus:border-green-500 flex-1 block w-full rounded-none rounded-l-md sm:text-lg border-gray-300 p-3"
                                    placeholder={isManualMode ? "Taper les 1ers caractères..." : "Attente du scan..."}
                                    value={barcode}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    Valider
                                </button>
                            </form>

                            {/* Dropdown d'autocomplétion */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm">
                                    {suggestions.map((cyl) => (
                                        <li
                                            key={cyl.id}
                                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-teal-50 text-gray-900"
                                            onClick={() => handleSuggestionClick(cyl.barcode)}
                                        >
                                            <span className="block truncate font-mono font-medium">
                                                {cyl.barcode} <span className="text-gray-400 text-xs ml-2">SN: {cyl.serial_number}</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {showSuggestions && suggestions.length === 0 && barcode.length > 1 && (
                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-gray-500">
                                    Aucune bouteille vide trouvée avec ce code.
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            {isManualMode 
                                ? "Tapez les premières lettres pour voir les suggestions de bouteilles vides." 
                                : "Laissez branché pour scanner à la chaîne sans toucher la souris."}
                        </p>
                    </div>
                </div>

                {/* Colonne de droite : Liste des bouteilles scannées */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Journal des scans</h3>
                            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                {scannedCylinders.length} scan(s)
                            </span>
                        </div>
                        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            {scannedCylinders.length === 0 ? (
                                <li className="p-6 text-center text-gray-500">Aucune bouteille scannée pour le moment.</li>
                            ) : (
                                scannedCylinders.map((cyl, index) => (
                                    <li 
                                        key={index} 
                                        className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 ${cyl.type === 'error' ? 'bg-red-50' : ''}`}
                                    >
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            {cyl.type === 'success' ? (
                                                <svg className="h-6 w-6 text-green-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="h-6 w-6 text-red-500 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            )}
                                            <span className="font-medium text-gray-900 font-mono text-lg">{cyl.barcode}</span>
                                        </div>
                                        <span className={`text-sm text-right ${cyl.type === 'error' ? 'text-red-600 font-semibold' : 'text-green-600'}`}>
                                            {cyl.message}
                                        </span>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>

            </div>
        </MagMedLayout>
    );
}