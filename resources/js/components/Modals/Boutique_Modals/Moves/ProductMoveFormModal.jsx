import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; 
import InputField from '../../../form/input/InputField'; 
import Button from '../../../ui/button/Button'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, 
    faTimes, 
    faBoxOpen, 
    faExchangeAlt, 
    faTruckLoading, 
    faDollyFlatbed,
    faExclamationTriangle,
    faImage
} from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";
import Swal from 'sweetalert2';

const ProductMoveFormModal = ({ 
    isOpen, 
    onClose, 
    products = [], // Assurez-vous que ces objets contiennent 'image_url'
    boutiqueId,    
    routeName = 'magasin.boutique.store' 
}) => {

  // --- Initialisation du Formulaire ---
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    product_id: '',
    boutique_id: boutiqueId || '',
    type: 'entree', 
    qty: '',
    label: '', 
    destination: '', 
  });

  // État pour stocker le produit sélectionné (pour l'aperçu)
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (isOpen) {
        clearErrors();
        reset();
        setData('boutique_id', boutiqueId);
        setData('type', 'entree'); 
        setSelectedProduct(null); // Reset de l'image
    }
  }, [isOpen, boutiqueId]);

  // --- Options pour Select ---
  const productOptions = useMemo(() => products.map(p => ({ 
      value: String(p.id), 
      label: `${p.designation} (${p.sku})` 
  })), [products]);

  const typeOptions = [
      { value: 'entree', label: 'Entrée (Approvisionnement)' },
      { value: 'sortie', label: 'Sortie (Déstockage)' }
  ];

  const destinationOptions = [
      { value: 'commercial', label: 'Vers Commercial (Mise en rayon)' },
      { value: 'perte', label: 'Perte (Casse, Vol, Périmé)' }
  ];

  // --- Gestion changement Produit (avec mise à jour aperçu) ---
  const handleProductChange = (option) => {
      const prodId = option ? option.value : '';
      setData('product_id', prodId);

      if (prodId) {
          // On retrouve l'objet produit complet dans la liste props.products
          const prod = products.find(p => String(p.id) === prodId);
          setSelectedProduct(prod || null);
      } else {
          setSelectedProduct(null);
      }
  };

  // --- Gestion du changement de Type ---
  const handleTypeChange = (selectedOption) => {
      const newType = selectedOption.value;
      setData(data => ({
          ...data,
          type: newType,
          destination: newType === 'entree' ? '' : '' 
      }));
  };

  // --- Soumission ---
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.product_id) {
        Swal.fire('Erreur', 'Veuillez sélectionner un produit.', 'warning');
        return;
    }
    if (Number(data.qty) <= 0) {
        Swal.fire('Erreur', 'La quantité doit être supérieure à 0.', 'warning');
        return;
    }
    if (data.type === 'sortie' && !data.destination) {
        Swal.fire('Erreur', 'Pour une sortie, veuillez préciser la destination.', 'warning');
        return;
    }

    post(route(routeName), {
        onSuccess: () => {
            Swal.fire({
                icon: 'success',
                title: 'Mouvement enregistré',
                text: 'Le stock a été mis à jour.',
                timer: 2000,
                showConfirmButton: false
            });
            onClose();
        },
        onError: (err) => {
            console.error(err);
            Swal.fire('Erreur', 'Vérifiez les données (Stock insuffisant ?).', 'error');
        }
    });
  };

  const isSortie = data.type === 'sortie';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer un Mouvement de Stock" maxWidth="xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* --- Sélection Type --- */}
        <div className="flex justify-center mb-4">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                {typeOptions.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleTypeChange(opt)}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                            data.type === opt.value 
                            ? (opt.value === 'sortie' ? 'bg-red-100 text-red-700 shadow-sm' : 'bg-green-100 text-green-700 shadow-sm')
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>

        {/* --- Produit et Aperçu --- */}
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faBoxOpen} className="mr-1 text-gray-400"/> Produit <span className="text-red-500">*</span>
                </label>
                <Select 
                    options={productOptions}
                    onChange={handleProductChange}
                    placeholder="Rechercher un produit (Nom, SKU)..."
                    isSearchable
                    className="text-sm"
                />
                {errors.product_id && <p className="text-xs text-red-500 mt-1">{errors.product_id}</p>}
            </div>

            {/* --- APERÇU DE L'IMAGE --- */}
            {selectedProduct && (
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 animate-fade-in">
                    <div className="h-16 w-16 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                        {selectedProduct.image_url ? (
                            <img 
                                src={`/storage/${selectedProduct.image_url}`} 
                                alt={selectedProduct.designation} 
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <FontAwesomeIcon icon={faImage} className="text-gray-300 text-2xl"/>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedProduct.designation}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {selectedProduct.sku}</p>
                        {selectedProduct.stock_alert && (
                             <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded mt-1 inline-block">
                                Seuil alerte : {selectedProduct.stock_alert}
                             </span>
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* --- Quantité --- */}
            <InputField
                id="qty" label="Quantité" type="number" step="0.01" required
                value={data.qty} onChange={e => setData('qty', e.target.value)}
                errorMessage={errors.qty}
                icon={faExchangeAlt}
                placeholder="0.00"
            />

            {/* --- Destination (Affiché uniquement si Sortie) --- */}
            {isSortie ? (
                <div>
                    <label className="block text-sm font-medium text-red-700 mb-1 font-bold">
                        Destination <span className="text-red-500">*</span>
                    </label>
                    <Select 
                        options={destinationOptions}
                        onChange={opt => setData('destination', opt ? opt.value : '')}
                        placeholder="Choisir destination..."
                        className="text-sm"
                        styles={{ control: (base) => ({ ...base, borderColor: '#fca5a5' }) }}
                    />
                    {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
                </div>
            ) : (
                <div className="flex flex-col justify-end pb-2">
                    <span className="text-sm text-gray-500 font-medium">Provenance : <span className="text-gray-800">Fournisseur</span></span>
                    <span className="text-sm text-gray-500 font-medium">Destination : <span className="text-green-700 font-bold">Magasin (Stock)</span></span>
                </div>
            )}
        </div>

        {/* --- Motif / Label --- */}
        <InputField
            id="label" label="Motif / Commentaire"
            value={data.label} onChange={e => setData('label', e.target.value)}
            errorMessage={errors.label}
            placeholder={isSortie ? "Ex: Produit cassé lors du transport" : "Ex: Livraison BL n°12345"}
        />

        {/* --- Warning Stock (Visuel) --- */}
        {isSortie && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 flex items-start gap-2 text-sm text-yellow-800">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mt-1"/>
                <p>Attention : Cette action va déduire la quantité du stock magasin actuel.</p>
            </div>
        )}

        {/* --- Actions --- */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Annuler
            </Button>
            <Button 
                type="submit" 
                disabled={processing} 
                className={`text-white shadow-md ${isSortie ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                <FontAwesomeIcon icon={faSave} className="mr-2" /> 
                {processing ? 'Enregistrement...' : `Confirmer ${isSortie ? 'la Sortie' : 'l\'Entrée'}`}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductMoveFormModal;