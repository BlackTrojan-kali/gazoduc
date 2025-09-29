import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash, faRedo } from '@fortawesome/free-solid-svg-icons';
import { useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import Select from 'react-select';
// 🛑 Import du hook réel
import useLicenceChoice from '@/Hooks/useLicenceChoice'; // ⚠️ Vérifiez le chemin d'accès ('@/Hooks/...')


const NewSaleModal = ({ isOpen, onClose, clients, articles }) => {
    // 1. RÉCUPÉRATION DE LA VARIABLE LICENCE EN UTILISANT VOTRE HOOK
    const { licence: licenceChoice } = useLicenceChoice(); 

    const { data, setData, post, processing, errors, reset } = useForm({
        client_id: null,
        currency: 'liquide',
        type: 'vente',
        items: [],
        licence:licenceChoice,
    });

    const [selectedArticleOption, setSelectedArticleOption] = useState(null);
    const [articleQuantity, setArticleQuantity] = useState(1);
    const [quantityError, setQuantityError] = useState('');
    const [selectedClientOption, setSelectedClientOption] = useState(null);

    // Mappage des options (inchangé)
    const clientOptions = clients.map(client => ({
        value: client.id,
        label: `${client.name}`,
    }));

    const articleOptions = articles.map(article => ({
        value: article.id,
        label: article.name,
    }));

    // Styles de Select (inchangé)
    const selectStyles = {
        control: (baseStyles, state) => ({
            ...baseStyles,
            height: '44px',
            minHeight: '44px',
            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
            backgroundColor: '#1F2937',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
            },
        }),
        singleValue: (baseStyles) => ({ ...baseStyles, color: '#F9FAFB' }),
        placeholder: (baseStyles) => ({ ...baseStyles, color: '#9CA3AF' }),
        input: (baseStyles) => ({ ...baseStyles, color: '#F9FAFB' }),
        menu: (baseStyles) => ({ ...baseStyles, backgroundColor: '#1F2937', zIndex: 9999 }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1F2937',
            color: state.isSelected ? 'white' : '#F9FAFB',
            '&:hover': { backgroundColor: '#374151', color: '#F9FAFB' },
        }),
    };

    useEffect(() => {
        if (!isOpen) {
            handleResetForm();
        }
    }, [isOpen]);

    const handleClientSelect = (selectedOption) => {
        setSelectedClientOption(selectedOption);
        setData('client_id', selectedOption ? selectedOption.value : null);
    };

    const handleArticleSelect = (selectedOption) => {
        setSelectedArticleOption(selectedOption);
        setArticleQuantity(1);
        setQuantityError('');
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (isNaN(value) || value <= 0) {
            setQuantityError('La quantité doit être un nombre positif.');
            setArticleQuantity(value);
        } else {
            setQuantityError('');
            setArticleQuantity(value);
        }
    };

    const handleAddItem = () => {
        if (quantityError) {
            Swal.fire('Erreur', quantityError, 'error');
            return;
        }
        if (!selectedArticleOption || articleQuantity <= 0) {
            Swal.fire('Erreur', 'Veuillez sélectionner un article et entrer une quantité valide.', 'error');
            return;
        }

        const articleId = selectedArticleOption.value;
        const articleName = selectedArticleOption.label;

        const existingItemIndex = data.items.findIndex(item => item.article_id == articleId);

        if (existingItemIndex > -1) {
            const updatedItems = data.items.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: item.quantity + articleQuantity }
                    : item
            );
            setData('items', updatedItems);
        } else {
            const newItem = {
                article_id: articleId,
                name: articleName,
                quantity: articleQuantity,
            };
            setData('items', [...data.items, newItem]);
        }

        setSelectedArticleOption(null);
        setArticleQuantity(1);
        setQuantityError('');
    };

    const handleRemoveItem = (indexToRemove) => {
        setData('items', data.items.filter((_, index) => index !== indexToRemove));
    };
    
    const handleUpdateItemQuantity = (indexToUpdate, newQuantity) => {
        const value = parseInt(newQuantity);

        if (isNaN(value) || value <= 0) {
            Swal.fire('Erreur', 'La quantité doit être un nombre positif.', 'error');
            return;
        }

        const updatedItems = data.items.map((item, index) => {
            if (index === indexToUpdate) {
                return { ...item, quantity: value };
            }
            return item;
        });

        setData('items', updatedItems);
    };


    const handleResetForm = () => {
        reset();
        setSelectedClientOption(null);
        setSelectedArticleOption(null);
        setArticleQuantity(1);
        setQuantityError('');
        setData('items', []);
    };

    /**
     * LOGIQUE DE SOUMISSION MISE À JOUR :
     * 1. Applique la règle de filtration des articles basée sur licenceChoice.
     * 2. AJOUTE licenceChoice sous la clé 'licence' aux données soumises.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.client_id === null) {
            Swal.fire('Erreur', 'Veuillez sélectionner un client.', 'error');
            return;
        }

        let itemsToSend = data.items;
        
        // Appliquer la règle : 'gaz' (pas de mouvement de stock)
        if (licenceChoice === 'gaz') {
            itemsToSend = [];
            
        } else if (licenceChoice === 'carburant') {
            // Pour 'carburant' (mouvement de stock), on valide la présence d'articles.
            if (data.items.length === 0) {
                Swal.fire('Erreur', 'Veuillez ajouter au moins un article à la facture.', 'error');
                return;
            }
        }
        
        // Construction de l'objet de données final, incluant la licence !
        const finalData = {
            ...data,
            items: itemsToSend, 
            licence: licenceChoice, // <--- C'est ici que la variable est ajoutée pour la soumission
        };

        post(route('compage.store'), finalData, {
            onSuccess: () => {
                Swal.fire('Succès', 'Facture créée avec succès, monsieur !', 'success');
                handleResetForm(); 
                onClose();        
                router.reload();  
            },
            onError: (err) => {
                console.error('Erreur de création de facture:', err);
                Swal.fire('Erreur', 'Impossible de créer la facture. Veuillez vérifier les champs.', 'error');
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/10 dark:bg-white/10 bg-opacity-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8 p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-3">
                    Créer une Nouvelle Vente ({licenceChoice ? licenceChoice.toUpperCase() : 'LICENCE INDÉFINIE'})
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section Informations Générales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="client_select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                            <Select
                                id="client_select"
                                options={clientOptions}
                                onChange={handleClientSelect}
                                value={selectedClientOption}
                                placeholder="Sélectionner un client"
                                isClearable
                                isSearchable
                                styles={selectStyles}
                            />
                            {errors.client_id && <div className="text-red-500 text-sm mt-1">{errors.client_id}</div>}
                        </div>

                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mode de Paiement</label>
                            <select
                                id="currency"
                                name="currency"
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="liquide">Liquide</option>
                                <option value="virement">Virement</option>
                            </select>
                            {errors.currency && <div className="text-red-500 text-sm mt-1">{errors.currency}</div>}
                        </div>

                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Vente</label>
                            <select
                                id="type"
                                name="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="vente">Vente</option>
                                <option value="consigne">Consigne</option>
                            </select>
                            {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                        </div>
                    </div>

                    {/* Section Ajout d'Articles */}
                    <div className="border p-4 rounded-lg dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ajouter des Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label htmlFor="article_select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article</label>
                                <Select
                                    id="article_select"
                                    options={articleOptions}
                                    onChange={handleArticleSelect}
                                    value={selectedArticleOption}
                                    placeholder="Sélectionner un article"
                                    isClearable
                                    isSearchable
                                    styles={selectStyles}
                                />
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantité</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={articleQuantity}
                                    onChange={handleQuantityChange}
                                    min="0"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                                {quantityError && <div className="text-red-500 text-sm mt-1">{quantityError}</div>}
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                            >
                                <FontAwesomeIcon icon={faPlus} /> Ajouter
                            </button>
                        </div>
                    </div>

                    {/* Tableau des Articles */}
                    <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantité</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.items.length > 0 ? (
                                    data.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateItemQuantity(index, e.target.value)}
                                                    min="1"
                                                    className="w-20 rounded-md border-gray-300 shadow-sm text-center dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                                                    title="Supprimer l'article"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                                            Ajoutez des articles pour créer une facture.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Total Général */}
                    <div className="flex justify-end pr-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            Total Général: Calculé au backend
                        </p>
                    </div>

                    {/* Boutons d'Action */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={handleResetForm}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                            disabled={processing}
                        >
                            <FontAwesomeIcon icon={faRedo} className="mr-2" /> Réinitialiser
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            disabled={processing}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                            disabled={processing}
                        >
                            {processing ? 'Création...' : 'Créer la Vente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewSaleModal;