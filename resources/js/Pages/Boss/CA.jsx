import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';

const SalesDashboard = () => {
  const { charts, tables, year } = usePage().props;

  // Détection du mode sombre (via Tailwind dark:)
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Couleurs selon le thème
  const textColor = isDarkMode ? '#d1d5db' : '#374151'; // gray-300 / gray-700
  const gridColor = isDarkMode ? '#374151' : '#e5e7eb'; // gray-700 / gray-200
  const bgColor = isDarkMode ? '#1f2937' : '#ffffff'; // gray-800 / white

  return (
    <div className="p-6 space-y-8">
      <Head title={`Chiffres d'Affaires ${year}`} />

      {/* === TITRE PRINCIPAL === */}
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Tableau de bord des ventes et consignes ({year})
      </h1>

      {/* === GRAPHIQUE DES VENTES ET CONSIGNES === */}
      <div className="shadow rounded-lg p-4 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Chiffre d'affaires mensuel
        </h2>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.monthlySales}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={textColor} />
              <YAxis stroke={textColor} />
              <Tooltip
                contentStyle={{
                  backgroundColor: bgColor,
                  borderColor: gridColor,
                  color: textColor,
                }}
              />
              <Legend wrapperStyle={{ color: textColor }} />
              <Line type="monotone" dataKey="vente" stroke="#16a34a" strokeWidth={2} name="Ventes" />
              <Line type="monotone" dataKey="consigne" stroke="#2563eb" strokeWidth={2} name="Consignes" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === TABLEAU VENTES PAR AGENCE === */}
      <div className="shadow rounded-lg p-4 overflow-x-auto bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Ventes par agence</h2>
        <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <tr>
              <th className="border p-2">Agence</th>
              {Array.from({ length: 12 }).map((_, i) => (
                <th key={i} className="border p-2 text-center">
                  {new Date(0, i).toLocaleString('fr', { month: 'short' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tables.ventes.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border p-2 font-medium text-gray-700 dark:text-gray-200">{row.agency}</td>
                {row.monthlyTotals.map((val, i) => (
                  <td key={i} className="border text-center p-2 text-gray-600 dark:text-gray-300">
                    {val ? val.toLocaleString() : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* === TABLEAU CONSIGNES PAR AGENCE === */}
      <div className="shadow rounded-lg p-4 overflow-x-auto bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-200">Consignes par agence</h2>
        <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <tr>
              <th className="border p-2">Agence</th>
              {Array.from({ length: 12 }).map((_, i) => (
                <th key={i} className="border p-2 text-center">
                  {new Date(0, i).toLocaleString('fr', { month: 'short' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tables.consignes.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border p-2 font-medium text-gray-700 dark:text-gray-200">{row.agency}</td>
                {row.monthlyTotals.map((val, i) => (
                  <td key={i} className="border text-center p-2 text-gray-600 dark:text-gray-300">
                    {val ? val.toLocaleString() : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

SalesDashboard.layout = page => <CEOLayout children={page} />;
export default SalesDashboard;
