import React, { useState } from 'react'; // Importez useState
import MagLayout from '../../layout/MagLayout/MagLayout';
import { Head, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importez FontAwesome
import { faPlus } from '@fortawesome/free-solid-svg-icons'; // Importez l'icône plus

import MovementFormModal from '../../components/Modals/Magasin/MoveModal'; // Assurez-vous du chemin correct vers votre modal

const MagIndex = ({ stocks, articles, agencies }) => { // Ajoutez articles et agencies comme props si ce n'est pas déjà fait
  // Définir la quantité maximale pour la jauge
  const MAX_QUANTITY_FOR_GAUGE = 10000;
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false); // État pour contrôler l'ouverture/fermeture de la modal

  const openMovementModal = () => {
    setIsMovementModalOpen(true);
  };

  const closeMovementModal = () => {
    setIsMovementModalOpen(false);
    // Rechargez les données de la page après un enregistrement réussi si nécessaire
    // window.location.reload(); // Optionnel, mais recommandé pour rafraîchir les stocks
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
              {/* Bouton pour ouvrir la modal de mouvement */}
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
              // Assurez-vous que stock.article et stock.quantity existent
              const articleName = stock.article ? stock.article.name : 'Article inconnu';
              const currentQuantity = stock.quantity || 0;

              // Calcul du pourcentage de remplissage de la jauge
              const percentage = Math.min(100, (currentQuantity / MAX_QUANTITY_FOR_GAUGE) * 100);

              // Définir la couleur de la jauge en fonction des nouvelles conditions
              let gaugeColorClass = 'bg-blue-500'; // Couleur par défaut si aucune condition n'est remplie
              if (currentQuantity < 100) { // Nouvelle condition: Rouge si moins de 100
                gaugeColorClass = 'bg-red-500';
              } else if (currentQuantity < 1000) { // Orange si moins de 1000 (et au moins 100)
                gaugeColorClass = 'bg-orange-500';
              } else { // Vert si 1000 ou plus
                gaugeColorClass = 'bg-green-500';
              }

              return (
                <div
                  key={stock.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                >
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
                    {percentage.toFixed(0)}% rempli
                  </p>
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
        articles={articles} // Assurez-vous de passer cette prop depuis votre contrôleur Laravel
        agencies={agencies} // Assurez-vous de passer cette prop depuis votre contrôleur Laravel
      />
    </>
  );
};

MagIndex.layout = page => <MagLayout children={page} />;
export default MagIndex;