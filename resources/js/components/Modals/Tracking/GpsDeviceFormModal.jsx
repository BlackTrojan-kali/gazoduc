import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Assurez-vous que le chemin est correct
import Form from '../../form/Form'; 
import Label from '../../form/Label'; 
import Input from '../../form/input/InputField'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSatelliteDish, faSimCard, faMicrochip, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

const GpsDeviceFormModal = ({ isOpen, onClose, gpsDevice = null }) => {
    
    // Initialisation du formulaire Inertia
    const { data, setData, post, put, processing, errors, reset, recentlySuccessful } = useForm({
        imei: '',
        model: '',
        sim_number: '',
        is_active: true, // Par défaut, un nouveau boîtier est actif
    });

    // Remplissage du formulaire à l'ouverture (Mode Édition vs Création)
    useEffect(() => {
        if (isOpen) {
            if (gpsDevice) {
                setData({
                    imei: gpsDevice.imei || '',
                    model: gpsDevice.model || '',
                    sim_number: gpsDevice.sim_number || '',
                    is_active: gpsDevice.is_active !== undefined ? Boolean(gpsDevice.is_active) : true,
                });
            } else {
                reset(); // Remet à zéro pour une nouvelle création
            }
        }
    }, [isOpen, gpsDevice]);

    // Fermeture automatique après succès
    useEffect(() => {
        if (recentlySuccessful) {
            reset();
            onClose();
        }
    }, [recentlySuccessful, onClose]);

    // Soumission du formulaire
    const handleSubmit = (e) => {
        e.preventDefault();

        if (gpsDevice) {
            // Mode MISE À JOUR
            put(route('gps-devices.update', gpsDevice.id), {
                preserveScroll: true,
            });
        } else {
            // Mode CRÉATION
            post(route('gps-devices.store'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={gpsDevice ? "Modifier le Boîtier GPS" : "Ajouter un Nouveau Boîtier"}
        >
            <Form onSubmit={handleSubmit} className="space-y-5">
                
                {/* En-tête visuel */}
                <div className="flex items-center gap-3 p-3 mb-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300">
                    <FontAwesomeIcon icon={faSatelliteDish} className="text-xl" />
                    <p className="text-sm">
                        L'IMEI est l'identifiant unique qui permettra de lier ce boîtier à un véhicule.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Champ IMEI */}
                    <div>
                        <Label htmlFor="imei">Numéro IMEI <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input
                                type="text"
                                id="imei"
                                name="imei"
                                value={data.imei}
                                onChange={(e) => setData('imei', e.target.value)}
                                disabled={processing}
                                error={!!errors.imei}
                                hint={errors.imei}
                                placeholder="Ex: 86421004..."
                                required
                            />
                        </div>
                    </div>

                    {/* Champ Modèle */}
                    <div>
                        <Label htmlFor="model">Modèle / Marque <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FontAwesomeIcon icon={faMicrochip} />
                            </span>
                            <Input
                                type="text"
                                id="model"
                                name="model"
                                value={data.model}
                                onChange={(e) => setData('model', e.target.value)}
                                disabled={processing}
                                error={!!errors.model}
                                hint={errors.model}
                                placeholder="Ex: Teltonika FMB920"
                                className="pl-10" // Padding pour l'icône
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Champ Numéro SIM */}
                <div>
                    <Label htmlFor="sim_number">Numéro de la puce SIM</Label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <FontAwesomeIcon icon={faSimCard} />
                        </span>
                        <Input
                            type="text"
                            id="sim_number"
                            name="sim_number"
                            value={data.sim_number}
                            onChange={(e) => setData('sim_number', e.target.value)}
                            disabled={processing}
                            error={!!errors.sim_number}
                            hint={errors.sim_number}
                            placeholder="Ex: +237 6..."
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Champ Statut (Actif / Inactif) */}
                <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div>
                        <Label className="mb-0 cursor-pointer" htmlFor="is_active">Statut du boîtier</Label>
                        <p className="text-xs text-gray-500">Désactivez si l'abonnement SIM est suspendu.</p>
                    </div>
                    
                    <button
                        type="button"
                        onClick={() => setData('is_active', !data.is_active)}
                        className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            ${data.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                        `}
                    >
                        <span className="sr-only">Utiliser le paramètre actif</span>
                        <span
                            aria-hidden="true"
                            className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                ${data.is_active ? 'translate-x-5' : 'translate-x-0'}
                            `}
                        />
                    </button>
                </div>

                {/* Boutons d'action */}
                <div className="flex items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        className="text-red-500 font-bold uppercase px-6 py-2 text-sm mr-2 hover:bg-red-50 rounded transition"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-blue-700 transition disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                {gpsDevice ? 'Mise à jour...' : 'Enregistrement...'}
                            </>
                        ) : (
                            gpsDevice ? 'Modifier le boîtier' : 'Enregistrer le boîtier'
                        )}
                    </button>
                </div>
            </Form>
        </Modal>
    );
};

export default GpsDeviceFormModal;