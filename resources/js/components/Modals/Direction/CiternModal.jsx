// resources/js/Components/Modals/Direction/CreateCiterneModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Assurez-vous que le chemin vers votre composant Modal est correct
import InputField from "../../form/input/InputField"; // Votre composant InputField
import Button from '../../ui/button/Button'; // Votre composant Button
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const CreateCiterneModal = ({ isOpen, onClose, entreprises, products, title = "Créer une Nouvelle Citerne" }) => {
    // Initialisation des données du formulaire pour une citerne
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'fixed', // Valeur par défaut pour le type de citerne
        product_type: 'liquide', // Valeur par défaut pour le type de produit stocké
        capacity_liter: '',
        capacity_kg: '',
        current_product_id: '', // ID du produit actuellement dans la citerne (peut être null)
        agency_id: '',       // Sera défini dans le contrôleur ou via une prop si nécessaire
        entreprise_id: '',   // Sera défini dans le contrôleur ou via une prop
    });

    // Types de citerne possibles
    const citerneTypes = [
        { value: 'fixed', label: 'Fixe' },
        { value: 'mobile', label: 'Mobile' },
    ];

    // Types de produit pouvant être stockés
    const productTypes = [
        { value: 'liquide', label: 'Liquide' },
        { value: 'solide', label: 'Solide' },
        { value: 'gaz', label: 'Gaz' },
    ];

    useEffect(() => {
        if (isOpen) {
            reset(); // Réinitialise le formulaire à ses valeurs initiales
            setData(prevData => ({
                ...prevData,
                // Pré-sélectionne la première entreprise si elle existe
                entreprise_id: entreprises.length > 0 ? String(entreprises[0].id) : '',
                // Le current_product_id peut rester vide par défaut
                current_product_id: '',
            }));
        }
    }, [isOpen, entreprises, reset, setData]);


    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // On n'envoie pas agency_id et entreprise_id si on les gère côté serveur via l'utilisateur connecté
        // ou si on doit les récupérer via une prop spécifique.
        // Pour l'exemple, supposons que entreprise_id est dans le formulaire, et agency_id est déduit côté serveur.
        post(route('citernes.store'), data, { // Assurez-vous que cette route existe
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès !',
                    text: 'Citerne créée avec succès !',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    onClose(); // Ferme la modal
                });
            },
            onError: (validationErrors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Erreur lors de la création de la citerne.',
                    confirmButtonText: 'Compris'
                });
                console.error("Erreurs de validation:", validationErrors);
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    id="name"
                    type="text"
                    label="Nom de la Citerne"
                    value={data.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Ex: Citerne A, Citerne principale"
                    required
                />

                {/* Champ Type de Citerne */}
                <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type de Citerne
                    </label>
                    <select
                        id="type"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.type}
                        onChange={handleChange}
                        required
                    >
                        {citerneTypes.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
                </div>

                {/* Champ Type de Produit (stocké) */}
                <div className="mb-4">
                    <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type de Produit Stocké
                    </label>
                    <select
                        id="product_type"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.product_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.product_type}
                        onChange={handleChange}
                        required
                    >
                        {productTypes.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.product_type && <p className="text-sm text-red-600 mt-1">{errors.product_type}</p>}
                </div>

                <InputField
                    id="capacity_liter"
                    type="number"
                    step="0.01"
                    label="Capacité (Litres)"
                    value={data.capacity_liter}
                    onChange={handleChange}
                    error={errors.capacity_liter}
                    placeholder="Capacité en Litres"
                    min="0"
                    required
                />

                <InputField
                    id="capacity_kg"
                    type="number"
                    step="0.01"
                    label="Capacité (Kg)"
                    value={data.capacity_kg}
                    onChange={handleChange}
                    error={errors.capacity_kg}
                    placeholder="Capacité en Kilogrammes"
                    min="0"
                />

                {/* Champ Produit Actuel (optionnel, peut être vide au début) */}
                <div className="mb-4">
                    <label htmlFor="current_product_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Produit Actuellement dans la Citerne
                    </label>
                    <select
                        id="current_product_id"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.current_product_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.current_product_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Aucun produit --</option> {/* Option pour aucun produit */}
                        {products && products.map(product => (
                            <option key={product.id} value={String(product.id)}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    {errors.current_product_id && <p className="text-sm text-red-600 mt-1">{errors.current_product_id}</p>}
                </div>

                {/* Champ Entreprise (généralement géré automatiquement ou pré-sélectionné) */}
                 <div className="mb-4">
                    <label htmlFor="entreprise_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Entreprise
                    </label>
                    <select
                        id="entreprise_id"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.entreprise_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.entreprise_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Sélectionnez une entreprise</option>
                        {entreprises.map(entreprise => (
                            <option key={entreprise.id} value={String(entreprise.id)}>
                                {entreprise.name}
                            </option>
                        ))}
                    </select>
                    {errors.entreprise_id && <p className="text-sm text-red-600 mt-1">{errors.entreprise_id}</p>}
                </div>


                <div className="flex justify-end mt-6">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="destructive" // Bouton Annuler en rouge
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
                                Création...
                            </>
                        ) : (
                            'Créer la Citerne'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateCiterneModal;