import React from 'react';
import MagLayout from '../../layout/MagLayout/MagLayout';
import { Head } from '@inertiajs/react';
import GaugeBottle from '../../components/GaugeBottle'; // Assurez-vous du bon chemin d'importation

const MagCiterne = ({ stocks }) => {
  return (
    <>
      <Head title="Stocks Citernes" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-6">
          Gestion des Stocks de Citernes
        </h1>

        {stocks && stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => {
              const citerneName = stock.citerne ? stock.citerne.name : 'Citerne inconnue';
              const maxCapacityKg = stock.citerne ? stock.citerne.capacity_kg : 0;

              // Assurez-vous que ces propriétés existent dans votre objet stock
              const theoreticalQuantity = stock.theorical_quantity || 0;
              const actualQuantity = stock.quantity || 0;

              // Calcul de l'écart
              const discrepancy = theoreticalQuantity - actualQuantity;
              let discrepancyColorClass = 'text-gray-600 dark:text-gray-300'; // Couleur par défaut
              if (discrepancy > 0) {
                discrepancyColorClass = 'text-red-500 font-semibold'; // Écart positif (manque)
              } else if (discrepancy < 0) {
                discrepancyColorClass = 'text-green-500 font-semibold'; // Écart négatif (excédent)
              }

              return (
                <div
                  key={stock.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
                >
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
                    Citerne: {citerneName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Capacité Maximale: <span className="font-bold">{maxCapacityKg} kg</span>
                  </p>

                  <div className="flex justify-around w-full mb-4">
                    <GaugeBottle
                      quantity={theoreticalQuantity}
                      maxCapacity={maxCapacityKg}
                      label="Théorique"
                    />
                    <GaugeBottle
                      quantity={actualQuantity}
                      maxCapacity={maxCapacityKg}
                      label="Relevé"
                    />
                  </div>

                  {/* Affichage de l'écart */}
                  <p className={`text-sm mt-3 ${discrepancyColorClass}`}>
                    Écart: <span className="font-bold">{discrepancy} kg</span>
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <p className="text-lg">Aucun stock de citerne n'est disponible pour le moment, monsieur. 😔</p>
          </div>
        )}
      </div>
    </>
  );
}

MagCiterne.layout = page => <MagLayout children={page} />;
export default MagCiterne;