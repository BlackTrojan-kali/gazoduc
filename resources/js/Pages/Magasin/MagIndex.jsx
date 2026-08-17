import React, { useState } from 'react'; 
import MagLayout from '../../layout/MagLayout/MagLayout';
import { Head, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
// NOUVEAU : Import de faMoneyBillWave pour l'icône d'argent de la CSPH
import { faCartPlus, faPlus, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons'; 

import MovementFormModal from '../../components/Modals/Magasin/MoveModal'; 
import NewSaleModal from '../../components/Modals/Sales/NewSaleModal';

const MagIndex = ({ stocks, articles, agencies, clients, articlePrices }) => { 
  const { auth } = usePage().props;
  
  // Définir la quantité maximale pour la jauge
  const MAX_QUANTITY_FOR_GAUGE = 10000;
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false); 

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false); 
  
  const openMovementModal = () => {
    setIsMovementModalOpen(true);
  };

  const closeMovementModal = () => {
    setIsMovementModalOpen(false);
  };

  const openSaleModal = () => {
    setIsSaleModalOpen(true);
  };

  const closeSaleModal = () => {
    setIsSaleModalOpen(false);
  };

  // --- NOUVEAU : Fonction pour formater les montants en FCFA ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <>
      <Head title="Stock Magasin" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-6">
          Vue d'Ensemble des Stocks par Article
        </h1>

        {/* --- Bloc des actions (Header) --- */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 mb-6 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Actions de Stock Globales
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {auth.user.licence === "gaz et petrol" ? (
                <button
                  onClick={openSaleModal}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  <FontAwesomeIcon icon={faCartPlus} /> 
                  Créer une Vente
                </button>
              ) : ""}
              
              <button
                onClick={openMovementModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:border-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600"
              >
                <FontAwesomeIcon icon={faPlus} />
                Enregistrer un Mouvement
              </button>
            </div>
          </div>
        </div>
        {/* --- Fin du bloc des actions --- */}

        {stocks && stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((stock) => {
              const articleName = stock.article ? stock.article.name : 'Article inconnu';
              const currentQuantity = stock.quantity || 0;
              
              // NOUVEAU : Récupération de la subvention calculée par le backend
              const expectedCsphRefund = stock.expected_csph_refund || 0;

              // Calcul du pourcentage de remplissage de la jauge
              const percentage = Math.min(100, (currentQuantity / MAX_QUANTITY_FOR_GAUGE) * 100);

              // Définir la couleur de la jauge en fonction des conditions
              let gaugeColorClass = 'bg-blue-500'; 
              if (currentQuantity < 100) { 
                gaugeColorClass = 'bg-red-500';
              } else if (currentQuantity < 1000) { 
                gaugeColorClass = 'bg-orange-500';
              } else { 
                gaugeColorClass = 'bg-green-500';
              }

              return (
                <div
                  key={stock.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {articleName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      Quantité en stock : <span className="font-bold">{currentQuantity}</span>
                    </p>

                    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                      <div
                        className={`h-3 rounded-full ${gaugeColorClass} transition-all duration-500 ease-out`}
                        style={{ width: `${percentage}%` }}
                        title={`${currentQuantity} / ${MAX_QUANTITY_FOR_GAUGE} (${percentage.toFixed(2)}%)`}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right mb-4">
                      {percentage.toFixed(0)}% rempli
                    </p>
                  </div>

                  {/* --- NOUVEAU : Affichage de la CSPH --- */}
                  {expectedCsphRefund > 0 && (
                    <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Remboursement CSPH estimé :
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold">
                          <FontAwesomeIcon icon={faMoneyBillWave} />
                          {formatCurrency(expectedCsphRefund)}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* --- FIN NOUVEAU --- */}
                  
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-600 dark:text-gray-400">
            <p className="text-lg">Aucun stock n'est disponible pour le moment, monsieur. 😔</p>
          </div>
        )}
      </div>

      {/* La Modal de Mouvement */}
      <MovementFormModal
        isOpen={isMovementModalOpen}
        onClose={closeMovementModal}
        articles={articles} 
        agencies={agencies} 
      />
       
      <NewSaleModal
        isOpen={isSaleModalOpen}
        onClose={closeSaleModal}
        articles={articles}
        clients={clients} 
        articlePrices={articlePrices}
      />
    </>
  );
};

MagIndex.layout = page => <MagLayout children={page} />;
export default MagIndex;