import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { useDropzone } from 'react-dropzone';
import Modal from '../../Modal'; 
import InputField from '../../../form/input/InputField'; 
import Button from '../../../ui/button/Button'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faCloudUploadAlt, faImage } from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";

const ProductFormModal = ({ 
    isOpen, 
    onClose, 
    product, 
    categories, 
    units, // Pensez à passer les unités depuis le contrôleur
    routeName = 'products.store' 
}) => {
  const isEditMode = !!product;

  // --- Initialisation du Formulaire ---
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    category_id: product?.category_id || '',
    designation: product?.designation || '',
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    image: null, // Pour le nouveau fichier uploadé
    _method: isEditMode ? 'PUT' : 'POST', // Astuce pour l'upload de fichier en mode Edit
    prix_achat: product?.prix_achat || '',
    prix_vente: product?.prix_vente || '',
    tva: product?.tva || 19.25, // Valeur par défaut courante au Cameroun
    unit: product?.unit || '',
    stock_alert: product?.stock_alert || 5,
    value_per_unit: product?.value_per_unit || 1,
  });

  // --- Preview de l'image locale ---
  const [preview, setPreview] = useState(null);

  // --- Reset à l'ouverture ---
  useEffect(() => {
    if (isOpen) {
        clearErrors();
        if (isEditMode) {
            setData({
                category_id: product.category_id || '',
                designation: product.designation,
                sku: product.sku,
                barcode: product.barcode || '',
                image: null,
                _method: 'PUT', // Important pour Laravel
                prix_achat: product.prix_achat || '',
                prix_vente: product.prix_vente,
                tva: product.tva,
                unit: product.unit,
                stock_alert: product.stock_alert,
                value_per_unit: product.value_per_unit,
            });
            // Si le produit a déjà une URL d'image (venant du back), on pourrait l'afficher
            // Ici on suppose que product.image_url contient le chemin public
            setPreview(product.image_url ? `/storage/${product.image_url}` : null);
        } else {
            reset();
            setPreview(null);
            setData('sku', generateSKU()); // Génération auto d'un SKU temporaire
        }
    }
  }, [isOpen, isEditMode, product]);

  // --- Helper SKU ---
  const generateSKU = () => `PROD-${Math.floor(Math.random() * 100000)}`;

  // --- Gestion du Drag and Drop (Image) ---
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
        setData('image', file);
        // Créer une URL temporaire pour la prévisualisation immédiate
        setPreview(URL.createObjectURL(file));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  });

  // --- Options pour les Selects ---
  const categoriesOptions = useMemo(() => (categories || []).map(c => ({
    value: String(c.id), label: c.name
  })), [categories]);

  // Si 'units' est un tableau d'objets {id, name}, sinon adaptez
  const unitsOptions = useMemo(() => (units || []).map(u => ({
    value: u.name, label: `${u.name} (Unité)` 
  })), [units]);


  // --- Soumission ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ATTENTION : Pour envoyer des fichiers avec Inertia en mode EDIT (PUT), 
    // il faut utiliser POST avec _method="PUT" dans les données.
    // C'est pourquoi on utilise post() dans les deux cas ici.
    
    const url = isEditMode ? route('products.update', product.id) : route(routeName);
    
    post(url, {
        forceFormData: true, // Obligatoire pour l'upload de fichiers
        onSuccess: () => onClose(),
        onError: (err) => console.error("Erreur produit :", err),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Modifier le Produit" : "Nouveau Produit"} maxWidth="2xl">
      <form onSubmit={handleSubmit} className="p-5 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* --- COLONNE GAUCHE : Image Drag & Drop --- */}
            <div className="md:col-span-1 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image du produit</label>
                
                <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors overflow-hidden relative
                    ${isDragActive ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-brand-400'}`}
                >
                    <input {...getInputProps()} />
                    
                    {preview ? (
                        <img 
                            src={preview} 
                            alt="Aperçu" 
                            className="absolute inset-0 w-full h-full object-cover rounded-xl" 
                        />
                    ) : (
                        <div className="text-gray-400">
                            <FontAwesomeIcon icon={isDragActive ? faCloudUploadAlt : faImage} className="text-3xl mb-2" />
                            <p className="text-xs">{isDragActive ? "Déposez ici" : "Glissez une image ou cliquez"}</p>
                        </div>
                    )}
                    
                    {/* Overlay au survol si image existe */}
                    {preview && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-bold">Changer l'image</p>
                        </div>
                    )}
                </div>
                {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
            </div>

            {/* --- COLONNE DROITE : Infos Générales --- */}
            <div className="md:col-span-2 space-y-4">
                {/* Catégorie */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie <span className="text-red-500">*</span></label>
                    <Select 
                        options={categoriesOptions}
                        value={categoriesOptions.find(c => c.value === String(data.category_id))}
                        onChange={opt => setData('category_id', opt ? opt.value : '')}
                        placeholder="Choisir une catégorie..."
                        className="text-sm"
                    />
                    {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
                </div>

                {/* Designation */}
                <InputField 
                    id="designation" label="Désignation" required
                    value={data.designation} onChange={e => setData('designation', e.target.value)}
                    errorMessage={errors.designation}
                />

                {/* SKU & Barcode */}
                <div className="grid grid-cols-2 gap-3">
                    <InputField 
                        id="sku" label="SKU (Réf)" required
                        value={data.sku} onChange={e => setData('sku', e.target.value)}
                        errorMessage={errors.sku}
                    />
                    <InputField 
                        id="barcode" label="Code-barres"
                        value={data.barcode} onChange={e => setData('barcode', e.target.value)}
                        errorMessage={errors.barcode}
                    />
                </div>
            </div>
        </div>

        {/* --- SECTION PRIX & TVA --- */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">Tarification</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField 
                    id="prix_achat" label="Prix d'Achat" type="number"
                    value={data.prix_achat} onChange={e => setData('prix_achat', e.target.value)}
                    errorMessage={errors.prix_achat}
                />
                <InputField 
                    id="prix_vente" label="Prix de Vente" type="number" required
                    value={data.prix_vente} onChange={e => setData('prix_vente', e.target.value)}
                    errorMessage={errors.prix_vente}
                />
                <InputField 
                    id="tva" label="TVA (%)" type="number" step="0.01" required
                    value={data.tva} onChange={e => setData('tva', e.target.value)}
                    errorMessage={errors.tva}
                />
            </div>
        </div>

        {/* --- SECTION STOCK & UNITÉS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {/* Unité (Select car la migration attend un string, mais c'est mieux de choisir parmi une liste) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unité <span className="text-red-500">*</span></label>
                <Select 
                    options={unitsOptions}
                    value={unitsOptions.find(u => u.value === data.unit)}
                    onChange={opt => setData('unit', opt ? opt.value : '')}
                    placeholder="Ex: kg, pcs..."
                    className="text-sm"
                />
                {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
            </div>

            <InputField 
                id="value_per_unit" label="Valeur par unité" type="number" step="0.1" required
                value={data.value_per_unit} onChange={e => setData('value_per_unit', e.target.value)}
                errorMessage={errors.value_per_unit}
                placeholder="Ex: 1 (pour 1kg)"
            />

            <InputField 
                id="stock_alert" label="Seuil d'alerte" type="number" required
                value={data.stock_alert} onChange={e => setData('stock_alert', e.target.value)}
                errorMessage={errors.stock_alert}
            />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Annuler
            </Button>
            <Button type="submit" disabled={processing} className="bg-brand-600 text-white hover:bg-brand-700">
                <FontAwesomeIcon icon={faSave} className="mr-2" /> 
                {processing ? 'Sauvegarde...' : 'Enregistrer le produit'}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;