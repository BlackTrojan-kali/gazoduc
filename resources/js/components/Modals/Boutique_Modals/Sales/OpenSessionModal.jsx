import React, { useEffect, useRef } from 'react';
import Modal from '../../Modal';
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCashRegister, faCoins, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const OpenSessionModal = ({ isOpen, onClose }) => {
    const inputRef = useRef(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        opening_balance: ''
    });

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            reset();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.opening_balance === '') {
            return Swal.fire('Attention', 'Veuillez saisir le fond de caisse. Mettez 0 si la caisse est vide.', 'warning');
        }

        post(route('pos-sessions.open'), {
            onSuccess: () => {
                onClose();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Caisse ouverte avec succès',
                    showConfirmButton: false,
                    timer: 3000
                });
            },
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                
                {/* Header stylisé */}
                <div className="bg-blue-600 p-6 text-center text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FontAwesomeIcon icon={faCashRegister} size="2x" />
                    </div>
                    <h2 className="text-xl font-bold">Ouvrir la Caisse</h2>
                    <p className="text-blue-100 text-sm mt-1">Déclarez votre fond de caisse initial</p>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCoins} className="text-yellow-500"/>
                            Fond de Caisse (FCFA)
                        </label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="number"
                                min="0"
                                step="1"
                                value={data.opening_balance}
                                onChange={(e) => setData('opening_balance', e.target.value)}
                                className={`w-full text-right text-2xl font-mono py-3 pr-16 pl-4 border ${errors.opening_balance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-900 dark:text-white`}
                                placeholder="0"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-bold">FCFA</span>
                            </div>
                        </div>
                        {errors.opening_balance && <p className="text-red-500 text-xs mt-1">{errors.opening_balance}</p>}
                        <p className="text-xs text-gray-500 mt-2">
                            Saisissez le montant exact de l'argent liquide présent dans votre tiroir-caisse avant de commencer vos ventes.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {processing ? 'Ouverture...' : <><FontAwesomeIcon icon={faCheckCircle} /> Valider l'ouverture</>}
                    </button>
                </form>
            </div>
        </Modal>
    );
};

export default OpenSessionModal;