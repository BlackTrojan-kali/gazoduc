import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import Modal from '../Modal'; // Import du composant Modal

const ExportRoadbillsModal = ({ isOpen, onClose, agencies, articles }) => {
  // État local pour gérer les données du formulaire
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    departureAgency: null,
    arrivalAgency: null,
    article: null,
  });

  // Styles personnalisés pour React Select avec gestion du mode sombre
  const customStyles = useMemo(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return {
      control: (provided, state) => ({
        ...provided,
        backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        borderColor: state.isFocused ? '#3b82f6' : (isDarkMode ? '#4b5563' : '#d1d5db'),
        color: isDarkMode ? '#ffffff' : '#1f2937',
        borderRadius: '0.375rem',
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : null,
        minHeight: '42px',
        '&:hover': {
          borderColor: isDarkMode ? '#60a5fa' : '#6b7280',
        },
      }),
      singleValue: (provided) => ({
        ...provided,
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
      }),
      input: (provided) => ({
        ...provided,
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
      }),
      placeholder: (provided) => ({
        ...provided,
        color: '#9ca3af',
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? '#2563eb'
          : (state.isFocused ? (isDarkMode ? '#3b82f6' : '#e5e7eb') : 'transparent'),
        color: state.isSelected || state.isFocused ? '#ffffff' : (isDarkMode ? '#e5e7eb' : '#1f2937'),
      }),
      indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: isDarkMode ? '#6b7280' : '#9ca3af',
      }),
      dropdownIndicator: (provided) => ({
        ...provided,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        '&:hover': {
          color: '#3b82f6',
        },
      }),
      clearIndicator: (provided) => ({
        ...provided,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
        '&:hover': {
          color: '#ef4444',
        },
      }),
    };
  }, []);

  // Options pour les menus déroulants
  const agencyOptions = useMemo(() => [
    { value: '', label: 'Toutes les agences' },
    ...agencies.map(agency => ({ value: agency.id, label: agency.name }))
  ], [agencies]);

  const departureAgencyOptions = useMemo(() => [
    ...agencies.map(agency => ({ value: agency.id, label: agency.name }))
  ], [agencies]);

  const articleOptions = useMemo(() => [
    { value: '', label: 'Tous les articles' },
    ...articles.map(article => ({ value: article.id, label: article.name }))
  ], [articles]);

  // Gestion des changements pour les champs Select
  const handleInputChange = (selectedOption, { name }) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: selectedOption,
    }));
  };

  // Gestion des changements pour les champs de texte (dates)
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Logique d'exportation
  const handleExport = () => {
    if (!formData.departureAgency) {
      Swal.fire({
        title: 'Attention !',
        text: "L'agence de départ est obligatoire.",
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    const queryParams = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      departureAgency: formData.departureAgency?.value,
      arrivalAgency: formData.arrivalAgency?.value,
      article: formData.article?.value,
    };
    
    // Assurez-vous d'avoir une route nommée 'broutes.export-pdf-filtered' dans votre backend
    window.location.href = route('broutes.export', queryParams);
    
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exporter les Bordereaux de Route">
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Sélectionnez les critères pour générer un rapport PDF.
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de début</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleTextChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de fin</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleTextChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Agence de départ <span className="text-red-500">*</span>
          </label>
          <Select
            name="departureAgency"
            options={departureAgencyOptions}
            value={formData.departureAgency}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="Sélectionner une agence..."
            isClearable={false}
            styles={customStyles}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agence de destination</label>
          <Select
            name="arrivalAgency"
            options={agencyOptions}
            value={formData.arrivalAgency}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="Sélectionner..."
            styles={customStyles}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article transféré</label>
          <Select
            name="article"
            options={articleOptions}
            value={formData.article}
            onChange={handleInputChange}
            className="mt-1"
            placeholder="Sélectionner..."
            styles={customStyles}
          />
        </div>
      </div>
      <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700 mt-4">
        <button
          type="button"
          className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
          onClick={onClose}
        >
          Annuler
        </button>
        <button
          type="button" // Changé en type="button" pour éviter de soumettre le formulaire
          className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
          onClick={handleExport}
        >
          Exporter
        </button>
      </div>
    </Modal>
  );
};

export default ExportRoadbillsModal;
