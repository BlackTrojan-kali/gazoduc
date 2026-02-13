import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Select from 'react-select';
import Modal from '../Modal';
import Button from '../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faTimes } from '@fortawesome/free-solid-svg-icons'; // Changement d'icône

const ExportPricesModal = ({ isOpen, onClose, agencies = [], articles = [], clientCategories = [], routeName }) => {
    
    // État pour gérer le feedback visuel pendant la génération du PDF
    const [isExporting, setIsExporting] = useState(false);

    // Initialisation du formulaire
    const { data, setData, reset } = useForm({
        agency_id: '',
        client_category_id: '',
        article_id: '',
    });

    // Reset à l'ouverture
    useEffect(() => {
        if (isOpen) {
            reset();
            setIsExporting(false);
        }
    }, [isOpen]);

    const handleExport = (e) => {
        e.preventDefault();
        setIsExporting(true);

        try {
            // Construction de l'URL avec Ziggy
            // On ajoute potentiellement un paramètre 'format' si votre route gère les deux, 
            // sinon la route spécifique PDF suffit.
            const exportUrl = route(routeName, {
                agency_id: data.agency_id || undefined,
                client_category_id: data.client_category_id || undefined,
                article_id: data.article_id || undefined,
                format: 'pdf' // Optionnel : utile si vous utilisez la même route pour Excel/PDF
            });

            // Déclenchement du téléchargement / ouverture du PDF
            window.location.href = exportUrl;

            // On laisse un peu de temps pour le feedback visuel avant de fermer
            setTimeout(() => {
                setIsExporting(false);
                onClose();
            }, 1500);

        } catch (error) {
            console.error("Erreur de route Ziggy", error);
            setIsExporting(false);
        }
    };

    // Préparation des options pour les selects
    const agencyOptions = agencies.map(a => ({ value: a.id, label: a.name }));
    const clientCategoryOptions = clientCategories.map(c => ({ value: c.id, label: c.name }));
    const articleOptions = articles.map(art => ({ value: art.id, label: art.name }));

    // Styles personnalisés pour React-Select (Thème Rouge/PDF ou Standard)
    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '44px',
            borderRadius: '0.5rem',
            borderColor: state.isFocused ? '#ef4444' : '#d1d5db', // Rouge au focus pour rappeler le PDF
            boxShadow: state.isFocused ? '0 0 0 1px #ef4444' : 'none',
            '&:hover': { borderColor: state.isFocused ? '#ef4444' : '#9ca3af' }
        }),
        menu: (base) => ({ ...base, zIndex: 9999 }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#ef4444' : (state.isFocused ? '#fecaca' : 'white'),
            color: state.isSelected ? 'white' : '#1f2937',
        })
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Imprimer la Grille Tarifaire">
            <form onSubmit={handleExport} className="p-5 space-y-5">
                
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 flex items-start gap-3">
                    <FontAwesomeIcon icon={faFilePdf} className="text-xl mt-0.5" />
                    <div>
                        <p className="font-semibold">Génération du catalogue PDF</p>
                        <p className="opacity-90">Sélectionnez les filtres ci-dessous pour générer un document PDF personnalisé prêt à imprimer.</p>
                    </div>
                </div>

                {/* --- FILTRE AGENCE --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agence concernée
                    </label>
                    <Select
                        options={agencyOptions}
                        value={agencyOptions.find(opt => opt.value === data.agency_id) || null}
                        onChange={opt => setData('agency_id', opt ? opt.value : '')}
                        isClearable
                        placeholder="Toutes les agences..."
                        styles={customSelectStyles}
                        classNamePrefix="react-select"
                        noOptionsMessage={() => "Aucune agence trouvée"}
                    />
                </div>

                {/* --- FILTRE CATÉGORIE --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Catégorie Tarifaire
                    </label>
                    <Select
                        options={clientCategoryOptions}
                        value={clientCategoryOptions.find(opt => opt.value === data.client_category_id) || null}
                        onChange={opt => setData('client_category_id', opt ? opt.value : '')}
                        isClearable
                        placeholder="Toutes les catégories..."
                        styles={customSelectStyles}
                        classNamePrefix="react-select"
                        noOptionsMessage={() => "Aucune catégorie trouvée"}
                    />
                </div>

                {/* --- FILTRE ARTICLE --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Article (Optionnel)
                    </label>
                    <Select
                        options={articleOptions}
                        value={articleOptions.find(opt => opt.value === data.article_id) || null}
                        onChange={opt => setData('article_id', opt ? opt.value : '')}
                        isClearable
                        placeholder="Tous les articles..."
                        styles={customSelectStyles}
                        classNamePrefix="react-select"
                        noOptionsMessage={() => "Aucun article trouvé"}
                    />
                </div>

                {/* --- ACTIONS --- */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={onClose}
                        disabled={isExporting}
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" /> 
                        Annuler
                    </Button>

                    <Button
                        type="submit"
                        disabled={isExporting}
                        className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center shadow-red-200"
                    >
                        {isExporting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Génération PDF...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                                Télécharger PDF
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExportPricesModal;