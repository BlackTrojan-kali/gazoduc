import React, { useEffect, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal';
import Swal from 'sweetalert2';
import { faSpinner, faTachometerAlt, faGasPump, faVial, faInfoCircle, faBuilding } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField'; 
import Button from '../../ui/button/Button'; 
import Select from 'react-select'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FuelSaleFormModal = ({ isOpen, onClose, agencies, pompes }) => {
    const { props: { auth } } = usePage();
    const currentUserId = auth.user ? auth.user.id : null;
    
    // Initialisation du formulaire Inertia
    // Le champ 'client_id' a été supprimé
    const { data, setData, post, processing, errors, reset } = useForm({
        pistolet_id: '', 
        agency_id: '',
        index_fermeture: '', 
        volume_test: '', 
        user_id: currentUserId,
    });
    
    // --- Gestion des Options Select ---
    
    const agencyOptions = useMemo(() => agencies.map(agency => ({
        value: String(agency.id),
        label: agency.name
    })), [agencies]);

    // Groupement des Pistolets par Pompe (Îlot)
    const pistoletOptions = useMemo(() => {
        if (!pompes) return [];
        return pompes.map(pompe => ({
            label: pompe.name, // Nom du groupe
            options: pompe.pistolets?.map(p => ({
                value: String(p.id),
                label: `${p.name} (${p.citerne?.article?.name || 'Produit inconnu'})`,
                current_index: p.current_index, // On garde l'index pour affichage
                article_name: p.citerne?.article?.name || 'Inconnu'
            })) || []
        })).filter(group => group.options.length > 0); // On ne garde que les pompes qui ont des pistolets
    }, [pompes]);

    // --- Calcul en Temps Réel du Volume (UX/UI) ---
    
    // Trouver le pistolet sélectionné pour récupérer son index de départ
    const selectedPistoletObj = useMemo(() => {
        if (!data.pistolet_id || !pompes) return null;
        for (const pompe of pompes) {
            const p = pompe.pistolets?.find(p => String(p.id) === data.pistolet_id);
            if (p) return p;
        }
        return null;
    }, [data.pistolet_id, pompes]);

    // Calcul du volume à la volée
    const liveCalculatedVolume = useMemo(() => {
        if (!selectedPistoletObj || data.index_fermeture === '') return null;
        
        const ouverture = Number(selectedPistoletObj.current_index) || 0;
        const fermeture = Number(data.index_fermeture);
        const test = Number(data.volume_test) || 0;
        
        let volumeBrut = fermeture - ouverture;
        
        // Gestion de la remise à zéro du compteur mécanique (Rollover)
        if (volumeBrut < 0) {
            volumeBrut = (9999999 - ouverture) + fermeture;
        }
        
        return volumeBrut - test;
    }, [selectedPistoletObj, data.index_fermeture, data.volume_test]);

    // --- Hooks et Logique du Formulaire ---

    useEffect(() => {
        if (isOpen) {
            reset();
        }
    }, [isOpen, reset]);
    
    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation front-end préventive
        if (liveCalculatedVolume !== null && liveCalculatedVolume <= 0) {
            Swal.fire('Erreur d\'Index', 'Le volume net calculé doit être supérieur à zéro. Vérifiez vos index.', 'warning');
            return;
        }

        post(route('fuel.store'), { 
            onSuccess: () => {
                 Swal.fire({
                     icon: 'success',
                     title: 'Clôture validée !',
                     text: 'Le relevé d\'index est enregistré et les stocks ont été mis à jour.',
                     confirmButtonText: 'Terminer'
                 });
                 onClose();
            },
            onError: (validationErrors) => {
                console.error("Validation Errors:", validationErrors);
            },
        });
    };

    // --- Styles React-Select ---
    const selectCustomStyles = {
        control: (styles, { isFocused }) => ({
            ...styles,
            minHeight: '40px',
            borderColor: isFocused ? '#3b82f6' : styles.borderColor,
            boxShadow: isFocused ? '0 0 0 1px #3b82f6' : styles.boxShadow,
            '&:hover': { borderColor: isFocused ? '#3b82f6' : styles.borderColor },
        }),
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Clôture de Quart : Saisie des Index">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* --- LIGNE 1 : Station et Pistolet --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="agency_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBuilding} className="text-slate-400" /> Station <span className="text-red-500">*</span>
                        </label>
                        <Select
                            inputId="agency_id"
                            styles={selectCustomStyles}
                            options={agencyOptions}
                            value={agencyOptions.find(opt => opt.value === String(data.agency_id))}
                            onChange={(opt) => setData('agency_id', opt ? opt.value : '')}
                            placeholder="Sélectionnez la station"
                            isClearable
                        />
                        {errors.agency_id && <p className="text-xs text-red-500 mt-1">{errors.agency_id}</p>}
                    </div>

                    <div>
                        <label htmlFor="pistolet_id" className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faGasPump} className="text-blue-500" /> Pistolet Relevé <span className="text-red-500">*</span>
                        </label>
                        <Select
                            inputId="pistolet_id"
                            styles={selectCustomStyles}
                            options={pistoletOptions}
                            value={pistoletOptions.flatMap(group => group.options).find(opt => opt.value === String(data.pistolet_id))}
                            onChange={(opt) => setData('pistolet_id', opt ? opt.value : '')}
                            placeholder="Ex: Pistolet 1 (Super)..."
                            isClearable
                        />
                        {errors.pistolet_id && <p className="text-xs text-red-500 mt-1">{errors.pistolet_id}</p>}
                    </div>
                </div>

                {/* --- BLOC INFO PISTOLET (Visible uniquement si sélectionné) --- */}
                <div className={`transition-all duration-300 overflow-hidden ${selectedPistoletObj ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {selectedPistoletObj && (
                        <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-blue-400">Produit dans la cuve</span>
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                    {selectedPistoletObj.citerne?.article?.name || 'Inconnu'}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-bold text-blue-400">Dernier Index Connu (Ouverture)</span>
                                <span className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">
                                    {Number(selectedPistoletObj.current_index).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- LIGNE 2 : Les Index (Saisie) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700"> 
                    <Input
                        id="index_fermeture"
                        type="number"
                        step="0.01" 
                        min="0"
                        label={<span className="flex items-center gap-2"><FontAwesomeIcon icon={faTachometerAlt} /> Index de Fermeture Actuel *</span>}
                        value={data.index_fermeture}
                        onChange={handleChange}
                        error={errors.index_fermeture}
                        placeholder="Ex: 14502.50"
                        disabled={!data.pistolet_id}
                        required
                    />

                    <Input
                        id="volume_test"
                        type="number"
                        step="0.01" 
                        min="0"
                        label={<span className="flex items-center gap-2 text-slate-500"><FontAwesomeIcon icon={faVial} /> Étalonnage / Purge (L)</span>}
                        value={data.volume_test}
                        onChange={handleChange}
                        error={errors.volume_test}
                        placeholder="Volume remis en cuve..."
                        disabled={!data.pistolet_id}
                    />
                </div>

                {/* --- RÉCAPITULATIF UX --- */}
                {liveCalculatedVolume !== null && (
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${liveCalculatedVolume > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faInfoCircle} className={liveCalculatedVolume > 0 ? 'text-green-500' : 'text-red-500'} />
                            <span className={`text-sm font-semibold ${liveCalculatedVolume > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                Volume Net Vendu :
                            </span>
                        </div>
                        <span className={`text-2xl font-mono font-bold ${liveCalculatedVolume > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            {liveCalculatedVolume.toFixed(2)} L
                        </span>
                    </div>
                )}
                
                {/* Boutons d'Action */}
                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="destructive"
                        className="mr-3"
                        disabled={processing}
                    >
                        Annuler 
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing || !data.user_id || liveCalculatedVolume === null || liveCalculatedVolume <= 0}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Enregistrement...
                            </>
                        ) : (
                            'Valider la Clôture'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default FuelSaleFormModal;