// resources/js/Components/Modals/DepotageHistoryPDFExcelModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Votre composant de modale générique
import Input from '../form/input/InputField'; // Votre composant Input
import Button from '../ui/button/Button'; // Votre composant Button
import { useForm } from '@inertiajs/react'; // Pour gérer l'état du formulaire
import Swal from 'sweetalert2'; // Pour les notifications
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons'; // Icônes

const DepotageHistoryPDFExcelModal = ({ isOpen, onClose, agencies }) => {
  // Initialisation de l'état du formulaire avec useForm d'Inertia
  const { data, setData, processing, errors, reset } = useForm({
    start_date: '',
    end_date: '',
    agency_id: '', // Pour filtrer par agence
    file_type: 'pdf', // Type de fichier par défaut
  });

  // Effet pour initialiser les dates par défaut (mois précédent à aujourd'hui) lors de l'ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      reset({ // Utiliser reset pour s'assurer que tous les champs sont réinitialisés
        start_date: lastMonth.toISOString().split('T')[0], // Format YYYY-MM-DD
        end_date: today.toISOString().split('T')[0], // Format YYYY-MM-DD
        agency_id: '', // Réinitialiser l'agence
        file_type: 'pdf', // Réinitialiser le type de fichier
      });
    }
  }, [isOpen]); // Se déclenche quand 'isOpen' change

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
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

    // S'assurer que agency_id est une chaîne vide si null ou undefined pour la queryString
    const formDataForQuery = {
      ...data,
      agency_id: data.agency_id || '',
    };

    // Construction de la chaîne de requête pour l'URL de génération de rapport
    const queryString = new URLSearchParams(formDataForQuery).toString();
    // Assurez-vous que cette route existe dans votre fichier routes/web.php (ou routes/magasin.php)
    const generateRoute = route('depotages.export') + '?' + queryString;

    // Ouverture du rapport dans une nouvelle fenêtre/onglet
    if (data.file_type === 'pdf' || data.file_type === 'excel') {
      window.open(generateRoute, '_blank');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de format',
        text: 'Veuillez sélectionner un type de fichier valide (PDF ou Excel), monsieur.',
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Générer l'historique des dépotages (PDF/Excel)">
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

        {/* Agence - Affiché si des agences sont disponibles et > 1 pour un vrai choix */}
        {agencies && agencies.length > 0 && (
          <div className="mb-4">
            <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agence
            </label>
            <select
              id="agency_id"
              className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                ${errors.agency_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
              value={data.agency_id}
              onChange={handleChange}
            >
              <option value="">Toutes les agences</option>
              {agencies.map(agency => (
                <option key={agency.id} value={String(agency.id)}>
                  {agency.name}
                </option>
              ))}
            </select>
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
                <FontAwesomeIcon icon={data.file_type === 'pdf' ? faFilePdf : faFileExcel} className="mr-2" />
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