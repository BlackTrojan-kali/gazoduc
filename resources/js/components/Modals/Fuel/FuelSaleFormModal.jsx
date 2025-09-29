// resources/js/Components/Modals/FuelSaleFormModal.jsx

import React, { useEffect, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal';
import Swal from 'sweetalert2';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Assurez-vous d'avoir une fonction getSelectStyles ou adaptez la gestion des styles
// pour react-select si vous ne l'importez pas ici.

const FuelSaleFormModal = ({ isOpen, onClose, articles, agencies, cuves, clients }) => {
   // Suppression des champs: unit_price, sub_total, total_price, description
    const { data, setData, post, processing, errors, reset } = useForm({
        citerne_id: null,
        agency_id: '',
        article_id: null, // Si le carburant est un article
        client_id: null,
        quantity: '', // Seul champ de quantité/prix restant à saisir
        status: 'NA', // Statut par défaut
    });
    
    // Options pour les menus déroulants
    const articleOptions = useMemo(() => articles.map(article => ({
        value: String(article.id),
        label: article.name
    })), [articles]);
    
    const agencyOptions = useMemo(() => agencies.map(agency => ({
        value: String(agency.id),
        label: agency.name
    })), [agencies]);

    const citerneOptions = useMemo(() => cuves.map(citerne => ({
        value: String(citerne.id),
        label: `${citerne.citerne.name}` 
    })), [cuves]);
    
    const clientOptions = useMemo(() => clients.map(client => ({
        value: String(client.id),
        label: client.name
    })), [clients]);

    // Initialisation du formulaire à l'ouverture de la modale
    useEffect(() => {
        if (isOpen) {
            reset({
                citerne_id: null,
                agency_id: '',
                article_id: null,
                client_id: null,
                quantity: '',
                status: 'NA',
            });
        }
    }, [isOpen, reset]);
    
    // L'ancien useEffect pour le calcul des totaux a été supprimé

    // Gestion du changement des champs Input
    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Envoi du formulaire à la route de stockage
        post(route('fuel.store'), { // Assurez-vous que cette route existe
            onSuccess: () => {
              
                onClose(); // Fermer la modale
            },
            onError: (validationErrors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Veuillez corriger les erreurs dans le formulaire, monsieur.',
                    confirmButtonText: 'Compris'
                });
                console.error("Validation Errors:", validationErrors);
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer une Vente de Carburant">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Ligne 1: Agence et Citerne */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Agence (Select avec react-select) */}
                    <div className="mb-4 md:mb-0">
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
                            // styles={getSelectStyles(errors.agency_id)}
                        />
                        {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
                    </div>

                    {/* Citerne (Select avec react-select) */}
                    <div className="mb-4 md:mb-0">
                        <label htmlFor="citerne_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Citerne de Sortie
                        </label>
                        <Select
                            inputId="citerne_id"
                            classNamePrefix="react-select"
                            options={citerneOptions}
                            value={citerneOptions.find(opt => opt.value === String(data.citerne_id))}
                            onChange={(selectedOption) => {
                                setData('citerne_id', selectedOption ? selectedOption.value : '');
                            }}
                            placeholder="Sélectionnez une citerne"
                            isClearable
                            // styles={getSelectStyles(errors.citerne_id)}
                        />
                        {errors.citerne_id && <p className="text-sm text-red-600 mt-1">{errors.citerne_id}</p>}
                    </div>

                </div>

                {/* Ligne 2: Article et Client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Article (Select avec react-select) */}
                    <div className="mb-4 md:mb-0">
                        <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Article Vendu (Carburant)
                        </label>
                        <Select
                            inputId="article_id"
                            classNamePrefix="react-select"
                            options={articleOptions}
                            value={articleOptions.find(opt => opt.value === String(data.article_id))}
                            onChange={(selectedOption) => {
                                setData('article_id', selectedOption ? selectedOption.value : '');
                            }}
                            placeholder="Sélectionnez l'article"
                            isClearable
                            // styles={getSelectStyles(errors.article_id)}
                        />
                        {errors.article_id && <p className="text-sm text-red-600 mt-1">{errors.article_id}</p>}
                    </div>
                    
                    {/* Client (Select avec react-select) */}
                    <div className="mb-4 md:mb-0">
                        <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client
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
                            // styles={getSelectStyles(errors.client_id)}
                        />
                        {errors.client_id && <p className="text-sm text-red-600 mt-1">{errors.client_id}</p>}
                    </div>
                </div>

                {/* Ligne 3: Quantité (seul champ de valeur restant) */}
                <div className="grid grid-cols-1 gap-4"> 
                    {/* Quantité */}
                    <Input
                        id="quantity"
                        type="number"
                        step="0.01" // Permettre les décimales pour le carburant
                        min='0.01'
                        label="Quantité (en Litres/Unités)"
                        value={data.quantity}
                        onChange={handleChange}
                        error={errors.quantity}
                        onWheel={(e) => e.target.blur()}
                        placeholder="Ex: 50.5"
                        required
                    />
                    {/* Les autres champs (Prix Unitaire, Sous-Total, Prix Total) ont été retirés */}
                </div>
                
                {/* Champs cachés requis par le modèle */}
                <input type="hidden" id="user_id" value={data.user_id} />
                <input type="hidden" id="status" value={data.status} />

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
                        disabled={processing}
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