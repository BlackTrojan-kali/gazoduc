import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faCloudUploadAlt, faDownload, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const CustomerImportModal = ({ isOpen, onClose }) => {
    
    // Utilisation de useForm pour gérer le fichier
    const { data, setData, post, processing, errors, reset, clearErrors, progress } = useForm({
        file: null,
    });

    const [fileName, setFileName] = useState(null);

    useEffect(() => {
        if (isOpen) {
            reset();
            setFileName(null);
            clearErrors();
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('file', file);
            setFileName(file.name);
        }
    };

    const handleDownloadTemplate = () => {
        // Redirige vers une route qui télécharge un fichier Excel vide avec les entêtes
        window.location.href = route('customers.download-template');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.file) {
            Swal.fire('Erreur', 'Veuillez sélectionner un fichier Excel.', 'error');
            return;
        }

        post(route('customers.import'), {
            forceFormData: true, // Important pour l'envoi de fichiers
            onSuccess: () => {
                onClose();
                Swal.fire({
                    icon: 'success',
                    title: 'Importation réussie',
                    text: 'La liste des clients a été importée avec succès.',
                    timer: 2000,
                    showConfirmButton: false
                });
                reset();
            },
            onError: (err) => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur d\'importation',
                    text: 'Vérifiez le format du fichier ou les données manquantes.',
                });
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Importer des Clients (Excel)" maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6">
                
                {/* Section 1 : Téléchargement du modèle */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-blue-700 font-bold">Format requis</p>
                            <p className="text-xs text-blue-600 mt-1">
                                Le fichier doit contenir les colonnes : <br/>
                                <em>Nom, Téléphone, Email, Adresse, Dette Initiale</em>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-xs px-4 py-2 flex items-center transition-colors"
                        >
                            <FontAwesomeIcon icon={faDownload} className="mr-2" />
                            Télécharger le modèle
                        </button>
                    </div>
                </div>

                {/* Section 2 : Zone de drop / Input File */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner le fichier Excel (.xlsx, .xls)
                    </label>
                    
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${errors.file ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}>
                            
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {fileName ? (
                                    <>
                                        <FontAwesomeIcon icon={faFileExcel} className="w-10 h-10 text-green-600 mb-3" />
                                        <p className="mb-2 text-sm text-gray-900 font-semibold">{fileName}</p>
                                        <p className="text-xs text-gray-500">Prêt à être importé</p>
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCloudUploadAlt} className="w-10 h-10 text-gray-400 mb-3" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour choisir</span></p>
                                        <p className="text-xs text-gray-500">XLSX ou XLS (MAX. 5Mo)</p>
                                    </>
                                )}
                            </div>
                            
                            <input 
                                id="dropzone-file" 
                                type="file" 
                                className="hidden" 
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                    {errors.file && <p className="text-red-500 text-xs mt-2 text-center">{errors.file}</p>}
                    
                    {/* Barre de progression si upload lent */}
                    {progress && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium mr-3"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={processing || !data.file}
                        className={`text-white font-bold py-2 px-6 rounded shadow flex items-center ${processing || !data.file ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Traitement...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                Importer les données
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CustomerImportModal;