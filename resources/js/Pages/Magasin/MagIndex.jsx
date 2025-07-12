import React from 'react';
import MagLayout from '../../layout/MagLayout/MagLayout';
import { Head } from '@inertiajs/react';

const MagIndex = ({ stocks }) => {
  // Définir la quantité maximale pour la jauge
  const MAX_QUANTITY_FOR_GAUGE = 10000;

  return (
    <>
      <Head title="Stock Magasin" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-6">
          Vue d'Ensemble des Stocks par Article
        </h1>

        {stocks && stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => {
              // Assurez-vous que stock.article et stock.quantity existent
              const articleName = stock.article ? stock.article.name : 'Article inconnu';
              const currentQuantity = stock.quantity || 0;

              // Calcul du pourcentage de remplissage de la jauge
              const percentage = Math.min(100, (currentQuantity / MAX_QUANTITY_FOR_GAUGE) * 100);

              // Définir la couleur de la jauge en fonction des nouvelles conditions
              let gaugeColorClass = 'bg-blue-500'; // Couleur par défaut si aucune condition n'est remplie
              if (currentQuantity < 100) { // Nouvelle condition: Rouge si moins de 100
                gaugeColorClass = 'bg-red-500';
              } else if (currentQuantity < 1000) { // Orange si moins de 1000 (et au moins 100)
                gaugeColorClass = 'bg-orange-500';
              } else { // Vert si 1000 ou plus
                gaugeColorClass = 'bg-green-500';
              }

              return (
                <div
                  key={stock.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                >
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {articleName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Quantité en stock : <span className="font-bold">{currentQuantity}</span>
                  </p>

                  <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                    <div
                      className={`h-3 rounded-full ${gaugeColorClass} transition-all duration-500 ease-out`}
                      style={{ width: `${percentage}%` }}
                      title={`${currentQuantity} / ${MAX_QUANTITY_FOR_GAUGE} (${percentage.toFixed(2)}%)`}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    {percentage.toFixed(0)}% rempli
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <p className="text-lg">Aucun stock n'est disponible pour le moment, monsieur. 😔</p>
          </div>
        )}
      </div>
    </>
  );
};

MagIndex.layout = page => <MagLayout children={page} />;
export default MagIndex;