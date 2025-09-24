import React, { useState } from 'react';

const SelectLicence = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelection = (type) => {
    setSelectedOption(type);
    // Ajoutez ici votre logique de navigation ou de mise à jour de l'état global
    // Par exemple: window.location.href = `/dashboard/${type}`;
  };

  const options = [
    {
      type: 'carburant',
      label: 'Gérer le Carburant',
      description: 'Gérez le stock et la distribution de produits pétroliers.',
      href: '/dashboard/carburant', // Lien de destination pour cet exemple
      icon: (
        <svg
          className="w-12 h-12 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v14m-12 0h12m-12 0L9 6"
          />
        </svg>
      ),
    },
    {
      type: 'gaz',
      label: 'Gérer le Gaz',
      description: 'Gérez le stock de bouteilles de gaz.',
      href: '/magasin-index', // Lien de destination pour cet exemple
      icon: (
        <svg
          className="w-12 h-12 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14v6m-4-2v4m-4-6v8m5-16l-7 14v-4m0 0L9 3v4m0 0h6m-6 0v4m6-4v4"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
          Sélectionnez votre licence
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
          Choisissez le type de produits que vous souhaitez gérer avec votre système de stock.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
        {options.map((option) => (
          <a
            key={option.type}
            href={option.href}
            onClick={() => handleSelection(option.type)}
            className={`
              flex flex-col items-center p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg
              hover:shadow-2xl transition-all duration-300 ease-in-out
              ${selectedOption === option.type ? 'ring-4 ring-blue-500 transform scale-105' : 'ring-2 ring-transparent'}
              focus:outline-none focus:ring-4 focus:ring-blue-500
              w-full cursor-pointer
            `}
          >
            <div className="mb-4">
              {option.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {option.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {option.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SelectLicence;
