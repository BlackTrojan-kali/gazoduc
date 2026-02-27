import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; 
import InputField from '../../../form/input/InputField'; 
import Button from '../../../ui/button/Button'; 
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, 
    faTimes, 
    faClipboardCheck, 
    faTruckLoading, 
    faStore,
    faBoxOpen,
    faCheckCircle,
    faTimesCircle,
    faFileInvoice
} from '@fortawesome/free-solid-svg-icons';

const ReceiptFormModal = ({ 
    isOpen, 
    onClose, 
    receipt = null, 
    purchaseOrders = [], // Les bons de commande au statut 'sent' ou 'partial' (avec leurs lignes et produits)
    boutiques = [],
    routeName = 'receipts.store' 
}) => {
    const isEditMode = !!receipt;

    // --- Options pour React-Select ---
    // On attache l'objet PO complet (poData) pour pouvoir extraire ses lignes lors de la sélection
    const poOptions = purchaseOrders.map(po => ({ 
        value: po.id, 
        label: `${po.reference} - ${po.supplier?.name || 'Fournisseur inconnu'}`,
        poData: po 
    }));
    const boutiqueOptions = boutiques.map(b => ({ value: b.id, label: b.name }));
    
    const statusOptions = [
        { value: 'pending', label: 'En cours d\'inspection (Brouillon)' },
        { value: 'validated', label: 'Validé (Mise à jour du stock)' }
    ];

    // Initialisation du formulaire
    const { data, setData, post, put, processing, errors, reset } = useForm({
        purchase_order_id: receipt?.purchase_order_id || '',
        boutique_id: receipt?.boutique_id || '',
        reference: receipt?.reference || '',
        received_at: receipt?.received_at ? receipt.received_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: receipt?.status || 'pending',
        lines: receipt?.lines || [], // Les lignes de réception
    });

    // --- Gestion de la sélection du Bon de Commande ---
    const handlePOSelect = (selected) => {
        if (selected && selected.poData) {
            const po = selected.poData;
            
            // On auto-remplit la boutique et on prépare les lignes à réceptionner
            const expectedLines = po.lines.map(line => {
                // Calcul de ce qu'il reste à recevoir (au cas où c'est une livraison partielle)
                const remainingToReceive = line.quantity_ordered - (line.quantity_recieved || 0);
                
                return {
                    product_id: line.product_id,
                    designation: line.product ? line.product.designation : `Produit #${line.product_id}`,
                    expected: remainingToReceive, // Information visuelle
                    quantity_accepted: remainingToReceive > 0 ? remainingToReceive : 0, // Par défaut, on suppose qu'on reçoit tout ce qui manque
                    quantity_rejected: 0
                };
            });

            setData(prevData => ({
                ...prevData,
                purchase_order_id: po.id,
                boutique_id: po.boutique_id, // La réception se fait dans la boutique prévue par la commande
                lines: expectedLines
            }));
        } else {
            setData(prevData => ({
                ...prevData,
                purchase_order_id: '',
                lines: []
            }));
        }
    };

    // --- Mise à jour dynamique des quantités saisies ---
    const handleLineChange = (index, field, value) => {
        const updatedLines = [...data.lines];
        updatedLines[index][field] = value === '' ? '' : parseFloat(value);
        setData('lines', updatedLines);
    };

    // Synchronisation à l'ouverture
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                // Formatage si on est en édition d'une réception existante
                const formattedLines = receipt.lines ? receipt.lines.map(line => ({
                    id: line.id,
                    product_id: line.product_id,
                    designation: line.product ? line.product.designation : `Produit #${line.product_id}`,
                    expected: 0, // En édition, on ne recalcule pas l'attendu de la même manière
                    quantity_accepted: parseFloat(line.quantity_accepted || 0),
                    quantity_rejected: parseFloat(line.quantity_rejected || 0)
                })) : [];

                setData({
                    purchase_order_id: receipt.purchase_order_id || '',
                    boutique_id: receipt.boutique_id || '',
                    reference: receipt.reference || '',
                    received_at: receipt.received_at ? receipt.received_at.split('T')[0] : '',
                    status: receipt.status || 'pending',
                    lines: formattedLines,
                });
            } else {
                reset(); 
            }
        }
    }, [isOpen, isEditMode, receipt]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.lines.length === 0) {
            alert("Veuillez sélectionner un bon de commande valide contenant des articles.");
            return;
        }

        if (isEditMode) {
            put(route('receipts.update', receipt.id), {
                onSuccess: () => onClose(),
            });
        } else {
            post(route(routeName), {
                onSuccess: () => onClose(),
            });
        }
    };

    const modalTitle = isEditMode ? "Modifier le Bon de Réception" : "Nouvelle Réception de Marchandise";
    
    // Verrouillage total si le statut est déjà validé (le stock a déjà bougé, on ne touche plus !)
    const isLocked = isEditMode && receipt.status === 'validated';

    // --- Valeurs sélectionnées pour React-Select ---
    const currentPO = poOptions.find(opt => opt.value === data.purchase_order_id) || null;
    const currentBoutique = boutiqueOptions.find(opt => opt.value === data.boutique_id) || null;
    const currentStatus = statusOptions.find(opt => opt.value === data.status) || null;

    // --- Styles React-Select (Dark Mode) ---
    const rsClassNames = {
        control: (state) => `bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm min-h-[38px] transition-colors ${state.isFocused ? 'ring-1 ring-brand-500 border-brand-500' : 'hover:border-gray-400 dark:hover:border-gray-500'}`,
        menu: () => 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md mt-1 z-50 text-sm',
        option: (state) => `px-3 py-2 cursor-pointer ${state.isSelected ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium' : state.isFocused ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`,
        singleValue: () => 'text-gray-900 dark:text-gray-100',
        placeholder: () => 'text-gray-400 dark:text-gray-500',
    };
    const rsStyles = {
        control: (base) => ({ ...base, backgroundColor: 'white', border: 'none', boxShadow: 'none', minHeight: '38px' }),
        menu: (base) => ({ ...base, backgroundColor: 'white' }),
        option: (base) => ({ ...base, backgroundColor: 'white', color: 'inherit' }),
        singleValue: (base) => ({ ...base, color: 'inherit' })
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="7xl">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
                    
                    {/* COLONNE GAUCHE : CONTRÔLE DES PRODUITS (7 colonnes sur 12) */}
                    <div className="lg:col-span-7 flex flex-col space-y-4 border-r-0 lg:border-r border-gray-200 dark:border-gray-700 lg:pr-6">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                            <FontAwesomeIcon icon={faBoxOpen} className="text-brand-500"/>
                            Contrôle Quantitatif
                        </h3>

                        {!data.purchase_order_id ? (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 h-64 text-gray-500 dark:text-gray-400 p-6 text-center">
                                <FontAwesomeIcon icon={faTruckLoading} className="text-4xl mb-3 text-gray-300 dark:text-gray-600" />
                                <p>Sélectionnez un Bon de Commande à droite pour afficher la liste des articles attendus.</p>
                            </div>
                        ) : (
                            <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 h-96 overflow-y-auto shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Désignation</th>
                                            {!isEditMode && <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Attendu</th>}
                                            <th className="px-4 py-3 text-center text-xs font-bold text-green-600 uppercase">Accepté (Bon)</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-red-600 uppercase">Rejeté (Avarié)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {data.lines.map((line, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                    {line.designation}
                                                </td>
                                                
                                                {!isEditMode && (
                                                    <td className="px-4 py-3 text-sm text-center font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                                                        {line.expected}
                                                    </td>
                                                )}

                                                <td className="px-4 py-2 text-center w-32">
                                                    <div className="relative">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="absolute left-2.5 top-2.5 text-green-500 text-sm" />
                                                        <input 
                                                            type="number" min="0" step="0.01"
                                                            value={line.quantity_accepted}
                                                            onChange={(e) => handleLineChange(index, 'quantity_accepted', e.target.value)}
                                                            className="pl-8 w-full rounded-md border-green-300 dark:border-green-800 dark:bg-green-900/20 text-sm focus:ring-green-500 focus:border-green-500 dark:text-green-300"
                                                            disabled={isLocked}
                                                        />
                                                    </div>
                                                </td>

                                                <td className="px-4 py-2 text-center w-32">
                                                    <div className="relative">
                                                        <FontAwesomeIcon icon={faTimesCircle} className="absolute left-2.5 top-2.5 text-red-400 text-sm" />
                                                        <input 
                                                            type="number" min="0" step="0.01"
                                                            value={line.quantity_rejected}
                                                            onChange={(e) => handleLineChange(index, 'quantity_rejected', e.target.value)}
                                                            className="pl-8 w-full rounded-md border-red-200 dark:border-red-900/50 dark:bg-red-900/10 text-sm focus:ring-red-500 focus:border-red-500 dark:text-red-300"
                                                            disabled={isLocked}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* COLONNE DROITE : INFO DE LA RÉCEPTION (5 colonnes sur 12) */}
                    <div className="lg:col-span-5 flex flex-col space-y-5">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2 border-b dark:border-gray-700 pb-2">
                            <FontAwesomeIcon icon={faClipboardCheck} className="text-brand-500"/>
                            Détails de Réception
                        </h3>

                        <div className="space-y-4">
                            
                            {/* Choix du Bon de Commande */}
                            <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl border border-brand-200 dark:border-brand-800">
                                <label className="block text-xs font-semibold text-brand-800 dark:text-brand-300 mb-1 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFileInvoice} />
                                    Lier à un Bon de Commande <span className="text-red-500">*</span>
                                </label>
                                <Select 
                                    options={poOptions} 
                                    value={currentPO}
                                    onChange={handlePOSelect}
                                    placeholder="Ex: PO-202602-0001 - Nestlé..."
                                    classNames={{...rsClassNames, control: (state) => `${rsClassNames.control(state)} border-brand-300 ${errors.purchase_order_id ? 'border-red-500' : ''}`}}
                                    styles={rsStyles} 
                                    isClearable 
                                    isDisabled={isEditMode} // On ne change pas le BC lié une fois la réception créée
                                />
                                {errors.purchase_order_id && <p className="mt-1 text-xs text-red-600">{errors.purchase_order_id}</p>}
                                {!isEditMode && (
                                    <p className="mt-2 text-xs text-brand-600 dark:text-brand-400 italic">
                                        Sélectionner un Bon de Commande chargera automatiquement les produits attendus.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faStore} className="text-gray-400" />
                                    Lieu de déchargement <span className="text-red-500">*</span>
                                </label>
                                <Select 
                                    options={boutiqueOptions} 
                                    value={currentBoutique}
                                    onChange={(s) => setData('boutique_id', s ? s.value : '')}
                                    classNames={{...rsClassNames, control: (state) => `${rsClassNames.control(state)} ${errors.boutique_id ? 'border-red-500' : ''}`}}
                                    styles={rsStyles} 
                                    isClearable 
                                    isDisabled={isLocked}
                                />
                                {errors.boutique_id && <p className="mt-1 text-xs text-red-600">{errors.boutique_id}</p>}
                            </div>

                            <InputField
                                id="received_at" label="Date de Réception" type="date"
                                value={data.received_at} onChange={(e) => setData('received_at', e.target.value)}
                                errorMessage={errors.received_at} required disabled={isLocked}
                            />

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    Statut (Mise à jour du Stock)
                                </label>
                                <Select 
                                    options={statusOptions} value={currentStatus}
                                    onChange={(s) => setData('status', s ? s.value : 'pending')}
                                    classNames={rsClassNames} styles={rsStyles} isDisabled={isLocked} 
                                />
                                {data.status === 'validated' && (
                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/30 p-2 rounded">
                                        Attention : Enregistrer avec ce statut augmentera immédiatement le stock physique de la boutique.
                                    </p>
                                )}
                            </div>

                            <InputField
                                id="reference" label="Réf. Bordereau de Livraison (BL)" type="text"
                                value={data.reference} onChange={(e) => setData('reference', e.target.value)}
                                errorMessage={errors.reference} placeholder="Le numéro inscrit sur le papier du livreur" 
                                disabled={isLocked}
                            />

                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl mt-auto">
                    <Button type="button" variant="secondary" onClick={onClose} className="inline-flex items-center">
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Fermer
                    </Button>
                    {!isLocked && (
                        <Button type="submit" disabled={processing} className="inline-flex items-center bg-brand-600 text-white hover:bg-brand-700">
                            <FontAwesomeIcon icon={faSave} className="mr-2" />
                            {processing ? 'Enregistrement...' : (data.status === 'validated' ? 'Valider & Entrer en Stock' : 'Enregistrer le brouillon')}
                        </Button>
                    )}
                </div>

            </form>
        </Modal>
    );
};

export default ReceiptFormModal;