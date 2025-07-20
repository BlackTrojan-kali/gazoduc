import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from './Modal'; // Votre composant de modale générique
import InputField from "../form/input/InputField"; // Votre composant InputField
import Button from '../ui/button/Button'; // Votre composant Button
import Swal from 'sweetalert2'; // Pour les notifications
import Select from 'react-select'; // Pour les sélecteurs améliorés
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Utilisez faFileExport pour un export générique

// Props attendues :
// isOpen: boolean - pour contrôler l'ouverture/fermeture de la modal
// onClose: function - callback pour fermer la modal
// title: string - titre de la modal (ex: "Exporter l'Historique des Mouvements")
// articles: array - liste des articles au format { id: number, name: string } (pour le filtre)
// agencies: array - liste des agences au format { id: number, name: string } (pour le filtre)
// services: array - NOUVEAU ! Liste des services/rôles au format { id: number, name: string } (pour le filtre)
// currentFilters: object - filtres actuels pour pré-remplir le formulaire (optionnel)

// Ajout d'une valeur par défaut pour le titre des props
const MovementHistoryPDFExcelModal = ({ isOpen, onClose, title = "Exporter l'Historique des Mouvements", articles, agencies, services, currentFilters }) => {
    const { data, setData, processing, errors, reset } = useForm({
        start_date: currentFilters?.start_date || '',
        end_date: currentFilters?.end_date || '',
        article_id: currentFilters?.article_id || '',
        agency_id: currentFilters?.agency_id || '',
        service_id: currentFilters?.service_id || '', // NOUVEAU : pour le filtre par service
        type_mouvement: currentFilters?.type_mouvement || 'global', // Défaut à 'global'
        file_type: 'pdf', // NOUVEAU : Ajout du champ pour le type de fichier, par défaut PDF
    });

    // Options pour react-select des articles
    const articleOptions = Array.isArray(articles)
        ? articles.map(article => ({ value: String(article.id), label: article.name }))
        : [];

    // Options pour react-select des agences
    const agencyOptions = Array.isArray(agencies)
        ? agencies.map(agency => ({ value: String(agency.id), label: agency.name }))
        : [];

    // Options pour react-select des services/rôles (NOUVEAU !)
    const serviceOptions = Array.isArray(services)
        ? services.map(service => ({ value: String(service.id), label: service.name }))
        : [];

    // Options pour le type de mouvement
    const movementTypeOptions = [
        { value: 'global', label: 'Global (Entrées & Sorties)' },
        { value: 'entree', label: 'Entrée' },
        { value: 'sortie', label: 'Sortie' },
    ];

    // Options pour le type de fichier de sortie
    const fileTypeOptions = [
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel (XLSX)' },
    ];

    // Réinitialise le formulaire et définit les dates par défaut lors de l'ouverture de la modal
    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0]; // Date du jour au format YYYY-MM-DD
            reset({
                start_date: currentFilters?.start_date || today,
                end_date: currentFilters?.end_date || today,
                article_id: currentFilters?.article_id || '',
                agency_id: currentFilters?.agency_id || '',
                service_id: currentFilters?.service_id || '', // Réinitialise le service
                type_mouvement: currentFilters?.type_mouvement || 'global',
                file_type: 'pdf', // Réinitialise le type de fichier à PDF par défaut
            });
        }
    }, [isOpen, reset, currentFilters]); // Dépend de isOpen, reset et currentFilters

    // Gère les changements pour les champs InputField (date) et Select HTML natifs (file_type)
    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    // Gère les changements pour les champs Select (react-select)
    const handleSelectChange = (selectedOption, { name }) => {
        setData(name, selectedOption ? selectedOption.value : '');
    };

    // Soumission du formulaire pour générer le rapport
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation des dates
        if (!data.start_date || !data.end_date) {
            Swal.fire({
                icon: 'warning',
                title: 'Dates Requises',
                text: 'Veuillez sélectionner une date de début et une date de fin pour le rapport, monsieur.',
            });
            return;
        }

        if (new Date(data.start_date) > new Date(data.end_date)) {
            Swal.fire({
                icon: 'warning',
                title: 'Dates Invalides',
                text: 'La date de début ne peut pas être postérieure à la date de fin, monsieur.',
            });
            return;
        }

        // Construire la chaîne de requête pour l'URL
        const queryString = new URLSearchParams(data).toString();
        // Cible la route backend 'movements.generateReport' qui gérera l'exportation
        const generateRoute = route('movements.generateReport') + '?' + queryString;

        // Ouvre le rapport (PDF ou Excel) dans un nouvel onglet
        window.open(generateRoute, '_blank');

        // Notification et fermeture de la modal
        Swal.fire({
            icon: 'info',
            title: 'Génération en cours',
            text: `Le rapport des mouvements (${data.file_type.toUpperCase()}) est en cours de génération.`,
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            onClose(); // Ferme la modale
        });
    };

    // Déterminer les valeurs sélectionnées pour react-select pour l'affichage
    const selectedArticleOption = articleOptions.find(option => option.value === data.article_id);
    const selectedAgencyOption = agencyOptions.find(option => option.value === data.agency_id);
    const selectedServiceOption = serviceOptions.find(option => option.value === data.service_id);
    const selectedMovementTypeOption = movementTypeOptions.find(option => option.value === data.type_mouvement);

    // Styles personnalisés pour react-select (vos styles existants, ajustés pour le texte gris clair)
    const reactSelectStyles = {
        control: (baseStyles, state) => ({
            ...baseStyles,
            height: '44px',
            minHeight: '44px',
            borderColor: errors.article_id || errors.agency_id || errors.service_id || errors.type_mouvement
                ? '#EF4444' // Rouge en cas d'erreur
                : (state.isFocused ? '#3B82F6' : (state.menuIsOpen ? '#3B82F6' : '#D1D5DB')), // Bleu au focus, gris par défaut
            backgroundColor: 'transparent', // Permet au fond du modal de transparaître
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
            },
        }),
        // Texte principal dans le champ de sélection
        singleValue: (baseStyles) => ({
            ...baseStyles,
            color: '#D1D5DB', // Gris clair pour le texte sélectionné (mode sombre)
            // Vous pouvez ajouter une condition pour le mode clair si nécessaire, ex:
            // color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#333',
        }),
        // Texte du placeholder
        placeholder: (baseStyles) => ({
            ...baseStyles,
            color: '#9CA3AF', // Gris légèrement plus foncé pour le placeholder
        }),
        // Texte saisi dans le champ de recherche
        input: (baseStyles) => ({
            ...baseStyles,
            color: '#D1D5DB', // Gris clair pour le texte saisi
        }),
        menu: (baseStyles) => ({ ...baseStyles, backgroundColor: '#1F2937', zIndex: 9999 }), // Fond du menu déroulant (dark)
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1F2937',
            color: state.isSelected ? 'white' : '#D1D5DB', // Texte des options : blanc pour sélection, gris clair sinon
            '&:active': { // Pour le clic actif
                backgroundColor: '#2563EB',
                color: 'white',
            },
            '&:hover': { backgroundColor: '#374151', color: '#D1D5DB' },
        }),
        // Ajustements pour les indicateurs (flèche, croix de clear)
        indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: '#4B5563' }),
        dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: '#9CA3AF' }),
        clearIndicator: (baseStyles) => ({ ...baseStyles, color: '#9CA3AF', '&:hover': { color: '#EF4444' } }),
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}> {/* Le titre est maintenant géré ici */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Champs de Date */}
                <InputField
                    id="start_date"
                    type="date"
                    label="Date de Début"
                    value={data.start_date}
                    onChange={handleChange}
                    error={errors.start_date}
                    required
                    // InputField est supposé déjà gérer le dark mode
                />

                <InputField
                    id="end_date"
                    type="date"
                    label="Date de Fin"
                    value={data.end_date}
                    onChange={handleChange}
                    error={errors.end_date}
                    required
                    // InputField est supposé déjà gérer le dark mode
                />

                {/* Sélecteur d'Article avec react-select */}
                <div className="mb-4">
                    <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Article
                    </label>
                    <Select
                        id="article_id"
                        name="article_id"
                        options={[{ value: '', label: 'Tous les articles' }, ...articleOptions]}
                        value={selectedArticleOption || { value: '', label: 'Tous les articles' }}
                        onChange={handleSelectChange}
                        placeholder="Sélectionner un article ou laisser vide pour tous"
                        isClearable={true}
                        isSearchable={true}
                        classNamePrefix="react-select"
                        styles={reactSelectStyles}
                    />
                    {errors.article_id && <p className="text-sm text-red-600 mt-1">{errors.article_id}</p>}
                </div>

                {/* Sélecteur d'Agence avec react-select */}
                <div className="mb-4">
                    <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agence
                    </label>
                    <Select
                        id="agency_id"
                        name="agency_id"
                        options={[{ value: '', label: 'Toutes les agences' }, ...agencyOptions]}
                        value={selectedAgencyOption || { value: '', label: 'Toutes les agences' }}
                        onChange={handleSelectChange}
                        placeholder="Sélectionner une agence ou laisser vide pour toutes"
                        isClearable={true}
                        isSearchable={true}
                        classNamePrefix="react-select"
                        styles={reactSelectStyles}
                    />
                    {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
                </div>

                {/* Sélecteur de Service/Rôle */}
                <div className="mb-4">
                    <label htmlFor="service_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service
                    </label>
                    <Select
                        id="service_id"
                        name="service_id"
                        options={[{ value: '', label: 'Tous les services' }, ...serviceOptions]}
                        value={selectedServiceOption || { value: '', label: 'Tous les services' }}
                        onChange={handleSelectChange}
                        placeholder="Sélectionner un service ou laisser vide pour tous"
                        isClearable={true}
                        isSearchable={true}
                        classNamePrefix="react-select"
                        styles={reactSelectStyles}
                    />
                    {errors.service_id && <p className="text-sm text-red-600 mt-1">{errors.service_id}</p>}
                </div>

                {/* Sélecteur de Type de Mouvement */}
                <div className="mb-4">
                    <label htmlFor="type_mouvement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type de Mouvement
                    </label>
                    <Select
                        id="type_mouvement"
                        name="type_mouvement"
                        options={movementTypeOptions}
                        value={selectedMovementTypeOption || movementTypeOptions[0]}
                        onChange={handleSelectChange}
                        placeholder="Sélectionner un type de mouvement"
                        isClearable={true}
                        classNamePrefix="react-select"
                        styles={reactSelectStyles}
                    />
                    {errors.type_mouvement && <p className="text-sm text-red-600 mt-1">{errors.type_mouvement}</p>}
                </div>

                {/* Champ pour le type de fichier à exporter (balise <select> native) */}
                <div className="mb-4">
                    <label htmlFor="file_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type de fichier
                    </label>
                    <select
                        id="file_type"
                        className="h-11 w-full appearance-none rounded-lg border
                                   border-gray-300 dark:border-gray-700
                                   bg-white dark:bg-gray-800
                                   px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                                   text-gray-900 dark:text-white/90
                                   placeholder:text-gray-400 dark:placeholder:text-white/30
                                   focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                                   dark:focus:border-brand-800"
                        value={data.file_type}
                        onChange={handleChange}
                    >
                        {fileTypeOptions.map(option => (
                            <option
                                key={option.value}
                                value={option.value}
                                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white/90"
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.file_type && <p className="text-sm text-red-600 mt-1">{errors.file_type}</p>}
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
                                Génération...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                                Générer
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default MovementHistoryPDFExcelModal;