import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; // Assurez-vous que le chemin est correct
import Label from '../../../form/Label';
import Input from '../../../form/input/FileInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faSave, faPen } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const CustomerFormModal = ({ isOpen, onClose, customer = null }) => { // Ajout de la prop 'customer'
    
    // Initialisation du formulaire
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        dept_amount: '',
    });

    // Gestion du remplissage des données à l'ouverture
    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (customer) {
                // Mode Modification : On pré-remplit les champs
                setData({
                    name: customer.name || '',
                    phone: customer.phone || '',
                    email: customer.email || '',
                    address: customer.address || '',
                    dept_amount: customer.dept_amount || '',
                });
            } else {
                // Mode Création : On remet à zéro
                reset();
            }
        }
    }, [isOpen, customer]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (customer) {
            // --- MISE À JOUR (UPDATE) ---
            put(route('customers.update', customer.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    Swal.fire({
                        icon: 'success',
                        title: 'Modifié !',
                        text: 'Les informations du client ont été mises à jour.',
                        timer: 1500,
                        showConfirmButton: false,
                        // Support Dark Mode pour Swal
                        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                    });
                    reset();
                },
                onError: (errors) => {
                    console.error(errors);
                    // Swal d'erreur...
                }
            });
        } else {
            // --- CRÉATION (STORE) ---
            post(route('customers.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                    Swal.fire({
                        icon: 'success',
                        title: 'Succès',
                        text: 'Le client a été créé avec succès.',
                        timer: 1500,
                        showConfirmButton: false,
                        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
                        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                    });
                    reset();
                },
                onError: (errors) => {
                    console.error(errors);
                    // Swal d'erreur...
                }
            });
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={customer ? `Modifier ${customer.name}` : "Nouveau Client"} 
            maxWidth="2xl"
        >
            <form onSubmit={handleSubmit} className="p-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Nom du Client */}
                    <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="name" value="Nom du Client / Entreprise *" />
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Ex: Entreprise Sarl ou Jean Dupont"
                            error={!!errors.name}
                            required
                            autoFocus
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Téléphone */}
                    <div>
                        <Label htmlFor="phone" value="Téléphone" />
                        <Input
                            id="phone"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="+237 ..."
                            error={!!errors.phone}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email" value="Email" />
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="client@exemple.com"
                            error={!!errors.email}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Adresse */}
                    <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="address" value="Adresse Physique" />
                        <Input
                            id="address"
                            type="text"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Quartier, Ville, Rue..."
                            error={!!errors.address}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    {/* Dette Initiale (dept_amount) */}
                    <div>
                        <Label htmlFor="dept_amount" value="Dette (Montant Dû)" />
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <Input
                                id="dept_amount"
                                type="number"
                                step="0.01"
                                value={data.dept_amount}
                                onChange={(e) => setData('dept_amount', e.target.value)}
                                className="block w-full pr-12 text-right"
                                placeholder="0.00"
                                error={!!errors.dept_amount}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">FCFA</span>
                            </div>
                        </div>
                        {errors.dept_amount && <p className="text-red-500 text-xs mt-1">{errors.dept_amount}</p>}
                    </div>

                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium mr-3 transition-colors"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Annuler
                    </button>
                    
                    <button
                        type="submit"
                        disabled={processing}
                        className={`text-white font-bold py-2 px-6 rounded shadow-md transition-all flex items-center ${
                            customer 
                                ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600' 
                                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        }`}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={customer ? faPen : faSave} className="mr-2" />
                                {customer ? 'Mettre à jour' : 'Enregistrer'}
                            </>
                        )}
                    </button>
                </div>

            </form>
        </Modal>
    );
};

export default CustomerFormModal;