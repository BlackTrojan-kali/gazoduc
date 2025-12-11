import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash, faRedo } from '@fortawesome/free-solid-svg-icons';
import { useForm, router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import Select from 'react-select';
// ⚠️ Vérifiez le chemin d'accès
import useLicenceChoice from '@/Hooks/useLicenceChoice'; 


const NewSaleModal = ({ isOpen, onClose, clients, articles ,articlePrices}) => {
    
    // Récupération des props Inertia, y compris les prix
    const { auth } = usePage().props;
    const agencyId = auth.user.agency_id;

    // --- 1. États et Formulaire Inertia ---
    const { data, setData, post, processing, errors, reset } = useForm({
        client_id: null,
        currency: 'liquide',
        type: 'vente',
        items: [],
    });

    const [selectedArticleOption, setSelectedArticleOption] = useState(null);
    const [articleQuantity, setArticleQuantity] = useState(1);
    const [quantityError, setQuantityError] = useState('');
    const [selectedClientOption, setSelectedClientOption] = useState(null);
    
    // États pour le calcul instantané du prochain item
    const [currentUnitPrice, setCurrentUnitPrice] = useState(0);
    const [currentSubtotal, setCurrentSubtotal] = useState(0);

    // Détermine si le panier contient des articles
    const isCartNotEmpty = data.items.length > 0; // 👈 Nouvelle variable de condition

    // --- 2. Mappage des options et Calculs mémorisés ---

    // Mappage des clients (inclut la catégorie pour le calcul de prix)
    const clientOptions = useMemo(() => clients.map(client => ({
        value: client.id,
        label: `${client.name}`,
        category_id: client.client_category_id, 
    })), [clients]);

    const articleOptions = useMemo(() => articles.map(article => ({
        value: article.id,
        label: article.name,
    })), [articles]);

    // Calcul du Total Général de la commande
    const generalTotal = useMemo(() => {
        return data.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    }, [data.items]);

    // Styles de Select (inchangé)
    const selectStyles = (isDisabled = false) => ({
        control: (baseStyles, state) => ({
            ...baseStyles,
            height: '44px',
            minHeight: '44px',
            borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
            backgroundColor: isDisabled ? '#4B5563' : '#1F2937', // Grisé si désactivé
            boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
            },
        }),
        singleValue: (baseStyles) => ({ ...baseStyles, color: isDisabled ? '#9CA3AF' : '#F9FAFB' }), // Texte grisé si désactivé
        placeholder: (baseStyles) => ({ ...baseStyles, color: '#9CA3AF' }),
        input: (baseStyles) => ({ ...baseStyles, color: '#F9FAFB' }),
        menu: (baseStyles) => ({ ...baseStyles, backgroundColor: '#1F2937', zIndex: 9999 }),
        option: (baseStyles, state) => ({
            ...baseStyles,
            backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#374151' : '#1F2937',
            color: state.isSelected ? 'white' : '#F9FAFB',
            '&:hover': { backgroundColor: '#374151', color: '#F9FAFB' },
        }),
        // S'assurer que le Select est désactivé si isCartNotEmpty est vrai
        ... (isDisabled && {
            container: (baseStyles) => ({ ...baseStyles, pointerEvents: 'none' }),
            singleValue: (baseStyles) => ({ ...baseStyles, color: '#9CA3AF' }),
        })
    });

    // --- 3. Logique de Réinitialisation et Hooks ---

    const handleResetForm = () => {
        reset();
        setSelectedClientOption(null);
        setSelectedArticleOption(null);
        setArticleQuantity(1);
        setQuantityError('');
        setCurrentUnitPrice(0);
        setCurrentSubtotal(0);
        setData('items', []);
    };
    
    useEffect(() => {
        if (!isOpen) {
            handleResetForm();
        }
    }, [isOpen]);

    // Fonction de recherche de prix (Cœur de la logique Front-end)
    const calculateUnitPrice = () => {
        const articleId = selectedArticleOption?.value;
        const client = clientOptions.find(opt => opt.value === data.client_id);
        const clientCategoryId = client?.category_id;
        const saleType = data.type;

        if (!articleId || !clientCategoryId || !articlePrices) {
            return 0;
        }

        // Chercher l'entrée de prix correspondante dans la collection passée par Inertia
        // Remarques: L'agencyId a été retiré de la prop, mais je l'ai laissé dans le hook usePage().props pour la cohérence Back/Front.
        // Si vous ne filtrez pas par agency_id côté PHP, vous ne devriez pas le filtrer ici non plus.
        const priceEntry = articlePrices.find(price => 
            price.article_id === articleId &&
            price.client_category_id === clientCategoryId
            // Si vous avez besoin de l'agence, décommentez la ligne suivante
            // && price.agency_id === agencyId
        );

        if (!priceEntry) {
            return 0; 
        }

        // Déterminer quel prix utiliser
        if (saleType === 'consigne') {
            return priceEntry.consigne_price || 0; 
        } else {
            return priceEntry.price || 0;
        }
    };
    
    // Effet pour mettre à jour le prix affiché à l'écran
    useEffect(() => {
        const unitPrice = calculateUnitPrice();
        setCurrentUnitPrice(unitPrice);
        // Recalculer le sous-total lorsque le prix unitaire ou la quantité change
        setCurrentSubtotal(unitPrice * articleQuantity);
    }, [selectedArticleOption, data.client_id, data.type, articleQuantity]);


    // --- 4. Handlers de Formulaire ---

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
        
        if (currentUnitPrice <= 0) {
            Swal.fire('Erreur', "Prix non trouvé pour cette combinaison (Article/Client).", 'error');
            return;
        }

        const articleId = selectedArticleOption.value;
        const articleName = selectedArticleOption.label;
        // On s'assure que le prix est au format float avec 2 décimales pour l'enregistrement dans items
        const unitPrice = parseFloat(currentUnitPrice); 

        const existingItemIndex = data.items.findIndex(item => item.article_id == articleId);

        if (existingItemIndex > -1) {
            // Fusionner les quantités
            const updatedItems = data.items.map((item, index) =>
                index === existingItemIndex
                    ? { ...item, quantity: item.quantity + articleQuantity }
                    : item
            );
            setData('items', updatedItems);
        } else {
            // Nouvel article
            const newItem = {
                article_id: articleId,
                name: articleName,
                quantity: articleQuantity,
                unit_price: unitPrice, 
            };
            setData('items', [...data.items, newItem]);
        }

        setSelectedArticleOption(null);
        setArticleQuantity(1);
        setQuantityError('');
        setCurrentUnitPrice(0); 
        setCurrentSubtotal(0);
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

    // --- 5. Soumission du Formulaire ---
    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.client_id === null) {
            Swal.fire('Erreur', 'Veuillez sélectionner un client.', 'error');
            return;
        }
        if (data.items.length === 0) {
             Swal.fire('Erreur', 'Veuillez ajouter au moins un article.', 'error');
             return;
        }
        
        // Les données `data` contiennent déjà tout ce dont le contrôleur a besoin
        post(route('compage.store'), {
            onSuccess: () => {
                Swal.fire('Succès', 'Facture créée avec succès, monsieur !', 'success');
                handleResetForm(); 
                onClose(); 
                router.reload(); 
            },
            onError: (err) => {
                console.error('Erreur de création de facture:', err);
                // Afficher une erreur plus générique ou extraire l'erreur de validation si possible
                Swal.fire('Erreur', 'Impossible de créer la facture. Veuillez vérifier les champs et réessayer.', 'error');
            },
        });
    };

    if (!isOpen) return null;

    // --- 6. Rendu du Composant ---
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
                    Créer une Nouvelle Vente
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section Informations Générales (Client, Paiement, Type) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* CHAMP CLIENT */}
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
                                styles={selectStyles(isCartNotEmpty)} // 👈 Désactivation ici
                                isDisabled={isCartNotEmpty} // 👈 Désactivation ici
                            />
                            {errors.client_id && <div className="text-red-500 text-sm mt-1">{errors.client_id}</div>}
                        </div>

                        {/* CHAMP MODE DE PAIEMENT */}
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mode de Paiement</label>
                            <select
                                id="currency"
                                name="currency"
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${isCartNotEmpty ? 'bg-gray-700/50 cursor-not-allowed' : 'dark:bg-gray-800'} dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500`}
                                required
                                disabled={isCartNotEmpty} // 👈 Désactivation ici
                            >
                                <option value="liquide">Liquide</option>
                                <option value="virement">Virement</option>
                            </select>
                            {errors.currency && <div className="text-red-500 text-sm mt-1">{errors.currency}</div>}
                        </div>

                        {/* CHAMP TYPE DE VENTE */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de Vente</label>
                            <select
                                id="type"
                                name="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${isCartNotEmpty ? 'bg-gray-700/50 cursor-not-allowed' : 'dark:bg-gray-800'} dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500`}
                                required
                                disabled={isCartNotEmpty} // 👈 Désactivation ici
                            >
                                <option value="vente">Vente</option>
                                <option value="consigne">Consigne</option>
                            </select>
                            {errors.type && <div className="text-red-500 text-sm mt-1">{errors.type}</div>}
                        </div>
                    </div>

                    {/* Section Ajout d'Articles (avec affichage du prix dynamique) */}
                    <div className="border p-4 rounded-lg dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ajouter des Articles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label htmlFor="article_select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article</label>
                                <Select
                                    id="article_select"
                                    options={articleOptions}
                                    onChange={handleArticleSelect}
                                    value={selectedArticleOption}
                                    placeholder="Sélectionner un article"
                                    isClearable
                                    isSearchable
                                    styles={selectStyles()} 
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Qté</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    value={articleQuantity}
                                    onChange={handleQuantityChange}
                                    min="1"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    disabled={!data.client_id || !selectedArticleOption}
                                />
                                {quantityError && <div className="text-red-500 text-sm mt-1">{quantityError}</div>}
                            </div>
                            
                            {/* Affichage du Prix Unitaire */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix (XAF)</label>
                                <p className="mt-1 block w-full h-11 leading-10 text-xl font-bold rounded-md dark:text-green-400">
                                    {currentUnitPrice} {/* 👈 Affichage formaté */}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-transparent bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                                disabled={!data.client_id || !selectedArticleOption || articleQuantity <= 0 || currentUnitPrice <= 0}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prix Unitaire</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sous-Total</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {data.items.length > 0 ? (
                                    data.items.map((item, index) => {
                                        const itemSubtotal = item.quantity * item.unit_price; 
                                        return (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                    {item.unit_price} {/* 👈 Affichage formaté */}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                                                    {itemSubtotal} {/* 👈 Affichage formaté */}
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
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                                            Ajoutez des articles pour créer une facture.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Total Général */}
                    <div className="flex justify-end pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner">
                        <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                            Total Général: {generalTotal} {/* 👈 Affichage formaté */}
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
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                            disabled={processing || data.items.length === 0 || data.client_id === null}
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