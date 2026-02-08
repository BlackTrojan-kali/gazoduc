import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import GaugeBottle from '../../components/GaugeBottle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faClipboardCheck, 
  faCreditCard,
  faSearch,
  faFilter,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

import ReceptionFormModal from '../../components/Modals/Magasin/ReceptionModal';
import DepotageFormModal from '../../components/Modals/Magasin/DepotageModal';
import EditCiterneStockModal from '../../components/Modals/Magasin/ReleveModal';
import FuelSaleFormModal from '../../components/Modals/Fuel/FuelSaleFormModal';
import MagFuelLayout from '../../layout/FuelLayout/MagFuelLayout';
import useLicenceChoice from '../../hooks/useLicenceChoice';

const MagFuelCiterne = ({ stocks, articles, clients, agencies, cuvesFixes, pompes, citernesMobiles }) => {
    // --- Gestion des Modals (Code existant conservé) ---
    const [isReceptionModalOpen, setIsReceptionModalModalOpen] = useState(false);
    const [isDepotageModalOpen, setIsDepotageModalOpen] = useState(false);
    const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
    const [isFuelSaleModalOpen, setIsFuelSaleModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    
    const { licence } = useLicenceChoice();

    // --- Nouveaux États pour les Filtres ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgency, setSelectedAgency] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

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

    // --- Logique de Filtrage (Nouvelle logique) ---
    const filteredStocks = useMemo(() => {
        if (!stocks) return [];
    
        return stocks.filter((stock) => {
          const cuveName = stock.citerne?.name?.toLowerCase() || '';
          const agencyId = stock.agency_id?.toString() || '';
          
          const theoretical = stock.theorical_quantity || 0;
          const actual = stock.quantity || 0;
          const discrepancy = actual - theoretical;
    
          // 1. Filtre Recherche Texte
          const matchesSearch = cuveName.includes(searchTerm.toLowerCase());
    
          // 2. Filtre Agence
          const matchesAgency = selectedAgency === 'all' || agencyId === selectedAgency;
    
          // 3. Filtre par Statut (Écarts)
          let matchesStatus = true;
          if (statusFilter === 'ecart_negatif') matchesStatus = discrepancy < 0;
          if (statusFilter === 'ecart_positif') matchesStatus = discrepancy > 0;
          if (statusFilter === 'ok') matchesStatus = discrepancy === 0;
    
          return matchesSearch && matchesAgency && matchesStatus;
        });
    }, [stocks, searchTerm, selectedAgency, statusFilter]);

    return (
        <>
            <Head title="Stocks Cuves" />
            <div className="p-6">
                
                {/* En-tête avec Titre et Stats */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Gestion des Stocks de Cuves
                    </h1>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredStocks.length} cuve(s) affichée(s)
                    </span>
                </div>

                {/* --- Bloc des actions principales (Grid adaptative) --- */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Bouton Réception */}
                    <button
                        onClick={openReceptionModal}
                        className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-4 transition hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                        <div className="text-left">
                            <span className="block font-medium text-gray-700 dark:text-gray-200">Réception</span>
                            <span className="text-xs text-gray-500">Approvisionner une cuve</span>
                        </div>
                    </button>

                    {/* Bouton Dépotage */}
                    <button
                        onClick={openDepotageModal}
                        className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white p-4 transition hover:border-brand-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-brand-400"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                            <FontAwesomeIcon icon={faPlus} />
                        </div>
                        <div className="text-left">
                            <span className="block font-medium text-gray-700 dark:text-gray-200">Dépotage</span>
                            <span className="text-xs text-gray-500">Transfert inter-cuves</span>
                        </div>
                    </button>

                    {/* Bouton Vente de Carburant (Spécifique) */}
                    <button
                        onClick={openFuelSaleModal}
                        className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-green-300 bg-white p-4 transition hover:border-green-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-400"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                            <FontAwesomeIcon icon={faCreditCard} />
                        </div>
                        <div className="text-left">
                            <span className="block font-medium text-gray-700 dark:text-gray-200">Vente Carburant</span>
                            <span className="text-xs text-gray-500">Enregistrer une sortie</span>
                        </div>
                    </button>
                </div>

                {/* --- Barre de Filtres --- */}
                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    
                    {/* Recherche */}
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FontAwesomeIcon icon={faSearch} />
                      </span>
                      <input
                        type="text"
                        placeholder="Rechercher une cuve..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Filtres Selects */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      
                      {/* Filtre par statut d'écart */}
                      <div className="relative min-w-[200px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <FontAwesomeIcon icon={faFilter} />
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-8 text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                        >
                            <option value="all">Tous les états</option>
                            <option value="ecart_negatif">⚠️ Manque (Négatif)</option>
                            <option value="ecart_positif">📈 Surplus (Positif)</option>
                            <option value="ok">✅ Stock Juste</option>
                        </select>
                      </div>

                      {/* Filtre par Agence */}
                      {agencies && agencies.length > 0 && (
                        <div className="relative min-w-[200px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <FontAwesomeIcon icon={faLayerGroup} />
                            </span>
                            <select
                                value={selectedAgency}
                                onChange={(e) => setSelectedAgency(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-8 text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                            >
                                <option value="all">Toutes les agences</option>
                                {agencies.map((agency) => (
                                    <option key={agency.id} value={agency.id.toString()}>
                                        {agency.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- Grille des Cartes (Données filtrées) --- */}
                {filteredStocks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStocks.map((stock) => {
                            const cuveName = stock.citerne ? stock.citerne.name : 'Cuve inconnue';
                            // Attention: ici c'est capacity_liter
                            const maxCapacityL = stock.citerne ? stock.citerne.capacity_liter : 0;
                            const theoreticalQuantity = stock.theorical_quantity || 0;
                            const actualQuantity = stock.quantity || 0;
                            const discrepancy = actualQuantity - theoreticalQuantity;
                            
                            // Détermination du style basé sur l'écart
                            let statusColor = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
                            let borderColor = 'border-gray-200 dark:border-gray-700';
                            
                            if (discrepancy < 0) {
                                statusColor = 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
                                borderColor = 'border-red-100 dark:border-red-900/30';
                            } else if (discrepancy > 0) {
                                statusColor = 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
                            }

                            return (
                                <div
                                    key={stock.id}
                                    className={`group relative flex flex-col overflow-hidden rounded-2xl border ${borderColor} bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800`}
                                >
                                    {/* Header de la carte */}
                                    <div className="flex items-start justify-between p-5 pb-0">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                                {cuveName}
                                            </h2>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Capacité: {maxCapacityL} L
                                            </p>
                                        </div>
                                        {/* Badge Écart */}
                                        <div className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                                            {discrepancy === 0 ? 'Stock Juste' : `${discrepancy > 0 ? '+' : ''}${discrepancy} L`}
                                        </div>
                                    </div>

                                    {/* Visualisation Jauges */}
                                    <div className="flex flex-1 items-center justify-center gap-6 p-6">
                                        <GaugeBottle
                                            quantity={theoreticalQuantity}
                                            maxCapacity={maxCapacityL}
                                            label="Théorique"
                                        />
                                        
                                        {/* Séparateur vertical */}
                                        <div className="h-20 w-px bg-gray-100 dark:bg-gray-700"></div>

                                        <GaugeBottle
                                            quantity={actualQuantity}
                                            maxCapacity={maxCapacityL}
                                            label="Relevé"
                                        />
                                    </div>

                                    {/* Footer avec les DEUX Actions */}
                                    <div className="mt-auto border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-white/[0.02]">
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Bouton Relevé */}
                                            <button
                                                onClick={() => openEditStockModal(stock, 'actual')}
                                                className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/40"
                                            >
                                                <FontAwesomeIcon icon={faClipboardCheck} />
                                                Relever Stock
                                            </button>
                                            
                                            {/* Bouton Modifier Théorique */}
                                            <button
                                                onClick={() => openEditStockModal(stock, 'theoretical')}
                                                className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-purple-700 focus:ring-4 focus:ring-purple-500/20 dark:focus:ring-purple-500/40"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                                Corriger Théo.
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* État vide amélioré */
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                            <FontAwesomeIcon icon={faSearch} className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucun résultat trouvé</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Essayez de modifier vos filtres ou assurez-vous qu'une cuve est configurée.
                        </p>
                        {searchTerm || statusFilter !== 'all' ? (
                            <button 
                                onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSelectedAgency('all'); }}
                                className="mt-4 text-sm font-medium text-brand-500 hover:text-brand-600"
                            >
                                Réinitialiser les filtres
                            </button>
                        ) : null}
                    </div>
                )}
            </div>

            {/* --- Modals (inchangées) --- */}
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
                articles={articles}
                agencies={agencies}
                pompes={pompes}
                clients={clients}
            />
        </>
    );
};

MagFuelCiterne.layout = page => <MagFuelLayout children={page} />;
export default MagFuelCiterne;