import React, { useEffect, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal';
import Swal from 'sweetalert2';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField'; // Assurez-vous que ce chemin est correct
import Button from '../../ui/button/Button'; // Assurez-vous que ce chemin est correct
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Note: Ce composant suppose qu'il reçoit la liste des pompes (pumps)
// au lieu de la liste des citernes (tanks) via le prop 'pompes'.
// Il est crucial que les données 'pompes' soient fournies par le contrôleur Inertia.

const FuelSaleFormModal = ({ isOpen, onClose, articles, agencies, pompes, clients }) => {
    // Récupération de l'ID utilisateur connecté pour l'associer automatiquement à la vente
    const { props: { auth } } = usePage();
    const currentUserId = auth.user ? auth.user.id : null;
    
    // Initialisation du formulaire Inertia
    // Changement: Remplacement de 'citerne_id' par 'pompe_id'
    const { data, setData, post, processing, errors, reset } = useForm({
        pompe_id: '', // Nouvelle clé: L'ID de la pompe utilisée pour la vente
        agency_id: '',
        article_id: '', 
        client_id: '',
        quantity: '', 
        // L'ID utilisateur est géré ici mais envoyé dans le POST
        user_id: currentUserId,
        status: 'NA', // Statut par défaut
    });
    
    // --- Gestion des Options Select (Optimisation avec useMemo) ---
    
    const articleOptions = useMemo(() => articles.map(article => ({
        value: String(article.id),
        label: article.name
    })), [articles]);
    
    const agencyOptions = useMemo(() => agencies.map(agency => ({
        value: String(agency.id),
        label: agency.name
    })), [agencies]);

    // NOUVELLES OPTIONS: Pour les pompes
    const pompeOptions = useMemo(() => pompes.map(pompe => ({
        value: String(pompe.id),
        label: pompe.name
    })), [pompes]);
    
    const clientOptions = useMemo(() => clients.map(client => ({
        value: String(client.id),
        label: client.name
    })), [clients]);

    // --- Hooks et Logique du Formulaire ---

    // Réinitialisation du formulaire à l'ouverture de la modale
    useEffect(() => {
        if (isOpen) {
            // Changement: Réinitialisation de 'pompe_id'
            reset({
                pompe_id: '',
                agency_id: '',
                article_id: '',
                client_id: '',
                quantity: '',
                user_id: currentUserId,
                status: 'NA',
            });
        }
    }, [isOpen, reset, currentUserId]);
    
    // Gestion du changement des champs Input
    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    // Gestion de l'envoi du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();

        // Envoi du formulaire à la route de stockage
        post(route('fuel.store'), { // Assurez-vous que cette route existe
            onSuccess: () => {
                 Swal.fire({
                     icon: 'success',
                     title: 'Succès !',
                     text: 'La vente a été enregistrée et le stock sera déduit de la cuve appropriée, monsieur.',
                     confirmButtonText: 'OK'
                 });
                 onClose(); // Fermer la modale
            },
            onError: (validationErrors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur de validation',
                    text: 'Veuillez corriger les erreurs dans le formulaire, monsieur.',
                    confirmButtonText: 'Compris'
                });
                console.error("Validation Errors:", validationErrors);
            },
        });
    };

    // --- Rendu du Composant ---
    
    // Style de base pour les sélecteurs
    const selectCustomStyles = {
        control: (styles, { isFocused, isSelected }) => ({
            ...styles,
            minHeight: '40px',
            borderColor: isFocused ? '#3b82f6' : styles.borderColor,
            boxShadow: isFocused ? '0 0 0 1px #3b82f6' : styles.boxShadow,
            '&:hover': {
                borderColor: isFocused ? '#3b82f6' : styles.borderColor,
            },
        }),
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer une Vente de Carburant">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Ligne 1: Agence et Article */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Agence */}
                    <div>
                        <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Agence <span className="text-red-500">*</span>
                        </label>
                        <Select
                            inputId="agency_id"
                            styles={selectCustomStyles}
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

                    {/* Article Vendu (Carburant) */}
                    <div>
                        <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Article Vendu <span className="text-red-500">*</span>
                        </label>
                        <Select
                            inputId="article_id"
                            styles={selectCustomStyles}
                            options={articleOptions}
                            value={articleOptions.find(opt => opt.value === String(data.article_id))}
                            onChange={(selectedOption) => {
                                setData('article_id', selectedOption ? selectedOption.value : '');
                            }}
                            placeholder="Sélectionnez l'article"
                            isClearable
                        />
                        {errors.article_id && <p className="text-sm text-red-600 mt-1">{errors.article_id}</p>}
                    </div>
                </div>

                {/* Ligne 2: Pompe et Client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* CHAMP MIS À JOUR: Pompe Utilisée */}
                    <div>
                        <label htmlFor="pompe_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Pompe Utilisée <span className="text-red-500">*</span>
                        </label>
                        <Select
                            inputId="pompe_id"
                            styles={selectCustomStyles}
                            options={pompeOptions}
                            value={pompeOptions.find(opt => opt.value === String(data.pompe_id))}
                            onChange={(selectedOption) => {
                                setData('pompe_id', selectedOption ? selectedOption.value : '');
                            }}
                            placeholder="Sélectionnez la pompe"
                            isClearable
                        />
                        {errors.pompe_id && <p className="text-sm text-red-600 mt-1">{errors.pompe_id}</p>}
                        {/* Rappel : Le contrôleur devra déterminer la cuve à déduire en fonction de cette pompe et de l'article. */}
                    </div>
                    
                    {/* Client */}
                    <div>
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client <span className="text-red-500">*</span>
                        </label>
                        <Select
                            inputId="client_id"
                            styles={selectCustomStyles}
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
                </div>

                {/* Ligne 3: Quantité */}
                <div className="grid grid-cols-1 gap-4"> 
                    {/* Quantité */}
                    <Input
                        id="quantity"
                        type="number"
                        step="0.01" 
                        min='0.01'
                        label="Quantité (en Litres/Unités)"
                        value={data.quantity}
                        onChange={handleChange}
                        error={errors.quantity}
                        onWheel={(e) => e.target.blur()}
                        placeholder="Ex: 50.5"
                        required
                    />
                </div>
                
                {/* Champs cachés requis par le modèle FuelSale */}
                <input type="hidden" name="user_id" value={data.user_id || ''} />
                <input type="hidden" name="status" value={data.status} />

                {/* Boutons d'Action */}
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        disabled={processing || !data.user_id} // Désactiver si l'utilisateur n'est pas identifié
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Enregistrement...
                            </>
                        ) : (
                            'Enregistrer la Vente'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default FuelSaleFormModal;