// resources/js/components/Modals/ReceptionHistoryPDFExcelModal.jsx
import React from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from './Modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';

const ReceptionHistoryPDFExcelModal = ({ isOpen, onClose, agencies, currentFilters }) => {
  const { data, setData, post, processing, errors } = useForm({
    agency_id: currentFilters?.agency_id || '',
    start_date: currentFilters?.start_date || '',
    end_date: currentFilters?.end_date || '',
    // La valeur par défaut est mise à jour pour refléter le choix initial
    export_format: 'pdf',
  });

  const handleChange = (e) => {
    setData(e.target.id, e.target.value);
  };
 const {auth} =  usePage().props;
  const handleDownload = () => {
    const params = new URLSearchParams();
    if (data.agency_id) {
      params.append('agency_id', data.agency_id);
    }
    if (data.start_date) {
      params.append('start_date', data.start_date);
    }
    if (data.end_date) {
      params.append('end_date', data.end_date);
    }
    
    // --- NOUVELLE LOGIQUE DE DÉTECTION DU TYPE D'EXPORTATION ---
    let fileType = 'pdf'; // Défaut
    let movementType = 'global_no_delete'; // Défaut
    
    // On décompose la valeur de la liste déroulante pour déterminer les paramètres
    if (data.export_format === 'pdf_with_delete') {
      fileType = 'pdf';
      movementType = 'global_with_delete';
    } else if (data.export_format === 'excel') {
      fileType = 'excel';
    }

    // Ajout des paramètres déterminés
    params.append('file_type', fileType);
    params.append('type_mouvement', movementType);

    // La route 'receptions.export' est celle qui gère les deux types d'exportation.
    // L'URL est construite en ajoutant les paramètres de recherche.
    const exportUrl = route('receptions.export') + '?' + params.toString();

    // Ouvre le téléchargement dans un nouvel onglet
    window.open(exportUrl, '_blank');
    onClose(); // Ferme la modal après avoir déclenché le téléchargement
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exporter l'Historique des Réceptions">
      <div className="p-4">
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Sélectionnez les critères d'exportation pour l'historique des réceptions.
        </p>

        {/* Champs de filtre Agence */}
        <div className="mb-4">
          <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agence
          </label>
          <select
            id="agency_id"
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            value={data.agency_id}
            onChange={handleChange}
          >
            {auth.user.role =="direction" ?<option value="">Toutes les agences</option>:""}
            
            {agencies.map(agency => (
              <option key={agency.id} value={String(agency.id)}>
                {agency.name}
              </option>
            ))}
          </select>
          {errors.agency_id && <div className="text-red-500 text-sm mt-1">{errors.agency_id}</div>}
        </div>

        {/* Filtres de Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
                id="start_date"
                type="date"
                label="Date de début"
                value={data.start_date}
                onChange={handleChange}
                error={errors.start_date}
            />
            <Input
                id="end_date"
                type="date"
                label="Date de fin"
                value={data.end_date}
                onChange={handleChange}
                error={errors.end_date}
            />
        </div>

        {/* Champ pour le type de fichier à exporter, avec la nouvelle option */}
        <div className="mb-6">
          <label htmlFor="export_format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de rapport
          </label>
          <select
            id="export_format"
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            value={data.export_format}
            onChange={handleChange}
          >
            <option value="pdf">PDF (mouvements actuels)</option>
           {auth.user.role =="direction" ? <option value="pdf_with_delete">PDF (mouvements actuels et supprimés)</option>:""}
            <option value="excel">Excel (XLSX)</option>
          </select>
          {errors.export_format && <div className="text-red-500 text-sm mt-1">{errors.export_format}</div>}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="secondary" className="mr-2">
            Annuler
          </Button>
          <Button onClick={handleDownload} disabled={processing}>
            <FontAwesomeIcon icon={faFileExport} className="mr-2" />
            Générer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceptionHistoryPDFExcelModal;
