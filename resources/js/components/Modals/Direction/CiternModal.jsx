// resources/js/Components/Modals/Direction/CiterneFormModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal';
import InputField from "../../form/input/InputField";
import Button from '../../ui/button/Button';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'; // J'ai ajouté faMicrochip si dispo, sinon retirez-le

const CiterneFormModal = ({ isOpen, onClose, entreprises, agencies, products, selectedCiterne = null }) => {
    const modalTitle = selectedCiterne ? "Modifier la Citerne" : "Créer une Nouvelle Citerne";

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: selectedCiterne?.name || '',
        type: selectedCiterne?.type || 'fixed',
        product_type: selectedCiterne?.product_type || 'liquide',
        capacity_liter: selectedCiterne?.capacity_liter || '',
        capacity_kg: selectedCiterne?.capacity_kg || '',
        current_product_id: selectedCiterne?.current_product_id ? String(selectedCiterne.current_product_id) : '',
        agency_id: selectedCiterne?.agency_id ? String(selectedCiterne.agency_id) : '',
        entreprise_id: selectedCiterne?.entreprise_id ? String(selectedCiterne.entreprise_id) : '',
        
        // --- NOUVEAUX CHAMPS IOT ---
        sensor_token: selectedCiterne?.sensor_token || '',
        total_height_cm: selectedCiterne?.total_height_cm || '',
        diameter_cm: selectedCiterne?.diameter_cm || '',
    });

    const [filteredAgencies, setFilteredAgencies] = useState([]);

    const citerneTypes = [
        { value: 'fixed', label: 'Fixe' },
        { value: 'carburant', label: 'Fixe carburant' },
    ];

    const productTypes = [
        { value: 'produit_petrolier', label: 'Liquide' },
        { value: 'solide', label: 'Solide' },
        { value: 'gaz', label: 'Gaz' },
    ];

    useEffect(() => {
        if (isOpen) {
            reset();
            setData({
                name: selectedCiterne?.name || '',
                type: selectedCiterne?.type || 'fixed',
                product_type: selectedCiterne?.product_type || 'produit_petrolier',
                capacity_liter: selectedCiterne?.capacity_liter || '',
                capacity_kg: selectedCiterne?.capacity_kg || '',
                current_product_id: selectedCiterne?.current_product_id ? String(selectedCiterne.current_product_id) : '',
                agency_id: selectedCiterne?.agency_id ? String(selectedCiterne.agency_id) : '',
                entreprise_id: selectedCiterne?.entreprise_id ? String(selectedCiterne.entreprise_id) : entreprises.length > 0 ? String(entreprises[0].id) : '',
                
                // --- RESET DES NOUVEAUX CHAMPS ---
                sensor_token: selectedCiterne?.sensor_token || '',
                total_height_cm: selectedCiterne?.total_height_cm || '',
                diameter_cm: selectedCiterne?.diameter_cm || '',
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
                        text: 'Erreur lors de la mise à jour.',
                        confirmButtonText: 'Compris'
                    });
                },
            });
        } else {
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
                        text: 'Erreur lors de la création.',
                        confirmButtonText: 'Compris'
                    });
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            Type de Produit
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="Capacité en Kg"
                        min="0"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="current_product_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Produit Actuel
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

                {/* --- SECTION IOT : Affichée UNIQUEMENT en modification --- */}
                {selectedCiterne && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="text-md font-semibold text-brand-600 dark:text-brand-400 mb-4 flex items-center gap-2">
                             {/* Vous pouvez ajouter l'icone ici si vous l'avez importée */}
                            Configuration Sonde (IoT)
                        </h4>
                        
                        <div className="mb-4">
                            <InputField
                                id="sensor_token"
                                type="text"
                                label="Token de la Sonde (Identifiant unique)"
                                value={data.sensor_token}
                                onChange={handleChange}
                                error={errors.sensor_token}
                                placeholder="Ex: CITERNE_YDE_01"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Identifiant que la sonde ESP32 enverra à l'API. Gardez-le secret.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="total_height_cm"
                                type="number"
                                label="Hauteur Totale (cm)"
                                value={data.total_height_cm}
                                onChange={handleChange}
                                error={errors.total_height_cm}
                                placeholder="Hauteur du fond au sommet"
                                min="0"
                            />

                            <InputField
                                id="diameter_cm"
                                type="number"
                                label="Diamètre (cm)"
                                value={data.diameter_cm}
                                onChange={handleChange}
                                error={errors.diameter_cm}
                                placeholder="Diamètre intérieur"
                                min="0"
                            />
                        </div>
                    </div>
                )}
                {/* --- FIN SECTION IOT --- */}

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