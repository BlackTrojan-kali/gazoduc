import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Modal from '../Modal'; // Vérifie que ce chemin correspond bien à ton architecture

const FuelPaymentHistoryPDFExcelModal = ({ isOpen, onClose, agencies, banks, clients,isFuel=false }) => {
    const [filters, setFilters] = useState({
        selectedAgency: '',
        selectedBank: '',
        selectedClient: '',
        startDate: '',
        endDate: '',
    });
console.log(clients)
    const [isExporting, setIsExporting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true });
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    const colors = useMemo(() => ({
        '--text-color': isDarkMode ? 'rgb(249 250 251 / 0.9)' : 'rgb(31 41 55)',
        '--placeholder-color': isDarkMode ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
        '--border-color': isDarkMode ? 'rgb(75 85 99)' : 'rgb(209 213 219)',
        '--bg-menu': isDarkMode ? 'rgb(31 41 55)' : 'rgb(255 255 255)',
        '--bg-option-hover': isDarkMode ? 'rgb(55 65 81)' : 'rgb(243 244 246)',
    }), [isDarkMode]);

    const customStyles = useMemo(() => ({
        control: (base, state) => ({
            ...base,
            height: '44px',
            borderColor: state.isFocused ? '#3B82F6' : colors['--border-color'],
            backgroundColor: 'transparent',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : (isDarkMode ? '#4b5563' : '#9CA3AF'),
            },
        }),
        singleValue: (base) => ({ ...base, color: colors['--text-color'] }),
        placeholder: (base) => ({ ...base, color: colors['--placeholder-color'] }),
        input: (base) => ({ ...base, color: colors['--text-color'] }),
        menu: (base) => ({ ...base, backgroundColor: colors['--bg-menu'], zIndex: 9999 }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? '#2563EB'
                : state.isFocused
                ? colors['--bg-option-hover']
                : colors['--bg-menu'],
            color: state.isSelected ? 'white' : colors['--text-color'],
        }),
    }), [isDarkMode, colors]);

    // Options dynamiques
    const agencyOptions = useMemo(() =>
        [{ value: '', label: 'Toutes les agences' }, ...agencies?.map(a => ({ value: a.id, label: a.name })) || []],
        [agencies]
    );

    const bankOptions = useMemo(() =>
        [{ value: '', label: 'Toutes les banques' }, ...banks?.map(b => ({ value: b.id, label: b.name })) || []],
        [banks]
    );

    const clientOptions = useMemo(() =>
        [{ value: '', label: 'Tous les clients' }, ...clients?.map(c => ({ value: c.id, label: c.name })) || []],
        [clients]
    );

    const handleExport = (format) => {
        if (!filters.startDate || !filters.endDate) {
            Swal.fire('Dates manquantes', 'Veuillez sélectionner une période à exporter.', 'warning');
            return;
        }

        setIsExporting(true);

        const routeName = format === 'pdf' ? 'fuel_payments.export_pdf' : 'fuel_payments.export_excel';
        const exportUrl = route(routeName, {
            agency_id: filters.selectedAgency || null,
            bank_id: filters.selectedBank || null,
            client_id: filters.selectedClient || null,
            start_date: filters.startDate,
            end_date: filters.endDate,
            isFuel:isFuel
        });

        window.open(exportUrl, '_blank');

        Swal.fire(
            'Exportation en cours',
            `Votre rapport ${format.toUpperCase()} est en cours de génération...`,
            'info'
        );

        setTimeout(() => {
            setIsExporting(false);
            onClose();
        }, 1500);
    };

    useEffect(() => {
        if (isOpen) {
            setFilters({
                selectedAgency: '',
                selectedBank: '',
                selectedClient: '',
                startDate: '',
                endDate: '',
            });
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Exporter les versements carburant"
        >
            <div
                className="space-y-4"
                style={{
                    '--text-color': colors['--text-color'],
                    '--placeholder-color': colors['--placeholder-color'],
                    '--border-color': colors['--border-color'],
                    '--bg-menu': colors['--bg-menu'],
                }}
            >
                {/* Client */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Client
                    </label>
                    <Select
                        value={clientOptions.find(o => o.value === filters.selectedClient) || null}
                        onChange={(opt) => setFilters(p => ({ ...p, selectedClient: opt ? opt.value : '' }))}
                        options={clientOptions}
                        styles={customStyles}
                        isClearable
                        placeholder="Sélectionner un client"
                    />
                </div>

                {/* Agence */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agence
                    </label>
                    <Select
                        value={agencyOptions.find(o => o.value === filters.selectedAgency) || null}
                        onChange={(opt) => setFilters(p => ({ ...p, selectedAgency: opt ? opt.value : '' }))}
                        options={agencyOptions}
                        styles={customStyles}
                        isClearable
                        placeholder="Sélectionner une agence"
                    />
                </div>

                {/* Banque */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Banque
                    </label>
                    <Select
                        value={bankOptions.find(o => o.value === filters.selectedBank) || null}
                        onChange={(opt) => setFilters(p => ({ ...p, selectedBank: opt ? opt.value : '' }))}
                        options={bankOptions}
                        styles={customStyles}
                        isClearable
                        placeholder="Sélectionner une banque"
                    />
                </div>

                {/* Dates */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de début
                    </label>
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-white"
                        style={{ borderColor: colors['--border-color'] }}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de fin
                    </label>
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-white"
                        style={{ borderColor: colors['--border-color'] }}
                    />
                </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end mt-6 space-x-3">
                <button
                    onClick={onClose}
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md bg-white dark:bg-gray-800 text-sm font-medium dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    disabled={isExporting}
                >
                    Annuler
                </button>

                <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                    {isExporting ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            Génération...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faFilePdf} />
                            Exporter PDF
                        </>
                    )}
                </button>

                <button
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 rounded-md border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                >
                    {isExporting ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            Génération...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faFileExcel} />
                            Exporter Excel
                        </>
                    )}
                </button>
            </div>
        </Modal>
    );
};

export default FuelPaymentHistoryPDFExcelModal;
