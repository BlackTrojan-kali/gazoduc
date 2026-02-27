import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; // Adaptez le chemin selon votre structure
import InputField from '../../../form/input/InputField'; // Adaptez le chemin
import Button from '../../../ui/button/Button'; // Adaptez le chemin
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faBuilding, faAddressCard } from '@fortawesome/free-solid-svg-icons';

const SupplierFormModal = ({ 
    isOpen, 
    onClose, 
    supplier = null, 
    routeName = 'suppliers.store' 
}) => {
    const isEditMode = !!supplier;

    // Initialisation du formulaire avec Inertia
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: supplier?.name || '',
        contact_name: supplier?.contact_name || '',
        phone: supplier?.phone || '',
        tax_id: supplier?.tax_id || '',
        address: supplier?.address || '',
        payment_terms: supplier?.payment_terms || '',
    });

    // Synchronisation des données à l'ouverture de la modale
    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setData({
                    name: supplier.name || '',
                    contact_name: supplier.contact_name || '',
                    phone: supplier.phone || '',
                    tax_id: supplier.tax_id || '',
                    address: supplier.address || '',
                    payment_terms: supplier.payment_terms || '',
                });
            } else {
                reset(); 
            }
        }
    }, [isOpen, isEditMode, supplier]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditMode) {
            put(route('suppliers.update', supplier.id), {
                onSuccess: () => onClose(),
                onError: (err) => console.error("Erreur update fournisseur :", err),
            });
        } else {
            post(route(routeName), {
                onSuccess: () => onClose(),
                onError: (err) => console.error("Erreur création fournisseur :", err),
            });
        }
    };

    const modalTitle = isEditMode ? "Modifier le Fournisseur" : "Nouveau Fournisseur";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <form onSubmit={handleSubmit} className="p-4">
                
                {/* Section : Informations de l'entreprise */}
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBuilding} />
                    Informations de l'entreprise
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="md:col-span-2">
                        <InputField
                            id="name"
                            label="Raison Sociale / Nom"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            errorMessage={errors.name}
                            required
                            autoFocus
                            placeholder="Ex: Brasseries du Cameroun, Nestlé..."
                        />
                    </div>
                    
                    <InputField
                        id="tax_id"
                        label="Numéro de Contribuable (NIU)"
                        type="text"
                        value={data.tax_id}
                        onChange={(e) => setData('tax_id', e.target.value)}
                        errorMessage={errors.tax_id}
                        placeholder="Ex: M0123456789"
                    />

                    <div>
                        <label htmlFor="payment_terms" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Conditions de Paiement
                        </label>
                        <select
                            id="payment_terms"
                            value={data.payment_terms}
                            onChange={(e) => setData('payment_terms', e.target.value)}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm transition-colors 
                                bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 
                                text-gray-900 dark:text-white focus:border-brand-500 focus:ring-brand-500
                                ${errors.payment_terms ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`
                            }
                        >
                            <option value="">Sélectionnez une condition...</option>
                            <option value="comptant">Comptant (À la livraison)</option>
                            <option value="avance_50">Avance 50%, Solde à la livraison</option>
                            <option value="15_jours">Paiement à 15 jours</option>
                            <option value="30_jours">Paiement à 30 jours (Fin de mois)</option>
                            <option value="60_jours">Paiement à 60 jours</option>
                        </select>
                        {errors.payment_terms && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.payment_terms}</p>
                        )}
                    </div>
                </div>

                {/* Section : Contact & Localisation */}
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faAddressCard} />
                    Contact & Localisation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <InputField
                        id="contact_name"
                        label="Nom du Contact (Représentant)"
                        type="text"
                        value={data.contact_name}
                        onChange={(e) => setData('contact_name', e.target.value)}
                        errorMessage={errors.contact_name}
                        placeholder="Ex: Jean Dupont"
                    />

                    <InputField
                        id="phone"
                        label="Téléphone"
                        type="text"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        errorMessage={errors.phone}
                        placeholder="Ex: +237 6XX XX XX XX"
                    />

                    <div className="md:col-span-2">
                        <InputField
                            id="address"
                            label="Adresse Physique"
                            type="text"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            errorMessage={errors.address}
                            placeholder="Quartier, Rue, Boîte Postale..."
                        />
                    </div>
                </div>

                {/* Boutons d'action */}
                <div className="mt-8 flex justify-end gap-3 border-t dark:border-gray-700 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="inline-flex items-center"
                    >
                        <FontAwesomeIcon icon={faTimes} className="mr-2" />
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center bg-brand-600 text-white hover:bg-brand-700"
                    >
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {processing ? (isEditMode ? 'Mise à jour...' : 'Enregistrement...') : 'Enregistrer'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SupplierFormModal;