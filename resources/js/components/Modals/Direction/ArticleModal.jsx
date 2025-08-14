import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import InputField from "../../form/input/InputField";
import Button from '../../ui/button/Button';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import Select from 'react-select';

const ArticleModal = ({ isOpen, onClose, entreprises, simpleArticles, article = null, title }) => {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: '',
        name: '',
        type: 'produit', // Type par défaut
        unit: 'unité',   // Unité par défaut
        entreprise_id: '',
        weight_per_unit: '',
        simple_article_id: '',
    });

    const articleTypes = [
        { value: 'produit', label: 'Produit' },
        { value: 'matiere_premiere', label: 'Matière Première' },
        { value: 'produit_fini', label: 'Produit Fini' },
        { value: 'service', label: 'Service' },
    ];

    const articleUnits = [
        { value: 'kg', label: 'Kilogramme (kg)' },
        { value: 'litre', label: 'Litre (L)' },
        { value: 'm2', label: 'Mètre carré (m²)' },
        { value: 'unité', label: 'Unité' },
        { value: 'sac', label: 'Sac' },
        { value: 'botte', label: 'Botte' },
        { value: 'paquet', label: 'Paquet' },
    ];

    const entrepriseOptions = entreprises.map(entreprise => ({
        value: String(entreprise.id),
        label: entreprise.name,
    }));

    // S'assurer que simpleArticles est un tableau avant de le mapper
    const simpleArticleOptions = Array.isArray(simpleArticles)
        ? simpleArticles.map(simpleArticle => ({
            value: String(simpleArticle.id),
            label: simpleArticle.name,
        }))
        : [];

    useEffect(() => {
        if (isOpen) {
            if (article) {
                setData({
                    code: article.code || '',
                    name: article.name || '',
                    type: article.type || 'produit',
                    unit: article.unit || 'unité',
                    entreprise_id: String(article.entreprise_id || ''),
                    weight_per_unit: article.weight_per_unit || '',
                    simple_article_id: article.type === 'produit_fini' && article.simple_article_id
                                        ? String(article.simple_article_id)
                                        : '',
                });
            } else {
                reset();
                setData(prevData => ({
                    ...prevData,
                    entreprise_id: entreprises.length > 0 ? String(entreprises[0].id) : '',
                    weight_per_unit: '',
                    simple_article_id: '',
                }));
            }
        }
    }, [isOpen, article, entreprises, simpleArticles, reset, setData]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);

        // Logique de réinitialisation conditionnelle des champs
        if (id === 'type') {
            // Réinitialiser simple_article_id si le type n'est PAS 'produit_fini'
            if (value !== 'produit_fini') {
                setData('simple_article_id', '');
            }
        }
    };

    const handleSelectChange = (selectedOption, { name }) => {
        setData(name, selectedOption ? selectedOption.value : '');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const successMessage = article ? 'Article modifié avec succès !' : 'Article créé avec succès !';
        const failureMessage = article ? 'Erreur lors de la modification de l\'article.' : 'Erreur lors de la création de l\'article.';

        const submitMethod = article ? put : post;
        const submitRoute = article ? route('articles.update', article.id) : route('articles.store');

        submitMethod(submitRoute, {
            onSuccess: () => {
                    onClose();
                
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

    const selectedEntrepriseOption = entrepriseOptions.find(option => option.value === data.entreprise_id);
    const selectedSimpleArticleOption = simpleArticleOptions.find(option => option.value === data.simple_article_id);

    // Déterminer si le champ weight_per_unit doit être affiché
    const showWeightPerUnit = ['produit', 'produit_fini'].includes(data.type);

    // --- Dynamic styles for React-Select ---
    const reactSelectStyles = {
        // Style du conteneur principal (input, flèche, etc.)
        control: (baseStyles, state) => ({
            ...baseStyles,
            height: '44px',
            minHeight: '44px',
            // Couleurs pour le mode clair
            borderColor: errors[state.selectProps.name] ? '#EF4444' : (state.isFocused ? '#3B82F6' : '#E5E7EB'),
            backgroundColor: '#FFFFFF',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
            },
            // Couleurs pour le mode sombre
            '.dark &': {
                borderColor: errors[state.selectProps.name] ? '#EF4444' : (state.isFocused ? '#2563EB' : '#374151'),
                backgroundColor: '#111827',
                color: '#E5E7EB',
                '&:hover': {
                    borderColor: state.isFocused ? '#2563EB' : '#4B5563',
                },
            }
        }),
        // Style de la valeur sélectionnée
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: '#1F2937',
            '.dark &': {
                color: '#E5E7EB',
            }
        }),
        // Style du placeholder
        placeholder: (baseStyles) => ({
            ...baseStyles,
            color: '#9CA3AF',
            '.dark &': {
                color: '#6B7280',
            }
        }),
        // Style du texte tapé dans l'input
        input: (baseStyles) => ({
            ...baseStyles,
            color: '#1F2937',
            '.dark &': {
                color: '#E5E7EB',
            }
        }),
        // Style du menu déroulant
        menu: (baseStyles) => ({
            ...baseStyles,
            backgroundColor: '#FFFFFF',
            zIndex: 9999,
            '.dark &': {
                backgroundColor: '#1F2937',
            }
        }),
        // Style des options du menu déroulant
        option: (baseStyles, state) => ({
            ...baseStyles,
            // Couleurs pour le mode clair
            backgroundColor: state.isSelected ? '#2563EB' : (state.isFocused ? '#F3F4F6' : '#FFFFFF'),
            color: state.isSelected ? '#FFFFFF' : '#1F2937',
            '&:hover': {
                backgroundColor: state.isFocused ? '#F3F4F6' : '#FFFFFF',
                color: '#1F2937',
            },
            // Couleurs pour le mode sombre
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

                <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                    </label>
                    <select
                        id="type"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.type}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Sélectionnez un type</option>
                        {articleTypes.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Unité
                    </label>
                    <select
                        id="unit"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                             placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.unit}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Sélectionnez une unité</option>
                        {articleUnits.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.unit && <p className="text-sm text-red-600 mt-1">{errors.unit}</p>}
                </div>

                {/* --- Champ Poids par unité (conditionnel pour 'produit' et 'produit_fini') --- */}
                {showWeightPerUnit && (
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
                        required={showWeightPerUnit} // Rendre requis si visible
                    />
                )}

                {/* --- Champ Article Parent (simple_article_id) (conditionnel pour 'produit_fini' uniquement) --- */}
                {data.type === 'produit_fini' && (
                    <div className="mb-4">
                        <label htmlFor="simple_article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Article Parent (Produit Simple)
                        </label>
                        <Select
                            id="simple_article_id"
                            name="simple_article_id"
                            options={simpleArticleOptions}
                            value={selectedSimpleArticleOption}
                            onChange={handleSelectChange}
                            placeholder="Rechercher ou sélectionner un article parent"
                            isClearable={true}
                            isSearchable={true}
                            required={data.type === 'produit_fini'} // Requis si c'est un produit fini
                            classNamePrefix="react-select"
                            styles={reactSelectStyles} // Apply the centralized styles
                        />
                        {errors.simple_article_id && <p className="text-sm text-red-600 mt-1">{errors.simple_article_id}</p>}
                    </div>
                )}

                {/* Champ Entreprise (maintenu avec react-select) */}
                <div className="mb-4">
                    <label htmlFor="entreprise_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Entreprise
                    </label>
                    <Select
                        id="entreprise_id"
                        name="entreprise_id"
                        options={entrepriseOptions}
                        value={selectedEntrepriseOption}
                        onChange={handleSelectChange}
                        placeholder="Rechercher ou sélectionner une entreprise"
                        isClearable={true}
                        isSearchable={true}
                        required
                        classNamePrefix="react-select"
                        styles={reactSelectStyles} // Apply the centralized styles
                    />
                    {errors.entreprise_id && <p className="text-sm text-red-600 mt-1">{errors.entreprise_id}</p>}
                </div>

                <div className="flex justify-end mt-6">
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
                                Envoi...
                            </>
                        ) : (
                            article ? 'Modifier' : 'Créer'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ArticleModal;
