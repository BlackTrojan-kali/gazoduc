import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import { useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

const DepotageHistoryPDFExcelModal = ({ isOpen, onClose, agencies }) => {
  const { auth } = usePage().props;
  const userRole = auth.user.role;
  const isDirection = userRole === 'direction';

  const fileTypeOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    ...(isDirection ? [{ value: 'pdf_deleted', label: 'PDF (avec suppressions)' }] : []),
  ];
 
  const { data, setData, processing, errors, reset } = useForm({
    start_date: '',
    end_date: '',
    agency_id: null,
    file_type: 'pdf',
  });

  // --- Début de la modification ---
  const agencyOptions = React.useMemo(() => [
    ...(isDirection ? [{ value: null, label: 'Toutes les agences' }] : []),
    ...agencies.map(agency => ({
      value: String(agency.id),
      label: agency.name
    }))
  ], [agencies, isDirection]);
  // --- Fin de la modification ---

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      reset({
        start_date: lastMonth.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        agency_id: isDirection ? null : String(agencies[0]?.id || null), // Réinitialisation de l'agence
        file_type: 'pdf',
      });
      // si le role n'est pas 'direction', on sélectionne la première agence par défaut
      if (!isDirection && agencies.length > 0) {
        setData('agency_id', String(agencies[0].id));
      }
    }
  }, [isOpen, reset, agencies, isDirection, setData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };
  
  const handleAgencyChange = (selectedOption) => {
    setData('agency_id', selectedOption ? selectedOption.value : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.start_date || !data.end_date) {
      Swal.fire({
        icon: 'warning',
        title: 'Dates Requises',
        text: 'Veuillez sélectionner une date de début et une date de fin pour le rapport, monsieur.',
      });
      return;
    }

    if (new Date(data.start_date) > new Date(data.end_date)) {
      Swal.fire({
        icon: 'warning',
        title: 'Dates Invalides',
        text: 'La date de début ne peut pas être postérieure à la date de fin, monsieur.',
      });
      return;
    }
    
    const formDataForQuery = {
      ...data,
      agency_id: data.agency_id || '',
      format: data.file_type,
    };

    if (data.file_type === 'pdf_deleted') {
      formDataForQuery.isWithDeleted = true;
      formDataForQuery.format = 'pdf';
    }

    const queryString = new URLSearchParams(formDataForQuery).toString();
    const generateRoute = route('depotages.export') + '?' + queryString;

    const supportedFileTypes = fileTypeOptions.map(option => option.value);
    if (supportedFileTypes.includes(data.file_type)) {
      window.open(generateRoute, '_blank');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de format',
        text: 'Veuillez sélectionner un type de fichier valide, monsieur.',
      });
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'Génération en cours',
      text: `Le rapport d'historique des dépotages au format ${data.file_type.toUpperCase()} est en cours de génération.`,
      showConfirmButton: false,
      timer: 2000
    });

    onClose();
  };

  const isDarkMode = document.documentElement.classList.contains('dark');

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '44px',
      borderColor: errors[state.selectProps.id] ? 'rgb(239 68 68 / 1)' : (state.isFocused ? 'rgb(59 130 246 / 1)' : (isDarkMode ? 'rgb(55 65 81 / 1)' : 'rgb(209 213 219 / 1)')),
      boxShadow: errors[state.selectProps.id] ? '0 0 0 1px rgb(239 68 68 / 1)' : (state.isFocused ? '0 0 0 1px rgb(59 130 246 / 1)' : provided.boxShadow),
      '&:hover': {
        borderColor: errors[state.selectProps.id] ? 'rgb(239 68 68 / 1)' : (state.isFocused ? 'rgb(59 130 246 / 1)' : (isDarkMode ? 'rgb(55 65 81 / 1)' : 'rgb(209 213 219 / 1)')),
      },
      borderRadius: '8px',
      backgroundColor: isDarkMode ? 'rgb(17 24 39 / 1)' : '#fff',
      fontSize: '0.875rem',
      color: isDarkMode ? 'rgb(255 255 255 / 0.9)' : 'rgb(17 24 39 / 1)',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? 'rgb(255 255 255 / 0.9)' : 'rgb(17 24 39 / 1)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? 'rgb(255 255 255 / 0.3)' : 'rgb(107 114 128 / 1)',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: isDarkMode ? 'rgb(17 24 39 / 1)' : '#fff',
      borderRadius: '8px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: isDarkMode ? (state.isFocused ? 'rgb(55 65 81 / 1)' : provided.backgroundColor) : (state.isFocused ? '#e5e7eb' : provided.backgroundColor),
      color: isDarkMode ? (state.isFocused ? '#fff' : 'rgb(255 255 255 / 0.9)') : (state.isFocused ? '#111827' : '#111827'),
    }),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Générer l'historique des dépotages">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <Input
            id="start_date"
            type="date"
            label="Date de début"
            value={data.start_date}
            onChange={handleChange}
            error={errors.start_date}
            required
          />
          <Input
            id="end_date"
            type="date"
            label="Date de fin"
            value={data.end_date}
            onChange={handleChange}
            error={errors.end_date}
            required
          />
        </div>

        {agencies && agencies.length > 0 && (
          <div className="mb-4">
            <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agence
            </label>
            <Select
              id="agency_id"
              inputId="agency_id"
              options={agencyOptions}
              value={agencyOptions.find(option => option.value === data.agency_id)}
              onChange={handleAgencyChange}
              placeholder="Sélectionnez une agence"
              isClearable={isDirection}
              isDisabled={!isDirection && agencies.length === 1}
              styles={selectStyles}
              classNamePrefix="react-select"
            />
            {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="file_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Format de Fichier
          </label>
          <select
            id="file_type"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.file_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.file_type}
            onChange={handleChange}
            required
          >
            {fileTypeOptions.map(option => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
          {errors.file_type && <p className="text-sm text-red-600 mt-1">{errors.file_type}</p>}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="destructive"
            className="mr-2"
            disabled={processing}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={processing}
          >
            {processing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Génération...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={data.file_type === 'excel' ? faFileExcel : faFilePdf} className="mr-2" />
                Générer le Rapport
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepotageHistoryPDFExcelModal;