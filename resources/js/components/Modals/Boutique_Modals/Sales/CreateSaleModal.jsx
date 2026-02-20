import React, { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '../../Modal'; // Vérifiez le chemin
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
    const [step, setStep] = useState(1); // 1: Sélection, 2: Paiement
    const searchInputRef = useRef(null);

    // --- FORMULAIRE INERTIA ---
    const { data, setData, post, processing, transform, reset } = useForm({
        customer_id: '',
        payment_mode: 'cash',
        received_amount: 0,
        items: [], 
        total_ht: 0,
        total_ttc: 0,
        counter_id: userCounterId || '', 
    });

    // --- OPTIONS CLIENTS ---
    const customerOptions = useMemo(() => 
        customers.map(c => ({ value: c.id, label: c.name })), 
    [customers]);

    // --- LOGIQUE METIER ---

    // 1. Filtrage Visuel (Pour la recherche manuelle)
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const lowerQuery = searchQuery.toLowerCase();
        // On filtre pour l'affichage grille, mais la logique de scan est séparée
        return products.filter(p => 
            p.designation.toLowerCase().includes(lowerQuery) || 
            (p.sku && p.sku.toLowerCase().includes(lowerQuery)) ||
            (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
        );
    }, [products, searchQuery]);

    // 2. Initialisation et Focus
    useEffect(() => {
        if (isOpen) {
            // Focus rapide sur l'input au chargement
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            // Reset complet à la fermeture
            setCart([]);
            setStep(1);
            setSearchQuery('');
            reset();
        }
    }, [isOpen]);

    // Fonction utilitaire pour garder le focus (UX Caisse)
    const keepFocus = () => {
        // Si on n'est pas en train de cliquer sur un input ou un bouton spécifique
        if (step === 1 && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
            searchInputRef.current?.focus();
        }
    };

    // 3. Gestion du Scan (Douchette / Touche Entrée)
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Empêche le submit du formulaire global
            
            const codeToSearch = searchQuery.trim();
            if (!codeToSearch) return;

            // Recherche EXACTE prioritaire (Code-barre ou SKU)
            const exactMatch = products.find(p => 
                (p.barcode && p.barcode.toLowerCase() === codeToSearch.toLowerCase()) ||
                (p.sku && p.sku.toLowerCase() === codeToSearch.toLowerCase())
            );

            if (exactMatch) {
                addToCart(exactMatch);
                setSearchQuery(''); // On vide le champ pour le prochain scan
                // playBeep(); // Optionnel : jouer un son
            } else {
                // Si pas de match exact, on peut laisser le texte pour la recherche floue
                // ou notifier l'utilisateur :
                // Swal.fire({ toast: true, icon: 'error', title: 'Produit inconnu', position: 'top-end', showConfirmButton: false, timer: 1000 });
            }
        }
    };

    // 4. Gestion du Panier
    const addToCart = (product) => {
        const productPrice = parseFloat(product.prix_vente);
        const currentInCart = cart.find(item => item.product_id === product.id)?.qty || 0;
        
        // Validation Stock Comptoir
        if ((product.stock_comptoir ?? 0) <= currentInCart) {
            Swal.fire({
                icon: 'warning',
                title: 'Stock Insuffisant',
                text: `Stock comptoir restant : ${product.stock_comptoir ?? 0}`,
                toast: true, position: 'top-end', timer: 2000, showConfirmButton: false
            });
            return; 
        }

        setCart(prev => {
            const existing = prev.find(item => item.product_id === product.id);

            if (existing) {
                return prev.map(item => 
                    item.product_id === product.id 
                    ? { ...item, qty: item.qty + 1, sub_total: (item.qty + 1) * productPrice } 
                    : item
                );
            }
            
            return [...prev, {
                product_id: product.id,
                name: product.designation,
                sku: product.sku,
                image: product.image_url,
                qty: 1,
                unit_price: productPrice, 
                discount: 0,
                tva_rate: product.tva, 
                sub_total: productPrice
            }];
        });
    };

    const updateQty = (productId, newQty) => {
        if (newQty < 1) return;
        
        const product = products.find(p => p.id === productId);
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

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    // 5. Calculs Totaux
    const totals = useMemo(() => {
        const total_ht = cart.reduce((acc, item) => acc + item.sub_total, 0);
        const total_ttc = total_ht; 
        const total_tva = 0; // Ajuster si nécessaire
        
        return { total_ht, total_tva, total_ttc };
    }, [cart]);

    // 6. Soumission (Routes Ziggy préservées)
    const handleSubmit = (e) => {
        e.preventDefault();

        if (cart.length === 0) return Swal.fire('Erreur', 'Panier vide', 'error');
        if (!data.customer_id) return Swal.fire('Erreur', 'Sélectionnez un client', 'warning');

        transform((data) => ({
            ...data,
            items: cart.map(item => ({
                product_id: item.product_id,
                qty: item.qty,
                unit_price: item.unit_price,
                sub_total: item.sub_total,
                discount: item.discount || 0
            })),
            total_ht: totals.total_ht,
            total_ttc: totals.total_ttc,
        }));

        post(route('sales.store'), { 
            onSuccess: (page) => { 
                onClose();
                
                // Impression Ticket
                const printUrl = page.props.flash.print_url;
                if (printUrl) {
                    window.open(printUrl, 'PRINT_RECEIPT', 'height=600,width=400,top=100,left=100');
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Vente validée !',
                    text: `Total: ${totals.total_ttc.toLocaleString()} FCFA`,
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            onError: (err) => {
                console.error(err);
                Swal.fire('Erreur', 'Vérifiez les données du formulaire.', 'error');
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="full">
            <div className="flex h-[90vh] bg-gray-100 overflow-hidden font-sans" onClick={keepFocus}>
                
                {/* --- ZONE GAUCHE : CATALOGUE --- */}
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
                                placeholder="Scanner (Code-barre) ou taper pour rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown} // LE SCANNER AGIT ICI
                                autoComplete="off" // Important pour éviter les suggestions navigateur
                                autoFocus
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 hidden md:block">
                            {filteredProducts.length} articles
                        </div>
                    </div>

                    {/* Grille Produits */}
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
                                                src={`/storage/${product.image_url}`} 
                                                alt={product.designation} 
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <FontAwesomeIcon icon={faSearch} size="2x" className="text-gray-300" />
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md">
                                            {parseFloat(product.prix_vente).toLocaleString()} F
                                        </div>
                                        {/* Badge Stock */}
                                        <div className={`absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${ (product.stock_comptoir ?? 0) > 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                                    <p>Aucun produit trouvé.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- ZONE DROITE : TICKET / PANIER --- */}
                <div className="w-1/3 flex flex-col bg-white shadow-2xl z-20 border-l border-gray-200">
                    
                    {/* Header : Client */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            <FontAwesomeIcon icon={faUser} className="mr-1"/> Client
                        </label>
                        <Select
                            options={customerOptions}
                            value={customerOptions.find(c => c.value === data.customer_id)}
                            onChange={(opt) => setData('customer_id', opt ? opt.value : '')}
                            placeholder="Sélectionner un client..."
                            noOptionsMessage={() => "Aucun client trouvé"}
                            isClearable
                            className="text-sm"
                            styles={{
                                control: (base) => ({ 
                                    ...base, 
                                    borderRadius: '0.5rem', 
                                    borderColor: '#e5e7eb', 
                                    boxShadow: 'none', 
                                    '&:hover': { borderColor: '#d1d5db' },
                                    height: '42px'
                                })
                            }}
                        />
                    </div>

                    {/* Liste Articles */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                <div className="bg-gray-50 p-6 rounded-full mb-4">
                                    <FontAwesomeIcon icon={faShoppingCart} size="2x" className="text-gray-400" />
                                </div>
                                <p className="font-medium text-gray-500">Panier vide</p>
                                <p className="text-sm">Scannez un article pour commencer</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.product_id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <div className="font-semibold text-gray-800 text-sm truncate">{item.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {item.unit_price.toLocaleString()} x {item.qty}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateQty(item.product_id, item.qty - 1); }}
                                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                            >-</button>
                                            <span className="w-8 text-center font-mono text-sm font-bold text-gray-700">{item.qty}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateQty(item.product_id, item.qty + 1); }}
                                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                                            >+</button>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <div className="font-bold text-gray-900 text-sm">{item.sub_total.toLocaleString()}</div>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.product_id); }} className="text-gray-300 hover:text-red-500 transition-colors px-1">
                                            <FontAwesomeIcon icon={faTrash} size="sm" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer Totaux & Paiement */}
                    <div className="border-t border-gray-200 bg-gray-50 p-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="space-y-1 mb-5">
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Total HT</span>
                                <span>{totals.total_ht.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 mt-2">
                                <span className="text-gray-900 font-bold text-lg">Total TTC</span>
                                <span className="text-2xl font-extrabold text-blue-600">{totals.total_ttc.toLocaleString()} <span className="text-sm text-gray-500 font-normal">FCFA</span></span>
                            </div>
                        </div>

                        {step === 1 ? (
                            <button
                                onClick={() => setStep(2)}
                                disabled={cart.length === 0 || !data.customer_id}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                                    cart.length > 0 && data.customer_id 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FontAwesomeIcon icon={faMoneyBillWave} />
                                Encaisser
                            </button>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                                {/* Modes de paiement */}
                                <div className="grid grid-cols-2 gap-3 p-1 bg-gray-200/50 rounded-lg">
                                    <button 
                                        type="button"
                                        onClick={() => setData('payment_mode', 'cash')}
                                        className={`py-2 rounded-md text-sm font-medium transition-all ${data.payment_mode === 'cash' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >Espèces</button>
                                    <button 
                                        type="button"
                                        onClick={() => setData('payment_mode', 'mobile')}
                                        className={`py-2 rounded-md text-sm font-medium transition-all ${data.payment_mode === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >Mobile Money</button>
                                </div>
                                
                                {/* Montant Reçu */}
                                <div className="relative">
                                    <label className="absolute -top-2 left-2 bg-gray-50 px-1 text-[10px] font-bold text-gray-500 uppercase">Perçu</label>
                                    <input 
                                        type="number"
                                        value={data.received_amount}
                                        onChange={(e) => setData('received_amount', e.target.value)}
                                        className="w-full text-right font-mono text-xl py-3 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>

                                {/* Rendu Monnaie */}
                                {data.received_amount > totals.total_ttc && (
                                    <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                        <span className="text-sm font-medium text-green-700">À Rendre :</span>
                                        <span className="text-lg font-bold text-green-700">
                                            {(data.received_amount - totals.total_ttc).toLocaleString()} FCFA
                                        </span>
                                    </div>
                                )}

                                {/* Actions Finales */}
                                <div className="grid grid-cols-3 gap-3 pt-2">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="col-span-1 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={processing}
                                        className="col-span-2 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 hover:shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {processing ? 'Traitement...' : <><FontAwesomeIcon icon={faCheck} /> Valider la Vente</>}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 text-center">
                            <button onClick={onClose} className="text-xs text-gray-400 hover:text-red-600 hover:underline transition-colors">
                                Annuler la transaction (Echap)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CreateSaleModal;