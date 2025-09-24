import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import DirLayout from '../../layout/DirLayout/DirLayout';

// Définition d'une quantité maximale de référence pour la jauge
// Cette valeur peut être ajustée en fonction de la capacité de stockage attendue.
const MAX_QUANTITY_FOR_GAUGE = 10000;

const DirIndex = () => {
  // Récupération des données de stocks passées via Inertia.js
  const { stocks } = usePage().props;

  // Si 'stocks' n'est pas un tableau, on initialise un tableau vide
  const stocksData = Array.isArray(stocks) ? stocks : [];

  // Groupe les stocks par agence, puis par type de stockage
  const groupedStocks = stocksData.reduce((acc, stock) => {
    // S'assure que l'agence et le type de stockage existent
    const agencyName = stock.agency ? stock.agency.name : 'Agence Inconnue';
    const storageType = stock.storage_type || 'Stockage non spécifié';

    if (!acc[agencyName]) {
      acc[agencyName] = {};
    }
    if (!acc[agencyName][storageType]) {
      acc[agencyName][storageType] = [];
    }
    acc[agencyName][storageType].push(stock);
    return acc;
  }, {});

  return (
    <>
      <Head title="Aperçu du Stock Direction" />
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white/90 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          Aperçu du Stock Général par Agence
        </h1>

        {Object.keys(groupedStocks).length > 0 ? (
          Object.entries(groupedStocks).map(([agencyName, agencyData]) => (
            <div key={agencyName} className="mb-10">
              <h2 className="text-2xl font-bold text-brand-700 dark:text-brand-400 mb-4 px-4">
                Agence: {agencyName}
              </h2>
              {Object.entries(agencyData).map(([storageType, stocksInType]) => (
                <div key={storageType} className="mb-8 ml-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4 pl-4 border-l-4 border-brand-500">
                    Type de Stockage: {storageType}
                  </h3>
                  {/* Utilisation d'un flexbox pour une disposition compacte et adaptable */}
                  <div className="flex flex-col gap-3">
                    {stocksInType.map((stock) => {
                      const articleName = stock.article ? stock.article.name : 'Article Inconnu';
                      const currentQuantity = stock.quantity || 0;

                      // Calcul du pourcentage de la jauge
                      const percentage = Math.min(100, (currentQuantity / MAX_QUANTITY_FOR_GAUGE) * 100);

                      // Détermination de la couleur de la jauge
                      let gaugeColorClass = 'bg-blue-500'; // Couleur par défaut
                      if (currentQuantity < 100) {
                        gaugeColorClass = 'bg-red-500'; // Stock bas
                      } else if (currentQuantity < 1000) {
                        gaugeColorClass = 'bg-orange-500'; // Stock moyen
                      } else {
                        gaugeColorClass = 'bg-green-500'; // Stock élevé
                      }

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
                                {/* Affiche le nom de la citerne si le stock y est lié */}
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
                          
                          {/* Jauge fine pour le niveau de stock */}
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
            <p className="text-lg">Aucune donnée de stock disponible à la direction pour le moment, monsieur. 😔</p>
          </div>
        )}
      </div>
    </>
  );
};

// Application du layout DirLayout au composant
DirIndex.layout = page => <DirLayout children={page} />;
export default DirIndex;
