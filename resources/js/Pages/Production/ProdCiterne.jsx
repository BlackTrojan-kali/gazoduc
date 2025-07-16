import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import GaugeBottle from '../../components/GaugeBottle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faClipboardCheck } from '@fortawesome/free-solid-svg-icons'; // Importez faEdit et faClipboardCheck

import ReceptionFormModal from '../../components/Modals/Magasin/ReceptionModal';
import DepotageFormModal from '../../components/Modals/Magasin/DepotageModal';
import EditCiterneStockModal from '../../components/Modals/Magasin/ReleveModal'; // Importez la modal d'édition
import ProdLayout from '../../layout/ProdLayout/ProdLayout';

const ProdCiterne = ({ stocks, articles, citernes, agencies, citernesFixes, citernesMobiles }) => {
  const [isReceptionModalOpen, setIsReceptionModalModalOpen] = useState(false);
  const [isDepotageModalOpen, setIsDepotageModalOpen] = useState(false);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false); // État pour la modal de modification
  const [selectedStock, setSelectedStock] = useState(null); // Stock en cours de modification

  const openReceptionModal = () => {
    setIsReceptionModalModalOpen(true);
  };

  const closeReceptionModal = () => {
    setIsReceptionModalModalOpen(false);
  };

  const openDepotageModal = () => {
    setIsDepotageModalOpen(true);
  };

  const closeDepotageModal = () => {
    setIsDepotageModalOpen(false);
  };

  // Fonctions pour la modal d'édition de stock
  // Cette fonction recevra un type d'action pour savoir quel champ pré-remplir ou mettre en focus
  const openEditStockModal = (stock, actionType) => {
    setSelectedStock({ ...stock, actionType }); // Passe le stock complet et le type d'action
    setIsEditStockModalOpen(true);
  };

  const closeEditStockModal = () => {
    setSelectedStock(null);
    setIsEditStockModalOpen(false);
  };

  return (
    <>
      <Head title="Stocks Citernes" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-6">
          Gestion des Stocks de Citernes
        </h1>

        {/* --- Bloc des actions (Réception et Dépotage en haut) --- */}
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

              <button
                onClick={openDepotageModal}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:border-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600"
              >
                <FontAwesomeIcon icon={faPlus} /> {/* Vous pouvez utiliser faArrowsSplitUpAndMerge si vous le préférez */}
               Produire
              </button>
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

                  {/* Nouveaux Boutons par carte de citerne */}
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
        stockToEdit={selectedStock} // Passe le stock sélectionné et le type d'action
      />
    </>
  );
}

ProdCiterne.layout = page => <ProdLayout children={page} />;
export default ProdCiterne;