import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import MagMedLayout from '../../layout/MagMedLayout/MagMedLayout';

export default function DispatchCreate({ agencies, vehicules, drivers }) {
    const { data, setData, post, processing, errors } = useForm({
        destination_agency_id: '',
        vehicule_id: '',
        driver_id: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Envoie les données vers la méthode storeDispatch
        post(route('mag-med.dispatch.store'));
    };

    return (
        <MagMedLayout>
            <Head title="Nouvelle Expédition" />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Préparer une expédition</h1>
                        <p className="text-gray-600">Étape 1 : Création du bordereau de transfert</p>
                    </div>
                    <Link href={route('mag-med.index')} className="text-gray-500 hover:text-gray-700 underline text-sm">
                        Retour au tableau de bord
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        
                        {/* Agence de destination */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Agence de destination <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md ${errors.destination_agency_id ? 'border-red-500' : ''}`}
                                value={data.destination_agency_id}
                                onChange={e => setData('destination_agency_id', e.target.value)}
                                required
                            >
                                <option value="">-- Choisir l'agence de livraison --</option>
                                {agencies.map(agency => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
                            {errors.destination_agency_id && <p className="mt-1 text-sm text-red-600">{errors.destination_agency_id}</p>}
                        </div>

                        {/* Véhicule */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Véhicule affecté <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md ${errors.vehicule_id ? 'border-red-500' : ''}`}
                                value={data.vehicule_id}
                                onChange={e => setData('vehicule_id', e.target.value)}
                                required
                            >
                                <option value="">-- Sélectionner un camion --</option>
                                {vehicules.map(vehicule => (
                                    <option key={vehicule.id} value={vehicule.id}>
                                        {vehicule.immatriculation} - {vehicule.brand} {vehicule.model}
                                    </option>
                                ))}
                            </select>
                            {errors.vehicule_id && <p className="mt-1 text-sm text-red-600">{errors.vehicule_id}</p>}
                        </div>

                        {/* Chauffeur */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chauffeur responsable <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md ${errors.driver_id ? 'border-red-500' : ''}`}
                                value={data.driver_id}
                                onChange={e => setData('driver_id', e.target.value)}
                                required
                            >
                                <option value="">-- Assigner un chauffeur --</option>
                                {drivers.map(driver => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.first_name} {driver.last_name}
                                    </option>
                                ))}
                            </select>
                            {errors.driver_id && <p className="mt-1 text-sm text-red-600">{errors.driver_id}</p>}
                        </div>

                        {/* Notes optionnelles */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes ou instructions (Optionnel)
                            </label>
                            <textarea
                                rows="3"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm p-3"
                                placeholder="Instructions particulières pour le déchargement..."
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                            ></textarea>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex items-center justify-end border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded shadow transition duration-150 ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {processing ? 'Création en cours...' : 'Créer et passer au chargement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MagMedLayout>
    );
}