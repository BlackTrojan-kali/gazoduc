import React, { useState } from 'react';
import Select from 'react-select';
import InputField from '../form/input/InputField';
import Button from '../ui/button/Button';
import Modal from './Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const ExportProductionModal = ({ show, onClose, agencies, articles, citernes }) => {
  const [exportAgency, setExportAgency] = useState(null);
  const [exportArticle, setExportArticle] = useState(null);
  const [exportCiterne, setExportCiterne] = useState(null);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf'); // État pour le format d'exportation

  // Options pour les sélecteurs react-select
  const agencyOptions = Array.isArray(agencies)
    ? agencies.map(agency => ({ value: String(agency.id), label: agency.name }))
    : [];
  const articleOptions = Array.isArray(articles)
    ? articles.map(article => ({ value: String(article.id), label: article.name }))
    : [];
  const citerneOptions = Array.isArray(citernes)
    ? citernes.map(citerne => ({ value: String(citerne.id), label: citerne.name }))
    : [];

  // Styles personnalisés pour react-select pour une bonne visibilité dans les deux modes
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: '44px',
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : 'var(--select-border-color, #D1D5DB)',
      backgroundColor: 'var(--select-bg-color, #ffffff)',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3B82F6' : 'var(--select-border-color, #9CA3AF)',
      },
    }),
    singleValue: (baseStyles) => ({
      ...baseStyles,
      color: 'var(--select-text-color, #1F2937)',
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      color: 'var(--select-placeholder-color, #6B7280)',
    }),
    input: (baseStyles) => ({
      ...baseStyles,
      color: 'var(--select-text-color, #1F2937)',
    }),
    menu: (baseStyles) => ({
      ...baseStyles,
      backgroundColor: 'var(--select-menu-bg-color, #ffffff)',
      zIndex: 9999,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected
        ? '#2563EB'
        : state.isFocused
        ? 'var(--select-option-hover-bg, #F3F4F6)'
        : 'var(--select-menu-bg-color, #ffffff)',
      color: state.isSelected ? 'white' : 'var(--select-text-color, #1F2937)',
      '&:hover': {
        backgroundColor: 'var(--select-option-hover-bg, #F3F4F6)',
        color: 'var(--select-text-color, #1F2937)',
      },
    }),
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (exportAgency) {
      params.append('agency_id', exportAgency.value);
    }
    if (exportArticle) {
      params.append('article_id', exportArticle.value);
    }
    if (exportCiterne) {
      params.append('citerne_id', exportCiterne.value);
    }
    if (exportStartDate) {
      params.append('start_date', exportStartDate);
    }
    if (exportEndDate) {
      params.append('end_date', exportEndDate);
    }
    
    // Gère le format d'exportation et le paramètre isWithDeleted
    if (exportFormat === 'pdfWithDeleted') {
        params.append('format', 'isWithDeleted');
    } else if (exportFormat === 'excelWithDeleted') {
        params.append('format', 'excel');
        params.append('isWithDeleted', 'true');
    } else {
        params.append('format', exportFormat);
    }

    const exportUrl = route('prod.export', params.toString());
    window.location.href = exportUrl;

    onClose();
  };

  return (
    <Modal isOpen={show} onClose={onClose} title="Exporter l'historique des productions">
      <style>
        {`
        .dark {
          --select-bg-color: #1F2937;
          --select-border-color: #4B5563;
          --select-text-color: #E5E7EB;
          --select-placeholder-color: #9CA3AF;
          --select-menu-bg-color: #1F2937;
          --select-option-hover-bg: #374151;
        }
        .light {
          --select-bg-color: #ffffff;
          --select-border-color: #D1D5DB;
          --select-text-color: #1F2937;
          --select-placeholder-color: #6B7280;
          --select-menu-bg-color: #ffffff;
          --select-option-hover-bg: #F3F4F6;
        }
        `}
      </style>
      <div className="space-y-4">
        {/* Filtres de sélection (agence, article, citerne) */}
        <div>
          <label htmlFor="export-agency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filtrer par Agence
          </label>
          <Select
            id="export-agency"
            name="exportAgency"
            options={agencyOptions}
            value={exportAgency}
            onChange={setExportAgency}
            placeholder="Toutes les agences"
            isClearable={true}
            isSearchable={true}
            styles={selectStyles}
            className="light dark:dark" // Ajout des classes pour appliquer les variables CSS
          />
        </div>
        <div>
          <label htmlFor="export-article" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filtrer par Article
          </label>
          <Select
            id="export-article"
            name="exportArticle"
            options={articleOptions}
            value={exportArticle}
            onChange={setExportArticle}
            placeholder="Tous les articles"
            isClearable={true}
            isSearchable={true}
            styles={selectStyles}
            className="light dark:dark" // Ajout des classes pour appliquer les variables CSS
          />
        </div>
        <div>
          <label htmlFor="export-citerne" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filtrer par Citerne
          </label>
          <Select
            id="export-citerne"
            name="exportCiterne"
            options={citerneOptions}
            value={exportCiterne}
            onChange={setExportCiterne}
            placeholder="Toutes les citernes"
            isClearable={true}
            isSearchable={true}
            styles={selectStyles}
            className="light dark:dark" // Ajout des classes pour appliquer les variables CSS
          />
        </div>

        {/* Champs de date sur la même ligne */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="exportStartDate"
            label="Date de début"
            type="date"
            value={exportStartDate}
            onChange={(e) => setExportStartDate(e.target.value)}
            icon={faCalendarAlt}
          />
          <InputField
            id="exportEndDate"
            label="Date de fin"
            type="date"
            value={exportEndDate}
            onChange={(e) => setExportEndDate(e.target.value)}
            icon={faCalendarAlt}
          />
        </div>

        {/* Sélecteur de type de fichier avec balise <select> native */}
        <div>
          <label htmlFor="export-format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de fichier
          </label>
          <select
            id="export-format"
            name="exportFormat"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200
                       dark:border-gray-600 dark:placeholder-gray-400"
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          {auth.user.role =="direction" ?  <option value="pdfWithDeleted">PDF (avec suppression)</option>:""}
          </select>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={handleExport}
            variant="primary"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            <FontAwesomeIcon icon={faFileExport} />
            Exporter
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportProductionModal;
