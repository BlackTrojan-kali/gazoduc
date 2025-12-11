import React from 'react';
import RegLayout from '../../layout/RegLayout/RegLayout';
import { Head } from '@inertiajs/react';
import GaugeBottle from '../../components/GaugeBottle'; // Assuming GaugeBottle is reusable

// Props expected:
// stocks: array - Array of stock objects for cisterns.
//                 Each stock object should ideally contain:
//                 { id: ..., theorical_quantity: ..., quantity: ..., citerne: { name: ..., capacity_kg: ... } }
//                 Ensure 'citerne' (with its name and capacity_kg) is present for each stock.
const RegCiterne = ({ stocks }) => {

  return (
    <>
      <Head title="Regional Cistern Stocks" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-6">
          Regional Cistern Stocks Overview
        </h1>

        {/* --- No actions block here as requested --- */}

        {stocks && stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => {
              const citerneName = stock.citerne ? stock.citerne.name : 'Unknown Cistern';
              const maxCapacityKg = stock.citerne ? stock.citerne.capacity_kg : 0;

              const theoreticalQuantity = stock.theorical_quantity || 0;
              const actualQuantity = stock.quantity || 0;

              const discrepancy = theoreticalQuantity - actualQuantity;
              let discrepancyColorClass = 'text-gray-600 dark:text-gray-300';
              if (discrepancy > 0) {
                discrepancyColorClass = 'text-red-500 font-semibold';
              } else if (discrepancy < 0) {
                discrepancyColorClass = 'text-green-500 font-semibold';
              }

              return (
                <div
                  key={stock.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
                >
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
                    Cistern: {citerneName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Max Capacity: <span className="font-bold">{maxCapacityKg} kg</span>
                  </p>

                  <div className="flex justify-around w-full mb-4">
                    <GaugeBottle
                      quantity={theoreticalQuantity}
                      maxCapacity={maxCapacityKg}
                      label="Theoretical"
                    />
                    <GaugeBottle
                      quantity={actualQuantity}
                      maxCapacity={maxCapacityKg}
                      label="Actual"
                    />
                  </div>

                  <p className={`text-sm mt-3 ${discrepancyColorClass}`}>
                    Discrepancy: <span className="font-bold">{discrepancy} kg</span>
                  </p>

                  {/* No action buttons here as requested */}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <p className="text-lg">No cistern stock data available for the moment, monsieur. 😔</p>
          </div>
        )}
      </div>
    </>
  );
};

RegCiterne.layout = page => <RegLayout children={page} />;
export default RegCiterne;