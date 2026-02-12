import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from './Modal'; // Assurez-vous que ce chemin est correct selon votre structure
import InputField from "../form/input/InputField"; // Idem
import Button from '../ui/button/Button'; // Idem
import Swal from 'sweetalert2';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel, faDownload } from '@fortawesome/free-solid-svg-icons';

// --- Styles pour React-Select (Mode Sombre/Clair + Gestion d'erreur) ---
const getSelectStyles = (isDark, error = false) => ({
    control: (base, state) => ({
        ...base,
        height: '44px',
        minHeight: '44px',
        borderColor: error ? '#EF4444' : (state.isFocused ? '#3B82F6' : (isDark ? '#374151' : '#D1D5DB')),
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        color: isDark ? '#F3F4F6' : '#111827',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
        fontSize: '0.875rem',
        borderRadius: '0.5rem',
        '&:hover': {
            borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
        },
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        zIndex: 9999, // Priorité d'affichage sur la modale
        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected 
            ? '#2563EB' 
            : state.isFocused 
                ? (isDark ? '#374151' : '#F3F4F6') 
                : 'transparent',
        color: state.isSelected ? '#FFFFFF' : (isDark ? '#F3F4F6' : '#111827'),
        cursor: 'pointer',
        fontSize: '0.875rem',
    }),
    singleValue: (base) => ({ ...base, color: isDark ? '#F3F4F6' : '#111827' }),
    input: (base) => ({ ...base, color: isDark ? '#F3F4F6' : '#111827' }),
    placeholder: (base) => ({ ...base, color: isDark ? '#9CA3AF' : '#6B7280' }),
});

const MovementHistoryPDFExcelModal = ({ 
    isOpen, 
    onClose, 
    title = "Exporter l'Historique", 
    articles = [], 
    agencies = [], 
    services = [], 
    currentFilters = {} 
}) => {
    const { auth } = usePage().props;
    // Gestion sécurisée du rôle (objet ou chaîne de caractères)
    const userRole = auth.user.role?.name || auth.user.role;
    const isDirection = userRole === 'direction';
    const isDark = document.documentElement.classList.contains('dark');

    // --- 1. Préparation des Options pour React-Select ---

    // Type de mouvement (Adapté selon le rôle)
    const movementTypeOptions = [
        { value: 'global_no_delete', label: 'Global (Actifs uniquement)' },
        { value: 'entree', label: 'Entrées' },
        { value: 'sortie', label: 'Sorties' },
        // Option réservée à la direction
        ...(isDirection ? [{ value: 'global_with_delete', label: 'Complet (Inclus Supprimés)' }] : []),
    ];

    // Format de fichier
    const fileTypeOptions = [
        { value: 'pdf', label: 'Document PDF', icon: faFilePdf },
        { value: 'excel', label: 'Tableur Excel', icon: faFileExcel },
    ];

    // Conversion des données brutes (props) en format { value, label }
    const articleOptions = articles.map(a => ({ value: String(a.id), label: a.name }));
    const agencyOptions = agencies.map(a => ({ value: String(a.id), label: a.name }));
    const serviceOptions = services.map(s => ({ value: String(s.id), label: s.name }));

    // --- 2. Initialisation du Formulaire Inertia ---
    const { data, setData, setError, clearErrors, errors, reset } = useForm({
        start_date: '',
        end_date: '',
        article_id: '',
        agency_id: '',
        service_id: '',
        type_mouvement: 'global_no_delete',
        file_type: 'pdf',
    });

    // --- 3. Synchronisation et Correction des Données (useEffect) ---
    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            
            // A. Gestion intelligente de l'Agence par défaut
            let defaultAgencyId = currentFilters?.agency_id || '';
            // Si l'utilisateur n'a accès qu'à une seule agence, on la force
            if (agencies.length === 1) {
                defaultAgencyId = String(agencies[0].id);
            }

            // B. CORRECTION DU SERVICE : Mapping Nom -> ID
            let defaultServiceId = '';
            
            if (currentFilters?.service_id) {
                // Cas 1 : Le filtre contient déjà l'ID
                defaultServiceId = String(currentFilters.service_id);
            } else if (currentFilters?.service) {
                // Cas 2 : Le filtre contient le NOM (ex: 'magasin'). On cherche l'ID correspondant.
                // On utilise toLowerCase() pour éviter les erreurs de casse.
                const foundService = services.find(s => s.name.toLowerCase() === currentFilters.service.toLowerCase());
                if (foundService) {
                    defaultServiceId = String(foundService.id);
                }
            }

            // C. Réinitialisation du formulaire avec les valeurs calculées
            reset({
                start_date: currentFilters?.start_date || today,
                end_date: currentFilters?.end_date || today,
                article_id: currentFilters?.article_id || '', // Filtre article existant ou vide
                agency_id: defaultAgencyId,
                service_id: defaultServiceId, // L'ID corrigé
                type_mouvement: isDirection ? 'global_with_delete' : 'global_no_delete',
                file_type: 'pdf',
            });
            clearErrors();
        }
    }, [isOpen, agencies, services, currentFilters, isDirection]);

    // --- 4. Gestionnaires d'événements ---

    const handleSelectChange = (field, selectedOption) => {
        setData(field, selectedOption ? selectedOption.value : '');
        if (errors[field]) clearErrors(field);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation Frontend basique
        if (!data.start_date || !data.end_date) {
            setError('start_date', 'Les dates sont requises.');
            return;
        }

        if (new Date(data.start_date) > new Date(data.end_date)) {
            setError('end_date', 'La date de fin doit être postérieure à la date de début.');
            return;
        }

        // Construction de l'URL d'export
        const queryParams = new URLSearchParams({ ...data }).toString();
        // Assurez-vous que cette route correspond à votre web.php (magasin.move.report ou movements.generateReport)
        const exportUrl = `${route('movements.generateReport')}?${queryParams}`;

        // Fermeture et Feedback
        onClose(); 
        
        Swal.fire({
            title: 'Génération en cours...',
            text: 'Votre rapport est en cours de préparation. Le téléchargement débutera dans quelques instants.',
            icon: 'info',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: isDark ? '#1F2937' : '#fff',
            color: isDark ? '#F3F4F6' : '#000'
        });

        // Déclenchement du téléchargement dans un nouvel onglet
        window.open(exportUrl, '_blank');
    };

    // Formatage personnalisé pour afficher les icônes dans le Select Fichier
    const formatFileOptionLabel = ({ label, icon }) => (
        <div className="flex items-center gap-2">
            {icon && <FontAwesomeIcon icon={icon} className={label.includes('PDF') ? 'text-red-500' : 'text-green-600'} />}
            <span>{label}</span>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                
                {/* Section Période */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Période d'analyse</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField
                            id="start_date"
                            type="date"
                            label="Du"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            error={errors.start_date}
                            className="bg-white dark:bg-gray-800"
                        />
                        <InputField
                            id="end_date"
                            type="date"
                            label="Au"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            error={errors.end_date}
                            className="bg-white dark:bg-gray-800"
                        />
                    </div>
                </div>

                {/* Section Filtres Contextuels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Agence */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Agence</label>
                        <Select
                            options={agencyOptions}
                            value={agencyOptions.find(op => op.value === data.agency_id) || null}
                            onChange={(op) => handleSelectChange('agency_id', op)}
                            placeholder="Toutes les agences"
                            isClearable={agencies.length > 1}
                            isDisabled={agencies.length <= 1} // Verrouillé si une seule option dispo
                            styles={getSelectStyles(isDark, errors.agency_id)}
                            noOptionsMessage={() => "Aucune agence"}
                        />
                    </div>

                    {/* Service (Corrigé) */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Service</label>
                        <Select
                            options={serviceOptions}
                            // Comparaison stricte sur la value (qui est l'ID)
                            value={serviceOptions.find(op => op.value === data.service_id) || null}
                            onChange={(op) => handleSelectChange('service_id', op)}
                            placeholder="Tous les services"
                            isClearable
                            styles={getSelectStyles(isDark, errors.service_id)}
                        />
                    </div>
                </div>

                {/* Article Spécifique */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Article spécifique (Optionnel)</label>
                    <Select
                        options={articleOptions}
                        value={articleOptions.find(op => op.value === data.article_id) || null}
                        onChange={(op) => handleSelectChange('article_id', op)}
                        placeholder="Rechercher un article..."
                        isClearable
                        isSearchable
                        styles={getSelectStyles(isDark, errors.article_id)}
                    />
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

                {/* Section Options d'Export */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type de rapport */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Type de rapport</label>
                        <Select
                            options={movementTypeOptions}
                            value={movementTypeOptions.find(op => op.value === data.type_mouvement)}
                            onChange={(op) => handleSelectChange('type_mouvement', op)}
                            isClearable={false}
                            styles={getSelectStyles(isDark)}
                        />
                    </div>

                    {/* Format de fichier */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Format de sortie</label>
                        <Select
                            options={fileTypeOptions}
                            value={fileTypeOptions.find(op => op.value === data.file_type)}
                            onChange={(op) => handleSelectChange('file_type', op)}
                            isClearable={false}
                            formatOptionLabel={formatFileOptionLabel}
                            styles={getSelectStyles(isDark)}
                        />
                    </div>
                </div>

                {/* Boutons d'Action */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={onClose}
                        className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Annuler
                    </Button>
                    <Button type="submit" variant="primary">
                        <FontAwesomeIcon icon={faDownload} className="mr-2" />
                        Générer le rapport
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default MovementHistoryPDFExcelModal;