import React from "react";
import { usePage, Head } from "@inertiajs/react";
import CEOFuelLayout from "../../layout/CEOFuelLayout/CEOFuelLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FuelPaymentConsolidated = () => {
  const { year, report } = usePage().props;

  return (
    <div className="p-6 space-y-6">
      <Head title={`Versements carburant ${year}`} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Versements consolidés du carburant ({year})
      </h1>

      {/* 🔹 Tableau résumé */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="p-2 border">Mois</th>
              <th className="p-2 border text-right">Nombre de versements</th>
              <th className="p-2 border text-right">Montant total (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {report.length > 0 ? (
              report.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border p-2">{row.month_name}</td>
                  <td className="border p-2 text-right">{row.total_payments}</td>
                  <td className="border p-2 text-right font-semibold">
                    {row.total_amount.toLocaleString()} ₣
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-gray-500 p-4">
                  Aucune donnée disponible
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Graphique des montants par mois */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Graphique des montants versés par mois
        </h2>
        {report.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={report} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString() + " ₣"} />
              <Bar dataKey="total_amount" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">Aucune donnée à afficher</p>
        )}
      </div>
    </div>
  );
};

FuelPaymentConsolidated.layout = (page) => <CEOFuelLayout children={page} />;
export default FuelPaymentConsolidated;
