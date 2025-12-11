import React, { useState, useMemo } from "react";
import { usePage, Head } from "@inertiajs/react";
import CEOFuelLayout from "../../layout/CEOFuelLayout/CEOFuelLayout";

const FuelConsolidated = () => {
  const { year, report } = usePage().props;

  // --- États pour les filtres ---
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedArticle, setSelectedArticle] = useState("");

  // --- Liste des mois (pour affichage) ---
  const months = [
    { value: 1, label: "Janvier" },
    { value: 2, label: "Février" },
    { value: 3, label: "Mars" },
    { value: 4, label: "Avril" },
    { value: 5, label: "Mai" },
    { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" },
    { value: 8, label: "Août" },
    { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" },
    { value: 11, label: "Novembre" },
    { value: 12, label: "Décembre" },
  ];

  // --- Calcul des options uniques pour les filtres ---
  const agencies = [...new Set(report.map((r) => r.agency_name))];
  const articles = [...new Set(report.map((r) => r.article_name))];

  // --- Application des filtres ---
  const filteredReport = useMemo(() => {
    return report.filter((row) => {
      return (
        (selectedMonth ? row.month === parseInt(selectedMonth) : true) &&
        (selectedAgency ? row.agency_name === selectedAgency : true) &&
        (selectedArticle ? row.article_name === selectedArticle : true)
      );
    });
  }, [report, selectedMonth, selectedAgency, selectedArticle]);

  // --- Calcul des totaux ---
  const totals = useMemo(() => {
    return {
      totalQuantity: filteredReport.reduce((acc, r) => acc + r.total_quantity, 0),
      totalRevenue: filteredReport.reduce((acc, r) => acc + r.total_revenue, 0),
    };
  }, [filteredReport]);

  return (
    <div className="p-6 space-y-6">
      <Head title={`Ventes de carburant ${year}`} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Rapport consolidé des ventes de carburant ({year})
      </h1>

      {/* --- Filtres --- */}
      <div className="flex flex-wrap gap-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mois
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg p-2 bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Tous</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Agence
          </label>
          <select
            value={selectedAgency}
            onChange={(e) => setSelectedAgency(e.target.value)}
            className="border rounded-lg p-2 bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Toutes</option>
            {agencies.map((agency, i) => (
              <option key={i} value={agency}>
                {agency}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Article
          </label>
          <select
            value={selectedArticle}
            onChange={(e) => setSelectedArticle(e.target.value)}
            className="border rounded-lg p-2 bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Tous</option>
            {articles.map((article, i) => (
              <option key={i} value={article}>
                {article}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Tableau --- */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
            <tr>
              <th className="p-2 border">Mois</th>
              <th className="p-2 border">Agence</th>
              <th className="p-2 border">Article</th>
              <th className="p-2 border text-right">Quantité totale (L)</th>
              <th className="p-2 border text-right">Chiffre d’affaires (FCFA)</th>
            </tr>
          </thead>
          <tbody>
            {filteredReport.length > 0 ? (
              filteredReport.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border p-2 capitalize">
                    {new Date(0, row.month - 1).toLocaleString("fr", { month: "long" })}
                  </td>
                  <td className="border p-2">{row.agency_name}</td>
                  <td className="border p-2">{row.article_name}</td>
                  <td className="border p-2 text-right">
                    {row.total_quantity.toLocaleString()}
                  </td>
                  <td className="border p-2 text-right">
                    {row.total_revenue.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Aucun résultat trouvé.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-gray-100 dark:bg-gray-900 font-semibold">
            <tr>
              <td colSpan="3" className="border p-2 text-right">
                Totaux :
              </td>
              <td className="border p-2 text-right">
                {totals.totalQuantity.toLocaleString()}
              </td>
              <td className="border p-2 text-right">
                {totals.totalRevenue.toLocaleString()} FCFA
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

FuelConsolidated.layout = (page) => <CEOFuelLayout children={page} />;
export default FuelConsolidated;
