import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMapMarkedAlt, faTruck, faUserTie, faCalendarAlt, faFilter, faUndo, 
    faArrowRight, faMapMarkerAlt, faBoxOpen, faCheckCircle, faClock, faTimesCircle,
    faPrint,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import TransferDetailsModal from '../../../components/Modals/Boutique_Modals/Moves/TransferDetailsModal';

const GlobalTransferIndex = ({ transfers, regions, chauffeurs, vehicules, filters }) => {
  
  // --- États des filtres ---
  const [regionId, setRegionId] = useState(filters.region_id || '');
  const [chauffeurId, setChauffeurId] = useState(filters.chauffeur_id || '');
  const [vehiculeId, setVehiculeId] = useState(filters.vehicule_id || '');
  const [dateStart, setDateStart] = useState(filters.date_start || '');
  const [dateEnd, setDateEnd] = useState(filters.date_end || '');
  const [status, setStatus] = useState(filters.status || '');
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

  // --- Application des filtres ---
  const applyFilters = () => {
      router.get(route('direction.transfers'), { 
          region_id: regionId,
          chauffeur_id: chauffeurId,
          vehicule_id: vehiculeId,
          date_start: dateStart,
          date_end: dateEnd,
          status: status
      }, { preserveState: true, replace: true });
  };

  const handleReset = () => {
      setRegionId(''); setChauffeurId(''); setVehiculeId(''); 
      setDateStart(''); setDateEnd(''); setStatus('');
      router.get(route('direction.transfers'));
  };

  // --- Helpers ---
  const getStatusBadge = (status) => {
      const styles = {
          pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
          finished: "bg-green-100 text-green-800 border-green-200",
          cancelled: "bg-red-100 text-red-800 border-red-200"
      };
      const labels = { pending: "En cours", finished: "Reçu", cancelled: "Annulé" };
      
      return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100'}`}>
              {labels[status] || status}
          </span>
      );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Head title="Suivi des Transferts Logistiques" />

      {/* --- Header --- */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkedAlt} className="text-brand-600"/>
              Logistique & Transferts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
              Vue globale des mouvements inter-boutiques par région et transporteur.
          </p>
      </div>

      {/* --- Filtres Avancés --- */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
        
        {/* Région */}
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Région</label>
            <div className="relative">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="absolute left-3 top-3 text-gray-400" />
                <select value={regionId} onChange={e => setRegionId(e.target.value)} className="pl-10 w-full input-sm rounded-lg border-gray-200 dark:bg-gray-900">
                    <option value="">Toutes Régions</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>
        </div>

        {/* Chauffeur */}
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Chauffeur</label>
            <div className="relative">
                <FontAwesomeIcon icon={faUserTie} className="absolute left-3 top-3 text-gray-400" />
                <select value={chauffeurId} onChange={e => setChauffeurId(e.target.value)} className="pl-10 w-full input-sm rounded-lg border-gray-200 dark:bg-gray-900">
                    <option value="">Tous Chauffeurs</option>
                    {chauffeurs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
        </div>

        {/* Véhicule */}
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Véhicule</label>
            <div className="relative">
                <FontAwesomeIcon icon={faTruck} className="absolute left-3 top-3 text-gray-400" />
                <select value={vehiculeId} onChange={e => setVehiculeId(e.target.value)} className="pl-10 w-full input-sm rounded-lg border-gray-200 dark:bg-gray-900">
                    <option value="">Tous Véhicules</option>
                    {vehicules.map(v => <option key={v.id} value={v.id}>{v.type} - {v.licence_plate}</option>)}
                </select>
            </div>
        </div>

        {/* Statut */}
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Statut</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full input-sm rounded-lg border-gray-200 dark:bg-gray-900">
                <option value="">Tous</option>
                <option value="pending">En cours</option>
                <option value="finished">Terminé</option>
                <option value="cancelled">Annulé</option>
            </select>
        </div>

        {/* Dates (Prend 2 colonnes sur grand écran) */}
        <div className="md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-2">
            <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="input-sm rounded-lg border-gray-200 dark:bg-gray-900 text-xs" title="Du"/>
            <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="input-sm rounded-lg border-gray-200 dark:bg-gray-900 text-xs" title="Au"/>
        </div>

        {/* Boutons */}
        <div className="md:col-span-4 lg:col-span-1 flex gap-2">
            <button onClick={applyFilters} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg text-sm transition-colors">
                <FontAwesomeIcon icon={faFilter} className="mr-1"/> Filtrer
            </button>
            <button onClick={handleReset} className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">
                <FontAwesomeIcon icon={faUndo} />
            </button>
        </div>
      </div>

      {/* --- Tableau --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date Départ</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Trajet (Régions)</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Transport</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Contenu</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transfers.data.length > 0 ? (
                        transfers.data.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                
                                {/* Date */}
                                <td className="px-6 py-4 text-xs text-gray-600">
                                    <div className="font-bold text-gray-800 dark:text-white">
                                        {new Date(t.departure_date).toLocaleDateString()}
                                    </div>
                                    <div>{new Date(t.departure_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </td>

                                {/* Trajet */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                            <span className="font-medium">{t.boutique_departure?.name}</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-auto">
                                                {t.boutique_departure?.region?.name}
                                            </span>
                                        </div>
                                        <div className="pl-1 border-l border-gray-200 h-2 ml-1"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="font-medium">{t.boutique_arrival?.name}</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-auto">
                                                {t.boutique_arrival?.region?.name}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* Transport */}
                                <td className="px-6 py-4 text-sm">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {t.vehicule?.licence_plate}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faUserTie} className="text-gray-400"/>
                                        {t.chauffeur?.name}
                                    </div>
                                </td>

                                {/* Contenu (Aperçu) */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <FontAwesomeIcon icon={faBoxOpen} className="text-blue-400"/>
                                        <span>{t.items?.length || 0} référence(s)</span>
                                    </div>
                                </td>

                                {/* Statut */}
                                <td className="px-6 py-4 text-center">
                                    {getStatusBadge(t.status)}
                                </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                                                                        
                                                                                        {/* Détails */}
                                                                                        <button 
                                                                                            onClick={() => handlePreview(t)}
                                                                                            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors tooltip"
                                                                                            title="Voir le chargement"
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faEye} />
                                                                                        </button>
                                        
                                                                                        {/* Imprimer */}
                                                                                        <button 
                                                                                            onClick={() => handlePrint(t.id)}
                                                                                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors tooltip"
                                                                                            title="Bordereau de livraison"
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faPrint} />
                                                                                        </button>
                                        
                                                                                    </div>
                                    </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                Aucun transfert ne correspond à ces filtres.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        {transfers.links && transfers.links.length > 3 && (
             <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-center">
                {/* Utilisez votre composant de pagination habituel ici */}
             </div>
        )}
      </div>
      
            {/* --- Modale Détails (Lecture seule) --- */}
            <TransferDetailsModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                transfer={selectedTransfer}
            />
    </div>
  );
};

GlobalTransferIndex.layout = page => <DirBoutiqueLayout children={page}/>
export default GlobalTransferIndex;