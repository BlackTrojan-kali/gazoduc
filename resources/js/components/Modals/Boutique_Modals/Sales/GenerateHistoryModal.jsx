import React, { useState } from 'react';
import Modal from '../../Modal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faCalendarAlt, faDownload } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const GenerateHistoryModal = ({ isOpen, onClose }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleGenerate = (e) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            Swal.fire('Erreur', 'Veuillez sélectionner une date de début et de fin.', 'warning');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            Swal.fire('Erreur', 'La date de début ne peut pas être supérieure à la date de fin.', 'warning');
            return;
        }

        setProcessing(true);

        const url = route('sales.history.pdf', { 
            start_date: startDate, 
            end_date: endDate 
        });

        window.open(url, '_blank');

        setProcessing(false);
        onClose(); 
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-colors duration-200">
                
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                        <FontAwesomeIcon icon={faFilePdf} className="text-red-600 mr-3" />
                        Historique des Ventes
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        &times;
                    </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Sélectionnez la période pour laquelle vous souhaitez générer le rapport détaillé des ventes (incluant les articles).
                </p>

                {/* --- FORMULAIRE --- */}
                <div className="space-y-4">
                    {/* Date Début */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date de début
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="block w-full pl-10 border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 dark:[color-scheme:dark] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Date Fin */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date de fin
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="block w-full pl-10 border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 dark:[color-scheme:dark] transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* --- ACTIONS --- */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={processing}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {processing ? 'Génération...' : (
                            <>
                                <FontAwesomeIcon icon={faDownload} /> Télécharger PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default GenerateHistoryModal;