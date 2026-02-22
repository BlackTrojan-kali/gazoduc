// resources/js/Pages/GasMedical/Inventory.jsx

import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DirLayout from '../../../layout/DirLayout/DirLayout'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBuilding, faBoxOpen, faTimes, faMapMarkerAlt, faWarehouse, faIndustry, faStore } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select'; 

export default function Inventory({ agencies, groupedStocks, searchedBottle, filters }) {
    // Conversion des agences pour react-select
    const agencyOptions = agencies.map(agency => ({
        value: agency.id,
        label: agency.name
    }));

    // Trouver l'option initiale si un filtre est présent
    const initialAgencyOption = agencyOptions.find(opt => opt.value == filters?.agency_id) || null;

    const [selectedAgency, setSelectedAgency] = useState(initialAgencyOption);
    const [searchCode, setSearchCode] = useState(filters?.code || '');

    // Styles personnalisés pour react-select
    const customStyles = {
        control: (base, state) => ({
            ...base,
            paddingLeft: '2.5rem', // Espace pour l'icône
            minHeight: '42px',
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
            },
            backgroundColor: 'transparent',
        }),
        menu: (base) => ({
            ...base,
            zIndex: 9999 // Z-index très élevé pour passer au-dessus des autres éléments
        }),
        menuPortal: base => ({ ...base, zIndex: 9999 }) // Utile si utilisé avec menuPortalTarget
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('gas_medical.inventory'), {
            agency_id: selectedAgency ? selectedAgency.value : '',
            code: searchCode
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSelectedAgency(null);
        setSearchCode('');
        router.get(route('gas_medical.inventory'));
    };

    return (
        <DirLayout>
            <Head title="Inventaire Oxygène" />

            {/* RETRAIT de overflow-hidden ici pour que le menu react-select puisse déborder */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg mb-6 relative z-10">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        Localisation et Inventaire des Bouteilles
                    </h2>
                    
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Filtre par Agence avec React-Select */}
                        <div className="flex-1 w-full">
                            <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Inventaire par Agence
                            </label>
                            <div className="relative">
                                {/* L'icône est positionnée absolument pour s'afficher par-dessus le select */}
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                                    <FontAwesomeIcon icon={faBuilding} className="text-gray-400" />
                                </div>
                                <Select
                                    id="agency_id"
                                    options={agencyOptions}
                                    value={selectedAgency}
                                    onChange={(option) => {
                                        setSelectedAgency(option);
                                        setSearchCode('');
                                    }}
                                    placeholder="Sélectionner une agence..."
                                    isClearable
                                    styles={customStyles}
                                    className="react-select-container text-gray-900"
                                    classNamePrefix="react-select"
                                    menuPortalTarget={document.body} // Ceci détache le menu du conteneur parent, réglant 99% des problèmes de coupure
                                />
                            </div>
                        </div>

                        <div className="hidden md:flex items-center pb-2 text-gray-400 font-bold">OU</div>

                        {/* Recherche par Code-barres */}
                        <div className="flex-1 w-full">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Chercher une bouteille (Code)
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
                                        setSelectedAgency(null);
                                    }}
                                    placeholder="Scanner ou taper le code..."
                                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    style={{ minHeight: '42px' }}
                                />
                            </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex gap-2 w-full md:w-auto relative z-0">
                            <button
                                type="submit"
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-150 h-[42px]"
                            >
                                Rechercher
                            </button>
                            {(selectedAgency || searchCode) && (
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
            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg p-6 relative z-0">
                
                {/* SCÉNARIO 1 : Une bouteille précise */}
                {searchedBottle ? (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b pb-2">
                            Résultat de la recherche
                        </h3>
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="bg-blue-100 dark:bg-blue-800 p-4 rounded-full text-blue-600 dark:text-blue-200">
                                <FontAwesomeIcon icon={faMapMarkerAlt} size="2x" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {searchedBottle.article.name}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    Code : <span className="font-mono font-semibold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{searchedBottle.article.code}</span>
                                </p>
                                <p className="text-gray-600 dark:text-gray-300 mt-1">
                                    Emplacement : <span className="uppercase font-semibold">{searchedBottle.storage_type}</span>
                                </p>
                            </div>
                            <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Localisation actuelle</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {searchedBottle.agency.name}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : 
                
                /* SCÉNARIO 2 : Inventaire détaillé de l'agence */
                (selectedAgency && groupedStocks) ? (
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 border-b pb-2">
                            Inventaire détaillé : {selectedAgency.label}
                        </h3>
                        {/* On affiche le tableau même si les totaux sont à 0, pourvu qu'il y ait des articles configurés */}
                        {groupedStocks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r dark:border-gray-600">
                                                Type de Bouteille
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <FontAwesomeIcon icon={faWarehouse} className="mr-2" title="Magasin" /> Magasin
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                <FontAwesomeIcon icon={faIndustry} className="mr-2" title="Production" /> Production
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r dark:border-gray-600">
                                                <FontAwesomeIcon icon={faStore} className="mr-2" title="Commercial" /> Commercial
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-100 uppercase tracking-wider bg-gray-100 dark:bg-gray-600">
                                                TOTAL
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
                                                {/* On affiche toujours la valeur, 0 ou plus. Grisé si 0. */}
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${stock.magasin > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {stock.magasin}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${stock.production > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {stock.production}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-center border-r dark:border-gray-600 ${stock.commercial > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                                                    {stock.commercial}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold bg-gray-50 dark:bg-gray-750 ${stock.total > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                                    {stock.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-3 opacity-50" />
                                <p>Aucun type de bouteille d'oxygène n'est configuré dans le système.</p>
                            </div>
                        )}
                    </div>
                ) : 
                
                /* SCÉNARIO 3 : État initial */
                (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <FontAwesomeIcon icon={faSearch} size="3x" className="mb-4 opacity-30" />
                        <p className="text-lg">Veuillez sélectionner une agence ou scanner un code-barres pour visualiser l'inventaire.</p>
                        {searchCode && !searchedBottle && (
                            <p className="text-red-500 mt-4 font-semibold">Aucune bouteille trouvée ou physiquement présente avec le code : {searchCode}</p>
                        )}
                    </div>
                )}
            </div>
        </DirLayout>
    );
}