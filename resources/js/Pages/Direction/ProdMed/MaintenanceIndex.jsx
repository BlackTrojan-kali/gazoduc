import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react'; // <-- NOUVEAU : import de router
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTools, faPlus, faHistory, faCheckCircle, 
    faSpinner, faUser, faMapMarkerAlt, faCalendarAlt, faCheck
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // <-- NOUVEAU : import de Swal
import ProdLayout from '../../../layout/ProdLayout/ProdLayout'; 
import MaintenanceGasModal from '../../../components/Modals/MedGas/MaintenanceGasModal'; 

export default function MaintenanceIndex({ auth, maintenances, availableArticles, userAgencyName }) {
    
    // État pour gérer l'ouverture de la modale d'envoi
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- NOUVEAU : Fonction pour terminer une maintenance ---
    const handleCompleteMaintenance = (maintenanceId) => {
        Swal.fire({
            title: 'Terminer l\'intervention ?',
            text: "Confirmez-vous que cette bouteille est revenue de maintenance et est prête à l'emploi (vide) ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981', // Vert émeraude
            cancelButtonColor: '#6b7280',  // Gris
            confirmButtonText: 'Oui, clôturer !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                // Appel vers le backend pour clôturer la maintenance
                router.post(route('gas_medical.maintenance.complete', maintenanceId), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terminé !', 'L\'intervention a été clôturée avec succès.', 'success');
                    },
                    onError: (err) => {
                        Swal.fire('Erreur', err.error || 'Une erreur est survenue.', 'error');
                    }
                });
            }
        });
    };

    const formatType = (type) => {
        const types = {
            'epreuve': 'Épreuve hydraulique',
            'peinture': 'Peinture',
            'reparation_vanne': 'Réparation Vanne',
            'autre': 'Autre intervention'
        };
        return types[type] || type;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'en_cours':
                return (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-1.5" />
                        En cours
                    </span>
                );
            case 'terminee':
                return (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1.5" />
                        Terminée
                    </span>
                );
            case 'rejetee':
                return (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                        Rejetée / Réformée
                    </span>
                );
            default:
                return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <ProdLayout>
            <Head title={`Historique Maintenance - ${userAgencyName}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                                <FontAwesomeIcon icon={faHistory} className="text-orange-500" />
                                Historique des Maintenances
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                Agence : <span className="font-semibold text-orange-500">{userAgencyName}</span>
                            </p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-orange-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Nouvel envoi en maintenance
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-2xl border border-gray-100 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Bouteille concernée
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Intervention
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Dates
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Statut
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Enregistré par
                                        </th>
                                        {/* NOUVEAU : Colonne Actions */}
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {maintenances.data.length > 0 ? (
                                        maintenances.data.map((maint) => (
                                            <tr key={maint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {maint.article?.name || 'Article introuvable'}
                                                        </span>
                                                        <span className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                                                            {maint.article?.code}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                        {formatType(maint.type)}
                                                    </span>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Chez : <span className="font-semibold">{maint.provider || 'Non spécifié'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-gray-300 flex items-center gap-1.5">
                                                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                                                        {new Date(maint.start_date).toLocaleDateString('fr-FR')}
                                                    </div>
                                                    {maint.end_date && (
                                                        <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                                                            Fin : {new Date(maint.end_date).toLocaleDateString('fr-FR')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(maint.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                                                        <FontAwesomeIcon icon={faUser} />
                                                    </div>
                                                    {maint.recorded_by?.first_name || 'Inconnu'}
                                                </td>
                                                {/* NOUVEAU : Cellule d'action */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {maint.status === 'en_cours' && (
                                                        <button 
                                                            onClick={() => handleCompleteMaintenance(maint.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                                                            title="Clôturer cette intervention"
                                                        >
                                                            <FontAwesomeIcon icon={faCheck} />
                                                            <span className="font-semibold text-xs uppercase">Clôturer</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <FontAwesomeIcon icon={faTools} size="3x" className="text-gray-300 dark:text-gray-600 mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                                    Aucune maintenance n'a été enregistrée pour votre agence.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {maintenances.links && maintenances.links.length > 3 && (
                            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-center bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex flex-wrap gap-1">
                                    {maintenances.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-150 ${
                                                link.active 
                                                    ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <MaintenanceGasModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                availableArticles={availableArticles} 
            />

        </ProdLayout>
    );
}