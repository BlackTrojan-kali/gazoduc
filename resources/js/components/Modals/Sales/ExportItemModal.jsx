import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from '../Modal'; 

const ExportItemsModal = ({ isOpen, onClose, articles, agencies }) => {
    const [exportFilters, setExportFilters] = useState({
        selectedArticle: '',
        selectedAgency: '',
        startDate: '',
        endDate: '',
    });
    const [isExporting, setIsExporting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    const colors = {
        '--text-color': isDarkMode ? 'rgb(249 250 251 / 0.9)' : 'rgb(31 41 55)',
        '--placeholder-color': isDarkMode ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
        '--border-color': isDarkMode ? 'rgb(75 85 99)' : 'rgb(209 213 219)',
        '--bg-menu': isDarkMode ? 'rgb(31 41 55)' : 'rgb(255 255 255)',
        '--bg-option-hover': isDarkMode ? 'rgb(55 65 81)' : 'rgb(243 244 246)',
    };

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

    const articleOptions = articles?.map(article => ({ value: article.name, label: article.name })) || [];
    const agencyOptions = agencies?.map(agency => ({ value: agency.name, label: agency.name })) || [];

    const handleExport = () => {
        setIsExporting(true);

        // CORRECTION ICI : Assurez-vous que le nom de la route correspond à web.php
        const exportUrl = route('factures.export.item', {
            selectedArticle: exportFilters.selectedArticle || null,
            selectedAgency: exportFilters.selectedAgency || null,
            startDate: exportFilters.startDate || null,
            endDate: exportFilters.endDate || null,
        });

        window.open(exportUrl, '_blank');

        Swal.fire(
            'Exportation en cours',
            'Votre rapport PDF est en cours de préparation et de téléchargement, monsieur.',
            'info'
        );

        setTimeout(() => {
            setIsExporting(false);
            onClose();
        }, 1500); 
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Exporter les articles vendus">
            <div className="space-y-4" style={colors}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Article</label>
                    <Select
                        value={articleOptions.find(option => option.value === exportFilters.selectedArticle)}
                        onChange={(opt) => setExportFilters(prev => ({ ...prev, selectedArticle: opt ? opt.value : '' }))}
                        options={articleOptions}
                        isClearable={true}
                        styles={customStyles}
                        placeholder="Sélectionner un article"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agence</label>
                    <Select
                        value={agencyOptions.find(option => option.value === exportFilters.selectedAgency)}
                        onChange={(opt) => setExportFilters(prev => ({ ...prev, selectedAgency: opt ? opt.value : '' }))}
                        options={agencyOptions}
                        isClearable={true}
                        styles={customStyles}
                        placeholder="Sélectionner une agence"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                    <input
                        type="date"
                        value={exportFilters.startDate}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                    <input
                        type="date"
                        value={exportFilters.endDate}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm border-gray-300 dark:border-gray-700 bg-transparent dark:text-white"
                    />
                </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border rounded-md">Annuler</button>
                <button type="button" onClick={handleExport} disabled={isExporting} className="flex gap-2 px-4 py-2 text-sm text-white bg-green-600 rounded-md">
                    {isExporting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faFilePdf} />}
                    Exporter au format PDF
                </button>
            </div>
        </Modal>
    );
};

export default ExportItemsModal;