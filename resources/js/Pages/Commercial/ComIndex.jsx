import React from 'react';
import { Head } from '@inertiajs/react'; // Importer Head si vous voulez définir le titre de la page

// Importez les composants de Recharts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ComLayout from '../../layout/ComLayout/ComLayout';

const ComIndex = ({ dailySalesData, totalMonthlySales, currentMonth }) => {
  return (
    <>
      <Head title="Tableau de Bord Ventes" />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Statistiques de Ventes - {currentMonth}
        </h1>

        {/* Chiffre d'affaires total du mois */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Chiffre d'Affaires Total du Mois
          </h2>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            {totalMonthlySales.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            (estimation, basé sur les montants de facture)
          </p>
        </div>

        {/* Graphique des ventes quotidiennes */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            Chiffre d'Affaires Quotidien
          </h2>
          {dailySalesData && dailySalesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={dailySalesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600"/>
                <XAxis dataKey="date" stroke="#666" className="dark:stroke-gray-400" />
                <YAxis
                  stroke="#666"
                  className="dark:stroke-gray-400"
                  tickFormatter={(value) => value.toLocaleString('fr-FR')} // Formatage des valeurs Y
                />
                <Tooltip
                  formatter={(value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ color: '#333' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name="Ventes" // Nom de la ligne dans le tooltip
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Aucune donnée de vente pour le mois en cours, monsieur.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

ComIndex.layout = page => <ComLayout children={page} />;
export default ComIndex;