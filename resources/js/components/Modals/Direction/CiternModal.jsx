// resources/js/Components/Modals/Direction/CiterneFormModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import InputField from "../../form/input/InputField";
import Button from '../../ui/button/Button';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// La prop 'selectedCiterne' est maintenant optionnelle (null pour la création)
const CiterneFormModal = ({ isOpen, onClose, entreprises, agencies, products, selectedCiterne = null }) => {
    // Déterminez le titre de la modal en fonction de la présence de selectedCiterne
    const modalTitle = selectedCiterne ? "Modifier la Citerne" : "Créer une Nouvelle Citerne";

    // useForm d'Inertia. Si selectedCiterne est fournie, on pré-remplit les données.
    // Sinon, on utilise les valeurs par défaut pour la création.
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: selectedCiterne?.name || '',
        type: selectedCiterne?.type || 'fixed',
        product_type: selectedCiterne?.product_type || 'liquide',
        capacity_liter: selectedCiterne?.capacity_liter || '',
        capacity_kg: selectedCiterne?.capacity_kg || '',
        current_product_id: selectedCiterne?.current_product_id ? String(selectedCiterne.current_product_id) : '',
        agency_id: selectedCiterne?.agency_id ? String(selectedCiterne.agency_id) : '',
        entreprise_id: selectedCiterne?.entreprise_id ? String(selectedCiterne.entreprise_id) : '',
    });

    const [filteredAgencies, setFilteredAgencies] = useState([]);

    const citerneTypes = [
        { value: 'fixed', label: 'Fixe' },
        { value: 'mobile', label: 'Mobile' },
    ];

    const productTypes = [
        { value: 'liquide', label: 'Liquide' },
        { value: 'solide', label: 'Solide' },
        { value: 'gaz', label: 'Gaz' },
    ];

    useEffect(() => {
        if (isOpen) {
            // Réinitialise le formulaire quand la modal s'ouvre
            // et pré-remplit si selectedCiterne est présente
            reset();
            setData({
                name: selectedCiterne?.name || '',
                type: selectedCiterne?.type || 'fixed',
                product_type: selectedCiterne?.product_type || 'liquide',
                capacity_liter: selectedCiterne?.capacity_liter || '',
                capacity_kg: selectedCiterne?.capacity_kg || '',
                current_product_id: selectedCiterne?.current_product_id ? String(selectedCiterne.current_product_id) : '',
                agency_id: selectedCiterne?.agency_id ? String(selectedCiterne.agency_id) : '',
                entreprise_id: selectedCiterne?.entreprise_id ? String(selectedCiterne.entreprise_id) : entreprises.length > 0 ? String(entreprises[0].id) : '',
            });
        }
    }, [isOpen, selectedCiterne, entreprises, reset, setData]);


    useEffect(() => {
        if (data.entreprise_id && agencies) {
            const agencesDeLEntreprise = agencies.filter(agency =>
                String(agency.entreprise_id) === data.entreprise_id
            );
            setFilteredAgencies(agencesDeLEntreprise);

            if (!agencesDeLEntreprise.some(agency => String(agency.id) === data.agency_id)) {
                setData('agency_id', '');
            }
        } else {
            setFilteredAgencies([]);
            setData('agency_id', '');
        }
    }, [data.entreprise_id, agencies, setData]);


    const handleChange = (e) => {
        const { id, value } = e.target;
        setData(id, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedCiterne) {
            // Mode modification: utiliser PUT
            put(route('citernes.update', selectedCiterne.id), data, {
                onSuccess: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Succès !',
                        text: 'Citerne mise à jour avec succès !',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        onClose();
                    });
                },
                onError: (validationErrors) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Erreur lors de la mise à jour de la citerne.',
                        confirmButtonText: 'Compris'
                    });
                    console.error("Erreurs de validation:", validationErrors);
                },
            });
        } else {
            // Mode création: utiliser POST
            post(route('citernes.store'), data, {
                onSuccess: () => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Succès !',
                        text: 'Citerne créée avec succès !',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        onClose();
                    });
                },
                onError: (validationErrors) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Erreur lors de la création de la citerne.',
                        confirmButtonText: 'Compris'
                    });
                    console.error("Erreurs de validation:", validationErrors);
                },
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    id="name"
                    type="text"
                    label="Nom de la Citerne"
                    value={data.name}
                    onChange={handleChange}
                    error={errors.name}
                    placeholder="Ex: Citerne A, Citerne principale"
                    required
                />

                <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type de Citerne
                    </label>
                    <select
                        id="type"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.type}
                        onChange={handleChange}
                        required
                    >
                        {citerneTypes.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="product_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type de Produit Stocké
                    </label>
                    <select
                        id="product_type"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.product_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.product_type}
                        onChange={handleChange}
                        required
                    >
                        {productTypes.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {errors.product_type && <p className="text-sm text-red-600 mt-1">{errors.product_type}</p>}
                </div>

                <InputField
                    id="capacity_liter"
                    type="number"
                    step="0.01"
                    label="Capacité (Litres)"
                    value={data.capacity_liter}
                    onChange={handleChange}
                    error={errors.capacity_liter}
                    placeholder="Capacité en Litres"
                    min="0"
                    required
                />

                <InputField
                    id="capacity_kg"
                    type="number"
                    step="0.01"
                    label="Capacité (Kg)"
                    value={data.capacity_kg}
                    onChange={handleChange}
                    error={errors.capacity_kg}
                    placeholder="Capacité en Kilogrammes"
                    min="0"
                />

                <div className="mb-4">
                    <label htmlFor="current_product_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Produit Actuellement dans la Citerne
                    </label>
                    <select
                        id="current_product_id"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.current_product_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.current_product_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Aucun produit --</option>
                        {products && products.map(product => (
                            <option key={product.id} value={String(product.id)}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    {errors.current_product_id && <p className="text-sm text-red-600 mt-1">{errors.current_product_id}</p>}
                </div>

                 <div className="mb-4">
                    <label htmlFor="entreprise_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Entreprise
                    </label>
                    <select
                        id="entreprise_id"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.entreprise_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.entreprise_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Sélectionnez une entreprise</option>
                        {entreprises.map(entreprise => (
                            <option key={entreprise.id} value={String(entreprise.id)}>
                                {entreprise.name}
                            </option>
                        ))}
                    </select>
                    {errors.entreprise_id && <p className="text-sm text-red-600 mt-1">{errors.entreprise_id}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Agence
                    </label>
                    <select
                        id="agency_id"
                        className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
                            ${errors.agency_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
                            bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
                            dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                        value={data.agency_id}
                        onChange={handleChange}
                        required={filteredAgencies.length > 0}
                        disabled={!data.entreprise_id || filteredAgencies.length === 0}
                    >
                        <option value="" disabled>Sélectionnez une agence</option>
                        {filteredAgencies.length > 0 ? (
                            filteredAgencies.map(agency => (
                                <option key={agency.id} value={String(agency.id)}>
                                    {agency.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>Aucune agence trouvée pour cette entreprise</option>
                        )}
                    </select>
                    {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
                </div>


                <div className="flex justify-end mt-6">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="destructive"
                        className="mr-2"
                        disabled={processing}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                {selectedCiterne ? 'Mise à jour...' : 'Création...'}
                            </>
                        ) : (
                            selectedCiterne ? 'Mettre à jour la Citerne' : 'Créer la Citerne'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CiterneFormModal;