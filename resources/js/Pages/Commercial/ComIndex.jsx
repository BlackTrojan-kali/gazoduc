import React from 'react';
import { Head } from '@inertiajs/react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ComLayout from '../../layout/ComLayout/ComLayout';

const ComIndex = ({ 
  dailySalesDataVente, 
  totalMonthlySalesVente, 
  dailySalesDataConsigne, 
  totalMonthlySalesConsigne, 
  currentMonth 
}) => {
  return (
    <>
      <Head title="Tableau de Bord Commercial" />

      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Tableau de Bord - {currentMonth}
        </h1>

        {/* Totaux des chiffres d'affaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Chiffre d'affaires total des Ventes */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Chiffre d'Affaires Ventes
              </h2>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {totalMonthlySalesVente.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                (basé sur les factures de type "vente")
              </p>
            </div>

            {/* Chiffre d'affaires total des Consignes */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Chiffre d'Affaires Consignes
              </h2>
              <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                {totalMonthlySalesConsigne.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                (basé sur les factures de type "consigne")
              </p>
            </div>
        </div>

        {/* Graphiques quotidiens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Graphique des ventes quotidiennes */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Ventes Quotidiennes
              </h2>
              {dailySalesDataVente && dailySalesDataVente.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySalesDataVente} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                    <XAxis dataKey="date" stroke="#666" className="dark:stroke-gray-400" />
                    <YAxis stroke="#666" className="dark:stroke-gray-400" tickFormatter={(value) => value.toLocaleString('fr-FR')} />
                    <Tooltip
                      formatter={(value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} name="Ventes" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune donnée de vente pour le mois en cours, monsieur.
                </p>
              )}
            </div>

            {/* Graphique des consignes quotidiennes */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                Consignes Quotidiennes
              </h2>
              {dailySalesDataConsigne && dailySalesDataConsigne.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySalesDataConsigne} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                    <XAxis dataKey="date" stroke="#666" className="dark:stroke-gray-400" />
                    <YAxis stroke="#666" className="dark:stroke-gray-400" tickFormatter={(value) => value.toLocaleString('fr-FR')} />
                    <Tooltip
                      formatter={(value) => value.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#82ca9d" activeDot={{ r: 8 }} strokeWidth={2} name="Consignes" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune donnée de consigne pour le mois en cours, monsieur.
                </p>
              )}
            </div>
        </div>
      </div>
    </>
  );
};

ComIndex.layout = page => <ComLayout children={page} />;
export default ComIndex;