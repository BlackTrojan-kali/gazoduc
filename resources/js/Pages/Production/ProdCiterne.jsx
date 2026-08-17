import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
// On utilise le nouveau visualiseur
import TankLevelVisualizer from '../../components/GaugeBottle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faClipboardCheck, 
    faBottleWater, 
    faIndustry, 
    faWifi, 
    faWarehouse,
    faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

import ReceptionFormModal from '../../components/Modals/Magasin/ReceptionModal';
import DepotageFormModal from '../../components/Modals/Magasin/DepotageModal';
import EditCiterneStockModal from '../../components/Modals/Magasin/ReleveModal';
import ProductionBottleModal from '../../components/Modals/Production/ProdModal';
import ProdLayout from '../../layout/ProdLayout/ProdLayout';

const ProdCiterne = ({ stocks, articles, articlesProd, citernes, agencies, citernesFixes, citernesMobiles }) => {
  const { auth } = usePage().props;
  const userRole = auth.user?.role?.name;

  // --- États des Modales ---
  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
  const [isDepotageModalOpen, setIsDepotageModalOpen] = useState(false);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [isProductionBottleModalOpen, setIsProductionBottleModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  // --- Gestionnaires ---
  const openReceptionModal = () => setIsReceptionModalOpen(true);
  const closeReceptionModal = () => setIsReceptionModalOpen(false);
  const openDepotageModal = () => setIsDepotageModalOpen(true);
  const closeDepotageModal = () => setIsDepotageModalOpen(false);

  const openEditStockModal = (stock, actionType) => {
    setSelectedStock({ ...stock, actionType });
    setIsEditStockModalOpen(true);
  };
  const closeEditStockModal = () => {
    setSelectedStock(null);
    setIsEditStockModalOpen(false);
  };

  const openProductionBottleModal = () => setIsProductionBottleModalOpen(true);
  const closeProductionBottleModal = () => setIsProductionBottleModalOpen(false);

  const isProductionUser = userRole === 'Production';

  return (
    <>
      <Head title="Production - Stocks Citernes" />
      <div className="p-6 space-y-8">
        
        {/* --- En-tête et Actions Globales --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <FontAwesomeIcon icon={faIndustry} className="text-purple-600" />
                    Atelier Production
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Gestion des matières premières (Vrac) et lancements de production.
                </p>
            </div>

            {/* Barre d'actions */}
            <div className="flex flex-wrap items-center gap-3">
                {/* 1. Réception */}
                <button
                    onClick={openReceptionModal}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} className="text-green-500" />
                    Réception Vrac
                </button>

                {/* 2. Bouton Principal Produire */}
                <button
                    onClick={openProductionBottleModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 hover:bg-purple-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faBottleWater} />
                    Lancer Production
                </button>

                {/* 3. Bouton Spécifique (Optionnel selon rôle) */}
                {isProductionUser && (
                    <button
                        onClick={openProductionBottleModal} // Ou une autre modal spécifique
                        className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Bouteilles Pleines
                    </button>
                )}
            </div>
        </div>

        {/* --- Grille des Citernes --- */}
        {stocks && stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {stocks.map((stock) => {
              // 1. Extraction et calculs
              const citerne = stock.citerne || {};
              const citerneName = citerne.name || 'Citerne Inconnue';
              const agencyName = citerne.agency?.name || 'Agence Inconnue';
              
              // Capacité : Litres ou Kg selon le type de produit
              const maxCapacity = parseFloat(citerne.capacity_kg || citerne.capacity_liter || 0);
              
              const theoreticalQuantity = parseFloat(stock.theorical_quantity || 0);
              const actualQuantity = parseFloat(stock.quantity || 0);
              
              // Écart
              const discrepancy = actualQuantity - theoreticalQuantity;
              const isDiscrepancyNegative = discrepancy < -0.5;

              // 2. LOGIQUE IOT
              const isIotConnected = citerne.sensor_token && citerne.sensor_token.trim() !== '';

              return (
                <div
                  key={stock.id}
                  className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  {/* Indicateur IoT (Badge Absolu) */}
                  {isIotConnected && (
                      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/90 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-blue-100 dark:border-blue-800">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          IoT Online
                      </div>
                  )}

                  <div className="p-5">
                    {/* En-tête Carte */}
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate" title={citerneName}>
                            {citerneName}
                        </h2>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <FontAwesomeIcon icon={faWarehouse} className="mr-1.5 opacity-70" />
                            {agencyName}
                        </div>
                    </div>

                    {/* --- VISUALISEUR HYBRIDE --- */}
                    <div className="my-2">
                        <TankLevelVisualizer 
                            quantity={actualQuantity}
                            maxCapacity={maxCapacity}
                            label={stock.article?.name || 'Produit Vrac'}
                        />
                    </div>

                    {/* --- Comparatif Théorique vs Réel --- */}
                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 mb-4 border border-gray-100 dark:border-gray-600">
                        <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-gray-500 dark:text-gray-400">Stock Théorique</span>
                            <span className="font-mono font-semibold text-gray-700 dark:text-gray-200">
                                {theoreticalQuantity.toLocaleString('fr-FR')}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                            <div 
                                className="bg-gray-400 h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, (theoreticalQuantity/maxCapacity)*100)}%` }}
                            ></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-500">Écart constatée</span>
                            <span className={`font-bold font-mono ${isDiscrepancyNegative ? 'text-red-500' : 'text-green-500'}`}>
                                {discrepancy > 0 ? '+' : ''}{discrepancy.toLocaleString('fr-FR')}
                            </span>
                        </div>
                    </div>

                    {/* --- Zone d'Actions (Relevé de stock) --- */}
                    <div>
                        {isIotConnected ? (
                            // CAS 1: Connecté à une sonde -> Pas de saisie manuelle
                            <div className="flex flex-col items-center justify-center p-3 text-center bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                <FontAwesomeIcon icon={faWifi} className="text-blue-500 text-lg mb-1" />
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                    Niveau Automatisé
                                </p>
                            </div>
                        ) : (
                            // CAS 2: Manuel -> Bouton de relevé disponible
                            <button
                                onClick={() => openEditStockModal(stock, 'actual')}
                                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] text-sm"
                            >
                                <FontAwesomeIcon icon={faClipboardCheck} className="text-blue-500" />
                                Relever Stock Physique
                            </button>
                        )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* État Vide */
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-full mb-4">
                <FontAwesomeIcon icon={faIndustry} className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aucune citerne de production</h3>
            <p className="text-gray-500 text-sm mt-1">Aucun stock de matière première n'est disponible.</p>
          </div>
        )}
      </div>

      {/* --- Modales --- */}
      <ReceptionFormModal
        isOpen={isReceptionModalOpen}
        onClose={closeReceptionModal}
        articles={articles}
        citernesMobiles={citernesMobiles}
        agencies={agencies}
      />

      <DepotageFormModal
        isOpen={isDepotageModalOpen}
        onClose={closeDepotageModal}
        citernesMobiles={citernesMobiles}
        citernesFixes={citernesFixes}
        articles={articles}
        agencies={agencies}
      />

      <EditCiterneStockModal
        isOpen={isEditStockModalOpen}
        onClose={closeEditStockModal}
        stockToEdit={selectedStock}
      />

      <ProductionBottleModal
        isOpen={isProductionBottleModalOpen}
        onClose={closeProductionBottleModal}
        articles={articlesProd}
        title="Lancer une Production"
         mobileCisterns = {citernesMobiles}
        cisterns={citernesFixes}
      />
    </>
  );
}

ProdCiterne.layout = page => <ProdLayout children={page} />;
export default ProdCiterne;