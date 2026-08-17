import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../../Modal'; 
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMoneyBillWave, faCheck, faSearch, faFileInvoiceDollar, faLink 
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Notez le changement de nom de la prop pour la clarté : salesToAssociate
const CreatePaymentModal = ({ isOpen, onClose, salesToAssociate = [], counterId }) => {
    
    const [search, setSearch] = useState('');
    
    const { data, setData, post, processing, reset, errors } = useForm({
        amount: 0,
        reference: '',
        label: 'Règlement Factures',
        selected_sales: [], 
        counter_id: counterId || '',
    });

    // Filtre de recherche locale
    const filteredSales = useMemo(() => {
        if (!search) return salesToAssociate;
        const lowerSearch = search.toLowerCase();
        return salesToAssociate.filter(sale => 
            sale.facture_code.toLowerCase().includes(lowerSearch) ||
            (sale.customer?.name || '').toLowerCase().includes(lowerSearch)
        );
    }, [salesToAssociate, search]);

    // Calcul automatique du montant total basé sur la sélection
    useEffect(() => {
        const total = salesToAssociate
            .filter(sale => data.selected_sales.includes(sale.id))
            .reduce((sum, sale) => sum + parseFloat(sale.total_ttc), 0); // On prend le TTC complet car on règle la facture
        
        setData('amount', total);
    }, [data.selected_sales]);

    const toggleSale = (saleId) => {
        const currentSelection = [...data.selected_sales];
        if (currentSelection.includes(saleId)) {
            setData('selected_sales', currentSelection.filter(id => id !== saleId));
        } else {
            setData('selected_sales', [...currentSelection, saleId]);
        }
    };

    // Fonction pratique pour tout sélectionner
    const selectAll = () => {
        if (data.selected_sales.length === filteredSales.length) {
            setData('selected_sales', []);
        } else {
            setData('selected_sales', filteredSales.map(s => s.id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.selected_sales.length === 0) {
            Swal.fire('Attention', 'Veuillez sélectionner au moins une facture à associer.', 'warning');
            return;
        }

        post(route('product-sales.payment'), {
            onSuccess: () => {
                Swal.fire('Succès', 'Versement créé et factures associées !', 'success');
                reset();
                onClose();
            },
            onError: () => {
                Swal.fire('Erreur', 'Vérifiez les données.', 'error');
            }
        });
    };

    // Reset à l'ouverture
    useEffect(() => {
        if (!isOpen) {
            reset();
            setSearch('');
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl">
            <div className="flex h-[85vh] bg-gray-100 dark:bg-gray-900 overflow-hidden font-sans text-sm">
                
                {/* --- GAUCHE : LISTE DES VENTES EN ATTENTE D'ASSOCIATION --- */}
                <div className="w-3/5 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faLink} className="text-orange-500"/>
                                Factures non associées
                            </h3>
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold">
                                {salesToAssociate.length} en attente
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input 
                                    type="text" 
                                    placeholder="Rechercher..."
                                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 focus:ring-orange-500 text-xs"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <FontAwesomeIcon icon={faSearch} className="absolute left-2.5 top-2.5 text-gray-400" />
                            </div>
                            <button 
                                onClick={selectAll}
                                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-300"
                            >
                                {data.selected_sales.length === filteredSales.length ? 'Tout désél.' : 'Tout sél.'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50/50 dark:bg-gray-900/50">
                        {filteredSales.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-4xl mb-2 opacity-30" />
                                <p>Aucune facture en attente d'association.</p>
                            </div>
                        ) : (
                            filteredSales.map(sale => {
                                const isSelected = data.selected_sales.includes(sale.id);
                                return (
                                    <div 
                                        key={sale.id}
                                        onClick={() => toggleSale(sale.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center group ${
                                            isSelected 
                                            ? 'bg-orange-50 border-orange-500 shadow-sm dark:bg-orange-900/20 dark:border-orange-500' 
                                            : 'bg-white border-gray-200 hover:border-orange-300 dark:bg-gray-800 dark:border-gray-700'
                                        }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                                                {sale.facture_code}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(sale.created_at).toLocaleString('fr-FR')}
                                            </span>
                                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                                                {sale.customer?.name || 'Client de passage'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900 dark:text-white text-base">
                                                {Number(sale.total_ttc).toLocaleString()} F
                                            </div>
                                            <div className="mt-2">
                                                <div className={`w-5 h-5 rounded border ml-auto flex items-center justify-center transition-colors ${
                                                    isSelected ? 'bg-orange-600 border-orange-600 text-white' : 'border-gray-300'
                                                }`}>
                                                    {isSelected && <FontAwesomeIcon icon={faCheck} size="xs" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* --- DROITE : FORMULAIRE ENCAISSEMENT --- */}
                <div className="w-2/5 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
                    <div className="p-6 flex-1 flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                            <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-600"/>
                            Encaisser & Associer
                        </h2>

                        <div className="space-y-6">
                            
                            {/* Recap */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800/50">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Factures sélectionnées</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{data.selected_sales.length}</span>
                                </div>
                                <div className="border-t border-orange-200 dark:border-orange-700 my-2"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-medium text-orange-800 dark:text-orange-300 uppercase">Total à payer</span>
                                    <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
                                        {Number(data.amount).toLocaleString()} <span className="text-sm">FCFA</span>
                                    </span>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Montant Reçu</label>
                                <input 
                                    type="number" 
                                    value={data.amount}
                                    // On laisse l'utilisateur modifier si besoin (ex: paiement partiel, mais ici on vise l'association)
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="block w-full text-right text-xl font-mono font-bold p-3 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                />
                                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Mode & Référence</label>
                                <div className="grid grid-cols-1 gap-3">
                                    <input 
                                        type="text" 
                                        value={data.reference}
                                        onChange={(e) => setData('reference', e.target.value)}
                                        className="block w-full p-2.5 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                        placeholder="Ex: Chèque n°... / Transaction ID..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Note (Optionnel)</label>
                                <textarea 
                                    rows="2"
                                    value={data.label}
                                    onChange={(e) => setData('label', e.target.value)}
                                    className="block w-full p-2.5 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1"></div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 font-medium transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={processing || data.selected_sales.length === 0}
                                className="py-3 px-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Traitement...' : 'Valider Versement'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CreatePaymentModal;