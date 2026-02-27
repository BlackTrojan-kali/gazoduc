import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; 
import InputField from '../../../form/input/InputField'; 
import Button from '../../../ui/button/Button'; 
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, 
    faTimes, 
    faFileInvoice, 
    faCalendarAlt, 
    faTruckLoading,
    faStore,
    faBoxOpen,
    faPlus,
    faTrash,
    faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';

const PurchaseOrderFormModal = ({ 
    isOpen, 
    onClose, 
    purchaseOrder = null, 
    suppliers = [], 
    boutiques = [],
    products = [], // NOUVEAU : Le catalogue des produits
    routeName = 'purchase-orders.store' 
}) => {
    const isEditMode = !!purchaseOrder;

    // --- Options pour React-Select ---
    const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.name }));
    const boutiqueOptions = boutiques.map(b => ({ value: b.id, label: b.name }));
    const productOptions = products.map(p => ({ 
        value: p.id, 
        label: `${p.sku ? '['+p.sku+'] ' : ''}${p.designation}`,
        price: p.purchase_price || 0 // On embarque le prix d'achat par défaut
    }));
    
    const statusOptions = [
        { value: 'draft', label: 'Brouillon' },
        { value: 'sent', label: 'Envoyé au fournisseur' },
        { value: 'partial', label: 'Partiellement reçu' },
        { value: 'received', label: 'Totalement réceptionné' },
        { value: 'cancelled', label: 'Annulé' }
    ];

    // Initialisation du formulaire avec Inertia
    // Ajout d'un tableau "lines" pour stocker les produits sélectionnés
    const { data, setData, post, put, processing, errors, reset } = useForm({
        supplier_id: purchaseOrder?.supplier_id || '',
        boutique_id: purchaseOrder?.boutique_id || '',
        reference: purchaseOrder?.reference || '',
        status: purchaseOrder?.status || 'draft',
        order_date: purchaseOrder?.order_date || new Date().toISOString().split('T')[0],
        expected_delivery_date: purchaseOrder?.expected_delivery_date || '',
        lines: purchaseOrder?.lines || [], // Stocke les articles de la commande
    });

    // --- État local pour l'ajout d'un produit ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [lineQty, setLineQty] = useState('');
    const [linePrice, setLinePrice] = useState('');

    // Quand on choisit un produit, on remplit automatiquement son prix d'achat
    const handleProductSelect = (selected) => {
        setSelectedProduct(selected);
        if (selected) {
            setLinePrice(selected.price);
            setLineQty(1);
        } else {
            setLinePrice('');
            setLineQty('');
        }
    };

    // Ajouter la ligne au panier (data.lines)
    const handleAddLine = () => {
        if (!selectedProduct || !lineQty || !linePrice) return;

        const newLine = {
            product_id: selectedProduct.value,
            designation: selectedProduct.label,
            quantity_ordered: parseFloat(lineQty),
            unit_price: parseFloat(linePrice),
            subtotal: parseFloat(lineQty) * parseFloat(linePrice)
        };

        // Vérifier si le produit est déjà dans la liste
        const existingIndex = data.lines.findIndex(l => l.product_id === newLine.product_id);
        let updatedLines = [...data.lines];

        if (existingIndex >= 0) {
            // Mise à jour de la quantité si déjà présent
            updatedLines[existingIndex].quantity_ordered += newLine.quantity_ordered;
            updatedLines[existingIndex].subtotal = updatedLines[existingIndex].quantity_ordered * updatedLines[existingIndex].unit_price;
        } else {
            updatedLines.push(newLine);
        }

        setData('lines', updatedLines);
        
        // Reset des champs d'ajout
        setSelectedProduct(null);
        setLineQty('');
        setLinePrice('');
    };

    // Supprimer une ligne du panier
    const handleRemoveLine = (index) => {
        const updatedLines = data.lines.filter((_, i) => i !== index);
        setData('lines', updatedLines);
    };

    // Calcul du total global
    const totalAmount = useMemo(() => {
        return data.lines.reduce((acc, curr) => acc + curr.subtotal, 0);
    }, [data.lines]);

    // Synchronisation à l'ouverture
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setData({
                    supplier_id: purchaseOrder.supplier_id || '',
                    boutique_id: purchaseOrder.boutique_id || '',
                    reference: purchaseOrder.reference || '',
                    status: purchaseOrder.status || 'draft',
                    order_date: purchaseOrder.order_date || '',
                    expected_delivery_date: purchaseOrder.expected_delivery_date || '',
                    lines: purchaseOrder.lines || [],
                });
            } else {
                reset(); 
                setSelectedProduct(null);
                setLineQty('');
                setLinePrice('');
            }
        }
    }, [isOpen, isEditMode, purchaseOrder]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // On peut vérifier ici qu'il y a au moins un produit
        if (data.lines.length === 0 && data.status !== 'draft') {
            alert("Vous ne pouvez pas valider une commande vide.");
            return;
        }

        if (isEditMode) {
            put(route('purchase-orders.update', purchaseOrder.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route(routeName), {
                onSuccess: () => onClose(),
            });
        }
    };

    const modalTitle = isEditMode ? "Modifier le Bon de Commande" : "Créer un Bon de Commande";
    const isLocked = isEditMode && purchaseOrder.status !== 'draft';

    // --- Valeurs sélectionnées pour React-Select ---
    const currentSupplier = supplierOptions.find(opt => opt.value === data.supplier_id) || null;
    const currentBoutique = boutiqueOptions.find(opt => opt.value === data.boutique_id) || null;
    const currentStatus = statusOptions.find(opt => opt.value === data.status) || null;

    // --- Styles React-Select (Dark Mode) ---
    const rsClassNames = {
        control: (state) => `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm min-h-[38px] transition-colors ${state.isFocused ? 'ring-1 ring-brand-500 border-brand-500' : 'hover:border-gray-400 dark:hover:border-gray-500'}`,
        menu: () => 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md mt-1 z-50 text-sm',
        option: (state) => `px-3 py-2 cursor-pointer ${state.isSelected ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium' : state.isFocused ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`,
        singleValue: () => 'text-gray-900 dark:text-gray-100',
        placeholder: () => 'text-gray-400 dark:text-gray-500',
    };
    const rsStyles = {
        control: (base) => ({ ...base, backgroundColor: 'white', border: 'none', boxShadow: 'none', minHeight: '38px' }),
        menu: (base) => ({ ...base, backgroundColor: 'white' }),
        option: (base) => ({ ...base, backgroundColor: 'white', color: 'inherit' }),
        singleValue: (base) => ({ ...base, color: 'inherit' })
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="7xl">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                
                {/* Conteneur principal divisé en 2 colonnes */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
                    
                    {/* COLONNE GAUCHE : SÉLECTION DES PRODUITS (7 colonnes sur 12) */}
                    <div className="lg:col-span-7 flex flex-col space-y-4 border-r-0 lg:border-r border-gray-200 dark:border-gray-700 lg:pr-6">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                            <FontAwesomeIcon icon={faBoxOpen} className="text-brand-500"/>
                            Articles de la commande
                        </h3>

                        {/* Barre d'ajout de produit */}
                        {!isLocked && (
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col xl:flex-row gap-3 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Produit</label>
                                    <Select 
                                        options={productOptions}
                                        value={selectedProduct}
                                        onChange={handleProductSelect}
                                        placeholder="Chercher un produit..."
                                        classNames={rsClassNames}
                                        styles={rsStyles}
                                        isClearable
                                    />
                                </div>
                                <div className="w-full xl:w-24">
                                    <InputField
                                        id="qty" label="Qté" type="number" min="0.01" step="0.01"
                                        value={lineQty} onChange={(e) => setLineQty(e.target.value)}
                                    />
                                </div>
                                <div className="w-full xl:w-32">
                                    <InputField
                                        id="price" label="Prix U." type="number" min="0" step="0.01"
                                        value={linePrice} onChange={(e) => setLinePrice(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    onClick={handleAddLine}
                                    disabled={!selectedProduct || !lineQty || !linePrice}
                                    className="bg-gray-800 hover:bg-black text-white dark:bg-gray-600 dark:hover:bg-gray-500 h-[38px] mb-0.5"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </Button>
                            </div>
                        )}

                        {/* Tableau du panier */}
                        <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 h-64 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Désignation</th>
                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Qté</th>
                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Prix U.</th>
                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">S/Total</th>
                                        {!isLocked && <th className="px-4 py-2 w-10"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.lines.length > 0 ? data.lines.map((line, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{line.designation}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{line.quantity_ordered}</td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{new Intl.NumberFormat('fr-FR').format(line.unit_price)}</td>
                                            <td className="px-4 py-3 text-sm text-right font-bold text-brand-600 dark:text-brand-400">{new Intl.NumberFormat('fr-FR').format(line.subtotal)}</td>
                                            {!isLocked && (
                                                <td className="px-4 py-3 text-right">
                                                    <button type="button" onClick={() => handleRemoveLine(index)} className="text-red-500 hover:text-red-700">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={isLocked ? "4" : "5"} className="px-4 py-8 text-center text-sm text-gray-500">
                                                Aucun article dans cette commande.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>

                    {/* COLONNE DROITE : INFO DE LA COMMANDE (5 colonnes sur 12) */}
                    <div className="lg:col-span-5 flex flex-col space-y-5">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                            <FontAwesomeIcon icon={faFileInvoice} className="text-brand-500"/>
                            Détails de la demande
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Fournisseur <span className="text-red-500">*</span>
                                </label>
                                <Select 
                                    options={supplierOptions} value={currentSupplier}
                                    onChange={(s) => setData('supplier_id', s ? s.value : '')}
                                    classNames={{...rsClassNames, control: (state) => `${rsClassNames.control(state)} ${errors.supplier_id ? 'border-red-500' : ''}`}}
                                    styles={rsStyles} isClearable isDisabled={isLocked}
                                />
                                {errors.supplier_id && <p className="mt-1 text-xs text-red-600">{errors.supplier_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faStore} className="text-gray-400" />
                                    Boutique de livraison <span className="text-red-500">*</span>
                                </label>
                                <Select 
                                    options={boutiqueOptions} value={currentBoutique}
                                    onChange={(s) => setData('boutique_id', s ? s.value : '')}
                                    classNames={{...rsClassNames, control: (state) => `${rsClassNames.control(state)} ${errors.boutique_id ? 'border-red-500' : ''}`}}
                                    styles={rsStyles} isClearable isDisabled={isLocked}
                                />
                                {errors.boutique_id && <p className="mt-1 text-xs text-red-600">{errors.boutique_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    id="order_date" label="Date Commande" type="date"
                                    value={data.order_date} onChange={(e) => setData('order_date', e.target.value)}
                                    errorMessage={errors.order_date} required disabled={isLocked}
                                />
                                <InputField
                                    id="expected_delivery_date" label="Livraison Prévue" type="date"
                                    value={data.expected_delivery_date} onChange={(e) => setData('expected_delivery_date', e.target.value)}
                                    errorMessage={errors.expected_delivery_date} disabled={isLocked}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                                <Select 
                                    options={statusOptions} value={currentStatus}
                                    onChange={(s) => setData('status', s ? s.value : 'draft')}
                                    classNames={rsClassNames} styles={rsStyles} isDisabled={!isEditMode} 
                                />
                            </div>

                            <InputField
                                id="reference" label="Référence (Optionnel)" type="text"
                                value={data.reference} onChange={(e) => setData('reference', e.target.value)}
                                errorMessage={errors.reference} placeholder="Auto-généré si vide" disabled={isLocked}
                            />

                            {/* Encart Total */}
                            <div className="mt-6 bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl border border-brand-100 dark:border-brand-800 flex justify-between items-center">
                                <span className="text-sm font-bold text-brand-800 dark:text-brand-300 uppercase flex items-center gap-2">
                                    <FontAwesomeIcon icon={faMoneyBillWave} />
                                    Total Estimé
                                </span>
                                <span className="text-xl font-black text-brand-600 dark:text-brand-400">
                                    {new Intl.NumberFormat('fr-FR').format(totalAmount)} FCFA
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Boutons d'action globaux de la modale */}
                <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl mt-auto">
                    <Button type="button" variant="secondary" onClick={onClose} className="inline-flex items-center">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Annuler
                    </Button>
                    <Button type="submit" disabled={processing} className="inline-flex items-center bg-brand-600 text-white hover:bg-brand-700">
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {processing ? 'Enregistrement...' : 'Enregistrer la commande'}
                    </Button>
                </div>

            </form>
        </Modal>
    );
};

export default PurchaseOrderFormModal;