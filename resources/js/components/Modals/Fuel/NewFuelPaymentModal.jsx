// resources/js/Components/Modals/NewFuelPaymentModal.jsx
import React, { useEffect, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal'; // Assurez-vous que ce chemin est correct
import Swal from 'sweetalert2';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField'; // Assurez-vous que ce chemin est correct
import Button from '../../ui/button/Button'; // Assurez-vous que ce chemin est correct
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Définition des options pour le champ 'type'
const paymentTypeOptions = [
    { value: 'cash', label: 'Espèces (Cash)' },
    { value: 'transfer', label: 'Virement Bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'other', label: 'Autre' },
];

// Le nom du composant a été modifié pour refléter son rôle de Modal
const NewFuelPaymentModal = ({ isOpen, onClose, agencies, banks, clients, types }) => { 
    
    // Pour l'exemple, j'utilise 'types' qui peut être passé en prop, sinon utilisez 'paymentTypeOptions'
    const finalTypeOptions = types || paymentTypeOptions;
    const { auth } = usePage().props; // Pour récupérer l'ID de l'utilisateur connecté
    
    // Champs basés sur votre modèle Payment Laravel
    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: auth.user.id, // Utilisateur connecté
        agency_id: '',
        bank_id: '',
        client_id: '',
        amout: '', // ATTENTION : correction de la faute de frappe 'amout' -> 'amout'
        type: '', 
        notes: '',
        amout_notes: '', // Notes sur le montant/calcul (si pertinent)
        bordereau: '', // Numéro de bordereau/référence
        is_fuel: true, // Ce paiement est explicitement pour le carburant (défaut à true)
    });
    
    // Options pour les menus déroulants
    const agencyOptions = useMemo(() => agencies.map(agency => ({
        value: String(agency.id),
        label: agency.name
    })), [agencies]);

    const bankOptions = useMemo(() => banks.map(bank => ({
        value: String(bank.id),
        label: bank.name
    })), [banks]);
    
    const clientOptions = useMemo(() => clients.map(client => ({
        value: String(client.id),
        label: client.name
    })), [clients]);

    // Initialisation du formulaire à l'ouverture de la modale
    useEffect(() => {
        if (isOpen) {
            reset({
                user_id: auth.user.id,
                agency_id: '',
                bank_id: '',
                client_id: '',
                amout: '',
                type: '', 
                notes: '',
                amout_notes: '', 
                bordereau: '', 
                is_fuel: true,
            });
        }
    }, [isOpen, reset, auth.user.id]);
    
    // Gestion du changement des champs Input
    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Envoi du formulaire à la route de stockage des paiements
        post(route('fuel_payments.store'), { 
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès !',
                    text: 'Le versement a été enregistré avec succès, monsieur.',
                    confirmButtonText: 'OK'
                });
                onClose(); // Fermer la modale
            },
            onError: (validationErrors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oups...',
                    text: 'Veuillez corriger les erreurs dans le formulaire.',
                    confirmButtonText: 'Compris'
                });
                console.error("Validation Errors:", validationErrors);
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer un Versement de Carburant">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Ligne 1: Agence et Banque */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Agence (Select avec react-select) */}
                    <div>
                        <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Agence
                        </label>
                        <Select
                            inputId="agency_id"
                            classNamePrefix="react-select"
                            options={agencyOptions}
                            value={agencyOptions.find(opt => opt.value === String(data.agency_id))}
                            onChange={(selectedOption) => {
                                setData('agency_id', selectedOption ? selectedOption.value : '');
                            }}
                            placeholder="Sélectionnez l'agence"
                            isClearable
                        />
                        {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
                    </div>

                    {/* Banque (Select avec react-select) */}
                    <div>
                        <label htmlFor="bank_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Banque de Destination
                        </label>
                        <Select
                            inputId="bank_id"
                            classNamePrefix="react-select"
                            options={bankOptions}
                            value={bankOptions.find(opt => opt.value === String(data.bank_id))}
                            onChange={(selectedOption) => {
                                setData('bank_id', selectedOption ? selectedOption.value : '');
                            }}
                            placeholder="Sélectionnez la banque"
                            isClearable
                        />
                        {errors.bank_id && <p className="text-sm text-red-600 mt-1">{errors.bank_id}</p>}
                    </div>
                </div>

                {/* Ligne 2: Client et Type de Paiement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Client (Select avec react-select) */}
                    <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client (Optionnel)
                        </label>
                        <Select
                            inputId="client_id"
                            classNamePrefix="react-select"
                            options={clientOptions}
                            value={clientOptions.find(opt => opt.value === String(data.client_id))}
                            onChange={(selectedOption) => {
                                setData('client_id', selectedOption ? selectedOption.value : '');
                            }}
                            placeholder="Sélectionnez un client"
                            isClearable
                        />
                        {errors.client_id && <p className="text-sm text-red-600 mt-1">{errors.client_id}</p>}
                    </div>
                    
                    {/* Type de Paiement (Select avec react-select) */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Type de Versement
                        </label>
                        <Select
                            inputId="type"
                            classNamePrefix="react-select"
                            options={finalTypeOptions}
                            value={finalTypeOptions.find(opt => opt.value === data.type)}
                            onChange={(selectedOption) => {
                                setData('type', selectedOption ? selectedOption.value : '');
                            }}
                            placeholder="Sélectionnez un type"
                            isClearable
                        />
                        {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
                    </div>
                </div>

                {/* Ligne 3: Montant et Bordereau */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                    {/* Montant */}
                    <Input
                        id="amout"
                        type="number"
                        step="1" 
                        min='1'
                        label="Montant du Versement"
                        value={data.amout}
                        onChange={handleChange}
                        error={errors.amout}
                        onWheel={(e) => e.target.blur()}
                        placeholder="Ex: 150000.00"
                        required
                    />
                    
                    {/* Bordereau/Référence */}
                    <Input
                        id="bordereau"
                        type="text"
                        label="Numéro de Bordereau/Référence"
                        value={data.bordereau}
                        onChange={handleChange}
                        error={errors.bordereau}
                        placeholder="Référence (si virement/chèque)"
                    />
                </div>

                {/* Ligne 4: Notes */}
                <div className="grid grid-cols-1 gap-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes 
                    </label>
                    <textarea
                        id="notes"
                        rows="3"
                        value={data.notes}
                        onChange={handleChange}
                        placeholder="Détails du versement..."
                        className={`mt-1 block w-full text-white p-3 border ${errors.notes ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    ></textarea>
                    {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
                </div>
                
                {/* Champs cachés pour le modèle Payment */}
                <input type="hidden" id="user_id" value={data.user_id} />
                <input type="hidden" id="is_fuel" value={data.is_fuel ? '1' : '0'} />

                {/* Boutons d'Action */}
                <div className="flex justify-end pt-2">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="destructive"
                        className="mr-2"
                        disabled={processing}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing} // Désactiver si champs requis vides
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Enregistrement...
                            </>
                        ) : (
                            'Enregistrer le Versement'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default NewFuelPaymentModal;