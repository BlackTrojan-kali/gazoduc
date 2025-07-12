// resources/js/Components/GaugeBottle.jsx

import React from 'react';

const GaugeBottle = ({ quantity, maxCapacity, label, showLabel = true }) => {
  const currentQuantity = Math.max(0, quantity || 0);
  const totalCapacity = Math.max(1, maxCapacity || 1);

  const percentage = Math.min(100, (currentQuantity / totalCapacity) * 100);

  // --- Ajoutez ces lignes pour le débogage ---
  console.log(`Label: ${label}`);
  console.log(`  quantity (raw):`, quantity);
  console.log(`  maxCapacity (raw):`, maxCapacity);
  console.log(`  currentQuantity (processed):`, currentQuantity);
  console.log(`  totalCapacity (processed):`, totalCapacity);
  console.log(`  Calculated percentage: ${percentage}%`);
  // ------------------------------------------

  // ... (le reste de votre code)

  let gaugeColorClass = 'bg-blue-500'; // Couleur par défaut
  if (currentQuantity < totalCapacity * 0.1) {
    gaugeColorClass = 'bg-red-500';
  } else if (currentQuantity < totalCapacity * 0.5) {
    gaugeColorClass = 'bg-orange-500';
  } else {
    gaugeColorClass = 'bg-green-500';
  }

  const bottleStyle = {
    height: '100px',
    width: '40px',
    border: '2px solid #ccc',
    borderRadius: '10px 10px 30px 30px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  };

  const liquidStyle = {
    width: '100%',
    height: `${percentage}%`, // C'est ici que le pourcentage est appliqué
    backgroundColor: gaugeColorClass,
    transition: 'height 0.5s ease-out, background-color 0.5s ease-out',
    borderRadius: '0 0 28px 28px',
  };

  return (
    <div className="flex flex-col items-center mx-2">
      {showLabel && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      )}
      <div style={bottleStyle} className="dark:border-gray-600">
        <div style={liquidStyle} className='bg-brand-600 dark:bg-purple-800'
             title={`${currentQuantity} kg / ${totalCapacity} kg (${percentage.toFixed(2)}%)`}>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {currentQuantity} kg
      </p>
    </div>
  );
};

export default GaugeBottle;