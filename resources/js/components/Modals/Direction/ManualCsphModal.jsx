import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import axios from 'axios';

// NOUVEAU : Récupération de la prop "cities"
const ManualCsphModal = ({ isOpen, onClose, cities = [] }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [lignes, setLignes] = useState([
        { id: Date.now(), ville: '', source: 'Ex - SCDP', type: 'Conditionné', quantite: '', taux: '' }
    ]);
    
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStartDate('');
            setEndDate('');
            setLignes([{ id: Date.now(), ville: '', source: 'Ex - SCDP', type: 'Conditionné', quantite: '', taux: '' }]);
            setIsExporting(false);
        }
    }, [isOpen]);

    const handleAddRow = () => {
        setLignes([...lignes, { id: Date.now(), ville: '', source: 'Ex - SCDP', type: 'Conditionné', quantite: '', taux: '' }]);
    };

    const handleRemoveRow = (id) => {
        if (lignes.length > 1) {
            setLignes(lignes.filter(ligne => ligne.id !== id));
        }
    };

    const handleChangeRow = (id, field, value) => {
        setLignes(lignes.map(ligne => ligne.id === id ? { ...ligne, [field]: value } : ligne));
    };

    // NOUVEAU : Fonction magique pour auto-remplir le Taux
    const handleCityChange = (id, cityName) => {
        // On cherche la ville sélectionnée dans la liste
        const selectedCity = cities.find(c => c.name === cityName);
        // On récupère son taux (0 s'il n'existe pas)
        const newTaux = selectedCity ? selectedCity.transport_cost_per_tonne : '';
        
        // On met à jour la ligne avec le nom de la ville ET le taux automatique
        setLignes(lignes.map(ligne => 
            ligne.id === id ? { ...ligne, ville: cityName, taux: newTaux } : ligne
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!startDate || !endDate) {
            Swal.fire('Erreur', 'Veuillez sélectionner une date de début et de fin.', 'error');
            return;
        }

        const isValid = lignes.every(l => l.ville.trim() !== '' && l.quantite !== '' && l.taux !== '');
        if (!isValid) {
            Swal.fire('Erreur', 'Veuillez remplir correctement toutes les lignes.', 'error');
            return;
        }

        setIsExporting(true);

        try {
            const formatFR = (dateStr) => new Date(dateStr).toLocaleDateString('fr-FR');
            const periodeFormatee = `DU ${formatFR(startDate)} AU ${formatFR(endDate)}`;

            const response = await axios.post(route('direction.csph.export-manual'), {
                periode: periodeFormatee,
                lignes: lignes
            }, {
                responseType: 'blob' 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Declaration_CSPH_Manuelle_${new Date().getTime()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            Swal.fire('Succès', 'Votre déclaration manuelle a été générée.', 'success');
            onClose();

        } catch (error) {
            Swal.fire('Erreur', 'Une erreur est survenue lors de la génération du PDF.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Saisie Manuelle : Déclaration CSPH" maxWidth="5xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                        <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white p-2.5 shadow-sm"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                        <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-md border-gray-300 dark:bg-gray-900 dark:border-gray-600 dark:text-white p-2.5 shadow-sm"/>
                    </div>
                </div>

                <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-1/5">Ville</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-1/5">Source</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-1/6">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-1/6">Qté (T)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-1/5">Taux (FCFA)</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-16">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {lignes.map((ligne) => (
                                <tr key={ligne.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-2">
                                        {/* NOUVEAU : Menu déroulant pour les villes */}
                                        <select 
                                            required 
                                            value={ligne.ville} 
                                            onChange={(e) => handleCityChange(ligne.id, e.target.value)} 
                                            className="w-full text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white p-2"
                                        >
                                            <option value="" disabled>Sélectionnez une ville</option>
                                            {cities.map((city) => (
                                                <option key={city.id} value={city.name}>{city.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <select value={ligne.source} onChange={(e) => handleChangeRow(ligne.id, 'source', e.target.value)} className="w-full text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white p-2">
                                            <option value="Ex - SCDP">Ex - SCDP</option>
                                            <option value="Hors SCDP">Hors SCDP</option>
                                            <option value="Via BIPAGA">Via BIPAGA</option>
                                            <option value="Ex-SCDP (via Ngaoundéré)">Ex-SCDP (via Ngaoundéré)</option>
                                            <option value="Ex-SCDP (via Maroua)">Ex-SCDP (via Maroua)</option>
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <select value={ligne.type} onChange={(e) => handleChangeRow(ligne.id, 'type', e.target.value)} className="w-full text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white p-2">
                                            <option value="Conditionné">Conditionné</option>
                                            <option value="Vrac">Vrac</option>
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input type="number" step="0.0001" min="0" required placeholder="0.0000" value={ligne.quantite} onChange={(e) => handleChangeRow(ligne.id, 'quantite', e.target.value)} className="w-full text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-right p-2 font-mono" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" step="0.01" required value={ligne.taux} onChange={(e) => handleChangeRow(ligne.id, 'taux', e.target.value)} className="w-full text-sm border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white text-right p-2 font-mono" />
                                    </td>
                                    <td className="p-2 text-center">
                                        <button type="button" onClick={() => handleRemoveRow(ligne.id)} disabled={lignes.length === 1} className="text-red-500 hover:text-red-700 disabled:opacity-30 p-2 bg-red-50 dark:bg-red-900/20 rounded-md transition-colors">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-start">
                    <button type="button" onClick={handleAddRow} className="text-sm px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:text-blue-400 font-medium flex items-center gap-2 rounded-md transition-colors">
                        <FontAwesomeIcon icon={faPlus} /> Ajouter une ligne
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button type="button" onClick={onClose} disabled={isExporting} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                        Annuler
                    </button>
                    <button type="submit" disabled={isExporting} className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors">
                        {isExporting ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faFilePdf} />}
                        Générer PDF Manuel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ManualCsphModal;