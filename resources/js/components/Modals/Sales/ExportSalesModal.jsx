import React, { useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';

// Importation de votre composant de modale personnalisé
import Modal from '../Modal.jsx';

const ExportSalesModal = ({ isOpen, onClose, clients, agencies }) => {
  const [filterClient, setFilterClient] = useState(null);
  const [filterAgency, setFilterAgency] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Définition des variables CSS pour les couleurs en fonction du thème
  const colors = {
    '--text-color': 'rgb(31 41 55)',
    '--placeholder-color': 'rgb(107 114 128)',
    '--border-color': 'rgb(209 213 219)',
    '--bg-menu': 'rgb(255 255 255)',
    '--bg-option-hover': 'rgb(243 244 246)',
  };
  if (document.documentElement.classList.contains('dark')) {
    colors['--text-color'] = 'rgb(249 250 251 / 0.9)';
    colors['--placeholder-color'] = 'rgb(156 163 175)';
    colors['--border-color'] = 'rgb(75 85 99)';
    colors['--bg-menu'] = 'rgb(31 41 55)';
    colors['--bg-option-hover'] = 'rgb(55 65 81)';
  }

  // Options pour les sélecteurs
  const clientOptions = Array.isArray(clients)
    ? [{ value: 'all', label: 'Tous les clients' }, ...clients.map(client => ({ value: String(client.id), label: client.name }))]
    : [{ value: 'all', label: 'Tous les clients' }];
    
  const agencyOptions = Array.isArray(agencies)
    ? [{ value: 'all', label: 'Toutes les agences' }, ...agencies.map(agency => ({ value: String(agency.id), label: agency.name }))]
    : [{ value: 'all', label: 'Toutes les agences' }];

  // Styles pour react-select, utilisant les variables CSS
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: '44px',
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : 'var(--border-color)',
      backgroundColor: 'transparent',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
      },
    }),
    singleValue: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)' }),
    placeholder: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
    input: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)' }),
    menu: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--bg-menu)', zIndex: 9999 }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? 'var(--bg-option-hover)' : 'var(--bg-menu)',
      color: state.isSelected ? 'white' : 'var(--text-color)',
      '&:hover': { backgroundColor: 'var(--bg-option-hover)', color: 'var(--text-color)' },
    }),
    indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--border-color)' }),
    dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
    clearIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)', '&:hover': { color: '#EF4444' } }),
  };

  const handleExport = () => {
    setIsExporting(true);

    const clientId = filterClient?.value === 'all' ? null : filterClient?.value;
    const agencyId = filterAgency?.value === 'all' ? null : filterAgency?.value;

    const exportUrl = route('sales.export.pdf', {
      client_id: clientId,
      agency_id: agencyId,
      start_date: filterStartDate || null,
      end_date: filterEndDate || null,
    });

    window.open(exportUrl, '_blank');

    Swal.fire(
      'Exportation en cours',
      'Votre rapport PDF est en cours de préparation et de téléchargement, monsieur.',
      'info'
    );
    
    setIsExporting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exporter l'historique des ventes"
    >
      <div className="space-y-4" style={colors}>
        {/* Filtre par client */}
        <div>
          <label htmlFor="exportClient" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Client
          </label>
          <Select
            id="exportClient"
            options={clientOptions}
            value={filterClient}
            onChange={setFilterClient}
            isClearable={true}
            placeholder="Tous les clients"
            classNamePrefix="react-select"
            styles={selectStyles}
          />
        </div>

        {/* Filtre par agence */}
        <div>
          <label htmlFor="exportAgency" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Agence
          </label>
          <Select
            id="exportAgency"
            options={agencyOptions}
            value={filterAgency}
            onChange={setFilterAgency}
            isClearable={true}
            placeholder="Toutes les agences"
            classNamePrefix="react-select"
            styles={selectStyles}
          />
        </div>

        {/* Période de date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="exportStartDate" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Date de Début
            </label>
            <input
              id="exportStartDate"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
          <div>
            <label htmlFor="exportEndDate" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Date de Fin
            </label>
            <input
              id="exportEndDate"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-white/90 dark:border-gray-700 dark:hover:bg-white/[0.03]"
        >
          Annuler
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-green-700 disabled:opacity-50 dark:border-green-700 dark:bg-green-700 dark:hover:bg-green-600"
        >
          {isExporting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFilePdf} />
              Exporter au format PDF
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};

export default ExportSalesModal;
