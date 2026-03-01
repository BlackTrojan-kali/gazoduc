import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '../../Modal'; // Vérifiez le chemin relatif vers votre composant Modal
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBarcode, faSearch, faTimes, faTrash, 
    faMoneyBillWave, faUser, faShoppingCart, faCheck, faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select'; 
import Swal from 'sweetalert2';

const CreateSaleModal = ({ isOpen, onClose, products = [], customers = [], userCounterId }) => {
    
    // --- ÉTATS LOCAUX ---
    const [cart, setCart] = useState([]); 
    const [searchQuery, setSearchQuery] = useState('');
    const [step, setStep] = useState(1); // 1: Sélection d'articles, 2: Paiement
    const searchInputRef = useRef(null);

    // --- FORMULAIRE INERTIA ---
    const { data, setData, post, processing, transform, reset } = useForm({
        customer_id: '',
        payment_mode: 'CASH', // Mode par défaut, en majuscules pour le backend
        amount_paid: '',      // Ce que donne physiquement le client
        cart: [],             // Le tableau des articles attendu par le contrôleur
        counter_id: userCounterId || '', // Ajout de l'ID de la caisse pour la validation
    });

    // --- OPTIONS CLIENTS (Pour le Select) ---
    const customerOptions = useMemo(() => 
        customers.map(c => ({ value: c.id, label: `${c.name} ${c.phone ? '('+c.phone+')' : ''}` })), 
    [customers]);

    // --- LOGIQUE METIER ---

    // 1. Filtrage Visuel (Recherche manuelle dans la grille)
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const lowerQuery = searchQuery.toLowerCase();
        
        return products.filter(p => 
            p.designation.toLowerCase().includes(lowerQuery) || 
            (p.sku && p.sku.toLowerCase().includes(lowerQuery)) ||
            (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
        );
    }, [products, searchQuery]);

    // 2. Initialisation et gestion du Focus au clavier
    useEffect(() => {
        if (isOpen) {
            // Petit délai pour laisser la modale s'ouvrir avant de forcer le focus
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            // Remise à zéro totale quand on ferme la caisse
            setCart([]);
            setStep(1);
            setSearchQuery('');
            reset();
        }
    }, [isOpen]);

    // UX : Si on clique n'importe où (sauf sur un input), on remet le focus sur la douchette
    const keepFocus = () => {
        if (step === 1 && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            searchInputRef.current?.focus();
        }
    };

    // 3. Gestion du Scan (Douchette ou "Entrée" après frappe)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            
            const codeToSearch = searchQuery.trim();
            if (!codeToSearch) return;

            // Recherche EXACTE pour le scan
            const exactMatch = products.find(p => 
                (p.barcode && p.barcode.toLowerCase() === codeToSearch.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase() === codeToSearch.toLowerCase())
            );

            if (exactMatch) {
                addToCart(exactMatch);
                setSearchQuery(''); // On vide pour le scan suivant
            } else {
                 Swal.fire({ 
                     toast: true, icon: 'error', title: 'Produit introuvable', 
                     position: 'top-end', showConfirmButton: false, timer: 1500 
                 });
            }
        }
    };

    // 4. Gestion du Panier (Ajout)
    const addToCart = (product) => {
        const productPrice = parseFloat(product.prix_vente);
        
        // On vérifie combien on en a déjà dans le panier
        const existingItem = cart.find(item => item.product_id === product.id);
        const currentInCartQty = existingItem ? existingItem.qty : 0;
        
        // --- VÉRIFICATION DU STOCK DISPONIBLE ---
        if ((product.stock_comptoir ?? 0) <= currentInCartQty) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock Insuffisant',
                text: `Stock comptoir restant : ${product.stock_comptoir ?? 0}`,
                toast: true, position: 'top-end', timer: 2000, showConfirmButton: false
            });
            return; 
        }

        setCart(prev => {
            if (existingItem) {
                // Incrémenter la quantité
                return prev.map(item => 
                    item.product_id === product.id 
                    ? { ...item, qty: item.qty + 1, sub_total: (item.qty + 1) * productPrice } 
                    : item
                );
            }
            
            // Nouvel article
            return [...prev, {
                product_id: product.id,
                name: product.designation,
                sku: product.sku,
                image: product.image_url,
                qty: 1,
                unit_price: productPrice, 
                discount: 0,
                sub_total: productPrice
            }];
        });
    };

    // Modification manuelle de la quantité (+ / -)
    const updateQty = (productId, newQty) => {
        if (newQty < 1) return; // Pas de quantité zéro ou négative
        
        const product = products.find(p => p.id === productId);
        
        // --- VÉRIFICATION DU STOCK DISPONIBLE ---
        if (product && newQty > (product.stock_comptoir ?? 0)) {
             Swal.fire({
                icon: 'warning',
                title: 'Stock Limite Atteint',
                toast: true, position: 'top-end', timer: 2000, showConfirmButton: false
            });
            return;
        }

        setCart(prev => prev.map(item => 
            item.product_id === productId 
            ? { ...item, qty: newQty, sub_total: newQty * item.unit_price } 
            : item
        ));
    };

    // Suppression d'un article du panier
    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    // 5. Calculs des Totaux
    const totals = useMemo(() => {
        const total_ht = cart.reduce((acc, item) => acc + item.sub_total, 0);
        return { total_ttc: total_ht }; // Ajustable si vous ajoutez la gestion de la TVA par produit plus tard
    }, [cart]);

    // UX : Quand on passe à l'étape 2 (Paiement), on pré-remplit "amount_paid" avec le montant exact
    useEffect(() => {
        if (step === 2 && !data.amount_paid) {
            setData('amount_paid', totals.total_ttc);
        }
    }, [step, totals.total_ttc]);

    // Helper pour formater le chemin de l'image
    const getImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('/') ? url : `/storage/${url}`;
    };

    // 6. Soumission finale vers le serveur
    const handleSubmit = (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            return Swal.fire('Erreur', 'Le panier est vide.', 'error');
        }
        
        // Vérification logique : le client ne peut pas donner moins que ce qu'il doit (sauf cas spécifique)
        if (parseFloat(data.amount_paid) < totals.total_ttc && data.payment_mode !== 'CREDIT') {
            return Swal.fire('Erreur', 'Le montant perçu est inférieur au total de la facture.', 'error');
        }

        // On formate la requête pour inclure les totaux et le panier formaté pour le contrôleur
        transform((currentData) => ({
            ...currentData,
            total_ht: totals.total_ttc,  // Ajout des totaux pour la validation
            total_ttc: totals.total_ttc, // Ajout des totaux pour la validation
            cart: cart.map(item => ({
                id: item.product_id, 
                qty: item.qty,
                discount: item.discount || 0
            }))
        }));

        post(route('sales.store'), { 
            onSuccess: (page) => { 
                onClose(); // Fermer la modale
                
                // Si le contrôleur renvoie une URL pour le ticket PDF
                const printUrl = page.props.flash?.print_url;
                if (printUrl) {
                    window.open(printUrl, 'PRINT_RECEIPT', 'height=600,width=400,top=100,left=100');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Vente validée !',
                    text: `Total encaissé : ${totals.total_ttc.toLocaleString('fr-FR')} FCFA`,
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: (err) => {
                console.error("Erreur POS:", err);
                Swal.fire('Erreur de Caisse', err.message || 'Vérifiez les données du formulaire.', 'error');
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="full">
            <div className="flex h-[90vh] bg-gray-100 overflow-hidden font-sans" onClick={keepFocus}>
                
                {/* ========================================================= */}
                {/* ZONE GAUCHE : CATALOGUE ET RECHERCHE                      */}
                {/* ========================================================= */}
                <div className="w-2/3 flex flex-col border-r border-gray-300">
                    
                    {/* Barre de Recherche / Scan */}
                    <div className="p-4 bg-white shadow-sm z-10 flex gap-4 items-center">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faBarcode} className="text-gray-400 text-lg" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm shadow-inner"
                                placeholder="Scanner (Code-barre) ou taper pour rechercher manuellement..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                                autoFocus
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 hidden md:block font-medium">
                            {filteredProducts.length} article(s) trouvé(s)
                        </div>
                    </div>

                    {/* Grille des Produits */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-100/50">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start">
                            {filteredProducts.map(product => (
                                <div 
                                    key={product.id}
                                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-lg hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all duration-200 overflow-hidden border border-gray-100 flex flex-col h-full group"
                                >
                                    <div className="h-32 w-full bg-gray-100 relative flex items-center justify-center overflow-hidden">
                                        {product.image_url ? (
                                            <img 
                                                src={getImageUrl(product.image_url)} 
                                                alt={product.designation} 
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <FontAwesomeIcon icon={faSearch} size="2x" className="text-gray-300" />
                                        )}
                                        {/* Prix superposé */}
                                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                                            {parseFloat(product.prix_vente).toLocaleString('fr-FR')} F
                                        </div>
                                        {/* Badge de stock (Rouge si <= 5) */}
                                        <div className={`absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${ (product.stock_comptoir ?? 0) > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            Stock: {product.stock_comptoir ?? 0}
                                        </div>
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col justify-between">
                                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight" title={product.designation}>
                                            {product.designation}
                                        </h4>
                                        <div className="text-[10px] text-gray-400 mt-2 font-mono truncate">
                                            {product.barcode ? <><FontAwesomeIcon icon={faBarcode} /> {product.barcode}</> : product.sku}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredProducts.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                                    <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="mb-4 opacity-30"/>
                                    <p>Aucun produit ne correspond à cette recherche.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* ZONE DROITE : TICKET DE CAISSE ET ENCAISSEMENT            */}
                {/* ========================================================= */}
                <div className="w-1/3 flex flex-col bg-white shadow-2xl z-20 border-l border-gray-200">
                    
                    {/* Header : Choix du Client */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <FontAwesomeIcon icon={faUser} className="mr-1"/> Client (Optionnel)
                        </label>
                        <Select
                            options={customerOptions}
                            value={customerOptions.find(c => c.value === data.customer_id) || null}
                            onChange={(opt) => setData('customer_id', opt ? opt.value : '')}
                            placeholder="Client de passage..."
                            noOptionsMessage={() => "Aucun client trouvé"}
                            isClearable
                            className="text-sm"
                            styles={{
                                control: (base) => ({ 
                                    ...base, borderRadius: '0.5rem', borderColor: '#e5e7eb', boxShadow: 'none', 
                                    '&:hover': { borderColor: '#d1d5db' }, height: '42px'
                                })
                            }}
                            isDisabled={step === 2} // On bloque le choix du client au moment de payer
                        />
                    </div>

                    {/* Liste des articles du panier */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="bg-gray-50 p-6 rounded-full mb-4 border border-dashed border-gray-200">
                                    <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-gray-300" />
                                </div>
                                <p className="font-medium text-gray-500">Le panier est vide</p>
                                <p className="text-sm">Scannez un article pour commencer</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.product_id} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${step === 2 ? 'bg-gray-50 border-transparent opacity-80' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'}`}>
                                    <div className="flex-1 min-w-0 pr-3">
                                        <div className="font-semibold text-gray-800 text-sm truncate">{item.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {item.unit_price.toLocaleString('fr-FR')} x {item.qty}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {step === 1 ? (
                                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateQty(item.product_id, item.qty - 1); }}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all font-bold"
                                                >-</button>
                                                <span className="w-8 text-center font-mono text-sm font-bold text-gray-700">{item.qty}</span>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); updateQty(item.product_id, item.qty + 1); }}
                                                    className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all font-bold"
                                                >+</button>
                                            </div>
                                        ) : (
                                            <span className="font-mono text-sm font-bold text-gray-600">x {item.qty}</span>
                                        )}
                                        
                                        <div className="text-right min-w-[80px]">
                                            <div className="font-bold text-gray-900 text-sm">{item.sub_total.toLocaleString('fr-FR')}</div>
                                        </div>

                                        {step === 1 && (
                                            <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.product_id); }} className="text-gray-300 hover:text-red-500 transition-colors px-1">
                                                <FontAwesomeIcon icon={faTrash} size="sm" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Zone de Totaux et d'Action */}
                    <div className="border-t border-gray-200 bg-gray-50 p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
                        <div className="space-y-1 mb-5">
                            <div className="flex justify-between items-baseline pt-2">
                                <span className="text-gray-900 font-bold text-lg">Total TTC</span>
                                <span className="text-3xl font-black text-blue-600">
                                    {totals.total_ttc.toLocaleString('fr-FR')} <span className="text-sm text-gray-500 font-normal">FCFA</span>
                                </span>
                            </div>
                        </div>

                        {/* ÉTAPE 1 : BOUTON PASSER À L'ENCAISSEMENT */}
                        {step === 1 ? (
                            <button
                                onClick={() => setStep(2)}
                                disabled={cart.length === 0}
                                className={`w-full py-4 rounded-xl font-bold text-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                                    cart.length > 0
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                Encaissement
                            </button>
                        ) : (
                            /* ÉTAPE 2 : SAISIE DU PAIEMENT */
                            <div className="animate-in fade-in duration-300 space-y-4">
                                <div className="grid grid-cols-2 gap-3 p-1 bg-gray-200/50 rounded-lg">
                                    <button 
                                        type="button"
                                        onClick={() => setData('payment_mode', 'CASH')}
                                        className={`py-2 rounded-md text-sm font-medium transition-all ${data.payment_mode === 'CASH' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >Espèces (Cash)</button>
                                    <button 
                                        type="button"
                                        onClick={() => setData('payment_mode', 'MOMO')}
                                        className={`py-2 rounded-md text-sm font-medium transition-all ${data.payment_mode === 'MOMO' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >Mobile Money</button>
                                </div>
                                
                                <div className="relative">
                                    <label className="absolute -top-2 left-2 bg-gray-50 px-1 text-[10px] font-bold text-gray-500 uppercase">Montant perçu par le client</label>
                                    <input 
                                        type="number"
                                        value={data.amount_paid}
                                        onChange={(e) => setData('amount_paid', e.target.value)}
                                        className="w-full text-right font-mono text-2xl py-3 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-inner"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>

                                {/* Calcul automatique de la monnaie à rendre si le paiement est en cash */}
                                {data.amount_paid > totals.total_ttc && data.payment_mode === 'CASH' && (
                                    <div className="flex justify-between items-center bg-green-50 px-4 py-3 rounded-lg border border-green-200">
                                        <span className="font-bold text-green-800">Monnaie à rendre :</span>
                                        <span className="text-xl font-black text-green-600">
                                            {(data.amount_paid - totals.total_ttc).toLocaleString('fr-FR')} F
                                        </span>
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="col-span-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing}
                                        className="col-span-2 py-3 bg-green-600 text-white rounded-xl font-extrabold shadow-lg hover:bg-green-700 hover:shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-70 transition-all active:scale-95"
                                    >
                                        {processing ? 'En cours...' : <><FontAwesomeIcon icon={faCheck} /> Valider la Vente</>}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 text-center">
                            <button type="button" onClick={onClose} className="text-xs text-gray-400 hover:text-red-600 hover:underline transition-colors font-medium">
                                Annuler la transaction et fermer (Echap)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CreateSaleModal;