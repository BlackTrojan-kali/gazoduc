import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MagBoutiqueLayout from '../../layout/MagBoutiqueLayout/MagBoutiqueLayout';
import TransferDetailsModal from '../../components/Modals/Boutique_Modals/Moves/TransferDetailsModal'; 
import CreateTransferModal from '../../components/Modals/Boutique_Modals/Moves/CreateTransferModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTruckLoading, 
    faPrint, 
    faEye, 
    faCheckCircle, 
    faArrowRight,
    faUser,
    faTruck,
    faInbox,
    faPlusCircle,
    faBoxOpen,
    faClock,
    faTimesCircle,
    faTrash // Nouvel import
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const TransferIndex = ({ transfers, userBoutique, modalData }) => {
    
    // --- États ---
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // --- Actions ---
    const handlePreview = (transfer) => {
        setSelectedTransfer(transfer);
        setIsDetailModalOpen(true);
    };

    const handlePrint = (id) => {
        window.open(route('transfers.print_waybill', id), '_blank');
    };

    const handleReceive = (transfer) => {
        Swal.fire({
            title: 'Confirmer la réception ?',
            html: `
                <div class="text-left text-sm">
                    <p class="mb-2">Vous allez valider l'entrée en stock des articles du véhicule :</p>
                    <p class="font-bold text-lg text-center bg-gray-100 p-2 rounded">
                        ${transfer.vehicule?.type} - ${transfer.vehicule?.licence_plate}
                    </p>
                    <p class="mt-2 text-red-500 font-bold"><i class="fas fa-exclamation-triangle"></i> Cette action est irréversible.</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981', 
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, tout est conforme',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('mag-boutique.transferts.receive', transfer.id), {}, {
                    onSuccess: () => Swal.fire('Réceptionnée', 'Le stock magasin a été mis à jour.', 'success')
                });
            }
        });
    };

    // --- Action Supprimer / Annuler ---
    const handleCancel = (transfer) => {
        Swal.fire({
            title: 'Annuler ce transfert ?',
            text: "Le transfert sera supprimé et le stock sera restitué à la boutique de départ.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Oui, annuler l\'envoi',
            cancelButtonText: 'Non, garder'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('transfers.destroy', transfer.id), {
                    onSuccess: () => Swal.fire('Annulé', 'Le transfert a été supprimé.', 'success')
                });
            }
        });
    };

    // --- Helper pour le badge de statut ---
    const getStatusBadge = (status) => {
        switch(status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <FontAwesomeIcon icon={faClock} className="text-[10px]" /> En transit
                    </span>
                );
            case 'finished':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-[10px]" /> Reçu
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-[10px]" /> Annulé
                    </span>
                );
            default:
                return <span className="text-gray-500 text-xs">{status}</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Transferts & Logistique" />

            {/* --- En-tête --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faTruckLoading} className="text-brand-600"/>
                        Logistique Inter-Boutiques
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gérez vos expéditions sortantes et vos arrivages entrants.
                    </p>
                </div>

                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <FontAwesomeIcon icon={faPlusCircle} className="text-lg"/>
                    Nouveau Transfert
                </button>
            </div>

            {/* --- Tableau --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type de Flux</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th> {/* NOUVELLE COLONNE */}
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Planning</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Itinéraire</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Transporteur</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transfers.data.length > 0 ? (
                            transfers.data.map((transfer) => {
                                // Logique d'affichage : Est-ce un arrivage pour moi ?
                                const isIncoming = transfer.boutique_arrival_id === userBoutique.id;

                                return (
                                    <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        
                                        {/* Flux (Badge) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {isIncoming ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                    <FontAwesomeIcon icon={faInbox} /> ARRIVAGE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                    <FontAwesomeIcon icon={faTruck} /> EXPÉDITION
                                                </span>
                                            )}
                                        </td>

                                        {/* Statut (Badge Dynamique) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(transfer.status)}
                                        </td>

                                        {/* Dates */}
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            <div className="space-y-1">
                                                <div className="flex justify-between w-32">
                                                    <span>Départ:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(transfer.departure_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between w-32">
                                                    <span>Arrivée:</span>
                                                    <span className={`font-bold ${isIncoming ? 'text-green-600' : 'text-gray-900'}`}>
                                                        {transfer.arrival_date ? new Date(transfer.arrival_date).toLocaleDateString() : 'En cours'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Itinéraire */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className={`font-medium ${!isIncoming ? 'text-brand-600 font-bold' : 'text-gray-500'}`}>
                                                    {transfer.boutique_departure?.name}
                                                </span>
                                                <FontAwesomeIcon icon={faArrowRight} className="text-gray-300 text-xs"/>
                                                <span className={`font-medium ${isIncoming ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                                                    {transfer.boutique_arrival?.name}
                                                </span>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                                                <FontAwesomeIcon icon={faBoxOpen} />
                                                {transfer.items?.length || 0} référence(s) incluse(s)
                                            </div>
                                        </td>

                                        {/* Logistique */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {transfer.vehicule?.type} - {transfer.vehicule?.licence_plate}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <FontAwesomeIcon icon={faUser} className="text-[10px]"/>
                                                    {transfer.chauffeur?.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                
                                                {/* Détails */}
                                                <button 
                                                    onClick={() => handlePreview(transfer)}
                                                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors tooltip"
                                                    title="Voir le chargement"
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>

                                                {/* Imprimer */}
                                                <button 
                                                    onClick={() => handlePrint(transfer.id)}
                                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors tooltip"
                                                    title="Bordereau de livraison"
                                                >
                                                    <FontAwesomeIcon icon={faPrint} />
                                                </button>

                                                {/* Réceptionner (Visible seulement si c'est pour moi ET que c'est en attente) */}
                                                {isIncoming && transfer.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleReceive(transfer)}
                                                        className="flex items-center gap-2 px-3 py-1.5 ml-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-md shadow-sm transition-colors animate-pulse-slow"
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} />
                                                        Réceptionner
                                                    </button>
                                                )}

                                                {/* Supprimer / Annuler (Visible seulement si c'est MON envoi ET qu'il est en attente) */}
                                                {!isIncoming && transfer.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleCancel(transfer)}
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                        title="Annuler ce transfert"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
                                            <FontAwesomeIcon icon={faTruckLoading} className="text-3xl text-gray-400"/>
                                        </div>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">Aucun mouvement en cours</p>
                                        <p className="text-sm text-gray-400">Tout est calme pour le moment.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Modale Détails (Lecture seule) --- */}
            <TransferDetailsModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                transfer={selectedTransfer}
            />

            {/* --- Modale Création (Nouveau Transfert) --- */}
            {modalData && (
                <CreateTransferModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    boutiques={modalData.boutiques}
                    vehicules={modalData.vehicules}
                    chauffeurs={modalData.chauffeurs}
                    users={modalData.users}
                    products={modalData.products} // Liste des produits avec stock actuel
                />
            )}
        </div>
    );
};

TransferIndex.layout = page => <MagBoutiqueLayout children={page}/>
export default TransferIndex;