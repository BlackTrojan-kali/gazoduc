import React from 'react';
import RegLayout from '../../layout/RegLayout/RegLayout';
import { Head } from '@inertiajs/react';

// Props expected:
// stocks: array - Array of stock objects, where each stock might look like:
//                 { id: ..., quantity: ..., article: { name: ... }, agency: { name: ... }, storage_type: 'Main Storage' }
//                 Ensure 'agency' and 'storage_type' are available on each stock object.
const RegIndex = ({ stocks }) => {
  // Define the maximum quantity for the gauge
  const MAX_QUANTITY_FOR_GAUGE = 10000; // You might want to adjust this based on regional stock capacity

  // Group stocks first by agency, then by storage_type
  const groupedStocks = stocks.reduce((acc, stock) => {
    const agencyName = stock.agency ? stock.agency.name : 'Unknown Agency';
    const storageType = stock.storage_type || 'Unspecified Storage'; // Default if storage_type is missing

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
      <Head title="Regional Stock Overview" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-6">
          Regional Stock Overview by Agency and Storage Type
        </h1>

        {Object.keys(groupedStocks).length > 0 ? (
          Object.entries(groupedStocks).map(([agencyName, agencyData]) => (
            <div key={agencyName} className="mb-8">
              <h2 className="text-2xl font-bold text-brand-700 dark:text-brand-400 mb-4">
                Agency: {agencyName}
              </h2>
              {Object.entries(agencyData).map(([storageType, stocksInType]) => (
                <div key={storageType} className="mb-6 ml-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-3">
                    Storage Type: {storageType}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stocksInType.map((stock) => {
                      const articleName = stock.article ? stock.article.name : 'Unknown Article';
                      const currentQuantity = stock.quantity || 0;

                      // Calculate gauge percentage
                      const percentage = Math.min(100, (currentQuantity / MAX_QUANTITY_FOR_GAUGE) * 100);

                      // Determine gauge color based on quantity
                      let gaugeColorClass = 'bg-blue-500'; // Default color
                      if (currentQuantity < 100) {
                        gaugeColorClass = 'bg-red-500';
                      } else if (currentQuantity < 1000) {
                        gaugeColorClass = 'bg-orange-500';
                      } else {
                        gaugeColorClass = 'bg-green-500';
                      }

                      return (
                        <div
                          key={stock.id}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                        >
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            {articleName}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            Quantity in stock: <span className="font-bold">{currentQuantity}</span>
                          </p>

                          <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                            <div
                              className={`h-3 rounded-full ${gaugeColorClass} transition-all duration-500 ease-out`}
                              style={{ width: `${percentage}%` }}
                              title={`${currentQuantity} / ${MAX_QUANTITY_FOR_GAUGE} (${percentage.toFixed(2)}%)`}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                            {percentage.toFixed(0)}% full
                          </p>
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
            <p className="text-lg">No stock data available at the regional level for the moment, monsieur. 😔</p>
          </div>
        )}
      </div>
    </>
  );
};

RegIndex.layout = page => <RegLayout children={page} />;
export default RegIndex;