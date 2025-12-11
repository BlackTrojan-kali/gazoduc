import React, { useState, useMemo } from 'react';
import { usePage, Head } from '@inertiajs/react';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';

const PaymentReport = () => {
  const { report, year } = usePage().props;

  // --- 📌 STATES DES FILTRES ---
  const [filterType, setFilterType] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterAgency, setFilterAgency] = useState('');

  // --- 📌 EXTRACTION DES MOIS ET AGENCES DISPONIBLES (pour les dropdowns) ---
  const agencies = useMemo(
    () => [...new Set(report.map(r => r.agency_name))],
    [report]
  );

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

  // --- 📌 APPLICATION DES FILTRES ---
  const filteredReport = useMemo(() => {
    return report.filter(r => {
      return (
        (filterType === '' || r.type === filterType) &&
        (filterMonth === '' || parseInt(filterMonth) === r.month) &&
        (filterAgency === '' || r.agency_name === filterAgency)
      );
    });
  }, [report, filterType, filterMonth, filterAgency]);

  return (
    <div className="p-6 space-y-6">
      <Head title={`Rapport des versements ${year}`} />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Rapport des versements ({year})
      </h1>

      {/* 🔽 BARRE DE FILTRES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
        
        {/* Type */}
        <div>
          <label className="text-sm font-semibold">Type</label>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Tous</option>
            <option value="vente">Vente</option>
            <option value="consigne">Consigne</option>
          </select>
        </div>

        {/* Mois */}
        <div>
          <label className="text-sm font-semibold">Mois</label>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Tous</option>
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Agence */}
        <div>
          <label className="text-sm font-semibold">Agence</label>
          <select
            value={filterAgency}
            onChange={e => setFilterAgency(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Toutes</option>
            {agencies.map((a, i) => (
              <option key={i} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <div className="flex items-end">
          <button
            onClick={() => { setFilterType(''); setFilterMonth(''); setFilterAgency(''); }}
            className="w-full py-2 bg-red-600 text-white rounded"
          >
            Réinitialiser
          </button>
        </div>

      </div>

      {/* 🔽 TABLEAU */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <tr>
            <th className="p-2 border">Mois</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Banque</th>
            <th className="p-2 border">Agence</th>
            <th className="p-2 border text-right">Versements</th>
            <th className="p-2 border text-right">Notes</th>
            <th className="p-2 border text-right">Factures</th>
            <th className="p-2 border text-right">Écart</th>
          </tr>
        </thead>

        <tbody>
          {filteredReport.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="border p-2">
                {new Date(0, r.month - 1).toLocaleString('fr', { month: 'long' })}
              </td>
              <td className="border p-2">{r.type}</td>
              <td className="border p-2">{r.bank_name}</td>
              <td className="border p-2">{r.agency_name}</td>
              <td className="border p-2 text-right">{r.total_versement?.toLocaleString()}</td>
              <td className="border p-2 text-right">{r.total_notes?.toLocaleString()}</td>
              <td className="border p-2 text-right">{r.total_facture?.toLocaleString()}</td>
              <td
                className={`border p-2 text-right font-semibold ${
                  r.ecart > 0 ? 'text-green-600' :
                  r.ecart < 0 ? 'text-red-600' :
                  'text-gray-700'
                }`}
              >
                {r.ecart?.toLocaleString()}
              </td>
            </tr>
          ))}

          {filteredReport.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center p-4 text-gray-500">
                Aucun résultat pour les filtres sélectionnés.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

PaymentReport.layout = page => <CEOLayout children={page} />;
export default PaymentReport;
