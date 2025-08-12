// resources/js/Components/Modals/DepotageHistoryPDFExcelModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Votre composant de modale générique
import Input from '../form/input/InputField'; // Votre composant Input
import Button from '../ui/button/Button'; // Votre composant Button
import { useForm } from '@inertiajs/react'; // Pour gérer l'état du formulaire
import Swal from 'sweetalert2'; // Pour les notifications
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons'; // Icônes
import Select from 'react-select'; // Ajout de react-select pour l'agence

const DepotageHistoryPDFExcelModal = ({ isOpen, onClose, agencies }) => {
  // Initialisation de l'état du formulaire avec useForm d'Inertia
  const { data, setData, processing, errors, reset } = useForm({
    start_date: '',
    end_date: '',
    agency_id: null, // Initialisé à null pour la sélection
    file_type: 'pdf', // Type de fichier par défaut
  });

  // Utilisation de useMemo pour créer les options pour react-select
  const agencyOptions = React.useMemo(() => [
    { value: null, label: 'Toutes les agences' },
    ...agencies.map(agency => ({
      value: String(agency.id),
      label: agency.name
    }))
  ], [agencies]);

  // Effet pour initialiser les dates par défaut (mois précédent à aujourd'hui) lors de l'ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      reset({ // Utiliser reset pour s'assurer que tous les champs sont réinitialisés
        start_date: lastMonth.toISOString().split('T')[0], // Format YYYY-MM-DD
        end_date: today.toISOString().split('T')[0], // Format YYYY-MM-DD
        agency_id: null, // Réinitialiser l'agence
        file_type: 'pdf', // Réinitialiser le type de fichier
      });
    }
  }, [isOpen, reset]); // Se déclenche quand 'isOpen' change

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };
  
  // Handler pour la sélection d'agence
  const handleAgencyChange = (selectedOption) => {
    setData('agency_id', selectedOption ? selectedOption.value : null);
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation des dates
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
    
    // Construction de la chaîne de requête
    const formDataForQuery = {
      ...data,
      agency_id: data.agency_id || '', // S'assurer que agency_id est une chaîne vide si null
      format: data.file_type, // Utiliser 'format' au lieu de 'file_type' si la route l'attend
    };

    // Ajout du paramètre pour les suppressions si l'option est choisie
    if (data.file_type === 'pdf_deleted') {
      formDataForQuery.isWithDeleted = true;
      formDataForQuery.format = 'pdf'; // On force le format à PDF même si le type est 'pdf_deleted'
    }

    const queryString = new URLSearchParams(formDataForQuery).toString();
    const generateRoute = route('depotages.export') + '?' + queryString;

    // Ouverture du rapport dans une nouvelle fenêtre/onglet
    if (data.file_type === 'pdf' || data.file_type === 'excel' || data.file_type === 'pdf_deleted') {
      window.open(generateRoute, '_blank');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de format',
        text: 'Veuillez sélectionner un type de fichier valide (PDF, Excel ou PDF avec suppressions), monsieur.',
      });
      return;
    }

    // Notification à l'utilisateur
    Swal.fire({
      icon: 'info',
      title: 'Génération en cours',
      text: `Le rapport d'historique des dépotages au format ${data.file_type.toUpperCase()} est en cours de génération.`,
      showConfirmButton: false,
      timer: 2000 // La notification disparaît après 2 secondes
    });

    onClose(); // Ferme la modale après la soumission
  };

  // Détecte le mode sombre pour appliquer les styles corrects
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Styles pour les composants react-select en mode sombre et clair
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
      backgroundColor: isDarkMode ? 'rgb(17 24 39 / 1)' : '#fff', // dark:bg-gray-900
      fontSize: '0.875rem',
      color: isDarkMode ? 'rgb(255 255 255 / 0.9)' : 'rgb(17 24 39 / 1)', // dark:text-white/90
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDarkMode ? 'rgb(255 255 255 / 0.9)' : 'rgb(17 24 39 / 1)',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDarkMode ? 'rgb(255 255 255 / 0.3)' : 'rgb(107 114 128 / 1)', // dark:placeholder:text-white/30
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: isDarkMode ? 'rgb(17 24 39 / 1)' : '#fff', // dark:bg-gray-900
      borderRadius: '8px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: isDarkMode ? (state.isFocused ? 'rgb(55 65 81 / 1)' : provided.backgroundColor) : (state.isFocused ? '#e5e7eb' : provided.backgroundColor), // dark:hover:bg-gray-700
      color: isDarkMode ? (state.isFocused ? '#fff' : 'rgb(255 255 255 / 0.9)') : (state.isFocused ? '#111827' : '#111827'),
    }),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Générer l'historique des dépotages">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Période */}
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

        {/* Agence - Utilisation de react-select pour une meilleure UX */}
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
              isClearable
              styles={selectStyles}
              classNamePrefix="react-select"
            />
            {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
          </div>
        )}

        {/* Type de Fichier */}
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
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="pdf_deleted">PDF (avec suppressions)</option>
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
