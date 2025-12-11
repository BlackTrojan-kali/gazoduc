import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; 
import Swal from 'sweetalert2';
import { faSpinner, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FuelSaleHistoryPDFExcelModal = ({ 
    isOpen, 
    onClose, 
    agencies, 
    articles, 
    currentFilters = {} 
}) => {
    // État local pour le type d'exportation (PDF ou Excel)
    const [exportType, setExportType] = useState('pdf');

    // Utilisation de useForm pour gérer les données de filtrage
    const { data, setData, processing, errors, reset } = useForm({
        start_date: '',
        end_date: '',
        agency_id: '',
        article_id: '',
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

    // Initialisation des dates et des sélections avec les filtres actuels du tableau
    useEffect(() => {
        if (isOpen) {
            setData({
                start_date: currentFilters.start_date || '',
                end_date: currentFilters.end_date || '',
                // Les IDs des listes déroulantes doivent être des chaînes (string)
                agency_id: currentFilters.agency_id ? String(currentFilters.agency_id) : '',
                article_id: currentFilters.article_id ? String(currentFilters.article_id) : '',
            });
            setExportType('pdf'); 
        } else {
            reset();
        }
    }, [isOpen, reset, currentFilters, setData]);

    // Gérer le changement des champs Input
    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    // Gérer le changement des champs Select
    const handleSelectChange = (id, selectedOption) => {
        // La valeur est soit la valeur de l'option, soit une chaîne vide si dégagée
        setData(id, selectedOption ? selectedOption.value : '');
    };


    // *** Soumission du formulaire d'exportation (Mise à jour pour le téléchargement direct GET) ***
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation simple des dates
        if (!data.start_date || !data.end_date) {
            Swal.fire({
                icon: 'warning',
                title: 'Dates Requises',
                text: 'Veuillez sélectionner une date de début et une date de fin, monsieur.',
            });
            return;
        }

        // 1. Détermination de la route Inertia à utiliser
        const exportRouteName = exportType === 'pdf' 
            ? 'fuel.export.pdf' 
            : 'fuel.export.excel';
        
        // 2. Préparation des données pour la query string
        // On s'assure que les valeurs sont non nulles pour l'URL
        const formDataForQuery = {
            start_date: data.start_date,
            end_date: data.end_date,
            agency_id: data.agency_id || '', 
            article_id: data.article_id || '',
        };

        // 3. Construction de la query string
        const queryString = new URLSearchParams(formDataForQuery).toString();
        
        // 4. Génération de l'URL complète avec le helper 'route()'
        // Assurez-vous que le helper 'route()' est disponible (Ziggy)
        const generateRoute = route(exportRouteName) + '?' + queryString;

        // 5. Déclenchement du téléchargement via le navigateur (GET)
        window.open(generateRoute, '_blank');

        // 6. Affichage de la notification et fermeture de la modal
        Swal.fire({
            icon: 'info',
            title: 'Exportation en cours',
            text: `La génération de votre fichier ${exportType.toUpperCase()} est lancée. Le téléchargement devrait commencer automatiquement, monsieur.`,
            showConfirmButton: false,
            timer: 3000 // Laisser la notification visible pendant le début du téléchargement
        });
        
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Exporter l'Historique des Ventes de Carburant">
            <form onSubmit={handleSubmit} className="space-y-4">
                
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mt-2">Plage de Dates d'Exportation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date de Début */}
                    <Input
                        id="start_date"
                        type="date"
                        label="Date de Début"
                        value={data.start_date}
                        onChange={handleChange}
                        error={errors.start_date}
                        required
                    />
                    {/* Date de Fin */}
                    <Input
                        id="end_date"
                        type="date"
                        label="Date de Fin"
                        value={data.end_date}
                        onChange={handleChange}
                        error={errors.end_date}
                        required
                    />
                </div>

                <h4 className="font-semibold text-gray-700 dark:text-gray-200 pt-2">Filtres Optionnels</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Agence (Select) */}
                    <div>
                        <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Agence
                        </label>
                        <Select
                            inputId="agency_id"
                            classNamePrefix="react-select"
                            // Ajout de l'option "Toutes les agences" en tête
                            options={[{ value: '', label: 'Toutes les agences' }, ...agencyOptions]}
                            value={agencyOptions.find(opt => opt.value === data.agency_id) || { value: '', label: 'Toutes les agences' }}
                            onChange={(selectedOption) => handleSelectChange('agency_id', selectedOption)}
                            placeholder="Sélectionnez l'agence"
                            isClearable
                        />
                        {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
                    </div>

                    {/* Article (Select) */}
                    <div>
                        <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Carburant
                        </label>
                        <Select
                            inputId="article_id"
                            classNamePrefix="react-select"
                            // Ajout de l'option "Tous les carburants" en tête
                            options={[{ value: '', label: 'Tous les carburants' }, ...articleOptions]}
                            value={articleOptions.find(opt => opt.value === data.article_id) || { value: '', label: 'Tous les carburants' }}
                            onChange={(selectedOption) => handleSelectChange('article_id', selectedOption)}
                            placeholder="Sélectionnez le carburant"
                            isClearable
                        />
                        {errors.article_id && <p className="text-sm text-red-600 mt-1">{errors.article_id}</p>}
                    </div>
                </div>

                <h4 className="font-semibold text-gray-700 dark:text-gray-200 pt-2">Format d'Exportation</h4>
                <div className="flex space-x-4">
                    <Button 
                        type="button" 
                        onClick={() => setExportType('pdf')}
                        variant={exportType === 'pdf' ? 'primary' : 'secondary'}
                        className="flex-1"
                        disabled={processing}
                    >
                        <FontAwesomeIcon icon={faFilePdf} className="mr-2" /> PDF
                    </Button>
                    <Button 
                        type="button" 
                        onClick={() => setExportType('excel')}
                        variant={exportType === 'excel' ? 'primary' : 'secondary'}
                        className="flex-1"
                        disabled={processing}
                    >
                        <FontAwesomeIcon icon={faFileExcel} className="mr-2" /> Excel
                    </Button>
                </div>


                {/* Boutons d'Action */}
                <div className="flex justify-end pt-4 border-t mt-4 border-gray-200 dark:border-gray-700">
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
                        variant="success"
                        disabled={processing || !data.start_date || !data.end_date}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Génération...
                            </>
                        ) : (
                            `Exporter en ${exportType.toUpperCase()}`
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default FuelSaleHistoryPDFExcelModal;