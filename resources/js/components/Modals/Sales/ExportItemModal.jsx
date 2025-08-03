import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from '../Modal'; // Import du composant Modal fourni

const ExportItemsModal = ({ isOpen, onClose, articles, agencies }) => {
    // État pour les filtres d'exportation
    const [exportFilters, setExportFilters] = useState({
        selectedArticle: '',
        selectedAgency: '',
        startDate: '',
        endDate: '',
    });
    const [isExporting, setIsExporting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Effet pour détecter le mode sombre
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    // Définition des variables CSS pour les couleurs en fonction du thème
    const colors = {
        '--text-color': isDarkMode ? 'rgb(249 250 251 / 0.9)' : 'rgb(31 41 55)',
        '--placeholder-color': isDarkMode ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
        '--border-color': isDarkMode ? 'rgb(75 85 99)' : 'rgb(209 213 219)',
        '--bg-menu': isDarkMode ? 'rgb(31 41 55)' : 'rgb(255 255 255)',
        '--bg-option-hover': isDarkMode ? 'rgb(55 65 81)' : 'rgb(243 244 246)',
    };

    // Styles personnalisés pour react-select
    const customStyles = {
        control: (baseStyles, state) => ({
            ...baseStyles,
            height: '44px',
            minHeight: '44px',
            borderColor: state.isFocused ? '#3B82F6' : 'var(--border-color)',
            backgroundColor: 'transparent',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : (isDarkMode ? '#4b5563' : '#9CA3AF'),
            },
        }),
        singleValue: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)' }),
        placeholder: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
        input: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)' }),
        menu: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--bg-menu)', zIndex: 9999 }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? 'var(--bg-option-hover)' : 'var(--bg-menu)',
            color: state.isSelected ? 'white' : 'var(--text-color)',
            '&:hover': { backgroundColor: 'var(--bg-option-hover)', color: 'var(--text-color)' },
        }),
        indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--border-color)' }),
        dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
        clearIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)', '&:hover': { color: '#EF4444' } }),
    };

    // Mise en forme des options pour react-select
    const articleOptions = articles?.map(article => ({ value: article.name, label: article.name })) || [];
    const agencyOptions = agencies?.map(agency => ({ value: agency.name, label: agency.name })) || [];

    // Gère la soumission du formulaire d'exportation
    const handleExport = () => {
        setIsExporting(true);

        const exportUrl = route('facture-items.export.pdf', {
            selectedArticle: exportFilters.selectedArticle || null,
            selectedAgency: exportFilters.selectedAgency || null,
            startDate: exportFilters.startDate || null,
            endDate: exportFilters.endDate || null,
        });

        // Ouvre l'URL dans un nouvel onglet pour déclencher le téléchargement
        window.open(exportUrl, '_blank');

        Swal.fire(
            'Exportation en cours',
            'Votre rapport PDF est en cours de préparation et de téléchargement, monsieur.',
            'info'
        );

        // Réinitialise l'état après un court délai pour l'expérience utilisateur
        setTimeout(() => {
            setIsExporting(false);
            onClose();
        }, 1500); // Délai pour laisser le temps à l'exportation de commencer
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Exporter les articles vendus"
        >
            <div className="space-y-4" style={colors}>
                {/* Filtre par Article */}
                <div>
                    <label htmlFor="export-article-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Article
                    </label>
                    <Select
                        id="export-article-filter"
                        value={articleOptions.find(option => option.value === exportFilters.selectedArticle)}
                        onChange={(selectedOption) => setExportFilters(prev => ({ ...prev, selectedArticle: selectedOption ? selectedOption.value : '' }))}
                        options={[{ value: '', label: 'Tous les articles' }, ...articleOptions]}
                        isClearable={true}
                        styles={customStyles}
                        className="w-full text-sm dark:bg-gray-900 dark:text-white/90"
                        placeholder="Sélectionner un article"
                    />
                </div>

                {/* Filtre par Agence */}
                <div>
                    <label htmlFor="export-agency-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agence
                    </label>
                    <Select
                        id="export-agency-filter"
                        value={agencyOptions.find(option => option.value === exportFilters.selectedAgency)}
                        onChange={(selectedOption) => setExportFilters(prev => ({ ...prev, selectedAgency: selectedOption ? selectedOption.value : '' }))}
                        options={[{ value: '', label: 'Toutes les agences' }, ...agencyOptions]}
                        isClearable={true}
                        styles={customStyles}
                        className="w-full text-sm dark:bg-gray-900 dark:text-white/90"
                        placeholder="Sélectionner une agence"
                    />
                </div>

                {/* Filtre par Date de début */}
                <div>
                    <label htmlFor="export-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de début
                    </label>
                    <input
                        type="date"
                        id="export-start-date"
                        value={exportFilters.startDate}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        style={{ '--bg-input-date': isDarkMode ? '#1f2937' : 'transparent', '--border-input-date': isDarkMode ? '#374151' : 'rgb(209 213 219)' }}
                    />
                </div>

                {/* Filtre par Date de fin */}
                <div>
                    <label htmlFor="export-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de fin
                    </label>
                    <input
                        type="date"
                        id="export-end-date"
                        value={exportFilters.endDate}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        style={{ '--bg-input-date': isDarkMode ? '#1f2937' : 'transparent', '--border-input-date': isDarkMode ? '#374151' : 'rgb(209 213 219)' }}
                    />
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end mt-6 space-x-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    disabled={isExporting}
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 rounded-md border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 dark:border-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50"
                >
                    {isExporting ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            Génération...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faFilePdf} />
                            Exporter au format PDF
                        </>
                    )}
                </button>
            </div>
        </Modal>
    );
};

export default ExportItemsModal;