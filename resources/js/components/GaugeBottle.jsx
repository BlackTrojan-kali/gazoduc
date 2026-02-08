// resources/js/Components/GaugeBottle.jsx

import React from 'react';

const GaugeBottle = ({ quantity, maxCapacity, label, showLabel = true }) => {
  // 1. Calcul des données (Logique inchangée)
  const currentQuantity = Math.max(0, quantity || 0);
  const totalCapacity = Math.max(1, maxCapacity || 1);
  const percentage = Math.min(100, Math.max(0, (currentQuantity / totalCapacity) * 100));

  // 2. Détermination de la couleur (Logique "Feu tricolore")
  let colorClass = 'from-green-500 to-green-600'; // Par défaut (Haut niveau)
  let shadowColor = 'shadow-green-500/50';

  if (percentage < 20) {
    colorClass = 'from-red-500 to-red-600'; // Critique
    shadowColor = 'shadow-red-500/50';
  } else if (percentage < 50) {
    colorClass = 'from-orange-400 to-orange-500'; // Moyen
    shadowColor = 'shadow-orange-500/50';
  } else {
    // Reste vert ou on peut mettre bleu si c'est plein
    colorClass = 'from-blue-500 to-blue-600'; 
    shadowColor = 'shadow-blue-500/50';
  }

  return (
    <div className="flex flex-col items-center mx-2 group">
      
      {/* Label (Haut) */}
      {showLabel && (
        <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 tracking-wide">
          {label}
        </p>
      )}

      {/* --- Corps de la Citerne / Bouteille --- */}
      <div className="relative">
        
        {/* Tête de la bouteille (Valve/Capuchon) - Optionnel mais ajoute du réalisme */}
        <div className="mx-auto w-6 h-3 bg-gray-300 dark:bg-gray-600 rounded-t-md border-x border-t border-gray-400 dark:border-gray-500"></div>

        {/* Conteneur Principal */}
        <div 
            className="relative h-32 w-14 bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden shadow-inner"
            style={{boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'}} // Ombre interne pour la profondeur
        >
          
          {/* Grille de fond (Graduations) */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between py-2 px-1 opacity-30 pointer-events-none">
             <div className="w-full border-t border-gray-400"></div> {/* 100% */}
             <div className="w-2/3 border-t border-gray-400 self-center"></div> {/* 75% */}
             <div className="w-full border-t border-gray-400"></div> {/* 50% */}
             <div className="w-2/3 border-t border-gray-400 self-center"></div> {/* 25% */}
             <div className="w-full border-t border-gray-400"></div> {/* 0% */}
          </div>

          {/* Le Liquide */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${colorClass} transition-all duration-1000 ease-out`}
            style={{ height: `${percentage}%` }}
          >
            {/* Effet de surface (la ligne brillante au dessus du liquide) */}
            <div className="w-full h-1 bg-white/30 absolute top-0"></div>
            
            {/* Bulles (optionnel pour le style) */}
            <div className="absolute w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          </div>

          {/* Reflet Cylindrique (Glass Effect) - Donne l'effet 3D arrondi */}
          <div className="absolute inset-0 z-20 rounded-2xl bg-gradient-to-r from-white/40 via-transparent to-black/10 pointer-events-none"></div>
          
        </div>
      </div>

      {/* Affichage des Valeurs (Bas) */}
      <div className="mt-2 text-center">
        <span className="block text-xs font-bold text-gray-800 dark:text-gray-100">
          {percentage.toFixed(0)}%
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400">
          {currentQuantity} / {totalCapacity}
        </span>
      </div>

      {/* Tooltip natif simple */}
      <div className="sr-only">
         {currentQuantity} sur {totalCapacity} ({percentage.toFixed(2)}%)
      </div>
    </div>
  );
};

export default GaugeBottle;