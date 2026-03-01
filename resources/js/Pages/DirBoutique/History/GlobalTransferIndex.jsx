import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import Select from 'react-select'; // Import de React Select
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faMapMarkedAlt, faTruck, faUserTie, faCalendarAlt, faFilter, faUndo, 
    faArrowRight, faMapMarkerAlt, faBoxOpen, faCheckCircle, faClock, faTimesCircle,
    faPrint,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import TransferDetailsModal from '../../../components/Modals/Boutique_Modals/Moves/TransferDetailsModal';

// Ajout de isDirecteur dans les props (avec true par défaut au cas où)
const GlobalTransferIndex = ({ transfers, regions, chauffeurs, vehicules, filters, isDirecteur = true }) => {
  
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

  // --- Options pour React Select ---
  const regionOptions = regions ? regions.map(r => ({ value: r.id, label: r.name })) : [];
  const chauffeurOptions = chauffeurs ? chauffeurs.map(c => ({ value: c.id, label: c.name })) : [];
  const vehiculeOptions = vehicules ? vehicules.map(v => ({ value: v.id, label: `${v.type} - ${v.licence_plate}` })) : [];
  const statusOptions = [
      { value: 'pending', label: 'En cours' },
      { value: 'finished', label: 'Terminé' },
      { value: 'cancelled', label: 'Annulé' }
  ];

  // Styles pour React Select (assortis au thème)
  const selectStyles = {
      control: (base) => ({
          ...base,
          minHeight: '38px',
          borderRadius: '0.5rem',
          borderColor: '#e5e7eb',
          boxShadow: 'none',
          '&:hover': { borderColor: '#d1d5db' },
          backgroundColor: 'transparent',
          fontSize: '0.875rem' // correspond à text-sm
      })
  };

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
          pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
          finished: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
          cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400"
      };
      const labels = { pending: "En cours", finished: "Terminé", cancelled: "Annulé" };
      
      return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100'}`}>
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
              <FontAwesomeIcon icon={faMapMarkedAlt} className="text-blue-600"/>
              Logistique & Transferts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
              Vue globale des mouvements inter-boutiques par région et transporteur.
          </p>
      </div>

      {/* --- Filtres Avancés --- */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
        
        {/* Région (Visible uniquement si Directeur) */}
        {isDirecteur && (
            <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" /> Région
                </label>
                <Select 
                    options={regionOptions}
                    value={regionOptions.find(opt => opt.value == regionId) || null}
                    onChange={(selected) => setRegionId(selected ? selected.value : '')}
                    placeholder="Toutes..."
                    isClearable
                    styles={selectStyles}
                />
            </div>
        )}

        {/* Chauffeur */}
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <FontAwesomeIcon icon={faUserTie} className="text-gray-400" /> Chauffeur
            </label>
            <Select 
                options={chauffeurOptions}
                value={chauffeurOptions.find(opt => opt.value == chauffeurId) || null}
                onChange={(selected) => setChauffeurId(selected ? selected.value : '')}
                placeholder="Tous..."
                isClearable
                styles={selectStyles}
            />
        </div>

        {/* Véhicule */}
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <FontAwesomeIcon icon={faTruck} className="text-gray-400" /> Véhicule
            </label>
            <Select 
                options={vehiculeOptions}
                value={vehiculeOptions.find(opt => opt.value == vehiculeId) || null}
                onChange={(selected) => setVehiculeId(selected ? selected.value : '')}
                placeholder="Tous..."
                isClearable
                styles={selectStyles}
            />
        </div>

        {/* Statut */}
        <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                Statut
            </label>
            <Select 
                options={statusOptions}
                value={statusOptions.find(opt => opt.value == status) || null}
                onChange={(selected) => setStatus(selected ? selected.value : '')}
                placeholder="Tous..."
                isClearable
                styles={selectStyles}
            />
        </div>

        {/* Dates (Prend 2 colonnes sur grand écran) */}
        <div className="md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-2">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Du</label>
                <input 
                    type="date" 
                    value={dateStart} 
                    onChange={e => setDateStart(e.target.value)} 
                    className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm p-2 dark:text-white dark:[color-scheme:dark] h-[38px]" 
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Au</label>
                <input 
                    type="date" 
                    value={dateEnd} 
                    onChange={e => setDateEnd(e.target.value)} 
                    className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm p-2 dark:text-white dark:[color-scheme:dark] h-[38px]" 
                />
            </div>
        </div>

        {/* Boutons */}
        <div className={`md:col-span-4 lg:col-span-1 flex gap-2 h-[38px] ${!isDirecteur ? 'lg:col-span-2' : ''}`}>
            <button onClick={applyFilters} className="flex-1 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                <FontAwesomeIcon icon={faFilter} className="mr-1"/> Filtrer
            </button>
            <button onClick={handleReset} className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center justify-center transition-colors" title="Réinitialiser">
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
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                    {transfers && transfers.data && transfers.data.length > 0 ? (
                        transfers.data.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                
                                {/* Date */}
                                <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="font-bold text-gray-800 dark:text-white">
                                        {new Date(t.departure_date).toLocaleDateString('fr-FR')}
                                    </div>
                                    <div>{new Date(t.departure_date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                                </td>

                                {/* Trajet */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1 text-sm text-gray-800 dark:text-gray-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                            <span className="font-medium">{t.boutique_departure?.name}</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded ml-auto">
                                                {t.boutique_departure?.region?.name}
                                            </span>
                                        </div>
                                        <div className="pl-1 border-l border-gray-200 dark:border-gray-600 h-2 ml-1"></div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="font-medium">{t.boutique_arrival?.name}</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded ml-auto">
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
                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <FontAwesomeIcon icon={faUserTie} className="text-gray-400"/>
                                        {t.chauffeur?.name}
                                    </div>
                                </td>

                                {/* Contenu (Aperçu) */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <FontAwesomeIcon icon={faBoxOpen} className="text-blue-400"/>
                                        <span className="font-medium">{t.items?.length || 0} référence(s)</span>
                                    </div>
                                </td>

                                {/* Statut */}
                                <td className="px-6 py-4 text-center">
                                    {getStatusBadge(t.status)}
                                </td>
                                
                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        {/* Détails */}
                                        <button 
                                            onClick={() => handlePreview(t)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors tooltip"
                                            title="Voir le chargement"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                
                                        {/* Imprimer */}
                                        <button 
                                            onClick={() => handlePrint(t.id)}
                                            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors tooltip"
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
                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                Aucun transfert ne correspond à ces filtres.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Pagination */}
        {transfers && transfers.links && transfers.links.length > 3 && (
             <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-center border-t border-gray-200 dark:border-gray-700">
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