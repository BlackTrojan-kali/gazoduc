import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MagMedLayout from '../../layout/MagMedLayout/MagMedLayout';
// Importation de la modale depuis votre structure de dossiers
import TransferModal from '../../components/Modals/Oxygene/magasin/TransferModal'; 

export default function Index({ 
    totalCylinders, 
    cylindersByState, 
    pendingIncomingTransfers, 
    cylindersToTest,
    cylinders, 
    filters,
    // NOUVELLES PROPS pour la modale (à envoyer depuis le MagMedController)
    agencies = [],
    vehicules = [],
    drivers = [],
    cylinderTypes = []
}) {
    // 1. Extraction des états
    const pleines = (cylindersByState['Pleine_Usine'] || 0) + (cylindersByState['Pleine_Agence'] || 0);
    const vides = cylindersByState['Vide_Usine'] || 0;
    const defectueuses = (cylindersByState['En_Maintenance'] || 0) + (cylindersByState['Rebut'] || 0);

    // 2. Gestion de la recherche locale
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    // 3. Gestion de l'état de la modale de transfert
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('mag-med.index'), { search, status: statusFilter }, { 
            preserveState: true, 
            replace: true 
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        router.get(route('mag-med.index'));
    };

    return (
        <MagMedLayout>
            <Head title="Tableau de bord - Magasin Médical" />

            {/* En-tête avec Actions Rapides */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Magasin Médical - Tableau de bord</h1>
                    <p className="text-gray-600">Vue d'ensemble de votre parc d'emballages</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {/* Bouton pour ouvrir la Modale de Transfert */}
                    <button 
                        onClick={() => setIsTransferModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow transition duration-150 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Nouveau Transfert (Expédition)
                    </button>

                    {/* Bouton existant pour la Production */}
                    <Link 
                        href={route('mag-med.production')} 
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded shadow transition duration-150 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Envoi en Production (Enfûtage)
                    </Link>
                </div>
            </div>

            {/* ... Le reste du code reste exactement identique : Section 1, Section 2, Section 3 ... */}
            {/* Section 1 : Les KPIs (Cartes) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Total Bouteilles (Site)</h3>
                    <p className="text-3xl font-bold text-gray-800">{totalCylinders}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Bouteilles Pleines</h3>
                    <p className="text-3xl font-bold text-green-600">{pleines}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-400">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">Bouteilles Vides</h3>
                    <p className="text-3xl font-bold text-gray-600">{vides}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-sm font-semibold uppercase">À Rééprouver / Quarantaine</h3>
                    <p className="text-3xl font-bold text-red-600">{cylindersToTest + defectueuses}</p>
                </div>
            </div>

            {/* Section 2 : Les Camions en approche */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800">Réceptions en attente (Camions en approche)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chauffeur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de départ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingIncomingTransfers.length > 0 ? (
                                pendingIncomingTransfers.map((transfer) => (
                                    <tr key={transfer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{transfer.reference}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{transfer.vehicule ? transfer.vehicule.licence_plate : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{transfer.driver ? `${transfer.driver.first_name} ${transfer.driver.last_name}` : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{transfer.departure_date ? new Date(transfer.departure_date).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link href={`/mag-med/receive/${transfer.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm transition duration-150">
                                                Scanner la réception
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Aucun camion en approche pour le moment.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Section 3 : Inventaire détaillé et filtrable */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Inventaire du site (Recherche)</h2>
                    
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code-barres / N° Série</label>
                            <input 
                                type="text" 
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm" 
                                placeholder="Rechercher..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                            <select 
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">Tous les statuts</option>
                                <option value="Vide_Usine">Vide à l'usine centrale</option>
                                <option value="Pleine_Usine">Pleine à l'usine</option>
                                <option value="Pleine_Agence">Pleine en Agence</option>
                                <option value="En_Transit">En Transit</option>
                                <option value="Chez_Client">Chez le Client</option>
                                <option value="En_Maintenance">En Maintenance</option>
                                <option value="Rebut">Rebut</option>
                            </select>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto">
                                Filtrer
                            </button>
                            {(search || statusFilter) && (
                                <button type="button" onClick={clearFilters} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto">
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code-barres</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro de Série</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière épreuve</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {cylinders.data.length > 0 ? (
                                cylinders.data.map((cyl) => (
                                    <tr key={cyl.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono font-medium text-gray-900">{cyl.barcode}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cyl.serial_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{cyl.cylinder_type ? cyl.cylinder_type.name : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${cyl.status.includes('Pleine') ? 'bg-green-100 text-green-800' : 
                                                  cyl.status.includes('Vide') ? 'bg-gray-100 text-gray-800' : 
                                                  cyl.status === 'En_Maintenance' ? 'bg-orange-100 text-orange-800' : 
                                                  'bg-blue-100 text-blue-800'}`}
                                            >
                                                {cyl.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {cyl.last_test_date ? new Date(cyl.last_test_date).toLocaleDateString() : 'Inconnue'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Aucune bouteille trouvée pour cette recherche.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {cylinders.links && cylinders.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-center">
                        <div className="flex flex-wrap gap-1">
                            {cylinders.links.map((link, key) => (
                                link.url === null ? (
                                    <div key={key} className="mr-1 mb-1 px-4 py-3 text-sm leading-4 text-gray-400 border rounded" dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <Link key={key} href={link.url} className={`mr-1 mb-1 px-4 py-3 text-sm leading-4 border rounded hover:bg-white focus:border-indigo-500 focus:text-indigo-500 ${link.active ? 'bg-white border-indigo-500 text-indigo-500' : 'bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            {/* L'intégration de la Modale */}
            <TransferModal 
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                agencies={agencies}
                vehicules={vehicules}
                drivers={drivers}
                cylinderTypes={cylinderTypes}
                availableCylinders={cylinders.data} // On passe les bouteilles récupérées pour react-select
            />
            
        </MagMedLayout>
    );
}
