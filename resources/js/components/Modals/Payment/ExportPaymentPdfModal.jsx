// resources/js/components/Modals/Sales/NewSaleModal.jsx

import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from '../Modal'; // Assurez-vous que ce chemin est correct

const ExportInvoicePdfModal = ({ isOpen, onClose, clients, agencies, banks }) => {
    const [exportFilters, setExportFilters] = useState({
        selectedClient: '',
        selectedAgency: '',
        selectedType: '',
        selectedBank: '',
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

    const colors = useMemo(() => {
        return {
            '--text-color': isDarkMode ? 'rgb(249 250 251 / 0.9)' : 'rgb(31 41 55)',
            '--placeholder-color': isDarkMode ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
            '--border-color': isDarkMode ? 'rgb(75 85 99)' : 'rgb(209 213 219)',
            '--bg-menu': isDarkMode ? 'rgb(31 41 55)' : 'rgb(255 255 255)',
            '--bg-option-hover': isDarkMode ? 'rgb(55 65 81)' : 'rgb(243 244 246)',
        };
    }, [isDarkMode]);

    const customStyles = useMemo(() => ({
        control: (baseStyles, state) => ({
            ...baseStyles,
            height: '44px',
            minHeight: '44px',
            borderColor: state.isFocused ? '#3B82F6' : colors['--border-color'],
            backgroundColor: 'transparent',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : (isDarkMode ? '#4b5563' : '#9CA3AF'),
            },
        }),
        singleValue: (baseStyles) => ({ ...baseStyles, color: colors['--text-color'] }),
        placeholder: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'] }),
        input: (baseStyles) => ({ ...baseStyles, color: colors['--text-color'] }),
        menu: (baseStyles) => ({ ...baseStyles, backgroundColor: colors['--bg-menu'], zIndex: 9999 }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? colors['--bg-option-hover'] : colors['--bg-menu'],
            color: state.isSelected ? 'white' : colors['--text-color'],
            '&:hover': { backgroundColor: colors['--bg-option-hover'], color: colors['--text-color'] },
        }),
        indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: colors['--border-color'] }),
        dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'] }),
        clearIndicator: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'], '&:hover': { color: '#EF4444' } }),
    }), [isDarkMode, colors]);

    const clientOptions = useMemo(() => 
        [{ value: '', label: 'Tous les clients' }, ...clients?.map(client => ({ value: client.id, label: client.name })) || []],
        [clients]
    );
    const agencyOptions = useMemo(() => 
        agencies?.map(agency => ({ value: agency.id, label: agency.name })) || [],
        [agencies]
    );

    const typeOptions = useMemo(() => [
        { value: 'consigne', label: 'Consigne' },
        { value: 'vente', label: 'Vente' },
    ], []);

    const bankOptions = useMemo(() => 
        [{ value: '', label: 'Toutes les banques' }, ...banks?.map(bank => ({ value: bank.id, label: bank.name })) || []],
        [banks]
    );

    const handleExport = () => {
        setIsExporting(true);

        const exportUrl = route('payments.export', {
            client_id: exportFilters.selectedClient || null,
            agency_id: exportFilters.selectedAgency || null,
            invoice_type: exportFilters.selectedType || null,
            bank_id: exportFilters.selectedBank || null,
            start_date: exportFilters.startDate || null,
            end_date: exportFilters.endDate || null,
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
            setExportFilters({
                selectedClient: '',
                selectedAgency: '',
                selectedType: '',
                selectedBank: '',
                startDate: '',
                endDate: '',
            });
        }, 1500);
    };

    useEffect(() => {
        if (isOpen) {
            setExportFilters({
                selectedClient: '',
                selectedAgency: '',
                selectedType: '',
                selectedBank: '',
                startDate: '',
                endDate: '',
            });
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Exporter les Versements"
        >
            <div className="space-y-4" style={{
                '--text-color': colors['--text-color'],
                '--placeholder-color': colors['--placeholder-color'],
                '--border-color': colors['--border-color'],
                '--bg-menu': colors['--bg-menu'],
                '--bg-option-hover': colors['--bg-option-hover']
            }}>
                <div>
                    <label htmlFor="export-client-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Client
                    </label>
                    <Select
                        id="export-client-filter"
                        value={clientOptions.find(option => option.value === exportFilters.selectedClient) || null}
                        onChange={(selectedOption) => setExportFilters(prev => ({ ...prev, selectedClient: selectedOption ? selectedOption.value : '' }))}
                        options={clientOptions}
                        isClearable={true}
                        styles={customStyles}
                        className="w-full text-sm dark:bg-gray-900 dark:text-white/90"
                        placeholder="Sélectionner un client"
                    />
                </div>

                <div>
                    <label htmlFor="export-agency-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agence
                    </label>
                    <Select
                        id="export-agency-filter"
                        value={agencyOptions.find(option => option.value === exportFilters.selectedAgency) || null}
                        onChange={(selectedOption) => setExportFilters(prev => ({ ...prev, selectedAgency: selectedOption ? selectedOption.value : '' }))}
                        options={agencyOptions}
                        isClearable={true}
                        styles={customStyles}
                        className="w-full text-sm dark:bg-gray-900 dark:text-white/90"
                        placeholder="Sélectionner une agence"
                    />
                </div>

                <div>
                    <label htmlFor="export-type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                    </label>
                    <Select
                        id="export-type-filter"
                        value={typeOptions.find(option => option.value === exportFilters.selectedType) || null}
                        onChange={(selectedOption) => setExportFilters(prev => ({ ...prev, selectedType: selectedOption ? selectedOption.value : '' }))}
                        options={typeOptions}
                        isClearable={true}
                        styles={customStyles}
                        className="w-full text-sm dark:bg-gray-900 dark:text-white/90"
                        placeholder="Sélectionner un type"
                    />
                </div>
                
                <div>
                    <label htmlFor="export-bank-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Banque
                    </label>
                    <Select
                        id="export-bank-filter"
                        value={bankOptions.find(option => option.value === exportFilters.selectedBank) || null}
                        onChange={(selectedOption) => setExportFilters(prev => ({ ...prev, selectedBank: selectedOption ? selectedOption.value : '' }))}
                        options={bankOptions}
                        isClearable={true}
                        styles={customStyles}
                        className="w-full text-sm dark:bg-gray-900 dark:text-white/90"
                        placeholder="Sélectionner une banque"
                    />
                </div>

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
                        style={{
                            borderColor: colors['--border-color'],
                            backgroundColor: 'transparent',
                            color: colors['--text-color']
                        }}
                    />
                </div>

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
                        style={{
                            borderColor: colors['--border-color'],
                            backgroundColor: 'transparent',
                            color: colors['--text-color']
                        }}
                    />
                </div>
            </div>

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
                    className="inline-flex items-center gap-2 rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 dark:border-red-700 dark:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50"
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

export default ExportInvoicePdfModal;