import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import InputField from "../../form/input/InputField";
import Button from '../../ui/button/Button';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBottleWater, 
    faSpinner, 
    faIndustry, 
    faTruckDroplet 
} from '@fortawesome/free-solid-svg-icons';

const ProductionBottleModal = ({ 
    isOpen, 
    onClose, 
    title, 
    cisterns = [],        // Citernes Fixes
    mobileCisterns = [],  // Camions / Véhicules (Nouveau prop)
    articles = []         // Articles (Bouteilles)
}) => {
    
    // --- 1. Initialisation du Formulaire ---
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        source_type: 'fixed', // 'fixed' ou 'mobile'
        source_citerne_id: '',
        vehicle_id: '',
        article_id: '',
        quantity_produced: '',
    });

    // --- 2. Préparation des Options pour les Selects ---
    
    // Options Citernes Fixes
    const fixedOptions = cisterns.map(c => ({ 
        value: String(c.id), 
        label: `${c.name} (${c.article?.name || 'Vrac'})` 
    }));

    // Options Camions (Mobiles)
    const mobileOptions = mobileCisterns.map(v => ({ 
        value: String(v.id), 
        label: `${v.brand} - ${v.licence_plate} (${v.capacity_liters}L)` 
    }));

    // Options Articles (Bouteilles)
    const articleOptions = articles.map(a => ({ 
        value: String(a.id), 
        label: `${a.name} (${a.weight_per_unit || '?'} kg)` 
    }));

    // --- 3. Gestionnaires ---

    useEffect(() => {
        if (isOpen) {
            // Reset partiel ou total à l'ouverture si besoin
        } else {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    // Changement du type de source (Fixe vs Mobile)
    const handleSourceTypeChange = (type) => {
        setData(d => ({
            ...d,
            source_type: type,
            source_citerne_id: '', // On vide la sélection précédente
            vehicle_id: ''
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation Frontend
        if (data.source_type === 'fixed' && !data.source_citerne_id) {
            return Swal.fire('Erreur', 'Veuillez sélectionner une citerne fixe source.', 'warning');
        }
        if (data.source_type === 'mobile' && !data.vehicle_id) {
            return Swal.fire('Erreur', 'Veuillez sélectionner un camion source.', 'warning');
        }
        if (!data.article_id) {
            return Swal.fire('Erreur', 'Veuillez sélectionner le type de bouteille.', 'warning');
        }
        if (!data.quantity_produced || data.quantity_produced <= 0) {
            return Swal.fire('Erreur', 'La quantité doit être supérieure à 0.', 'warning');
        }

        post(route('prod.produce'), { // Assurez-vous que la route est correcte
            onSuccess: () => {
                Swal.fire('Succès', 'Production enregistrée avec succès.', 'success');
                onClose();
            },
            onError: (err) => {
                console.error(err);
                Swal.fire('Erreur', 'Vérifiez les données saisies.', 'error');
            }
        });
    };

    // --- 4. Styles ---
    const isDark = document.documentElement.classList.contains('dark');
    const customStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: isDark ? '#1F2937' : '#fff',
            borderColor: state.isFocused ? '#9333EA' : (isDark ? '#374151' : '#D1D5DB'), // Violet pour prod
            color: isDark ? '#fff' : '#000',
            minHeight: '44px'
        }),
        menu: (base) => ({ ...base, backgroundColor: isDark ? '#1F2937' : '#fff', zIndex: 9999 }),
        singleValue: (base) => ({ ...base, color: isDark ? '#fff' : '#000' }),
        input: (base) => ({ ...base, color: isDark ? '#fff' : '#000' }),
        placeholder: (base) => ({ ...base, color: isDark ? '#9CA3AF' : '#6B7280' }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#9333EA' : state.isFocused ? (isDark ? '#374151' : '#F3F4F6') : 'transparent',
            color: state.isSelected ? '#fff' : (isDark ? '#fff' : '#000'),
        }),
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title || "Enregistrer une Production"} maxWidth="2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* --- 1. CHOIX DE LA SOURCE (Onglets) --- */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Source de Gaz Vrac
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <button
                            type="button"
                            onClick={() => handleSourceTypeChange('fixed')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold transition-all ${
                                data.source_type === 'fixed'
                                    ? 'bg-white dark:bg-gray-600 text-purple-700 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            <FontAwesomeIcon icon={faIndustry} />
                            Citerne Usine
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSourceTypeChange('mobile')}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold transition-all ${
                                data.source_type === 'mobile'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            <FontAwesomeIcon icon={faTruckDroplet} />
                            Camion / Mobile
                        </button>
                    </div>
                </div>

                {/* --- 2. SELECTEUR DYNAMIQUE DE SOURCE --- */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    {data.source_type === 'fixed' ? (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Sélectionner la Citerne Fixe
                            </label>
                            <Select
                                options={fixedOptions}
                                value={fixedOptions.find(opt => opt.value === data.source_citerne_id)}
                                onChange={opt => setData('source_citerne_id', opt?.value || '')}
                                placeholder="Choisir une citerne..."
                                styles={customStyles}
                                isClearable
                            />
                            {errors.source_citerne_id && <p className="text-red-500 text-xs mt-1">{errors.source_citerne_id}</p>}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                Sélectionner le Camion
                            </label>
                            <Select
                                options={mobileOptions}
                                value={mobileOptions.find(opt => opt.value === data.vehicle_id)}
                                onChange={opt => setData('vehicle_id', opt?.value || '')}
                                placeholder="Choisir un véhicule..."
                                styles={customStyles}
                                isClearable
                            />
                            {errors.vehicle_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_id}</p>}
                            <p className="text-[10px] text-orange-500 mt-1">
                                * Aucun mouvement de stock ne sera effectué sur les citernes usine.
                            </p>
                        </div>
                    )}
                </div>

                {/* --- 3. DETAILS DE PRODUCTION --- */}
                <div className="space-y-4">
                    {/* Article */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Type de Bouteille Produite <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={articleOptions}
                            value={articleOptions.find(opt => opt.value === data.article_id)}
                            onChange={opt => setData('article_id', opt?.value || '')}
                            placeholder="Sélectionner l'article..."
                            styles={customStyles}
                        />
                        {errors.article_id && <p className="text-red-500 text-xs mt-1">{errors.article_id}</p>}
                    </div>

                    {/* Quantité */}
                    <div>
                        <InputField
                            id="quantity_produced"
                            type="number"
                            label="Nombre de Bouteilles Produites"
                            value={data.quantity_produced}
                            onChange={(e) => setData('quantity_produced', e.target.value)}
                            error={errors.quantity_produced}
                            required
                            min="1"
                            placeholder="Ex: 50"
                        />
                    </div>
                </div>

                {/* --- 4. ACTIONS --- */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    <Button
                        type="submit"
                        variant="primary" // Assurez-vous que votre composant Button gère cette variante, sinon utilisez className
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Production...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faBottleWater} className="mr-2" />
                                Enregistrer Production
                            </>
                        )}
                    </Button>
                </div>

            </form>
        </Modal>
    );
};

export default ProductionBottleModal;