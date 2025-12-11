// src/components/Modals/ReleveHistoryPDFExcelModal.jsx

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Ajout de faSpinner pour le chargement
import Button from '../ui/button/Button';
import Swal from 'sweetalert2';
import Input from '../form/input/InputField';
import Select from '../form/form-elements/SelectInputs'; // Assurez-vous que ce chemin est correct pour votre composant Select

const ReleveHistoryPDFExcelModal = ({ isOpen, onClose, agencies }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAgencyId, setSelectedAgencyId] = useState(''); // État pour l'ID de l'agence sélectionnée
  const [reportType, setReportType] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);

  // Effet pour initialiser les dates par défaut (mois précédent à aujourd'hui) lors de l'ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      setStartDate(lastMonth.toISOString().split('T')[0]);
      setEndDate(today.toISOString().split('T')[0]);
      setSelectedAgencyId(''); // Réinitialiser l'agence sélectionnée à chaque ouverture
      setReportType('pdf'); // Réinitialiser le type de rapport
    }
  }, [isOpen]); // Se déclenche quand 'isOpen' change

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Dates Requises',
        text: 'Veuillez sélectionner une date de début et une date de fin pour le rapport, monsieur.',
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Dates Invalides',
        text: 'La date de début ne peut pas être postérieure à la date de fin, monsieur.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Construction des paramètres de la requête
      const params = {
        start_date: startDate,
        end_date: endDate,
        agency_id: selectedAgencyId || undefined, // Passe l'ID de l'agence ou undefined
        type: reportType, // 'pdf' ou 'excel'
      };

      const url = route('releves.export', params); // Assurez-vous que cette route existe dans Laravel

      // Redirection vers l'URL générée pour déclencher le téléchargement
      window.location.href = url;

      Swal.fire({
        icon: 'success',
        title: 'Génération en cours',
        text: `Votre rapport ${reportType.toUpperCase()} est en cours de génération et de téléchargement, monsieur.`,
        showConfirmButton: false, // Ne pas montrer de bouton de confirmation pour qu'il se ferme tout seul
        timer: 2000 // Ferme après 2 secondes
      });

      onClose(); // Ferme la modale après le déclenchement du téléchargement

    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la génération du rapport. Veuillez réessayer, monsieur.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-900/50"> {/* Opacité du fond ajustée */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Générer Historique des Relevés</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début :</label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin :</label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtre d'agence : Affiché si des agences sont passées en props et qu'il y a plus d'une agence disponible (sinon, pas de choix) */}
          {agencies.length > 0 && (
            <div>
              <label htmlFor="agency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agence :</label>
              <select // Utilise votre composant Select custom
                id="agency"
                value={selectedAgencyId}
                onChange={(e) => setSelectedAgencyId(e.target.value)}
              className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            
              >
                <option value="">Toutes les agences</option> {/* Option pour désélectionner le filtre d'agence */}
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>{agency.name}</option>
                ))}
              </select>
            </div>
          )}
          {/* Si seulement une agence est disponible ou aucune, la sélection d'agence n'est pas affichée,
              et la logique backend gérera le filtrage si l'utilisateur n'est pas "direction". */}

          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de rapport :</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="secondary"
            className="px-4 py-2"
            disabled={isLoading} // Désactiver pendant le chargement
          >
            Annuler
          </Button>
          <Button
            onClick={handleGenerateReport}
            variant="primary"
            className="px-4 py-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Génération...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={reportType === 'pdf' ? faFilePdf : faFileExcel} className="mr-2" />
                Générer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReleveHistoryPDFExcelModal;