import React, { useState, useMemo, useEffect } from 'react';
import { Head } from '@inertiajs/react';
// Import du nouveau visualiseur
import TankLevelVisualizer from '../../components/GaugeBottle'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faClipboardCheck, 
  faTachometerAlt, // Remplacement de faCreditCard par faTachometerAlt pour refléter la notion d'index
  faSearch,
  faFilter,
  faLayerGroup,
  faFolder,
  faFolderOpen,
  faChevronRight,
  faChevronDown,
  faGasPump,
  faWifi,                 // Pour l'IoT
  faTriangleExclamation,  // Pour les alertes
  faWarehouse             // Pour l'agence
} from '@fortawesome/free-solid-svg-icons';

import ReceptionFormModal from '../../components/Modals/Magasin/ReceptionModal';
import DepotageFormModal from '../../components/Modals/Magasin/DepotageModal';
import EditCiterneStockModal from '../../components/Modals/Magasin/ReleveModal';
import FuelSaleFormModal from '../../components/Modals/Fuel/FuelSaleFormModal';
import MagFuelLayout from '../../layout/FuelLayout/MagFuelLayout';
import useLicenceChoice from '../../hooks/useLicenceChoice';

const MagFuelCiterne = ({ stocks, articles, agencies, cuvesFixes, pompes, citernesMobiles }) => {
    // --- Gestion des Modals ---
    const [isReceptionModalOpen, setIsReceptionModalModalOpen] = useState(false);
    const [isDepotageModalOpen, setIsDepotageModalOpen] = useState(false);
    const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
    const [isFuelSaleModalOpen, setIsFuelSaleModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    
    const { licence } = useLicenceChoice();

    // --- États pour les Filtres ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // --- État pour gérer l'ouverture des dossiers ---
    const [expandedGroups, setExpandedGroups] = useState({});

    // --- Fonctions des Modals ---
    const openReceptionModal = () => setIsReceptionModalModalOpen(true);
    const closeReceptionModal = () => setIsReceptionModalModalOpen(false);
    const openDepotageModal = () => setIsDepotageModalOpen(true);
    const closeDepotageModal = () => setIsDepotageModalOpen(false);
    const openFuelSaleModal = () => setIsFuelSaleModalOpen(true);
    const closeFuelSaleModal = () => setIsFuelSaleModalOpen(false);

    const openEditStockModal = (stock, actionType) => {
        setSelectedStock({ ...stock, actionType });
        setIsEditStockModalOpen(true);
    };
    const closeEditStockModal = () => {
        setSelectedStock(null);
        setIsEditStockModalOpen(false);
    };

    // --- Logique de Filtrage ---
    const filteredStocks = useMemo(() => {
        if (!stocks) return [];
    
        return stocks.filter((stock) => {
          const cuveName = stock.citerne?.name?.toLowerCase() || '';
          const agencyId = stock.agency_id?.toString() || '';
          
          const theoretical = stock.theorical_quantity || 0;
          const actual = stock.quantity || 0;
          const discrepancy = actual - theoretical;
    
          const matchesSearch = cuveName.includes(searchTerm.toLowerCase());
          const matchesAgency = selectedAgency === 'all' || agencyId === selectedAgency;
    
          let matchesStatus = true;
          if (statusFilter === 'ecart_negatif') matchesStatus = discrepancy < -0.5; // Tolérance
          if (statusFilter === 'ecart_positif') matchesStatus = discrepancy > 0.5;
          if (statusFilter === 'ok') matchesStatus = Math.abs(discrepancy) <= 0.5;
    
          return matchesSearch && matchesAgency && matchesStatus;
        });
    }, [stocks, searchTerm, selectedAgency, statusFilter]);

    // --- Logique de Regroupement par Article ---
    const groupedStocks = useMemo(() => {
        const groups = {};
        filteredStocks.forEach(stock => {
            const articleName = stock.article?.name || stock.citerne?.product_type || 'Produit Inconnu';
            if (!groups[articleName]) {
                groups[articleName] = [];
            }
            groups[articleName].push(stock);
        });
        return groups;
    }, [filteredStocks]);

    // --- UX : Ouvrir automatiquement les dossiers si recherche ---
    useEffect(() => {
        if (searchTerm) {
            const allOpen = {};
            Object.keys(groupedStocks).forEach(key => allOpen[key] = true);
            setExpandedGroups(allOpen);
        }
    }, [searchTerm, groupedStocks]);

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    return (
        <>
            <Head title="Stocks Cuves Carburant" />
            <div className="p-6">
                
                {/* En-tête */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FontAwesomeIcon icon={faGasPump} className="text-blue-600" />
                            Gestion Carburant
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {filteredStocks.length} cuve(s) active(s) réparties sur {Object.keys(groupedStocks).length} produit(s)
                        </p>
                    </div>
                </div>

                {/* Actions principales */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <button onClick={openReceptionModal} className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-4 transition hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                        <div className="text-left">
                            <span className="block font-medium text-gray-700 dark:text-gray-200">Réception</span>
                            <span className="text-xs text-gray-500">Approvisionner une cuve</span>
                        </div>
                    </button>

                    <button onClick={openDepotageModal} className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-4 transition hover:border-brand-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-400">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                        <div className="text-left">
                            <span className="block font-medium text-gray-700 dark:text-gray-200">Dépotage</span>
                            <span className="text-xs text-gray-500">Transfert inter-cuves</span>
                        </div>
                    </button>

                    <button onClick={openFuelSaleModal} className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-green-300 bg-white p-4 transition hover:border-green-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-400">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <FontAwesomeIcon icon={faTachometerAlt} />
                        </div>
                        <div className="text-left">
                            <span className="block font-medium text-gray-700 dark:text-gray-200">Clôture & Index</span>
                            <span className="text-xs text-gray-500">Saisir les relevés de pompe</span>
                        </div>
                    </button>
                </div>

                {/* Filtres */}
                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FontAwesomeIcon icon={faSearch} />
                      </span>
                      <input type="text" placeholder="Rechercher une cuve..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FontAwesomeIcon icon={faFilter} /></span>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-8 text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                            <option value="all">Tous les états</option>
                            <option value="ecart_negatif">⚠️ Manque (Négatif)</option>
                            <option value="ecart_positif">📈 Surplus (Positif)</option>
                            <option value="ok">✅ Stock Juste</option>
                        </select>
                      </div>
                      {agencies && agencies.length > 0 && (
                        <div className="relative min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FontAwesomeIcon icon={faLayerGroup} /></span>
                            <select value={selectedAgency} onChange={(e) => setSelectedAgency(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-8 text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                                <option value="all">Toutes les agences</option>
                                {agencies.map((agency) => (<option key={agency.id} value={agency.id.toString()}>{agency.name}</option>))}
                            </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- AFFICHAGE DES DOSSIERS --- */}
                {Object.keys(groupedStocks).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedStocks).map(([articleName, groupStocks]) => {
                            const isExpanded = expandedGroups[articleName];

                            return (
                                <div key={articleName} className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden dark:border-gray-700 dark:bg-gray-900/50">
                                    
                                    {/* HEADER DU DOSSIER */}
                                    <div onClick={() => toggleGroup(articleName)}
                                        className="flex cursor-pointer items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} dark:bg-gray-700 dark:text-gray-400 transition-colors`}>
                                                <FontAwesomeIcon icon={isExpanded ? faFolderOpen : faFolder} className="text-lg" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-gray-800 dark:text-white text-md flex items-center gap-2">
                                                    {articleName}
                                                </h2>
                                                <p className="text-xs text-gray-500">
                                                    {groupStocks.length} cuve(s) associée(s)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-gray-400">
                                            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                                        </div>
                                    </div>

                                    {/* CONTENU DU DOSSIER (Grille de cuves) */}
                                    {isExpanded && (
                                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 animate-fadeIn bg-gray-50/50 dark:bg-black/20">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                                {groupStocks.map((stock) => {
                                                    // 1. Extraction et calculs
                                                    const citerne = stock.citerne || {};
                                                    const cuveName = citerne.name || 'Cuve inconnue';
                                                    const agencyName = citerne.agency?.name || 'Agence Inconnue';
                                                    const maxCapacityL = parseFloat(citerne.capacity_liter || 0);
                                                    
                                                    const theoreticalQuantity = parseFloat(stock.theorical_quantity || 0);
                                                    const actualQuantity = parseFloat(stock.quantity || 0);
                                                    const discrepancy = actualQuantity - theoreticalQuantity;
                                                    const isDiscrepancyNegative = discrepancy < -0.5;

                                                    // 2. LOGIQUE IOT
                                                    const isIotConnected = citerne.sensor_token && citerne.sensor_token.trim() !== '';

                                                    return (
                                                        <div key={stock.id} className="relative group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                            
                                                            {/* Badge IoT */}
                                                            {isIotConnected && (
                                                                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/90 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-blue-100 dark:border-blue-800">
                                                                    <FontAwesomeIcon icon={faWifi} className="text-[10px]" />
                                                                    <span>IoT</span>
                                                                </div>
                                                            )}

                                                            <div className="p-5">
                                                                {/* En-tête Carte */}
                                                                <div className="mb-2">
                                                                    <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate" title={cuveName}>
                                                                        {cuveName}
                                                                    </h2>
                                                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                                        <FontAwesomeIcon icon={faWarehouse} className="mr-1.5 opacity-70" />
                                                                        {agencyName}
                                                                    </div>
                                                                </div>

                                                                {/* Visualiseur (Jauge + Compteur) */}
                                                                <div className="my-4">
                                                                    <TankLevelVisualizer 
                                                                        quantity={actualQuantity}
                                                                        maxCapacity={maxCapacityL}
                                                                        label={articleName}
                                                                    />
                                                                </div>

                                                                {/* Comparatif Théorique */}
                                                                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 mb-4 border border-gray-100 dark:border-gray-600">
                                                                    <div className="flex justify-between items-center text-xs mb-1">
                                                                        <span className="text-gray-500 dark:text-gray-400">Stock Théorique</span>
                                                                        <span className="font-mono font-semibold text-gray-700 dark:text-gray-200">
                                                                            {theoreticalQuantity.toLocaleString('fr-FR')} L
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                                                                        <div 
                                                                            className="bg-gray-400 h-1.5 rounded-full" 
                                                                            style={{ width: `${Math.min(100, (theoreticalQuantity/maxCapacityL)*100)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    
                                                                    <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200 dark:border-gray-600">
                                                                        <span className="text-gray-500">Écart</span>
                                                                        <span className={`font-bold font-mono ${isDiscrepancyNegative ? 'text-red-500' : 'text-green-500'}`}>
                                                                            {discrepancy > 0 ? '+' : ''}{discrepancy.toLocaleString('fr-FR')} L
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="mt-auto">
                                                                    {isIotConnected ? (
                                                                        // CAS 1: IOT -> Bloqué
                                                                        <div className="flex flex-col items-center justify-center p-3 text-center bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                                                            <FontAwesomeIcon icon={faWifi} className="text-blue-500 text-lg mb-1" />
                                                                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                                                                Lecture Automatique
                                                                            </p>
                                                                        </div>
                                                                    ) : (
                                                                        // CAS 2: Manuel -> Boutons
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <button
                                                                                onClick={() => openEditStockModal(stock, 'actual')}
                                                                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                                                                            >
                                                                                <FontAwesomeIcon icon={faClipboardCheck} />
                                                                                Jauger
                                                                            </button>
                                                                            <button
                                                                                onClick={() => openEditStockModal(stock, 'theoretical')}
                                                                                className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-purple-700"
                                                                            >
                                                                                <FontAwesomeIcon icon={faEdit} />
                                                                                Corriger
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* État vide */
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                            <FontAwesomeIcon icon={faSearch} className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune cuve trouvée</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Essayez de modifier vos filtres ou assurez-vous qu'une cuve est configurée.
                        </p>
                        {searchTerm || statusFilter !== 'all' ? (
                            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSelectedAgency('all'); }}
                                className="mt-4 text-sm font-medium text-brand-500 hover:text-brand-600">
                                Réinitialiser les filtres
                            </button>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Modals */}
            <ReceptionFormModal
                isOpen={isReceptionModalOpen}
                onClose={closeReceptionModal}
                articles={articles}
                citernesMobiles={citernesMobiles}
                agencies={agencies}
                licence={licence}
            />

            <DepotageFormModal
                isOpen={isDepotageModalOpen}
                onClose={closeDepotageModal}
                citernesMobiles={citernesMobiles}
                citernesFixes={cuvesFixes}
                articles={articles}
                agencies={agencies}
                licence={licence}
            />

            <EditCiterneStockModal
                isOpen={isEditStockModalOpen}
                onClose={closeEditStockModal}
                stockToEdit={selectedStock}
                licence={licence}
            />
            
            <FuelSaleFormModal
                isOpen={isFuelSaleModalOpen}
                onClose={closeFuelSaleModal}
                agencies={agencies}
                pompes={pompes}
            />
        </>
    );
};

MagFuelCiterne.layout = page => <MagFuelLayout children={page} />;
export default MagFuelCiterne;