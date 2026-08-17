import React, { useState, useMemo } from 'react';
import Modal from '../../Modal'; // Votre composant Modal générique
import Button from '../../../ui/button/Button'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFilePdf, 
    faFileExcel, 
    faCalendarAlt, 
    faStore, 
    faBoxOpen, 
    faDownload,
    faTimes,
    faFilter
} from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";
import Swal from 'sweetalert2';

const GlobalExportHistoryModal = ({ 
    isOpen, 
    onClose, 
    boutiques = [], // Liste complète des boutiques
    products = [],  // Liste complète des produits
    routeExportName = 'direction.export_history' // Nom de la route Laravel
}) => {
  
  // --- États ---
  const [dateStart, setDateStart] = useState(() => {
      // Par défaut : 1er jour du mois en cours
      const date = new Date();
      return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  });
  const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]); // Aujourd'hui
  
  const [selectedBoutique, setSelectedBoutique] = useState(null); // null = Toutes
  const [selectedProduct, setSelectedProduct] = useState(null);   // null = Tous
  const [format, setFormat] = useState('pdf');

  // --- Préparation des Options ---
  
  // Options Boutiques
  const boutiqueOptions = useMemo(() => {
      const opts = boutiques.map(b => ({ value: String(b.id), label: b.name }));
      return [{ value: '', label: '🏢 Toutes les boutiques (Global)' }, ...opts];
  }, [boutiques]);

  // Options Produits
  const productOptions = useMemo(() => {
      const opts = products.map(p => ({ 
          value: String(p.id), 
          label: `${p.designation} (${p.sku})` 
      }));
      return [{ value: '', label: '📦 Tous les articles' }, ...opts];
  }, [products]);

  // --- Action d'Exportation ---
  const handleExport = () => {
      // 1. Validation
      if (!dateStart || !dateEnd) {
          Swal.fire('Erreur', 'Veuillez définir une période.', 'warning');
          return;
      }
      if (dateStart > dateEnd) {
          Swal.fire('Erreur', 'La date de début ne peut pas être supérieure à la date de fin.', 'warning');
          return;
      }

      // 2. Construction des paramètres
      const params = new URLSearchParams({
          date_start: dateStart,
          date_end: dateEnd,
          boutique_id: selectedBoutique ? selectedBoutique.value : '', // Vide = Toutes
          product_id: selectedProduct ? selectedProduct.value : '',   // Vide = Tous
          format: format
      });

      // 3. Génération de l'URL
      const url = `${route(routeExportName)}?${params.toString()}`;

      // 4. Déclenchement
      window.open(url, '_blank');
      
      onClose();
      
      const Toast = Swal.mixin({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 3000
      });
      Toast.fire({ icon: 'success', title: 'Téléchargement lancé' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rapport Global des Mouvements" maxWidth="lg">
      <div className="p-6 space-y-6">

        {/* --- Bloc Période --- */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} /> Période d'analyse
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-gray-500 font-bold uppercase">Du</label>
                    <input 
                        type="date" 
                        value={dateStart} 
                        onChange={e => setDateStart(e.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-bold uppercase">Au</label>
                    <input 
                        type="date" 
                        value={dateEnd} 
                        onChange={e => setDateEnd(e.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm focus:ring-brand-500 focus:border-brand-500"
                    />
                </div>
            </div>
        </div>

        {/* --- Bloc Filtres --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Filtre Boutique */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FontAwesomeIcon icon={faStore} className="mr-1 text-gray-400"/> Boutique concernée
                </label>
                <Select 
                    options={boutiqueOptions}
                    value={selectedBoutique || boutiqueOptions[0]}
                    onChange={opt => setSelectedBoutique(opt.value === '' ? null : opt)}
                    className="text-sm"
                    placeholder="Choisir une boutique..."
                />
            </div>

            {/* Filtre Produit */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FontAwesomeIcon icon={faBoxOpen} className="mr-1 text-gray-400"/> Article concerné
                </label>
                <Select 
                    options={productOptions}
                    value={selectedProduct || productOptions[0]}
                    onChange={opt => setSelectedProduct(opt.value === '' ? null : opt)}
                    className="text-sm"
                    isSearchable
                    placeholder="Rechercher un article..."
                />
            </div>
        </div>

        {/* --- Choix Format --- */}
        <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                Format du rapport
            </label>
            <div className="flex justify-center gap-6">
                <button
                    onClick={() => setFormat('pdf')}
                    className={`flex flex-col items-center justify-center w-32 h-20 rounded-xl border-2 transition-all ${
                        format === 'pdf' 
                        ? 'border-red-500 bg-red-50 text-red-600' 
                        : 'border-gray-200 hover:border-red-200 text-gray-400'
                    }`}
                >
                    <FontAwesomeIcon icon={faFilePdf} className="text-2xl mb-1"/>
                    <span className="text-xs font-bold">Document PDF</span>
                </button>

                <button
                    onClick={() => setFormat('excel')}
                    className={`flex flex-col items-center justify-center w-32 h-20 rounded-xl border-2 transition-all ${
                        format === 'excel' 
                        ? 'border-green-500 bg-green-50 text-green-600' 
                        : 'border-gray-200 hover:border-green-200 text-gray-400'
                    }`}
                >
                    <FontAwesomeIcon icon={faFileExcel} className="text-2xl mb-1"/>
                    <span className="text-xs font-bold">Tableur Excel</span>
                </button>
            </div>
        </div>

        {/* --- Footer --- */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="secondary" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Fermer
            </Button>
            <Button 
                onClick={handleExport}
                className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg"
            >
                <FontAwesomeIcon icon={faDownload} className="mr-2" /> 
                Générer le rapport
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GlobalExportHistoryModal;