import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; 
import InputField from '../../../form/input/InputField'; 
import Button from '../../../ui/button/Button'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, 
    faTimes, 
    faBoxOpen, 
    faArrowRightFromBracket,
    faWarehouse,
    faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";
import Swal from 'sweetalert2';

const CommercialStockMoveModal = ({ 
    isOpen, 
    onClose, 
    products = [], // Liste des produits avec leur stock commercial actuel
    routeName = "comboutique.move_store" 
}) => {

    // --- Initialisation du formulaire ---
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        product_id: '',
        qty: '',
        type: 'sortie', // FORCÉ : Le commercial ne fait que des sorties (vers client, magasin ou perte)
        destination: '', // Sera 'Magasin' ou 'Perte'
        label: '',
    });

    // Stock du produit sélectionné (pour validation visuelle)
    const [selectedProductStock, setSelectedProductStock] = useState(0);

    // --- Reset à l'ouverture ---
    useEffect(() => {
        if (isOpen) {
            reset();
            clearErrors();
            setSelectedProductStock(0);
        }
    }, [isOpen]);

    // --- Options Produits ---
    // On suppose que l'objet produit contient 'stock_comptoir' ou 'available_qty' pour le service commercial
    const productOptions = useMemo(() => products.map(p => ({ 
        value: p.id, 
        label: `${p.designation} (Dispo: ${p.stock_comptoir ?? 0} ${p.unit ?? 'U'})`,
        stock: p.stock_comptoir ?? 0 
    })), [products]);

    // --- Options Destinations (Restreintes) ---
    const destinationOptions = [
        { value: 'Magasin', label: '↩️ Retour au Magasin', icon: faWarehouse },
        { value: 'Perte', label: '⚠️ Perte / Avarie / Vol', icon: faTriangleExclamation },
    ];

    // --- Gestionnaires ---
    const handleProductChange = (selectedOption) => {
        setData('product_id', selectedOption ? selectedOption.value : '');
        setSelectedProductStock(selectedOption ? selectedOption.stock : 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation Front-end basique
        if (parseFloat(data.qty) > parseFloat(selectedProductStock)) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock Insuffisant',
                text: `Vous ne pouvez pas sortir ${data.qty}. Seuls ${selectedProductStock} sont disponibles au comptoir.`,
            });
            return;
        }

        if (!data.destination) {
            Swal.fire('Erreur', 'Veuillez sélectionner le type de sortie (Retour ou Perte).', 'error');
            return;
        }

        post(route("comboutique.move_store"), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'Mouvement enregistré',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (err) => {
                console.error(err);
                Swal.fire('Erreur', 'Veuillez vérifier les champs.', 'error');
            }
        });
    };

    // Styles custom pour React-Select (Optionnel : pour colorer les pertes en rouge si besoin)
    const customStyles = {
        control: (base) => ({ ...base, minHeight: '45px' }),
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Sortie de Stock (Commercial)" 
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                
                {/* Information visuelle */}
                <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded text-sm text-orange-700">
                    <p className="font-bold"><FontAwesomeIcon icon={faArrowRightFromBracket} /> Zone Sortie Commerciale</p>
                    <p>Utilisez ce formulaire pour retourner des produits au <b>Magasin</b> ou déclarer une <b>Perte</b>.</p>
                </div>

                {/* --- 1. Sélection Produit --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produit concerné <span className="text-red-500">*</span>
                    </label>
                    <Select
                        options={productOptions}
                        onChange={handleProductChange}
                        placeholder="Rechercher un produit..."
                        styles={customStyles}
                        noOptionsMessage={() => "Aucun produit trouvé"}
                        className="text-sm"
                    />
                    {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id}</p>}
                </div>

                {/* --- 2. Type de Sortie (Destination) --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motif / Destination <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {destinationOptions.map((option) => (
                            <div 
                                key={option.value}
                                onClick={() => setData('destination', option.value)}
                                className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center transition-all ${
                                    data.destination === option.value 
                                        ? (option.value === 'Perte' ? 'bg-red-100 border-red-500 text-red-700' : 'bg-blue-100 border-blue-500 text-blue-700')
                                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'
                                }`}
                            >
                                <FontAwesomeIcon icon={option.icon} className="text-xl mb-2" />
                                <span className="font-bold text-sm">{option.label}</span>
                            </div>
                        ))}
                    </div>
                    {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
                </div>

                {/* --- 3. Quantité --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputField
                            id="qty"
                            label="Quantité à sortir"
                            type="number"
                            step="0.01"
                            min="0.1"
                            required
                            value={data.qty}
                            onChange={(e) => setData('qty', e.target.value)}
                            errorMessage={errors.qty}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="flex flex-col justify-end pb-3">
                        <span className="text-xs text-gray-500 uppercase font-bold">Stock Actuel (Comptoir)</span>
                        <div className={`text-xl font-mono font-bold ${selectedProductStock < parseFloat(data.qty || 0) ? 'text-red-600' : 'text-gray-800'}`}>
                            {selectedProductStock}
                        </div>
                    </div>
                </div>

                {/* --- 4. Motif / Commentaire --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Justification / Note <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        rows="3"
                        placeholder="Ex: Produit abîmé lors de la manipulation..."
                        value={data.label}
                        onChange={(e) => setData('label', e.target.value)}
                        required
                    ></textarea>
                    {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
                </div>

                {/* --- Actions --- */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={processing}>
                        <FontAwesomeIcon icon={faTimes} className="mr-2" /> Annuler
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing} 
                        className={`text-white shadow-md ${data.destination === 'Perte' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        <FontAwesomeIcon icon={faSave} className="mr-2" /> 
                        {processing ? 'Traitement...' : 'Valider la Sortie'}
                    </Button>
                </div>

            </form>
        </Modal>
    );
};

export default CommercialStockMoveModal;