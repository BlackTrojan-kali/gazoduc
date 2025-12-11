import React, { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import DirLayout from '../../layout/DirLayout/DirLayout';

const MAX_QUANTITY_FOR_GAUGE = 10000;

const DirIndex = () => {
  const { stocks } = usePage().props;
  const stocksData = Array.isArray(stocks) ? stocks : [];

  // État de la recherche
  const [searchTerm, setSearchTerm] = useState('');

  // Regroupement des stocks par agence puis par type de stockage
  const groupedStocks = useMemo(() => {
    return stocksData.reduce((acc, stock) => {
      const agencyName = stock.agency ? stock.agency.name : 'Agence Inconnue';
      const storageType = stock.storage_type || 'Stockage non spécifié';

      if (!acc[agencyName]) acc[agencyName] = {};
      if (!acc[agencyName][storageType]) acc[agencyName][storageType] = [];

      acc[agencyName][storageType].push(stock);
      return acc;
    }, {});
  }, [stocksData]);

  // Filtrage dynamique selon le texte recherché
  const filteredAgencies = useMemo(() => {
    const lowerSearch = searchTerm.trim().toLowerCase();
    if (!lowerSearch) return groupedStocks;

    // Filtre les agences dont le nom correspond
    return Object.keys(groupedStocks)
      .filter((agencyName) => agencyName.toLowerCase().includes(lowerSearch))
      .reduce((acc, agencyName) => {
        acc[agencyName] = groupedStocks[agencyName];
        return acc;
      }, {});
  }, [groupedStocks, searchTerm]);

  return (
    <>
      <Head title="Aperçu du Stock Direction" />
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white/90 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          Aperçu du Stock Général par Agence
        </h1>

        {/* Barre de recherche */}
        <div className="mb-8 flex items-center justify-between">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une agence..."
            className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
          />
        </div>

        {/* Affichage des agences filtrées */}
        {Object.keys(filteredAgencies).length > 0 ? (
          Object.entries(filteredAgencies).map(([agencyName, agencyData]) => (
            <div key={agencyName} className="mb-10">
              <h2 className="text-2xl font-bold text-brand-700 dark:text-brand-400 mb-4 px-4">
                Agence: {agencyName}
              </h2>
              {Object.entries(agencyData).map(([storageType, stocksInType]) => (
                <div key={storageType} className="mb-8 ml-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4 pl-4 border-l-4 border-brand-500">
                    Type de Stockage: {storageType}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {stocksInType.map((stock) => {
                      const articleName = stock.article ? stock.article.name : 'Article Inconnu';
                      const currentQuantity = stock.quantity || 0;
                      const percentage = Math.min(100, (currentQuantity / MAX_QUANTITY_FOR_GAUGE) * 100);

                      let gaugeColorClass = 'bg-blue-500';
                      if (currentQuantity < 100) gaugeColorClass = 'bg-red-500';
                      else if (currentQuantity < 1000) gaugeColorClass = 'bg-orange-500';
                      else gaugeColorClass = 'bg-green-500';

                      return (
                        <div
                          key={stock.id}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 transition-shadow duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-base font-semibold text-gray-800 dark:text-white/90 truncate">
                                {articleName}
                              </span>
                              {stock.citerne && (
                                <span className="block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Cuve: {stock.citerne.name}
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300 ml-4">
                              {currentQuantity}
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-700">
                            <div
                              className={`h-2 rounded-full ${gaugeColorClass} transition-all duration-500 ease-out`}
                              style={{ width: `${percentage}%` }}
                              title={`${currentQuantity} / ${MAX_QUANTITY_FOR_GAUGE} (${percentage.toFixed(2)}%)`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <p className="text-lg">Aucune agence trouvée pour "{searchTerm}". 😔</p>
          </div>
        )}
      </div>
    </>
  );
};

DirIndex.layout = (page) => <DirLayout children={page} />;
export default DirIndex;
