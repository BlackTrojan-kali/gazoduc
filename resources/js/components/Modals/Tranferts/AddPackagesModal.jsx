import React, { useState } from 'react';
import Select from 'react-select';
import Modal from '../Modal';
import Swal from 'sweetalert2';

const AddPackagesModal = ({ isOpen, onClose, articles, agencyOptions, onAddPackages, departureAgencyId, arrivalAgencyId }) => {
    const [selectedPackages, setSelectedPackages] = useState([]);
    const [newPackage, setNewPackage] = useState({
        article_id: null,
        qty: '',
    });

    const articleOptions = articles?.map(a => ({ value: a.id, label: a.name })) || [];
console.log(articleOptions)
    const handleAddPackage = () => {
        if (!departureAgencyId || !arrivalAgencyId) {
            Swal.fire('Erreur', 'Veuillez d\'abord sélectionner les agences de départ et d\'arrivée.', 'error');
            return;
        }

        if (newPackage.article_id && newPackage.qty > 0) {
            const article = articles.find(a => a.id === newPackage.article_id);
            const departureAgency = agencyOptions.find(a => a.value === departureAgencyId);
            const arrivalAgency = agencyOptions.find(a => a.value === arrivalAgencyId);
            
            setSelectedPackages([...selectedPackages, {
                article_id: newPackage.article_id,
                qty: newPackage.qty,
                article_name: article.name,
                departure_agency_name: departureAgency.label,
                arrival_agency_name: arrivalAgency.label,
                departure_agency_id: departureAgencyId,
                arrival_agency_id: arrivalAgencyId,
            }]);
            setNewPackage({ article_id: null, qty: '' });
        } else {
            Swal.fire('Erreur', 'Veuillez sélectionner un article et une quantité supérieure à zéro.', 'error');
        }
    };

    const handleRemovePackage = (index) => {
        const updatedPackages = selectedPackages.filter((_, i) => i !== index);
        setSelectedPackages(updatedPackages);
    };

    const handleConfirm = () => {
        if (selectedPackages.length === 0) {
            Swal.fire('Erreur', 'Veuillez ajouter au moins un article.', 'error');
            return;
        }

        const packagesToSend = selectedPackages.map(pkg => ({
            article_id: pkg.article_id,
            qty: pkg.qty,
            departure_agency_id: pkg.departure_agency_id,
            arrival_agency_id: pkg.arrival_agency_id,
        }));
        
        onAddPackages(packagesToSend);
        onClose();
    };

    const handleCloseModal = () => {
        setSelectedPackages([]);
        setNewPackage({ article_id: null, qty: '' });
        onClose();
    };
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const customStyles = {
        control: (provided) => ({ ...provided, backgroundColor: isDarkMode ? '#374151' : '#f3f4f6', borderColor: isDarkMode ? '#4b5563' : '#d1d5db' }),
        singleValue: (provided) => ({ ...provided, color: isDarkMode ? '#ffffff' : '#1f2937' }),
        input: (provided) => ({ ...provided, color: isDarkMode ? '#ffffff' : '#1f2937' }),
        placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
        menu: (provided) => ({ ...provided, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', zIndex: 9999 }),
        option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#2563eb' : (state.isFocused ? (isDarkMode ? '#3b82f6' : '#e5e7eb') : 'transparent'), color: state.isSelected || state.isFocused ? '#ffffff' : (isDarkMode ? '#e5e7eb' : '#1f2937') }),
    };

    return (
        <Modal isOpen={isOpen} onClose={handleCloseModal} title="Ajouter des articles">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Article
                        </label>
                        <Select
                            options={articleOptions}
                            value={articleOptions.find(opt => opt.value === newPackage.article_id)}
                            onChange={(selectedOption) => setNewPackage({ ...newPackage, article_id: selectedOption?.value })}
                            className="mt-1"
                            placeholder="Sélectionner..."
                            styles={customStyles}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Quantité
                        </label>
                        <input
                            type="number"
                            value={newPackage.qty}
                            onChange={(e) => setNewPackage({ ...newPackage, qty: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            min="1"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleAddPackage}
                        className="bg-green-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg transition-colors duration-150"
                    >
                        Ajouter
                    </button>
                </div>
                {selectedPackages.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">Articles à envoyer :</h4>
                        <ul className="mt-2 space-y-2">
                            {selectedPackages.map((pkg, index) => (
                                <li key={index} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                                    <span className="text-sm text-gray-800 dark:text-gray-200">
                                        {pkg.qty} x {pkg.article_name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePackage(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors duration-150"
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700 mt-4">
                <button
                    type="button"
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    onClick={handleCloseModal}
                >
                    Annuler
                </button>
                <button
                    type="button"
                    className="bg-blue-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg"
                    onClick={handleConfirm}
                >
                    Confirmer les articles
                </button>
            </div>
        </Modal>
    );
};

export default AddPackagesModal;