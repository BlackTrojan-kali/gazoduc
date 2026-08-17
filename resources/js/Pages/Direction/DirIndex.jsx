import React, { useState, useMemo, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import DirLayout from '../../layout/DirLayout/DirLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFolder, 
    faFolderOpen, 
    faChevronRight, 
    faChevronDown, 
    faBuilding, 
    faBoxesStacked, 
    faSearch,
    faCube,
    faMoneyBillWave,
    faFilePdf
} from '@fortawesome/free-solid-svg-icons';

const MAX_QUANTITY_FOR_GAUGE = 10000;

const DirIndex = () => {
    const { stocks } = usePage().props;
    const stocksData = Array.isArray(stocks) ? stocks : [];

    const [searchTerm, setSearchTerm] = useState('');
    const [expandedAgencies, setExpandedAgencies] = useState({});
    const [expandedStorages, setExpandedStorages] = useState({});

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
    };

    const filteredStocks = useMemo(() => {
        if (!searchTerm) return stocksData;
        const lowerSearch = searchTerm.toLowerCase();
        
        return stocksData.filter(stock => 
            (stock.agency?.name || '').toLowerCase().includes(lowerSearch) ||
            (stock.article?.name || '').toLowerCase().includes(lowerSearch) ||
            (stock.storage_type || '').toLowerCase().includes(lowerSearch)
        );
    }, [stocksData, searchTerm]);

    const groupedData = useMemo(() => {
        const structure = {};

        filteredStocks.forEach(stock => {
            const agencyName = stock.agency ? stock.agency.name : 'Agence Inconnue';
            const storageType = stock.storage_type ? 
                (stock.storage_type.charAt(0).toUpperCase() + stock.storage_type.slice(1)) : 
                'Non spécifié';

            if (!structure[agencyName]) {
                structure[agencyName] = {};
            }
            if (!structure[agencyName][storageType]) {
                structure[agencyName][storageType] = [];
            }

            structure[agencyName][storageType].push(stock);
        });

        return structure;
    }, [filteredStocks]);

    useEffect(() => {
        if (searchTerm) {
            const allAgencies = {};
            const allStorages = {};
            
            Object.keys(groupedData).forEach(agency => {
                allAgencies[agency] = true;
                Object.keys(groupedData[agency]).forEach(storage => {
                    allStorages[`${agency}-${storage}`] = true;
                });
            });
            setExpandedAgencies(allAgencies);
            setExpandedStorages(allStorages);
        }
    }, [searchTerm, groupedData]);

    const toggleAgency = (agencyName) => {
        setExpandedAgencies(prev => ({ ...prev, [agencyName]: !prev[agencyName] }));
    };

    const toggleStorage = (agencyName, storageName) => {
        const key = `${agencyName}-${storageName}`;
        setExpandedStorages(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Génération de l'URL du PDF avec filtre de recherche
    const pdfExportUrl = `${route('direction.export.pdf')}?search=${encodeURIComponent(searchTerm)}`;

    return (
        <>
            <Head title="Aperçu du Stock Direction" />
            
            <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                {/* En-tête */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <span className="bg-brand-600 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-lg">
                                <FontAwesomeIcon icon={faBoxesStacked} />
                            </span>
                            Supervision Globale des Stocks
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 ml-14">
                            Vue consolidée et estimation du remboursement transport CSPH[cite: 1].
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        {/* Bouton Exportation PDF */}
                        <a
                            href={pdfExportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700/50 transition"
                        >
                            <FontAwesomeIcon icon={faFilePdf} />
                            Exporter PDF Péréquation
                        </a>

                        {/* Barre de recherche */}
                        <div className="relative w-full md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher une agence, un article..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* --- DOSSIERS PAR AGENCE --- */}
                <div className="space-y-6">
                    {Object.entries(groupedData).map(([agencyName, storageMap]) => {
                        const isAgencyOpen = expandedAgencies[agencyName];
                        const totalItemsInAgency = Object.values(storageMap).flat().length;

                        return (
                            <div key={agencyName} className="border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
                                
                                <div 
                                    onClick={() => toggleAgency(agencyName)}
                                    className="flex items-center justify-between p-5 cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors ${isAgencyOpen ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'}`}>
                                            <FontAwesomeIcon icon={faBuilding} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{agencyName}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                    {Object.keys(storageMap).length} lieux de stockage
                                                </span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {totalItemsInAgency} référence(s)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        <FontAwesomeIcon icon={isAgencyOpen ? faChevronDown : faChevronRight} size="lg" />
                                    </div>
                                </div>

                                {isAgencyOpen && (
                                    <div className="p-5 space-y-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                        {Object.entries(storageMap).map(([storageType, stocksList]) => {
                                            const storageKey = `${agencyName}-${storageType}`;
                                            const isStorageOpen = expandedStorages[storageKey];

                                            return (
                                                <div key={storageKey} className="ml-2 md:ml-6 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                                                    
                                                    <div 
                                                        onClick={() => toggleStorage(agencyName, storageType)}
                                                        className="flex items-center justify-between py-3 pr-2 cursor-pointer group select-none rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 px-2 transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-yellow-500 dark:text-yellow-600">
                                                                <FontAwesomeIcon icon={isStorageOpen ? faFolderOpen : faFolder} size="lg" />
                                                            </div>
                                                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-brand-600 transition-colors text-lg">
                                                                {storageType}
                                                            </h3>
                                                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                                                                {stocksList.length}
                                                            </span>
                                                        </div>
                                                        <div className="text-gray-300 group-hover:text-gray-500">
                                                            <FontAwesomeIcon icon={isStorageOpen ? faChevronDown : faChevronRight} />
                                                        </div>
                                                    </div>

                                                    {isStorageOpen && (
                                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                                                            {stocksList.map((stock) => {
                                                                const articleName = stock.article ? stock.article.name : 'Article Inconnu';
                                                                const currentQuantity = Number(stock.quantity) || 0;
                                                                const percentage = Math.min(100, (currentQuantity / MAX_QUANTITY_FOR_GAUGE) * 100);
                                                                const expectedCsphRefund = stock.expected_csph_refund ?? 0;

                                                                let gaugeColorClass = 'bg-blue-500';
                                                                if (currentQuantity <= 0) gaugeColorClass = 'bg-gray-400';
                                                                else if (currentQuantity < 100) gaugeColorClass = 'bg-red-500';
                                                                else if (currentQuantity < 1000) gaugeColorClass = 'bg-orange-500';
                                                                else gaugeColorClass = 'bg-green-500';

                                                                return (
                                                                    <div key={stock.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all flex flex-col justify-between">
                                                                        <div>
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                                    <div className="bg-white dark:bg-gray-800 p-1.5 rounded shadow-sm text-gray-400">
                                                                                        <FontAwesomeIcon icon={faCube} />
                                                                                    </div>
                                                                                    <div className="flex flex-col overflow-hidden">
                                                                                        <span className="font-bold text-gray-800 dark:text-white text-sm truncate" title={articleName}>
                                                                                            {articleName}
                                                                                        </span>
                                                                                        {stock.citerne && (
                                                                                            <span className="text-[10px] text-gray-500 truncate">
                                                                                                {stock.citerne.name}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <span className="text-sm font-bold font-mono text-gray-700 dark:text-gray-200">
                                                                                    {currentQuantity.toLocaleString()}
                                                                                </span>
                                                                            </div>

                                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2 overflow-hidden mb-2">
                                                                                <div
                                                                                    className={`h-full rounded-full ${gaugeColorClass} transition-all duration-500 ease-out relative`}
                                                                                    style={{ width: `${percentage}%` }}
                                                                                >
                                                                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* AFFICHE TOUJOURS LA SUBVENTION (MÊME SI ÉGALE À 0 FCFA) */}
                                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                                                    Subvention CSPH :
                                                                                </span>
                                                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold ${expectedCsphRefund > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                                                                    <FontAwesomeIcon icon={faMoneyBillWave} />
                                                                                    {formatCurrency(expectedCsphRefund)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {Object.keys(groupedData).length === 0 && (
                        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun stock trouvé</h3>
                            <p className="text-gray-500 mt-1">Essayez avec un autre terme de recherche.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

DirIndex.layout = (page) => <DirLayout children={page} />;
export default DirIndex;