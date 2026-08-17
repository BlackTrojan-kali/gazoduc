import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner, 
    faFileInvoiceDollar, 
    faMoneyBillWave,
    faCheckCircle,
    faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../Modal.jsx'; // Assurez-vous que le chemin est correct

const PaymentModal = ({ isOpen, onClose, clients, banks, sales }) => {
    // --- 1. Initialisation du formulaire ---
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        client_id: '',
        bank_id: '',
        type: 'vente',
        amount: '',
        notes: '',
        amount_notes: '',
        isComplement: false,
        selected_sale_ids: [],
    });

    // --- 2. Logique de Filtrage ---
    const availableInvoices = useMemo(() => {
        if (data.isComplement) return [];
        if (!data.client_id || !data.type) return [];
        
        return sales.filter(sale => 
            String(sale.client_id) === String(data.client_id) && 
            sale.status === 'pending' && 
            sale.invoice_type === data.type 
        );
    }, [sales, data.client_id, data.type, data.isComplement]);

    const totalSelectedAmount = useMemo(() => {
        if (data.isComplement) return 0;
        return availableInvoices
            .filter(sale => data.selected_sale_ids.includes(sale.id))
            .reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    }, [availableInvoices, data.selected_sale_ids, data.isComplement]);

    // Calculs financiers
    const enteredAmount = parseFloat(data.amount) || 0;
    const notesAmount = parseFloat(data.amount_notes) || 0;
    const totalAvailable = enteredAmount + notesAmount;
    const remainingToAllocate = totalAvailable - totalSelectedAmount;

    // --- 3. Gestionnaires ---
    useEffect(() => {
        if (!isOpen) {
            reset();
            clearErrors();
        }
    }, [isOpen]);

    const toggleInvoice = (saleId) => {
        if (data.isComplement) return;
        const currentIds = [...data.selected_sale_ids];
        if (currentIds.includes(saleId)) {
            setData('selected_sale_ids', currentIds.filter(id => id !== saleId));
        } else {
            setData('selected_sale_ids', [...currentIds, saleId]);
        }
    };

    const handleAutoSelect = () => {
        if (data.isComplement || totalAvailable <= 0) return;
        
        let currentSum = 0;
        const idsToSelect = [];

        // On peut ajouter un tri ici si nécessaire (ex: sales.sort...)
        for (const sale of availableInvoices) {
            const saleAmount = parseFloat(sale.total_amount);
            if (currentSum + saleAmount <= totalAvailable + 100) { 
                idsToSelect.push(sale.id);
                currentSum += saleAmount;
            }
        }
        setData('selected_sale_ids', idsToSelect);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.client_id) return Swal.fire('Erreur', 'Veuillez sélectionner un client.', 'error');
        if (!data.bank_id) return Swal.fire('Erreur', 'Veuillez sélectionner une banque.', 'error');
        if (enteredAmount <= 0) return Swal.fire('Erreur', 'Le montant versé doit être positif.', 'error');

        if (!data.isComplement && Math.abs(remainingToAllocate) > 100) {
             Swal.fire({
                title: 'Écart détecté',
                html: `
                    <div class="text-left">
                        <p>Total Disponible : <b>${totalAvailable.toLocaleString()}</b></p>
                        <p>Total Factures : <b>${totalSelectedAmount.toLocaleString()}</b></p>
                        <p class="mt-2 text-sm text-gray-500">L'écart (${remainingToAllocate.toLocaleString()}) sera considéré comme un acompte ou un trop-perçu.</p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui, valider',
                cancelButtonText: 'Corriger'
            }).then((result) => {
                if (result.isConfirmed) submitData();
            });
        } else {
            submitData();
        }
    };

    const submitData = () => {
        post(route('payments.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Enregistré !',
                    text: data.isComplement 
                        ? 'Versement complémentaire ajouté au solde.' 
                        : 'Versement enregistré et factures mises à jour.',
                    timer: 2000,
                    showConfirmButton: false
                });
                onClose();
            },
            onError: (errors) => {
                console.error(errors);
                Swal.fire('Erreur', 'Veuillez vérifier les champs.', 'error');
            }
        });
    };

    // --- 4. Styles ---
    const isDark = document.documentElement.classList.contains('dark');
    
    const customSelectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: isDark ? '#1F2937' : '#fff',
            borderColor: state.isFocused ? '#3B82F6' : (isDark ? '#374151' : '#D1D5DB'),
            color: isDark ? '#fff' : '#000',
            minHeight: '42px'
        }),
        menu: (base) => ({ ...base, backgroundColor: isDark ? '#1F2937' : '#fff', zIndex: 9999 }),
        singleValue: (base) => ({ ...base, color: isDark ? '#fff' : '#000' }),
        input: (base) => ({ ...base, color: isDark ? '#fff' : '#000' }),
        placeholder: (base) => ({ ...base, color: isDark ? '#9CA3AF' : '#6B7280' }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? (isDark ? '#374151' : '#F3F4F6') : 'transparent',
            color: state.isSelected ? '#fff' : (isDark ? '#fff' : '#000'),
            cursor: 'pointer'
        }),
    };

    const clientOptions = clients.map(c => ({ value: String(c.id), label: c.name }));
    const bankOptions = banks.map(b => ({ value: String(b.id), label: b.name }));

    return (
        // CORRECTION MAJEURE ICI : maxWidth="7xl"
        <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer un Règlement" maxWidth="7xl">
            
            {/* Conteneur principal - Hauteur minimale pour éviter l'effet tassé */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
                
                {/* --- GAUCHE : FORMULAIRE (4/12) --- */}
                <div className="lg:col-span-4 space-y-6 border-r border-gray-100 dark:border-gray-700 pr-0 lg:pr-8 flex flex-col">
                    
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <FontAwesomeIcon icon={faMoneyBillWave} />
                        </span>
                        Détails du versement
                    </h3>

                    <div className="space-y-5 flex-1">
                        {/* Client */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Client</label>
                            <Select
                                options={clientOptions}
                                styles={customSelectStyles}
                                placeholder="Rechercher..."
                                value={clientOptions.find(c => c.value === data.client_id)}
                                onChange={(opt) => {
                                    setData(d => ({ ...d, client_id: opt?.value || '', selected_sale_ids: [] }));
                                }}
                            />
                            {errors.client_id && <span className="text-red-500 text-xs mt-1 block">{errors.client_id}</span>}
                        </div>

                        {/* Banque */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Banque</label>
                            <Select
                                options={bankOptions}
                                styles={customSelectStyles}
                                placeholder="Rechercher..."
                                value={bankOptions.find(b => b.value === data.bank_id)}
                                onChange={(opt) => setData('bank_id', opt?.value || '')}
                            />
                            {errors.bank_id && <span className="text-red-500 text-xs mt-1 block">{errors.bank_id}</span>}
                        </div>

                        {/* Type & Complément */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Type</label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData(d => ({ ...d, type: e.target.value, selected_sale_ids: [] }))}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 px-3 text-sm dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="vente">Vente</option>
                                    <option value="consigne">Consigne</option>
                                </select>
                            </div>
                            <div className="flex flex-col justify-end">
                                <label className="flex items-center cursor-pointer p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-gray-50/50 dark:bg-gray-800/50 h-[42px]">
                                    <input 
                                        type="checkbox" 
                                        checked={data.isComplement}
                                        onChange={(e) => setData(d => ({ ...d, isComplement: e.target.checked, selected_sale_ids: [] }))}
                                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 select-none">
                                        Complément ?
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Montants (Cash + Justifié) */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Montant Versé (XAF)
                                </label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="0"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-3 px-4 text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-gray-300"
                                />
                                {errors.amount && <span className="text-red-500 text-xs mt-1 block">{errors.amount}</span>}
                            </div>

                            {/* Montant Justifié (Notes) */}
                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        + Montant Justifié
                                    </label>
                                    <span className="text-[10px] text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-600">Retenue, Frais...</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <input
                                        type="number"
                                        value={data.amount_notes}
                                        onChange={(e) => setData('amount_notes', e.target.value)}
                                        placeholder="Montant"
                                        className="col-span-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Motif (ex: Retenue 5%)"
                                        className="col-span-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2.5 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sommaire Rapide */}
                    <div className={`p-5 rounded-xl border-l-[6px] shadow-md transition-all duration-300 transform ${
                        data.isComplement 
                            ? 'bg-purple-50 border-purple-500 text-purple-900' 
                            : remainingToAllocate === 0 
                                ? 'bg-green-50 border-green-500 text-green-900' 
                                : 'bg-yellow-50 border-yellow-500 text-yellow-900'
                    }`}>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                                {data.isComplement ? 'Crédit Ajouté' : 'Reste à attribuer'}
                            </span>
                            {remainingToAllocate === 0 && !data.isComplement && (
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-xl" />
                            )}
                        </div>
                        <span className="block text-3xl font-extrabold mt-1 tracking-tight">
                            {data.isComplement 
                                ? totalAvailable.toLocaleString('fr-FR') 
                                : remainingToAllocate.toLocaleString('fr-FR')
                            } <span className="text-sm font-medium opacity-60">XAF</span>
                        </span>
                    </div>

                </div>

                {/* --- DROITE : SÉLECTION DES FACTURES (8/12) --- */}
                <div className={`lg:col-span-8 flex flex-col h-full relative transition-all duration-300 ${data.isComplement ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                    
                    {data.isComplement && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 text-center transform scale-110">
                                <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                    <FontAwesomeIcon icon={faMoneyBillWave} />
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Mode Complémentaire</h4>
                                <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
                                    Ce versement sera ajouté au solde du client<br/>sans être lié à une facture spécifique.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-3">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                            </span>
                            Factures <span className="capitalize text-blue-600 bg-blue-50 px-2 rounded-md">"{data.type}"</span>
                            <span className="ml-2 px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-600">
                                {availableInvoices.length} disponibles
                            </span>
                        </h3>
                        
                        <button 
                            type="button"
                            onClick={handleAutoSelect}
                            className="inline-flex items-center gap-2 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg font-bold transition-colors uppercase tracking-wide"
                            title="Sélectionne automatiquement pour atteindre le montant"
                        >
                            <span>✨</span> Sélection Auto
                        </button>
                    </div>

                    {/* Liste Scrollable */}
                    <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-inner custom-scrollbar">
                        {availableInvoices.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                <thead className="bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur sticky top-0 z-10">
                                    <tr>
                                        <th className="px-5 py-4 w-14 text-center">
                                            <span className="sr-only">Selection</span>
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Référence</th>
                                        <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Montant Dû</th>
                                        <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {availableInvoices.map((sale) => {
                                        const isSelected = data.selected_sale_ids.includes(sale.id);
                                        return (
                                            <tr 
                                                key={sale.id} 
                                                onClick={() => toggleInvoice(sale.id)}
                                                className={`group cursor-pointer transition-all duration-200 ${
                                                    isSelected 
                                                        ? 'bg-blue-50/80 dark:bg-blue-900/20' 
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                                }`}
                                            >
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                                        isSelected 
                                                            ? 'bg-blue-600 border-blue-600 text-white scale-110' 
                                                            : 'bg-white border-gray-300 text-transparent group-hover:border-blue-400'
                                                    }`}>
                                                        <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 dark:text-white">
                                                    #{sale.invoice_number || sale.id}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-right font-mono font-medium text-gray-700 dark:text-gray-300">
                                                    {parseFloat(sale.total_amount).toLocaleString('fr-FR')}
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    {isSelected ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-sm">
                                                            À Payer
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                            En attente
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-4 text-4xl opacity-50">
                                    <FontAwesomeIcon icon={faFileInvoiceDollar} />
                                </div>
                                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                    {!data.client_id 
                                        ? "Sélectionnez un client pour voir ses factures." 
                                        : `Aucune facture "${data.type}" en attente.`}
                                </p>
                                <p className="text-sm text-gray-400 mt-2">Les factures soldées n'apparaissent pas ici.</p>
                            </div>
                        )}
                    </div>

                    {/* Total Sélectionné */}
                    <div className="mt-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-5 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                        <span className="text-base font-medium text-gray-600 dark:text-gray-300">Total à lettrer :</span>
                        <div className="text-right">
                            <span className="block text-3xl font-extrabold text-blue-600 dark:text-blue-400 leading-none tracking-tight">
                                {totalSelectedAmount.toLocaleString('fr-FR')} <span className="text-base text-gray-400 font-normal">XAF</span>
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- FOOTER MODAL --- */}
            <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 transition-colors"
                    disabled={processing}
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={processing}
                    className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                    {processing ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Traitement...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faCheckCircle} /> Enregistrer le versement
                        </>
                    )}
                </button>
            </div>

        </Modal>
    );
};

export default PaymentModal;