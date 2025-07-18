import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Votre composant de modale générique
import InputField from "../../form/input/InputField"; // Votre composant InputField
import Button from '../../ui/button/Button'; // Votre composant Button
import Swal from 'sweetalert2'; // Pour les notifications
import Select from 'react-select'; // Pour les sélecteurs améliorés
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBottleWater, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Icônes pertinentes

// Props attendues :
// isOpen: boolean - pour contrôler l'ouverture/fermeture de la modal
// onClose: function - callback pour fermer la modal
// title: string - titre de la modal (ex: "Produire des Bouteilles Pleines")
// cisterns: array - liste des citernes au format { id: number, name: string }
// articles: array - NOUVEAU: liste des articles au format { id: number, name: string }
// currentProduction: object - données de production actuelles pour pré-remplir le formulaire (optionnel)

const ProductionBottleModal = ({ isOpen, onClose, title, cisterns, articles, currentProduction }) => { // AJOUT DE 'articles' ici
    const { data, setData, post, processing, errors, reset } = useForm({
        cistern_id: currentProduction?.cistern_id || '', // ID de la citerne sélectionnée
        article_id: currentProduction?.article_id || '', // NOUVEAU: ID de l'article (bouteille pleine)
        quantity_produced: currentProduction?.quantity_produced || '', // Nombre de bouteilles à produire
    });

    // Options pour react-select des citernes
    const cisternOptions = Array.isArray(cisterns)
        ? cisterns.map(cistern => ({ value: String(cistern.id), label: cistern.name }))
        : [];

    // NOUVEAU: Options pour react-select des articles
    const articleOptions = Array.isArray(articles)
        ? articles.map(article => ({ value: String(article.id), label: article.name }))
        : [];

    // Réinitialise le formulaire lors de l'ouverture de la modal
    useEffect(() => {
        if (isOpen) {
            reset({
                cistern_id: currentProduction?.cistern_id || '',
                article_id: currentProduction?.article_id || '', // NOUVEAU: réinitialiser aussi l'article
                quantity_produced: currentProduction?.quantity_produced || '',
            });
        }
    }, [isOpen, reset, currentProduction]);

    // Gère les changements pour les champs InputField
    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    // Gère les changements pour les champs Select (react-select)
    const handleSelectChange = (selectedOption, { name }) => {
        setData(name, selectedOption ? selectedOption.value : '');
    };

    // Soumission du formulaire pour enregistrer la production
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation simple côté client
        if (!data.cistern_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Citerne Requise',
                text: 'Veuillez sélectionner la citerne source, monsieur.',
            });
            return;
        }
        if (!data.article_id) { // NOUVELLE VALIDATION pour l'article
            Swal.fire({
                icon: 'warning',
                title: 'Article Requis',
                text: 'Veuillez sélectionner le type de bouteille produite, monsieur.',
            });
            return;
        }
        if (!data.quantity_produced || data.quantity_produced <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Quantité Requise',
                text: 'Veuillez entrer un nombre valide de bouteilles à produire (supérieur à zéro), monsieur.',
            });
            return;
        }

        // Envoi des données au backend
        post(route('prod.produce'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Production Enregistrée',
                    text: 'La production de bouteilles a été enregistrée avec succès, monsieur !',
                    showConfirmButton: false,
                    timer: 2000
                });
                onClose();
            },
            onError: (formErrors) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur de Production',
                    text: 'Une erreur est survenue lors de l\'enregistrement de la production. Veuillez vérifier les informations et réessayer.',
                });
                console.error("Erreurs de formulaire:", formErrors);
            },
        });
    };

    // Déterminer la valeur sélectionnée pour react-select
    const selectedCisternOption = cisternOptions.find(option => option.value === data.cistern_id);
    const selectedArticleOption = articleOptions.find(option => option.value === data.article_id); // NOUVEAU: pour l'article

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Sélecteur de Citerne avec react-select */}
                <div className="mb-4">
                    <label htmlFor="cistern_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Citerne Source
                    </label>
                    <Select
                        id="cistern_id"
                        name="cistern_id"
                        options={cisternOptions}
                        value={selectedCisternOption || null}
                        onChange={handleSelectChange}
                        placeholder="Sélectionner une citerne"
                        isClearable={true}
                        isSearchable={true}
                        classNamePrefix="react-select"
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                height: '44px',
                                minHeight: '44px',
                                borderColor: errors.cistern_id ? '#EF4444' : (state.isFocused ? '#3B82F6' : '#D1D5DB'),
                                backgroundColor: 'transparent',
                                boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                '&:hover': { borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF' },
                            }),
                            singleValue: (baseStyles) => ({ ...baseStyles, color: 'rgb(249 250 251 / 0.9)' }),
                            placeholder: (baseStyles) => ({ ...baseStyles, color: 'rgb(249 250 251 / 0.3)' }),
                            input: (baseStyles) => ({ ...baseStyles, color: 'rgb(249 250 251 / 0.9)' }),
                            menu: (baseStyles) => ({ ...baseStyles, backgroundColor: '#1F2937', zIndex: 9999 }),
                            option: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1F2937',
                                color: state.isSelected ? 'white' : 'rgb(249 250 251 / 0.9)',
                                '&:hover': { backgroundColor: '#374151', color: 'rgb(249 250 251 / 0.9)' },
                            }),
                        }}
                    />
                    {errors.cistern_id && <p className="text-sm text-red-600 mt-1">{errors.cistern_id}</p>}
                </div>

                {/* NOUVEAU: Sélecteur d'Article avec react-select */}
                <div className="mb-4">
                    <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type de Bouteille Produite
                    </label>
                    <Select
                        id="article_id"
                        name="article_id"
                        options={articleOptions}
                        value={selectedArticleOption || null}
                        onChange={handleSelectChange}
                        placeholder="Sélectionner un article"
                        isClearable={true}
                        isSearchable={true}
                        classNamePrefix="react-select"
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                height: '44px',
                                minHeight: '44px',
                                borderColor: errors.article_id ? '#EF4444' : (state.isFocused ? '#3B82F6' : '#D1D5DB'),
                                backgroundColor: 'transparent',
                                boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                                '&:hover': { borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF' },
                            }),
                            singleValue: (baseStyles) => ({ ...baseStyles, color: 'rgb(249 250 251 / 0.9)' }),
                            placeholder: (baseStyles) => ({ ...baseStyles, color: 'rgb(249 250 251 / 0.3)' }),
                            input: (baseStyles) => ({ ...baseStyles, color: 'rgb(249 250 251 / 0.9)' }),
                            menu: (baseStyles) => ({ ...baseStyles, backgroundColor: '#1F2937', zIndex: 9999 }),
                            option: (baseStyles, state) => ({
                                ...baseStyles,
                                backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1F2937',
                                color: state.isSelected ? 'white' : 'rgb(249 250 251 / 0.9)',
                                '&:hover': { backgroundColor: '#374151', color: 'rgb(249 250 251 / 0.9)' },
                            }),
                        }}
                    />
                    {errors.article_id && <p className="text-sm text-red-600 mt-1">{errors.article_id}</p>}
                </div>

                {/* Champ pour le nombre de bouteilles à produire */}
                <InputField
                    id="quantity_produced"
                    type="number"
                    label="Nombre de Bouteilles Produites"
                    value={data.quantity_produced}
                    onChange={handleChange}
                    error={errors.quantity_produced}
                    required
                    min="1"
                />

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