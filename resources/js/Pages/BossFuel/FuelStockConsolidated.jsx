import React from "react";
import { usePage, Head } from "@inertiajs/react";
import CEOFuelLayout from "../../layout/CEOFuelLayout/CEOFuelLayout";

const FuelStockConsolidated = () => {
  const { report } = usePage().props;

  return (
    <div className="p-6 space-y-6">
      <Head title="Stock carburant consolidé" />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Stock consolidé de carburant (toutes agences)
      </h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <tr>
            <th className="p-2 border">Article</th>
            <th className="p-2 border text-right">Quantité réelle (L)</th>
            <th className="p-2 border text-right">Quantité théorique (L)</th>
            <th className="p-2 border text-right">Écart (L)</th>
          </tr>
        </thead>
        <tbody>
          {report.length > 0 ? (
            report.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border p-2 font-medium">{row.article_name}</td>
                <td className="border p-2 text-right">
                  {row.total_quantity.toLocaleString()}
                </td>
                <td className="border p-2 text-right">
                  {row.total_theorical_quantity}
                </td>
                <td
                  className={`border p-2 text-right ${
                    row.total_quantity < row.total_theorical_quantity
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {(row.total_quantity - row.total_theorical_quantity)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-gray-500 p-4">
                Aucune donnée disponible
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

FuelStockConsolidated.layout = (page) => <CEOFuelLayout children={page} />;
export default FuelStockConsolidated;
