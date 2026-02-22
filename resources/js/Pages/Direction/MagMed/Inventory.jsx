// resources/js/Pages/Direction/MagMed/Inventory.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBoxOpen, faTimes, faMapMarkerAlt, faWarehouse, faExchangeAlt, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import MagLayout from '../../../layout/MagLayout/MagLayout';
import TransferGasModal from '../../../components/Modals/MedGas/TransferGasModal'; 
import ReceiveGasModal from '../../../components/Modals/MedGas/ReceiveGasModal'; // <-- NOUVEL IMPORT

export default function Inventory({ 
    groupedStocks, 
    searchedBottle, 
    filters, 
    userAgencyName, 
    availableCodes = [], 
    availableArticlesForTransfer = [],
    pendingMovements = [], // <-- NOUVELLE PROP
    articlesOut = []       // <-- NOUVELLE PROP
}) {
    
    // États pour la recherche
    const [searchCode, setSearchCode] = useState(filters?.code || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);
    
    // États pour les modales
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false); // <-- NOUVEL ÉTAT

    // Filtre les codes disponibles en fonction de ce qui est tapé (limité à 10 résultats)
    const filteredCodes = availableCodes
        .filter(code => code.toLowerCase().includes(searchCode.toLowerCase()))
        .slice(0, 10);

    // Gère la fermeture des suggestions si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        setShowSuggestions(false);
        router.get(route('mag_medical.inventory'), {
            code: searchCode
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearchCode('');
        setShowSuggestions(false);
        router.get(route('mag_medical.inventory'));
    };

    const handleSelectSuggestion = (code) => {
        setSearchCode(code);
        setShowSuggestions(false);
        router.get(route('mag_medical.inventory'), { code: code }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <MagLayout>
            <Head title={`Stock Magasin - ${userAgencyName}`} />

            {/* En-tête principal avec les boutons d'action */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                    <FontAwesomeIcon icon={faWarehouse} className="text-blue-600 dark:text-blue-400" />
                    Magasin : {userAgencyName}
                </h2>
                
                {/* Conteneur pour grouper les boutons d'action */}
                <div className="flex flex-wrap gap-3">
                    {/* Bouton de Réception (Entrée) */}
                    <button
                        onClick={() => setIsReceiveModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                        <FontAwesomeIcon icon={faArrowDown} />
                        Réceptionner
                        {pendingMovements.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                                {pendingMovements.length}
                            </span>
                        )}
                    </button>

                    {/* Bouton de Transfert (Sortie) */}
                    <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                        <FontAwesomeIcon icon={faExchangeAlt} />
                        Faire un transfert
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-6 relative z-20">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Recherche par Code-barres avec Autocomplétion */}
                        <div className="flex-1 w-full relative" ref={suggestionRef}>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Vérifier la présence d'une bouteille (Code)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="code"
                                    value={searchCode}
                                    onChange={(e) => {
                                        setSearchCode(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    autoComplete="off"
                                    placeholder="Scanner ou taper le code..."
                                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    style={{ minHeight: '42px' }}
                                />
                            </div>

                            {/* Liste des suggestions */}
                            {showSuggestions && searchCode && filteredCodes.length > 0 && (
                                <ul className="absolute z-50 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                                    {filteredCodes.map((code, index) => (
                                        <li
                                            key={index}
                                            onClick={() => handleSelectSuggestion(code)}
                                            className="px-4 py-2 hover:bg-blue-100 dark:hover:bg-gray-600 cursor-pointer text-gray-800 dark:text-gray-200 transition-colors"
                                        >
                                            {code}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Boutons d'action de recherche */}
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                type="submit"
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-150 h-[42px]"
                            >
                                Chercher
                            </button>
                            {searchCode && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded shadow transition duration-150 h-[42px]"
                                    title="Réinitialiser"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Zone d'affichage des résultats */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 relative z-10">
                
                {/* SCÉNARIO 1 : Recherche active par code-barres */}
                {searchCode && !showSuggestions && filters?.code ? (
                    searchedBottle ? (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b pb-2">
                                Bouteille trouvée
                            </h3>
                            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
                                <div className="bg-green-100 dark:bg-green-800 p-4 rounded-full text-green-600 dark:text-green-200">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {searchedBottle.article.name}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                                        Code : <span className="font-mono font-semibold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{searchedBottle.article.code}</span>
                                    </p>
                                    <p className="text-green-600 dark:text-green-400 mt-2 font-semibold">
                                        ✓ Présente dans votre magasin
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <FontAwesomeIcon icon={faTimes} size="3x" className="mb-4 text-red-400 opacity-80" />
                            <p className="text-lg font-medium text-red-500">Bouteille non trouvée dans ce magasin.</p>
                            <p className="mt-2">La bouteille avec le code <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">{searchCode}</span> n'existe pas ou se trouve actuellement dans une autre zone.</p>
                        </div>
                    )
                ) : 
                
                /* SCÉNARIO 2 : Affichage du tableau (État par défaut) */
                (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b pb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBoxOpen} className="text-gray-500" />
                            Aperçu Global du Magasin
                        </h3>
                        {groupedStocks && groupedStocks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r dark:border-gray-600">
                                                Type de Bouteille
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-100 uppercase tracking-wider bg-gray-100 dark:bg-gray-600">
                                                Quantité en Stock
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {groupedStocks.map((stock, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-3 border-r dark:border-gray-600">
                                                    <FontAwesomeIcon icon={faBoxOpen} className="text-gray-400" />
                                                    {stock.name}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold bg-gray-50 dark:bg-gray-750 ${stock.magasin > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                                    {stock.magasin}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3 opacity-50" />
                                <p>Aucun type de bouteille d'oxygène n'est configuré dans le système central.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modale de Transfert Multiple (Sortie) */}
            <TransferGasModal 
                isOpen={isTransferModalOpen} 
                onClose={() => setIsTransferModalOpen(false)} 
                availableArticles={availableArticlesForTransfer} 
                currentStorage="magasin" 
            />

            {/* Modale de Réception Multiple (Entrée) */}
            <ReceiveGasModal 
                isOpen={isReceiveModalOpen} 
                onClose={() => setIsReceiveModalOpen(false)} 
                pendingMovements={pendingMovements}
                articlesOut={articlesOut}
            />

        </MagLayout>
    );
}