import React from 'react';
import Modal from '../../Modal';
import Button from '../../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faUser, faMapMarkerAlt, faBoxOpen, faTimes } from '@fortawesome/free-solid-svg-icons';

const TransferDetailsModal = ({ isOpen, onClose, transfer }) => {
    if (!transfer) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Détails du Transfert #${transfer.id}`} maxWidth="2xl">
            <div className="p-6 space-y-6">
                
                {/* --- INFO LOGISTIQUE --- */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-600 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Transport</h4>
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                            <FontAwesomeIcon icon={faTruck} className="text-brand-500"/>
                            {transfer.vehicule?.licence_plate} 
                            <span className="text-xs font-normal text-gray-500">({transfer.vehicule?.type})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <FontAwesomeIcon icon={faUser} className="text-gray-400"/>
                            {transfer.chauffeur?.name}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Trajet</h4>
                        <div className="flex flex-col gap-1 text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                De: <strong>{transfer.boutique_departure?.name}</strong>
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Vers: <strong>{transfer.boutique_arrival?.name}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- LISTE DES ARTICLES --- */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <FontAwesomeIcon icon={faBoxOpen} /> Contenu du chargement
                    </h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Produit</th>
                                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Quantité</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {transfer.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-2">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.product?.designation}</div>
                                            <div className="text-xs text-gray-500">{item.product?.sku}</div>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono font-bold text-gray-700 dark:text-gray-300">
                                            {item.qty}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="secondary" onClick={onClose}>Fermer</Button>
                </div>
            </div>
        </Modal>
    );
};

export default TransferDetailsModal;