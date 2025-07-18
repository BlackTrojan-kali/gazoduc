import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import GaugeBottle from '../../components/GaugeBottle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faClipboardCheck, faBottleWater } from '@fortawesome/free-solid-svg-icons';

import ReceptionFormModal from '../../components/Modals/Magasin/ReceptionModal';
import DepotageFormModal from '../../components/Modals/Magasin/DepotageModal';
import EditCiterneStockModal from '../../components/Modals/Magasin/ReleveModal';
import ProductionBottleModal from '../../components/Modals/Production/ProdModal'; // Assurez-vous que le chemin est correct
import ProdLayout from '../../layout/ProdLayout/ProdLayout';

const ProdCiterne = ({ stocks, articles,articlesProd, citernes, agencies, citernesFixes, citernesMobiles }) => {
  const { auth } = usePage().props;
  const userRole = auth.user?.role?.name;

  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
  const [isDepotageModalOpen, setIsDepotageModalOpen] = useState(false);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [isProductionBottleModalOpen, setIsProductionBottleModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const openReceptionModal = () => {
    setIsReceptionModalOpen(true);
  };

  const closeReceptionModal = () => {
    setIsReceptionModalOpen(false);
  };

  const openDepotageModal = () => {
    setIsDepotageModalOpen(true);
  };

  const closeDepotageModal = () => {
    setIsDepotageModalOpen(false);
  };

  const openEditStockModal = (stock, actionType) => {
    setSelectedStock({ ...stock, actionType });
    setIsEditStockModalOpen(true);
  };

  const closeEditStockModal = () => {
    setSelectedStock(null);
    setIsEditStockModalOpen(false);
  };

  const openProductionBottleModal = () => {
    setIsProductionBottleModalOpen(true);
  };

  const closeProductionBottleModal = () => {
    setIsProductionBottleModalOpen(false);
  };

  const isProductionUser = userRole === 'Production';

  return (
    <>
      <Head title="Stocks Citernes" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-6">
          Gestion des Stocks de Citernes
        </h1>

        {/* --- Bloc des actions (Réception, Dépotage, et Production conditionnelle) --- */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 mb-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Actions Globales sur les Stocks
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openReceptionModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Enregistrer une Réception
              </button>

              {/* CE BOUTON A ÉTÉ MODIFIÉ POUR APPELER openProductionBottleModal */}
              {/* Le bouton "Produire" ouvrira la modal de production de bouteilles pour tous les utilisateurs,
                  mais le bouton "Produire Bouteilles Pleines" (plus spécifique) sera conditionnel.
                  Si "Produire" est aussi spécifique à la production de bouteilles, il pourrait aussi être conditionnel.
                  J'ai fait en sorte que les deux ouvrent la même modal pour la production de bouteilles.
              */}
              <button
                onClick={openProductionBottleModal}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:border-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600"
              >
                <FontAwesomeIcon icon={faPlus} />
               Produire
              </button>

              {/* Bouton pour ouvrir la modal de production de bouteilles - Conditionnel */}
              {isProductionUser && (
                <button
                  onClick={openProductionBottleModal}
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-purple-700 dark:border-purple-700 dark:bg-purple-800 dark:hover:bg-purple-700"
                >
                  <FontAwesomeIcon icon={faBottleWater} />
                  Produire Bouteilles Pleines
                </button>
              )}
            </div>
          </div>
        </div>
        {/* --- Fin du bloc des actions --- */}

        {stocks && stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => {
              const citerneName = stock.citerne ? stock.citerne.name : 'Citerne inconnue';
              const maxCapacityKg = stock.citerne ? stock.citerne.capacity_kg : 0;

              const theoreticalQuantity = stock.theorical_quantity || 0;
              const actualQuantity = stock.quantity || 0;

              const discrepancy = theoreticalQuantity - actualQuantity;
              let discrepancyColorClass = 'text-gray-600 dark:text-gray-300';
              if (discrepancy > 0) {
                discrepancyColorClass = 'text-red-500 font-semibold';
              } else if (discrepancy < 0) {
                discrepancyColorClass = 'text-green-500 font-semibold';
              }

              return (
                <div
                  key={stock.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
                >
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
                    Citerne: {citerneName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    Capacité Maximale: <span className="font-bold">{maxCapacityKg} kg</span>
                  </p>

                  <div className="flex justify-around w-full mb-4">
                    <GaugeBottle
                      quantity={theoreticalQuantity}
                      maxCapacity={maxCapacityKg}
                      label="Théorique"
                    />
                    <GaugeBottle
                      quantity={actualQuantity}
                      maxCapacity={maxCapacityKg}
                      label="Relevé"
                    />
                  </div>

                  <p className={`text-sm mt-3 ${discrepancyColorClass}`}>
                    Écart: <span className="font-bold">{discrepancy} kg</span>
                  </p>

                  {/* Nouveaux Boutons par carte de citerne (si vous en avez besoin ici) */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 w-full justify-center">
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <p className="text-lg">Aucun stock de citerne n'est disponible pour le moment, monsieur. 😔</p>
          </div>
        )}
      </div>

      {/* Les modals */}
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

      {/* La modal de modification de stock (utilisée pour les deux actions) */}
      <EditCiterneStockModal
        isOpen={isEditStockModalOpen}
        onClose={closeEditStockModal}
        stockToEdit={selectedStock}
      />

      {/* La modal de Production de Bouteilles (NOUVELLE) */}
      <ProductionBottleModal
        isOpen={isProductionBottleModalOpen}
        onClose={closeProductionBottleModal}
        articles={articlesProd}
        title="Enregistrer une Production de Bouteilles"
        cisterns={citernesFixes}
      />
    </>
  );
}

ProdCiterne.layout = page => <ProdLayout children={page} />;
export default ProdCiterne;