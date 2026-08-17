import React, { useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import InputField from '../../form/input/InputField';
import TextArea from '../../form/input/TextArea';
import Button from '../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";

const ClientFormModal = ({ isOpen, onClose, client, clientCategories = [], routeName, agencies = [] }) => {
    const isEditMode = !!client;

    // Préparation des options pour le select Agence
    const agencyOptions = useMemo(() => {
        return agencies.map(agency => ({
            value: agency.id,
            label: agency.name
        }));
    }, [agencies]);

    // Initialisation du formulaire
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        client_category_id: '',
        client_type: '',
        agency_id: '',
        name: '',
        phone_number: '',
        email_address: '',
        address: '',
        NUI: '',
    });

    // Remplissage du formulaire à l'ouverture ou au changement de client
    useEffect(() => {
        if (isOpen) {
            clearErrors(); // Nettoie les erreurs précédentes
            if (isEditMode && client) {
                setData({
                    client_category_id: client.client_category_id || '',
                    client_type: client.client_type || '',
                    agency_id: client.agency_id || '',
                    name: client.name || '',
                    phone_number: client.phone_number || '',
                    email_address: client.email_address || '',
                    address: client.address || '',
                    NUI: client.NUI || '',
                });
            } else {
                reset(); // Formulaire vide pour la création
            }
        }
    }, [isOpen, client, isEditMode]);

    // Gestionnaire pour React-Select (Agence)
    const handleAgencyChange = (selectedOption) => {
        setData("agency_id", selectedOption ? selectedOption.value : '');
    };

    // Trouver l'option actuellement sélectionnée pour l'afficher dans le React-Select
    const selectedAgencyOption = agencyOptions.find(opt => opt.value === data.agency_id) || null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                onClose();
                reset();
            },
            onError: (err) => {
                console.error("Erreur de validation", err);
            }
        };

        if (isEditMode) {
            // routeName est 'client.update' dans ce cas
            put(route(routeName, client.id), options);
        } else {
            // routeName est 'client.store' dans ce cas
            post(route(routeName), options);
        }
    };

    const modalTitle = isEditMode ? "Modifier le Client" : "Créer un Nouveau Client";

    // Options pour les selects natifs
    const clientTypeOptions = [
        { value: '', label: 'Sélectionner un type' },
        { value: 'particulier', label: 'Particulier' },
        { value: 'entreprise', label: 'Entreprise' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <form onSubmit={handleSubmit} className="p-4">
                <div className="space-y-5">
                    
                    {/* --- Nom --- */}
                    <InputField
                        id="name"
                        label="Nom du Client"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        errorMessage={errors.name}
                        required
                        autoFocus
                    />

                    {/* --- Ligne : Type & Catégorie --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Type de Client */}
                        <div>
                            <label htmlFor="client_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="client_type"
                                value={data.client_type}
                                onChange={(e) => setData('client_type', e.target.value)}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm bg-transparent
                                    ${errors.client_type ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                    focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white`}
                            >
                                {clientTypeOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {errors.client_type && <p className="mt-1 text-xs text-red-500">{errors.client_type}</p>}
                        </div>

                        {/* Catégorie */}
                        <div>
                            <label htmlFor="client_category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Catégorie <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="client_category_id"
                                value={data.client_category_id}
                                onChange={(e) => setData('client_category_id', e.target.value)}
                                className={`w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm bg-transparent
                                    ${errors.client_category_id ? 'border-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
                                    focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-900 dark:text-white`}
                            >
                                <option value="">Sélectionner...</option>
                                {clientCategories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {errors.client_category_id && <p className="mt-1 text-xs text-red-500">{errors.client_category_id}</p>}
                        </div>
                    </div>

                    {/* --- Agence (React Select) --- */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Agence de rattachement <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={agencyOptions}
                            value={selectedAgencyOption}
                            onChange={handleAgencyChange}
                            placeholder="Choisir une agence..."
                            className="react-select-container text-sm"
                            classNamePrefix="react-select"
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    borderColor: errors.agency_id ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#d1d5db'),
                                    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
                                    '&:hover': { borderColor: state.isFocused ? '#3b82f6' : '#9ca3af' }
                                })
                            }}
                        />
                        {errors.agency_id && <p className="mt-1 text-xs text-red-500">{errors.agency_id}</p>}
                    </div>

                    {/* --- Ligne : Téléphone & Email --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            id="phone_number"
                            label="Téléphone"
                            type="text"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            errorMessage={errors.phone_number}
                            placeholder="+237..."
                        />

                        <InputField
                            id="email_address"
                            label="Email (Optionnel)"
                            type="email"
                            value={data.email_address}
                            onChange={(e) => setData('email_address', e.target.value)}
                            errorMessage={errors.email_address}
                            placeholder="client@exemple.com"
                        />
                    </div>

                    {/* --- Adresse --- */}
                    <TextArea
                        id="address"
                        label="Adresse Physique"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        errorMessage={errors.address}
                        rows={2}
                        placeholder="Quartier, Rue, Ville..."
                    />

                    {/* --- NUI --- */}
                    <InputField
                        id="nui"
                        label="Numéro Unique d'Identification (NUI)"
                        type="text"
                        value={data.NUI}
                        onChange={(e) => setData('NUI', e.target.value)}
                        errorMessage={errors.NUI}
                        placeholder="Pour les entreprises"
                    />
                </div>

                {/* --- Boutons --- */}
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="inline-flex items-center"
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        variant="primary" // Assurez-vous que votre composant Button gère cette variante
                        className="inline-flex items-center bg-brand-600 hover:bg-brand-700 text-white"
                    >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {processing ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Enregistrer')}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ClientFormModal;