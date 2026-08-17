import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal';
import InputField from '../../../form/input/InputField';
import Button from '../../../ui/button/Button';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTruck, faBox, faPlus, faTrash, faSave, faTimes 
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const CreateTransferModal = ({ 
    isOpen, 
    onClose, 
    boutiques = [], 
    vehicules = [], 
    chauffeurs = [], 
    products = [] 
}) => {
    
    // Initialisation du formulaire
    // SUPPRESSION de arrival_date
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        boutique_arrival_id: '',
        vehicule_id: '',
        chauffeur_id: '',
        departure_date: new Date().toISOString().slice(0, 16),
        // arrival_date: '', // RETIRÉ
        items: [] 
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            reset();
            setData('items', []);
        }
    }, [isOpen]);

    // --- Options ---
    const boutiqueOptions = useMemo(() => boutiques.map(b => ({ value: b.id, label: b.name })), [boutiques]);
    const vehiculeOptions = useMemo(() => vehicules.map(v => ({ 
        value: v.id, 
        label: `${v.type} - ${v.licence_plate}` 
    })), [vehicules]);
    const chauffeurOptions = useMemo(() => chauffeurs.map(c => ({ value: c.id, label: c.name })), [chauffeurs]);
    
    const productOptions = useMemo(() => products.map(p => ({ 
        value: p.id, 
        label: `${p.designation} (Stock: ${p.stock_magasin || 0})`,
        stock: p.stock_magasin || 0,
        sku: p.sku
    })), [products]);

    // --- Panier ---
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qtyToAdd, setQtyToAdd] = useState('');

    const addItemToCart = () => {
        if (!selectedProduct || !qtyToAdd || qtyToAdd <= 0) return;

        if (Number(qtyToAdd) > selectedProduct.stock) {
            Swal.fire('Stock insuffisant', `Max disponible : ${selectedProduct.stock}.`, 'warning');
            return;
        }

        const existingIndex = data.items.findIndex(i => i.product_id === selectedProduct.value);
        let newItems = [...data.items];

        if (existingIndex >= 0) {
            const currentQty = parseFloat(newItems[existingIndex].qty);
            const newQty = currentQty + parseFloat(qtyToAdd);
            
            if (newQty > selectedProduct.stock) {
                Swal.fire('Limite atteinte', 'Le cumul dépasse le stock disponible.', 'warning');
                return;
            }
            newItems[existingIndex].qty = newQty;
        } else {
            newItems.push({
                product_id: selectedProduct.value,
                product_label: selectedProduct.label,
                sku: selectedProduct.sku,
                qty: parseFloat(qtyToAdd)
            });
        }

        setData('items', newItems);
        setSelectedProduct(null);
        setQtyToAdd('');
    };

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (data.items.length === 0) {
            Swal.fire('Erreur', 'Votre liste de transfert est vide.', 'warning');
            return;
        }

        post(route('mag-boutique.tranfert.store'), {
            onSuccess: () => {
                Swal.fire('Succès', 'Transfert créé et stock débité.', 'success');
                onClose();
            },
            onError: (err) => {
                console.error(err);
                Swal.fire('Erreur', 'Vérifiez le formulaire.', 'error');
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nouveau Transfert Inter-Boutiques" maxWidth="7xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                
                {/* --- SECTION 1 : LOGISTIQUE --- */}
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2 border-b pb-2">
                        <FontAwesomeIcon icon={faTruck} className="text-brand-600"/> 
                        Informations de transport
                    </h3>
                    
                    {/* Grille sur 4 colonnes : Destination, Date Départ, Véhicule, Chauffeur */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* Destination */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Boutique Arrivée *</label>
                            <Select 
                                options={boutiqueOptions}
                                onChange={opt => setData('boutique_arrival_id', opt?.value)}
                                className="text-sm" placeholder="Choisir la destination..."
                            />
                            {errors.boutique_arrival_id && <p className="text-xs text-red-500 mt-1">{errors.boutique_arrival_id}</p>}
                        </div>

                        {/* Date Départ */}
                        <div>
                             <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date Départ</label>
                             <input 
                                type="datetime-local"
                                value={data.departure_date}
                                onChange={e => setData('departure_date', e.target.value)}
                                className="w-full rounded-md border-gray-300 text-sm focus:border-brand-500 focus:ring-brand-500 h-[38px]"
                             />
                              {errors.departure_date && <p className="text-xs text-red-500 mt-1">{errors.departure_date}</p>}
                        </div>

                        {/* Véhicule */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Véhicule *</label>
                            <Select 
                                options={vehiculeOptions}
                                onChange={opt => setData('vehicule_id', opt?.value)}
                                className="text-sm" placeholder="Sélectionner..."
                            />
                            {errors.vehicule_id && <p className="text-xs text-red-500 mt-1">{errors.vehicule_id}</p>}
                        </div>

                        {/* Chauffeur */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Chauffeur *</label>
                            <Select 
                                options={chauffeurOptions}
                                onChange={opt => setData('chauffeur_id', opt?.value)}
                                className="text-sm" placeholder="Sélectionner..."
                            />
                            {errors.chauffeur_id && <p className="text-xs text-red-500 mt-1">{errors.chauffeur_id}</p>}
                        </div>
                    </div>
                </div>

                {/* --- SECTION 2 : PANIER --- */}
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* GAUCHE : FORMULAIRE D'AJOUT */}
                    <div className="lg:w-1/3 bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800 h-fit shadow-sm">
                        <h3 className="text-base font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBox} /> Ajouter au chargement
                        </h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Rechercher Produit</label>
                                <Select 
                                    options={productOptions}
                                    value={selectedProduct}
                                    onChange={setSelectedProduct}
                                    placeholder="Tapez le nom ou SKU..."
                                    className="text-sm"
                                    isClearable
                                />
                            </div>
                            
                            {selectedProduct && (
                                <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
                                    <span>Stock Actuel (Départ) :</span>
                                    <span className="font-bold text-lg">{selectedProduct.stock}</span>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase mb-1 block">Quantité à charger</label>
                                <input 
                                    type="number" 
                                    step="1"
                                    value={qtyToAdd}
                                    onChange={e => setQtyToAdd(e.target.value)}
                                    className="w-full rounded-md border-gray-300 focus:border-brand-500 focus:ring-brand-500 text-lg font-bold p-2"
                                    placeholder="0.00"
                                    onKeyDown={(e) => e.key === 'Enter' && addItemToCart()}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={addItemToCart}
                                disabled={!selectedProduct || !qtyToAdd}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-lg text-sm font-bold shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide"
                            >
                                <FontAwesomeIcon icon={faPlus} /> Ajouter
                            </button>
                        </div>
                    </div>

                    {/* DROITE : TABLEAU LISTE */}
                    <div className="lg:w-2/3 flex flex-col">
                        <div className="bg-gray-100 dark:bg-gray-700 px-5 py-3 rounded-t-xl border border-gray-200 dark:border-gray-600 flex justify-between items-center">
                            <span className="font-bold text-gray-700 dark:text-gray-200 uppercase text-sm">Contenu du transfert</span>
                            <span className="text-xs font-bold bg-white text-gray-800 px-3 py-1 rounded-full border shadow-sm">{data.items.length} lignes</span>
                        </div>
                        
                        <div className="border-x border-b border-gray-200 dark:border-gray-700 rounded-b-xl overflow-hidden bg-white dark:bg-gray-800 flex-grow">
                            <div className="overflow-y-auto max-h-[400px]">
                                {data.items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <FontAwesomeIcon icon={faBox} className="text-4xl mb-3 opacity-20"/>
                                        <p className="text-sm">Le chargement est vide.</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Article</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Quantité</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {data.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                    <td className="px-6 py-3">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {item.product_label}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-sm text-gray-900 font-mono font-bold bg-gray-50/50">
                                                        {item.qty}
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <button 
                                                            type="button"
                                                            onClick={() => removeItem(index)}
                                                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                            title="Retirer"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <Button type="button" variant="secondary" onClick={onClose} size="lg">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" /> Annuler
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing || data.items.length === 0} 
                        className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg text-sm px-8"
                        size="lg"
                    >
                        <FontAwesomeIcon icon={faSave} className="mr-2" /> 
                        {processing ? 'Validation en cours...' : 'CONFIRMER LE TRANSFERT'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateTransferModal;