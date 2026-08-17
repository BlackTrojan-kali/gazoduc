import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import InputField from '../form/input/InputField';
import Button from '../ui/button/Button';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { usePage } from '@inertiajs/react';

const ExportProductionModal = ({ show, onClose, agencies = [], articles = [], citernes = [] }) => {
  const { auth } = usePage().props;
  const userRole = auth.user?.role?.name?.toLowerCase(); // Sécurisation

  // États locaux
  const [exportAgency, setExportAgency] = useState(null);
  const [exportArticle, setExportArticle] = useState(null);
  const [exportCiterne, setExportCiterne] = useState(null);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');

  // Options Select (Mémorisées pour éviter les re-rendus inutiles)
  const agencyOptions = useMemo(() => agencies.map(a => ({ value: String(a.id), label: a.name })), [agencies]);
  const articleOptions = useMemo(() => articles.map(a => ({ value: String(a.id), label: a.name })), [articles]);
  const citerneOptions = useMemo(() => citernes.map(c => ({ value: String(c.id), label: c.name })), [citernes]);

  // Styles React-Select (Mode Sombre/Clair géré dynamiquement)
  const isDark = document.documentElement.classList.contains('dark');
  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? '#1F2937' : '#fff',
      borderColor: state.isFocused ? '#3B82F6' : (isDark ? '#374151' : '#D1D5DB'),
      color: isDark ? '#fff' : '#000',
      minHeight: '44px'
    }),
    menu: (base) => ({ ...base, backgroundColor: isDark ? '#1F2937' : '#fff', zIndex: 9999 }),
    singleValue: (base) => ({ ...base, color: isDark ? '#fff' : '#000' }),
    input: (base) => ({ ...base, color: isDark ? '#fff' : '#000' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? (isDark ? '#374151' : '#F3F4F6') : 'transparent',
      color: state.isSelected ? '#fff' : (isDark ? '#fff' : '#000'),
    })
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    
    if (exportAgency) params.append('agency_id', exportAgency.value);
    if (exportArticle) params.append('article_id', exportArticle.value);
    if (exportCiterne) params.append('citerne_id', exportCiterne.value);
    if (exportStartDate) params.append('start_date', exportStartDate);
    if (exportEndDate) params.append('end_date', exportEndDate);

    // Logique Format & Suppression
    if (exportFormat === 'pdfWithDeleted') {
      params.append('format', 'pdf');
      params.append('isWithDeleted', '1');
    } else {
      params.append('format', exportFormat);
    }

    // Redirection vers la route Ziggy
    window.location.href = route('prod.export', params.toString());
    onClose();
  };

  return (
    <Modal isOpen={show} onClose={onClose} title="Exporter l'Historique de Production">
      <div className="space-y-5">
        
        {/* Filtres Select */}
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Agence</label>
                <Select
                    options={agencyOptions}
                    value={exportAgency}
                    onChange={setExportAgency}
                    placeholder="Toutes les agences"
                    isClearable
                    styles={customStyles}
                />
            </div>
            
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Article (Produit Fini)</label>
                <Select
                    options={articleOptions}
                    value={exportArticle}
                    onChange={setExportArticle}
                    placeholder="Tous les articles"
                    isClearable
                    styles={customStyles}
                />
            </div>

            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Citerne Source</label>
                <Select
                    options={citerneOptions}
                    value={exportCiterne}
                    onChange={setExportCiterne}
                    placeholder="Toutes les citernes"
                    isClearable
                    styles={customStyles}
                />
            </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Date de début"
            type="date"
            value={exportStartDate}
            onChange={(e) => setExportStartDate(e.target.value)}
            icon={faCalendarAlt}
          />
          <InputField
            label="Date de fin"
            type="date"
            value={exportEndDate}
            onChange={(e) => setExportEndDate(e.target.value)}
            icon={faCalendarAlt}
          />
        </div>

        {/* Format */}
        <div>
          <label htmlFor="export-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Format du fichier
          </label>
          <select
            id="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="block w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm dark:text-white outline-none transition-colors"
          >
            <option value="pdf">PDF (Standard)</option>
            <option value="excel">Excel (Tableur)</option>
            {/* Option réservée à la direction */}
            {(userRole === 'direction' || userRole === 'admin') && (
                <option value="pdfWithDeleted" className="text-red-600 font-semibold">
                    PDF (Inclure supprimés)
                </option>
            )}
          </select>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700 gap-3">
            <Button variant="secondary" onClick={onClose}>Annuler</Button>
            <Button
                onClick={handleExport}
                variant="primary"
                className="bg-green-600 hover:bg-green-700 text-white"
            >
                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                Télécharger
            </Button>
        </div>

      </div>
    </Modal>
  );
};

export default ExportProductionModal;