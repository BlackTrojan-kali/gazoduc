import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSearch, faExchangeAlt, faFileDownload, 
    faBarcode, faIndustry, faMapMarkerAlt, faTimes, 
    faBoxes,
    faBoxOpen
} from '@fortawesome/free-solid-svg-icons';
import ProdLayout from '../../../layout/ProdLayout/ProdLayout'; // Ajustez le chemin vers votre layout de production
import ReceiveGasModal from '../../../components/Modals/MedGas/ReceiveGasModal';
import TransferGasModal from '../../../components/Modals/MedGas/TransferGasModal';

export default function Inventory({ 
    auth, 
    groupedStocks, 
    searchedBottle, 
    filters, 
    userAgencyName, 
    availableCodes = [], 
    availableArticlesForTransfer = [],
    pendingMovements = [], 
    articlesOut = []       
}) {
    
    // États pour la recherche
    const [searchCode, setSearchCode] = useState(filters?.code || '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);
    
    // États pour les modales
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false); 

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
        router.get(route('prod_medical.inventory'), {
            code: searchCode
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearchCode('');
        setShowSuggestions(false);
        router.get(route('prod_medical.inventory'));
    };

    const handleSelectSuggestion = (code) => {
        setSearchCode(code);
        setShowSuggestions(false);
        router.get(route('prod_medical.inventory'), { code: code }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <ProdLayout>
            <Head title={`Stock Production - ${userAgencyName}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* En-tête principal avec les boutons d'action */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                <FontAwesomeIcon icon={faIndustry} className="text-blue-600 dark:text-blue-400" />
                                Centre de Production
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                Agence : <span className="font-semibold text-blue-500">{userAgencyName}</span>
                            </p>
                        </div>

                        {/* Conteneur pour grouper les boutons d'action */}
                        <div className="flex flex-wrap gap-3">
                            {/* Bouton de Réception (Entrée) */}
                            <button
                                onClick={() => setIsReceiveModalOpen(true)}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md flex items-center gap-2 transition-all transform hover:scale-105"
                            >
                                <FontAwesomeIcon icon={faFileDownload} />
                                Réceptionner (du Magasin)
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
                                Envoyer au Magasin
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-8 relative z-20">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                                {/* Recherche par Code-barres avec Autocomplétion */}
                                <div className="flex-1 w-full relative" ref={suggestionRef}>
                                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Vérifier la présence d'une bouteille en prod (Code)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                                            <FontAwesomeIcon icon={faBarcode} className="text-gray-400" />
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
                                            className="block w-full pl-10 pr-3 py-3 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-blue-500 focus:border-blue-500"
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
                                        className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                    {searchCode && (
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="text-red-500 hover:text-red-700 px-4 font-bold uppercase text-sm transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTimes} className="mr-1" />
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Zone d'affichage des résultats */}
                    <div className="relative z-10">
                        
                        {/* SCÉNARIO 1 : Recherche active par code-barres */}
                        {searchCode && !showSuggestions && filters?.code ? (
                            searchedBottle ? (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4">
                                    <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-4 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faSearch} /> Résultat de la recherche
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-xs uppercase text-gray-500 font-bold">Désignation</p>
                                            <p className="text-lg font-semibold dark:text-white">{searchedBottle.article.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-gray-500 font-bold">Code Bouteille</p>
                                            <p className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{searchedBottle.article.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-gray-500 font-bold">État actuel</p>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                                {searchedBottle.article.state || 'Disponible'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-gray-500 font-bold">Emplacement</p>
                                            <p className="text-lg font-semibold dark:text-white capitalize">{searchedBottle.storage_type}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-red-50 text-red-600 rounded-2xl mb-8 border border-red-200 text-center">
                                    <FontAwesomeIcon icon={faTimes} size="2x" className="mb-2 opacity-80" />
                                    <p className="text-lg font-bold">Bouteille introuvable en production.</p>
                                    <p className="mt-1 text-sm">Le code <span className="font-mono bg-white px-1 rounded">{searchCode}</span> n'existe pas ou la bouteille est actuellement dans un autre service.</p>
                                </div>
                            )
                        ) : 
                        
                        /* SCÉNARIO 2 : Affichage du tableau (État par défaut) */
                        (
                            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b pb-2 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBoxes} className="text-gray-500" />
                                    Aperçu Global de la Production
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
                                                        Quantité en Production
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
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold bg-gray-50 dark:bg-gray-750 ${stock.production > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                                            {stock.production}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3 opacity-50" />
                                        <p>Aucune bouteille d'oxygène n'est actuellement en production.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modale de Transfert Multiple (Sortie vers Magasin/Commercial) */}
            <TransferGasModal 
                isOpen={isTransferModalOpen} 
                onClose={() => setIsTransferModalOpen(false)} 
                availableArticles={availableArticlesForTransfer} 
                currentStorage="production" // <-- CRUCIAL: Indique à la modale qu'on est en production
            />

            {/* Modale de Réception Multiple (Entrée depuis Magasin) */}
            <ReceiveGasModal 
                isOpen={isReceiveModalOpen} 
                onClose={() => setIsReceiveModalOpen(false)} 
                pendingMovements={pendingMovements}
                articlesOut={articlesOut}
            />

        </ProdLayout>
    );
}