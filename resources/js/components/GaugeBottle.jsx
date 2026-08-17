import React from 'react';

const TankLevelVisualizer = ({ quantity, maxCapacity, label }) => {
  // --- 1. Calculs Communs ---
  const currentQuantity = Math.max(0, quantity || 0);
  const totalCapacity = Math.max(1, maxCapacity || 1);
  const percentage = Math.min(100, Math.max(0, (currentQuantity / totalCapacity) * 100));

  // --- 2. Gestion des Couleurs (Partagée entre Bouteille et Compteur) ---
  let colorClass = 'from-green-500 to-green-600'; // Dégradé Bouteille
  let gaugeColor = '#22c55e'; // Hex Compteur (Green)
  let statusText = 'Normal';
  let statusColor = 'text-green-600';

  if (percentage < 20) {
    colorClass = 'from-red-500 to-red-600';
    gaugeColor = '#ef4444'; // Red
    statusText = 'Critique';
    statusColor = 'text-red-600';
  } else if (percentage < 50) {
    colorClass = 'from-orange-400 to-orange-500';
    gaugeColor = '#f97316'; // Orange
    statusText = 'Moyen';
    statusColor = 'text-orange-500';
  } else {
    // Plein / Normal
    colorClass = 'from-blue-500 to-blue-600';
    gaugeColor = '#3b82f6'; // Blue
    statusText = 'Optimal';
    statusColor = 'text-blue-600';
  }

  // --- 3. Config SVG du Compteur ---
  const radius = 60; // Un peu plus petit pour l'équilibre
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference / 2);

  return (
    <div className="flex flex-col items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-full max-w-md mx-auto">
      
      {/* --- PARTIE 1 : TITRE --- */}
      <div className="mb-6 text-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wide">
          {label}
        </h3>
        <p className={`text-xs font-bold uppercase tracking-wider ${statusColor} bg-opacity-10 px-2 py-1 rounded-full inline-block mt-1`}>
          Niveau {statusText}
        </p>
      </div>

      {/* --- PARTIE 2 : LA BOUTEILLE (Visuel Liquide) --- */}
      <div className="relative group mb-6">
        {/* Valve/Capuchon */}
        <div className="mx-auto w-8 h-4 bg-gray-300 dark:bg-gray-600 rounded-t-md border-x border-t border-gray-400 dark:border-gray-500"></div>

        {/* Corps de la bouteille (Élargie w-24) */}
        <div 
            className="relative h-40 w-24 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-gray-300 dark:border-gray-600 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"
        >
          {/* Graduations de fond */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between py-4 px-2 opacity-20 pointer-events-none">
             <div className="w-full border-t border-gray-500"></div>
             <div className="w-1/2 border-t border-gray-500 self-end"></div>
             <div className="w-full border-t border-gray-500"></div>
             <div className="w-1/2 border-t border-gray-500 self-end"></div>
             <div className="w-full border-t border-gray-500"></div>
          </div>

          {/* Le Liquide Animé */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${colorClass} transition-all duration-1000 ease-out`}
            style={{ height: `${percentage}%` }}
          >
            {/* Surface brillante */}
            <div className="w-full h-1.5 bg-white/40 absolute top-0"></div>
            {/* Bulles */}
            <div className="absolute w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          </div>

          {/* Reflet Verre (Glassmorphism) */}
          <div className="absolute inset-0 z-20 rounded-3xl bg-gradient-to-r from-white/30 via-transparent to-black/10 pointer-events-none"></div>
        </div>
        
        {/* Tooltip au survol */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
            <span className="bg-black/75 text-white text-xs px-2 py-1 rounded">
                {currentQuantity}L
            </span>
        </div>
      </div>

      {/* --- PARTIE 3 : LE COMPTEUR (Jauge Circulaire) --- */}
      <div className="relative w-40 h-24 overflow-hidden mt-2">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 origin-center mx-auto"
        >
          {/* Fond gris du compteur */}
          <circle
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{ strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: circumference / 2 }}
          />
          {/* Jauge colorée */}
          <circle
            stroke={gaugeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-out'
            }}
          />
        </svg>

        {/* Valeurs Numériques au centre du compteur */}
        <div className="absolute bottom-0 left-0 right-0 text-center flex flex-col items-center justify-end h-full pb-1">
            <span className="text-3xl font-extrabold text-gray-800 dark:text-white font-mono">
                {percentage.toFixed(0)}<span className="text-sm align-top">%</span>
            </span>
        </div>
      </div>

      {/* Données textuelles détaillées (Pied de carte) */}
      <div className="w-full mt-2 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <div>
            <span className="block font-semibold">Réel</span>
            {parseFloat(currentQuantity).toLocaleString('fr-FR')} L
        </div>
        <div className="text-right">
            <span className="block font-semibold">Capacité</span>
            {parseFloat(totalCapacity).toLocaleString('fr-FR')} L
        </div>
      </div>

    </div>
  );
};

export default TankLevelVisualizer;