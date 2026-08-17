import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout'; 
import GlobalExportHistoryModal from '../../../components/Modals/Boutique_Modals/Moves/GlobalExportHistoryModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHistory, 
    faSearch, 
    faFileExport, 
    faFilter, 
    faUndo, 
    faStore, 
    faCalendarAlt,
    faArrowRight
} from '@fortawesome/free-solid-svg-icons';

// CORRECTION 1 : Ajout de valeurs par défaut pour éviter le crash si une prop est manquante
const GlobalIndex = ({ moves = { data: [], links: [] }, boutiques = [], filters = {}, products = [] }) => {
  
  // --- États ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [search, setSearch] = useState(filters.search || '');
  const [boutiqueId, setBoutiqueId] = useState(filters.boutique_id || '');
  const [type, setType] = useState(filters.type || '');
  const [dateStart, setDateStart] = useState(filters.date_start || '');
  const [dateEnd, setDateEnd] = useState(filters.date_end || '');

  // --- Gestion des Filtres ---
  const applyFilters = () => {
      router.get(route('direction.history'), { 
          search, 
          boutique_id: boutiqueId, 
          type, 
          date_start: dateStart, 
          date_end: dateEnd 
      }, { preserveState: true, replace: true });
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') applyFilters();
  };

  const handleReset = () => {
      setSearch('');
      setBoutiqueId('');
      setType('');
      setDateStart('');
      setDateEnd('');
      router.get(route('direction.history'));
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
      <Head title="Historique Global des Stocks" />

      {/* --- En-tête --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faHistory} className="text-blue-600"/>
                Mouvements de Stock Globaux
            </h1>
            <p className="text-sm text-gray-500 mt-1">
                Suivi centralisé des entrées et sorties de toutes les boutiques.
            </p>
        </div>

        <button 
            onClick={() => setIsExportModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
        >
            <FontAwesomeIcon icon={faFileExport} />
            Exporter / Rapports
        </button>
      </div>

      {/* --- Barre de Filtres --- */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Recherche Texte */}
        <div className="md:col-span-3">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Recherche</label>
            <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                <input 
                    type="text"
                    placeholder="Produit, SKU, Auteur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-blue-500 text-sm dark:text-white"
                />
            </div>
        </div>

        {/* Filtre Boutique */}
        <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Boutique</label>
            <div className="relative">
                <FontAwesomeIcon icon={faStore} className="absolute left-3 top-3 text-gray-400" />
                <select 
                    value={boutiqueId}
                    onChange={(e) => setBoutiqueId(e.target.value)}
                    className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-blue-500 appearance-none text-sm dark:text-white"
                >
                    <option value="">Toutes les boutiques</option>
                    {boutiques.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Filtre Type */}
        <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Type</label>
            <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-blue-500 text-sm dark:text-white"
            >
                <option value="">Tout voir</option>
                <option value="entree">Entrées (+)</option>
                <option value="sortie">Sorties (-)</option>
            </select>
        </div>

        {/* Dates */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Du</label>
                <input 
                    type="date" 
                    value={dateStart}
                    onChange={e => setDateStart(e.target.value)}
                    className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm p-2 dark:text-white dark:[color-scheme:dark]"
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Au</label>
                <input 
                    type="date" 
                    value={dateEnd}
                    onChange={e => setDateEnd(e.target.value)}
                    className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm p-2 dark:text-white dark:[color-scheme:dark]"
                />
            </div>
        </div>

        {/* Boutons Action */}
        <div className="md:col-span-2 flex gap-2">
            <button 
                onClick={applyFilters}
                className="flex-1 bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <FontAwesomeIcon icon={faFilter} className="mr-1"/> Filtrer
            </button>
            <button 
                onClick={handleReset}
                className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                title="Réinitialiser"
            >
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
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Boutique</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Quantité</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Détail Flux</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">Auteur</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {moves && moves.data && moves.data.length > 0 ? (
                    moves.data.map((move) => (
                        <tr key={move.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                            
                            {/* Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300"/>
                                    {new Date(move.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit'
                                    })}
                                </div>
                            </td>

                            {/* Boutique */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                    <FontAwesomeIcon icon={faStore} className="mr-1.5 opacity-50"/>
                                    {move.boutique?.name || 'Inconnue'}
                                </span>
                            </td>

                            {/* Article */}
                            <td className="px-6 py-4">
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        {move.product?.designation}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        SKU: {move.product?.sku}
                                    </div>
                                </div>
                            </td>

                            {/* Type */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                {move.type === 'entree' ? (
                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-400">
                                        ENTRÉE
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded dark:bg-red-900/30 dark:text-red-400">
                                        SORTIE
                                    </span>
                                )}
                            </td>

                            {/* Quantité (CORRECTION 2: Sécurisation du nombre) */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={`font-mono font-bold text-sm ${move.type === 'entree' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {move.type === 'entree' ? '+' : '-'}{Number(move.qty || 0).toLocaleString()}
                                </span>
                            </td>

                            {/* Flux */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                    <span>{move.departure}</span>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-300 mx-1"/>
                                    <span className="font-semibold">{move.destination}</span>
                                </div>
                                {move.label && (
                                    <div className="text-[10px] text-gray-400 italic mt-0.5 truncate max-w-[150px]" title={move.label}>
                                        "{move.label}"
                                    </div>
                                )}
                            </td>

                            {/* Auteur */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                                {move.user ? `${move.user.first_name} ${move.user.last_name?.charAt(0)}.` : 'Système'}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" className="px-6 py-16 text-center text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col items-center">
                                <FontAwesomeIcon icon={faSearch} className="text-3xl text-gray-300 mb-3"/>
                                <p>Aucun mouvement trouvé pour ces critères.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {moves && moves.links && moves.links.length > 3 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                <div className="flex gap-1">
                    {moves.links.map((link, key) => (
                        link.url === null ? (
                            <div 
                                key={key}
                                className="px-3 py-1 text-xs rounded border bg-gray-100 text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-600 cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <Link
                                key={key}
                                href={link.url}
                                className={`px-3 py-1 text-xs rounded border transition-colors ${
                                    link.active 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* --- MODALE D'EXPORTATION --- */}
      <GlobalExportHistoryModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        boutiques={boutiques}
        products={products} // Sécurisé grâce à la valeur par défaut []
        routeExportName="direction.export_history"
      />
    </div>
  );
};

GlobalIndex.layout = page => <DirBoutiqueLayout children={page}/>
export default GlobalIndex;