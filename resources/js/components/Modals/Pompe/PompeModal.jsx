import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Ajustez le chemin si nécessaire
import InputField from "../../form/input/InputField"; // Ajustez le chemin
import Button from '../../ui/button/Button'; // Ajustez le chemin
import Swal from 'sweetalert2'; // Pour les notifications de succès
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';

/**
 * Modal pour la création et la modification d'une pompe.
 * @param {boolean} isOpen - État d'ouverture de la modale.
 * @param {function} onClose - Fonction de fermeture de la modale.
 * @param {Array<{id: number, name: string}>} agencies - Liste des agences pour la sélection.
 * @param {object|null} [pompe] - Objet pompe à modifier (null pour la création).
 * @param {string} title - Titre de la modale.
 */
const PompeModal = ({ isOpen, onClose, agencies, pompe = null, title }) => {
    // Initialisation du formulaire Inertia
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        agency_id: '',
    });

    // Options pour React-Select pour le choix de l'agence
    const agencyOptions = Array.isArray(agencies)
        ? agencies.map(agency => ({
            value: String(agency.id),
            label: agency.name,
        }))
        : [];

    // Logique d'initialisation et de réinitialisation lors de l'ouverture
    useEffect(() => {
        if (isOpen) {
            if (pompe) {
                // Mode Édition: Charger les données existantes
                setData({
                    name: pompe.name || '',
                    agency_id: String(pompe.agency_id || ''),
                });
            } else {
                // Mode Création: Réinitialiser et définir l'agence par défaut (la première)
                reset();
                setData(prevData => ({
                    ...prevData,
                    agency_id: agencies.length > 0 ? String(agencies[0].id) : '',
                }));
            }
        }
    }, [isOpen, pompe, agencies, reset, setData]);

    // Gestion du changement pour les champs InputField simples
    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    // Gestion du changement pour React-Select
    const handleSelectChange = (selectedOption, { name }) => {
        setData(name, selectedOption ? selectedOption.value : '');
    };

    // Soumission du formulaire (Création ou Modification)
    const handleSubmit = (e) => {
        e.preventDefault();

        const isEditing = !!pompe;
        const submitMethod = isEditing ? put : post;
        const submitRoute = isEditing ? route('pompes.update', pompe.id) : route('pompes.store');

        submitMethod(submitRoute, {
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: isEditing ? 'Modification réussie !' : 'Création réussie !',
                    text: `La pompe ${data.name} a été ${isEditing ? 'mise à jour' : 'créée'} avec succès.`,
                    showConfirmButton: false,
                    timer: 3000
                });
            },
            onError: (validationErrors) => {
                // Inertia gère l'affichage des erreurs sous les champs via 'errors'
                console.error("Erreurs de validation:", validationErrors);
            },
        });
    };

    // Option sélectionnée pour l'agence (nécessaire pour React-Select)
    const selectedAgencyOption = agencyOptions.find(option => option.value === data.agency_id);

    // --- Dynamic styles for React-Select (Copied for consistency) ---
    const reactSelectStyles = {
        control: (baseStyles, state) => ({
            ...baseStyles,
            height: '44px',
            minHeight: '44px',
            borderColor: errors[state.selectProps.name] ? '#EF4444' : (state.isFocused ? '#3B82F6' : '#E5E7EB'),
            backgroundColor: '#FFFFFF',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
            },
            '.dark &': {
                borderColor: errors[state.selectProps.name] ? '#EF4444' : (state.isFocused ? '#2563EB' : '#374151'),
                backgroundColor: '#111827',
                color: '#E5E7EB',
                '&:hover': {
                    borderColor: state.isFocused ? '#2563EB' : '#4B5563',
                },
            }
        }),
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: '#1F2937',
            '.dark &': {
                color: '#E5E7EB',
            }
        }),
        placeholder: (baseStyles) => ({
            ...baseStyles,
            color: '#9CA3AF',
            '.dark &': {
                color: '#6B7280',
            }
        }),
        input: (baseStyles) => ({
            ...baseStyles,
            color: '#1F2937',
            '.dark &': {
                color: '#E5E7EB',
            }
        }),
        menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: '#FFFFFF',
            zIndex: 9999,
            '.dark &': {
                backgroundColor: '#1F2937',
            }
        }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected ? '#2563EB' : (state.isFocused ? '#F3F4F6' : '#FFFFFF'),
            color: state.isSelected ? '#FFFFFF' : '#1F2937',
            '&:hover': {
                backgroundColor: state.isFocused ? '#F3F4F6' : '#FFFFFF',
                color: '#1F2937',
            },
            '.dark &': {
                backgroundColor: state.isSelected ? '#1E40AF' : (state.isFocused ? '#374151' : '#1F2937'),
                color: state.isSelected ? '#FFFFFF' : '#E5E7EB',
                '&:hover': {
                    backgroundColor: state.isFocused ? '#374151' : '#1F2937',
                    color: '#E5E7EB',
                },
            }
        }),
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* --- Champ Nom de la Pompe --- */}
                <InputField
                    id="name"
                    type="text"
                    label="Nom de la Pompe"
                    value={data.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Ex: Pompe P-01"
                    required
                />

                {/* --- Champ Agence (agency_id) --- */}
                <div className="mb-4">
                    <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agence Associée
                    </label>
                    <Select
                        id="agency_id"
                        name="agency_id"
                        options={agencyOptions}
                        value={selectedAgencyOption}
                        onChange={handleSelectChange}
                        placeholder="Sélectionner une agence"
                        isClearable={true}
                        isSearchable={true}
                        required
                        classNamePrefix="react-select"
                        styles={reactSelectStyles} // Application des styles cohérents
                    />
                    {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={onClose} // Utiliser onClose pour fermer
                        className="mr-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Envoi...
                            </>
                        ) : (
                            pompe ? 'Modifier la Pompe' : 'Créer la Pompe'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default PompeModal;