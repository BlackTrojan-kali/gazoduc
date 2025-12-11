import React, { useState, useMemo } from 'react';
import { usePage, Head } from '@inertiajs/react';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';

const ArticleConsolidated = () => {
  const { year, report } = usePage().props;

  // 🔹 États pour les filtres
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [search, setSearch] = useState('');

  // 🔹 Liste unique pour les filtres (basée sur les données)
  const months = [...new Set(report.map(r => r.month))];
  const agencies = [...new Set(report.map(r => r.agency_name))];
  const types = [...new Set(report.map(r => r.invoice_type))];
  const articles = [...new Set(report.map(r => r.article_name))];

  // 🔹 Filtrage des données (frontend)
  const filteredData = useMemo(() => {
    return report.filter(r => {
      return (
        (!selectedMonth || r.month === parseInt(selectedMonth)) &&
        (!selectedAgency || r.agency_name === selectedAgency) &&
        (!selectedType || r.invoice_type === selectedType) &&
        (!selectedArticle || r.article_name === selectedArticle) &&
        (!search ||
          r.article_name.toLowerCase().includes(search.toLowerCase()) ||
          r.agency_name.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [report, selectedMonth, selectedAgency, selectedType, selectedArticle, search]);

  return (
    <div className="p-6 space-y-6">
      <Head title={`Articles vendus ${year}`} />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Rapport consolidé des articles vendus ({year})
      </h1>

      {/* 🔹 Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Mois */}
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Tous les mois</option>
          {months.map(m => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString('fr', { month: 'long' })}
            </option>
          ))}
        </select>

        {/* Agence */}
        <select
          value={selectedAgency}
          onChange={e => setSelectedAgency(e.target.value)}
          className="border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Toutes les agences</option>
          {agencies.map((a, i) => (
            <option key={i} value={a}>
              {a}
            </option>
          ))}
        </select>

        {/* Type de facture */}
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Tous les types</option>
          {types.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Article */}
        <select
          value={selectedArticle}
          onChange={e => setSelectedArticle(e.target.value)}
          className="border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Tous les articles</option>
          {articles.map((art, i) => (
            <option key={i} value={art}>
              {art}
            </option>
          ))}
        </select>

        {/* Recherche rapide */}
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded p-2 text-sm dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      {/* 🔹 Tableau des résultats */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            <tr>
              <th className="p-2 border">Mois</th>
              <th className="p-2 border">Agence</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Article</th>
              <th className="p-2 border text-right">Quantité totale</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border p-2">
                    {new Date(0, row.month - 1).toLocaleString('fr', { month: 'long' })}
                  </td>
                  <td className="border p-2">{row.agency_name}</td>
                  <td className="border p-2 capitalize">{row.invoice_type}</td>
                  <td className="border p-2">{row.article_name}</td>
                  <td className="border p-2 text-right">{row.total_quantity.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Aucun résultat trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Résumé */}
      <div className="mt-4 text-right text-sm text-gray-600 dark:text-gray-400">
        {filteredData.length} enregistrements affichés
      </div>
    </div>
  );
};

ArticleConsolidated.layout = page => <CEOLayout children={page} />;
export default ArticleConsolidated;
