import React, { useState, useMemo } from 'react';
import Modal from '../../Modal'; // Adaptez le chemin
import InputField from '../../../form/input/InputField'; // Adaptez le chemin
import Button from '../../../ui/button/Button'; // Adaptez le chemin
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilePdf, 
    faFileExcel, 
    faCalendarAlt, 
    faBoxOpen, 
    faExchangeAlt, 
    faDownload,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";
import Swal from 'sweetalert2';

const ExportHistoryModal = ({ 
    isOpen, 
    onClose, 
    products = [], 
    routeExportName = 'mag-boutique.export' // Nom de la route Laravel
}) => {
  
  // --- États Locaux ---
  // On utilise des états simples car on ne fait pas de POST XHR, 
  // mais une redirection vers une URL de téléchargement.
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null); // null = Tous les produits
  const [moveType, setMoveType] = useState('all'); // 'all', 'entree', 'sortie'
  const [format, setFormat] = useState('pdf'); // 'pdf' ou 'excel'

  // --- Options Produits ---
  const productOptions = useMemo(() => {
      const opts = products.map(p => ({ 
          value: String(p.id), 
          label: `${p.designation} (${p.sku})` 
      }));
      // On ajoute l'option "Tous les produits" en tête
      return [{ value: '', label: '📦 Tous les produits' }, ...opts];
  }, [products]);

  // --- Gestionnaires Rapides de Dates ---
  const setThisMonth = () => {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      setDateStart(firstDay.toISOString().split('T')[0]);
      setDateEnd(lastDay.toISOString().split('T')[0]);
  };

  // --- Action d'Exportation ---
  const handleExport = () => {
      // 1. Validation basique
      if (!dateStart || !dateEnd) {
          Swal.fire('Période requise', 'Veuillez sélectionner une date de début et de fin.', 'warning');
          return;
      }

      if (dateStart > dateEnd) {
          Swal.fire('Erreur', 'La date de début ne peut pas être après la date de fin.', 'error');
          return;
      }

      // 2. Construction de l'URL avec Query Params
      // On utilise route() de Ziggy si disponible, sinon on construit à la main
      const params = new URLSearchParams({
          date_start: dateStart,
          date_end: dateEnd,
          product_id: selectedProduct ? selectedProduct.value : '', // Vide = Tous
          type: moveType,
          format: format
      });

      const url = `${route(routeExportName)}?${params.toString()}`;

      // 3. Ouverture dans un nouvel onglet (déclenche le téléchargement)
      window.open(url, '_blank');
      
      // 4. Feedback et Fermeture
      const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
      });
      Toast.fire({
          icon: 'info',
          title: `Génération du ${format.toUpperCase()} en cours...`
      });
      
      onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exporter l'Historique des Mouvements" maxWidth="lg">
      <div className="p-6 space-y-6">

        {/* --- Bloc 1 : Période --- */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-brand-500"/> Période
                </h3>
                <button onClick={setThisMonth} className="text-xs text-brand-600 hover:underline font-medium">
                    Ce mois-ci
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <InputField
                    label="Du" type="date"
                    value={dateStart} onChange={e => setDateStart(e.target.value)}
                />
                <InputField
                    label="Au" type="date"
                    value={dateEnd} onChange={e => setDateEnd(e.target.value)}
                />
            </div>
        </div>

        {/* --- Bloc 2 : Filtres --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Produit */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FontAwesomeIcon icon={faBoxOpen} className="mr-1 text-gray-400"/> Article concerné
                </label>
                <Select 
                    options={productOptions}
                    value={selectedProduct || productOptions[0]} // Par défaut "Tous"
                    onChange={opt => setSelectedProduct(opt.value === '' ? null : opt)}
                    placeholder="Tous les articles"
                    isSearchable
                    className="text-sm"
                />
            </div>

            {/* Type de Mouvement */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FontAwesomeIcon icon={faExchangeAlt} className="mr-1 text-gray-400"/> Type de mouvement
                </label>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    {['all', 'entree', 'sortie'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setMoveType(t)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${
                                moveType === t 
                                ? 'bg-white dark:bg-gray-600 text-brand-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {t === 'all' ? 'Tout' : t}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* --- Bloc 3 : Format de Sortie --- */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                Format du fichier
            </label>
            <div className="flex justify-center gap-6">
                {/* Bouton PDF */}
                <button
                    onClick={() => setFormat('pdf')}
                    className={`group relative flex flex-col items-center justify-center w-28 h-24 rounded-xl border-2 transition-all ${
                        format === 'pdf' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-red-200 text-gray-400'
                    }`}
                >
                    <FontAwesomeIcon icon={faFilePdf} className="text-3xl mb-2 group-hover:scale-110 transition-transform"/>
                    <span className="text-sm font-bold">PDF</span>
                    {format === 'pdf' && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></div>
                    )}
                </button>

                {/* Bouton Excel */}
                <button
                    onClick={() => setFormat('excel')}
                    className={`group relative flex flex-col items-center justify-center w-28 h-24 rounded-xl border-2 transition-all ${
                        format === 'excel' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-200 text-gray-400'
                    }`}
                >
                    <FontAwesomeIcon icon={faFileExcel} className="text-3xl mb-2 group-hover:scale-110 transition-transform"/>
                    <span className="text-sm font-bold">Excel</span>
                    {format === 'excel' && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-500"></div>
                    )}
                </button>
            </div>
        </div>

        {/* --- Actions --- */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="secondary" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Annuler
            </Button>
            <Button 
                onClick={handleExport}
                className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30"
            >
                <FontAwesomeIcon icon={faDownload} className="mr-2" /> 
                Générer le rapport
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportHistoryModal;