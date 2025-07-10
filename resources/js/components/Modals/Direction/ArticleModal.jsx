// resources/js/Components/Modals/Direction/ArticleModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Assurez-vous que le chemin vers votre composant Modal est correct
import InputField from "../../form/input/InputField"; // Votre composant InputField
import Button from '../../ui/button/Button'; // Votre composant Button
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importez FontAwesomeIcon
import { faSpinner } from '@fortawesome/free-solid-svg-icons'; // Importez l'icône de spinner

const ArticleModal = ({ isOpen, onClose, entreprises, article = null, title }) => {
    // Initialisation des données du formulaire avec des valeurs par défaut
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: '',
        name: '',
        type: 'produit', // Valeur par défaut
        unit: 'unité',   // Valeur par défaut
        entreprise_id: '', // Doit être une chaîne pour le <select>
        weight_per_unit: '',
    });

    // Types d'articles possibles (peut être déplacé hors du composant si statique)
    const articleTypes = [
        { value: 'produit', label: 'Produit' },
        { value: 'matiere_premiere', label: 'Matière Première' },
        { value: 'service', label: 'Service' },
    ];

    // Unités possibles (peut être déplacé hors du composant si statique)
    const articleUnits = [
        { value: 'kg', label: 'Kilogramme (kg)' },
        { value: 'litre', label: 'Litre (L)' },
        { value: 'm2', label: 'Mètre carré (m²)' },
        { value: 'unité', label: 'Unité' },
        { value: 'sac', label: 'Sac' },
        { value: 'botte', label: 'Botte' },
        { value: 'paquet', label: 'Paquet' },
    ];

    // Synchronise l'état du formulaire quand le modal s'ouvre ou que l'article à modifier change
    useEffect(() => {
        if (isOpen) {
            if (article) {
                // Mode modification: Remplir avec les données de l'article existant
                setData({
                    code: article.code || '',
                    name: article.name || '',
                    type: article.type || 'produit',
                    unit: article.unit || 'unité',
                    entreprise_id: String(article.entreprise_id || ''), // Convertir l'ID en chaîne
                    weight_per_unit: article.weight_per_unit || '',
                });
            } else {
                // Mode création: Réinitialiser aux valeurs par défaut
                reset(); // Réinitialise l'état de useForm aux valeurs initiales définies ci-dessus
                setData(prevData => ({
                    ...prevData,
                    // Pré-sélectionne la première entreprise si elle existe, uniquement si en mode création et si elle n'est pas déjà sélectionnée par reset()
                    entreprise_id: entreprises.length > 0 ? String(entreprises[0].id) : '',
                }));
            }
        }
    }, [isOpen, article, entreprises, reset, setData]); // Ajout de toutes les dépendances nécessaires

    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const successMessage = article ? 'Article modifié avec succès !' : 'Article créé avec succès !';
        const failureMessage = article ? 'Erreur lors de la modification de l\'article.' : 'Erreur lors de la création de l\'article.';

        const submitMethod = article ? put : post;
        const submitRoute = article ? route('articles.update', article.id) : route('articles.store');

        submitMethod(submitRoute, {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès !',
                    text: successMessage,
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    onClose(); // Ferme la modal et déclenche un rechargement des données via le parent
                });
            },
            onError: (validationErrors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: failureMessage,
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
                    id="code"
                    type="text"
                    label="Code"
                    value={data.code}
                    onChange={handleChange}
                    error={errors.code}
                    placeholder="Code de l'article"
                    required
                />

                <InputField
                    id="name"
                    type="text"
                    label="Nom"
                    value={data.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Nom de l'article"
                    required
                />

                {/* Champ Type (avec <select> natif) */}
                <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
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
                        <option value="" disabled>Sélectionnez un type</option> {/* Option par défaut */}
                        {articleTypes.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
                </div>

                {/* Champ Unité (avec <select> natif) */}
                <div className="mb-4">
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unité
                    </label>
                    <select
                        id="unit"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.unit}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Sélectionnez une unité</option> {/* Option par défaut */}
                        {articleUnits.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.unit && <p className="text-sm text-red-600 mt-1">{errors.unit}</p>}
                </div>

                <InputField
                    id="weight_per_unit"
                    type="number"
                    step="0.01"
                    label="Poids par unité (kg)"
                    value={data.weight_per_unit}
                    onChange={handleChange}
                    error={errors.weight_per_unit}
                    placeholder="Poids par unité"
                    min="0"
                />

                {/* Champ Entreprise (avec <select> natif) */}
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
                        <option value="" disabled>Sélectionnez une entreprise</option> {/* Option par défaut */}
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
                        disabled={processing} // Le bouton est désactivé pendant le traitement
                    >
                        {processing ? ( // Affiche le spinner si 'processing' est vrai
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Envoi...
                            </>
                        ) : (
                            article ? 'Modifier' : 'Créer' // Texte normal sinon
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ArticleModal;