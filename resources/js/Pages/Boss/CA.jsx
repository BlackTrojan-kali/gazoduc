import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faMoneyBillWave, faBoxOpen } from '@fortawesome/free-solid-svg-icons';

// --- Composant Tooltip Personnalisé pour le Graphique ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl">
        <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="text-gray-600 dark:text-gray-300 capitalize">{entry.name}:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- Composant Tableau Réutilisable ---
const MonthlyTable = ({ title, data, icon, colorClass, headerColorClass }) => {
  const months = Array.from({ length: 12 }, (_, i) => 
    new Date(0, i).toLocaleString('fr', { month: 'short' })
  );

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700 overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-700 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${headerColorClass}`}>
          <FontAwesomeIcon icon={icon} className={colorClass} />
        </div>
        <h3 className="text-lg font-bold leading-6 text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm whitespace-nowrap text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-6 py-3 font-semibold text-gray-900 dark:text-white shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                Agence
              </th>
              {months.map((month, i) => (
                <th key={i} className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right capitalize">
                  {month}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-6 py-4 font-medium text-gray-900 dark:text-white shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
                  {row.agency}
                </td>
                {row.monthlyTotals.map((val, i) => (
                  <td key={i} className="px-4 py-4 text-right text-gray-600 dark:text-gray-300 font-mono">
                    {val ? val.toLocaleString() : <span className="text-gray-300 dark:text-gray-600">-</span>}
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

const SalesDashboard = () => {
  const { charts, tables, year } = usePage().props;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 transition-colors duration-500">
      <div className="p-6 md:p-8 space-y-8 max-w-[1920px] mx-auto">
        <Head title={`Chiffres d'Affaires ${year}`} />

        {/* === HEADER === */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tableau de Bord Commercial
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Analyse détaillée des performances pour l'année <span className="font-semibold text-brand-600 dark:text-brand-400">{year}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 dark:bg-gray-800 dark:text-white dark:ring-gray-700">
              📅 Exercice {year}
            </span>
          </div>
        </div>

        {/* === GRAPHIQUE === */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <FontAwesomeIcon icon={faChartLine} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Évolution du Chiffre d'Affaires
              </h2>
            </div>
            {/* Légende personnalisée simple */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                <span className="text-gray-600 dark:text-gray-300">Ventes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500"></span>
                <span className="text-gray-600 dark:text-gray-300">Consignes</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlySales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }} 
                  tickFormatter={(value) => `${value / 1000}k`} // Formatage k (milliers) pour gagner de la place
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="vente" 
                  stroke="#10B981" // Emerald-500
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  name="Ventes"
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="consigne" 
                  stroke="#3B82F6" // Blue-500
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 7, strokeWidth: 0 }}
                  name="Consignes"
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === GRILLE DES TABLEAUX === */}
        <div className="space-y-8">
          
          {/* Tableau Ventes */}
          <MonthlyTable 
            title="Détail des Ventes par Agence" 
            data={tables.ventes} 
            icon={faMoneyBillWave}
            headerColorClass="bg-emerald-50 dark:bg-emerald-900/20"
            colorClass="text-emerald-600 dark:text-emerald-400"
          />

          {/* Tableau Consignes */}
          <MonthlyTable 
            title="Détail des Consignes par Agence" 
            data={tables.consignes} 
            icon={faBoxOpen}
            headerColorClass="bg-blue-50 dark:bg-blue-900/20"
            colorClass="text-blue-600 dark:text-blue-400"
          />

        </div>
      </div>
    </div>
  );
};

SalesDashboard.layout = page => <CEOLayout children={page} />;
export default SalesDashboard;