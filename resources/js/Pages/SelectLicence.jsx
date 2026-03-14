import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react'; 
import useLicenceChoice from '../hooks/useLicenceChoice'; 

const SelectLicence = () => {
    // 1. Consommer l'état et la fonction de mise à jour du Contexte/LocalStorage
    const { licence, handleChangeLicence } = useLicenceChoice(); 

    // L'état local pour l'effet visuel de sélection
    const [selectedOption, setSelectedOption] = useState(licence); 

    // S'assurer que l'état local reflète l'état du contexte.
    useEffect(() => {
        setSelectedOption(licence);
    }, [licence]);

    /**
     * Gère la sélection de la licence :
     * 1. Met à jour l'état du Contexte/LocalStorage.
     * 2. Redirige immédiatement vers la page de destination.
     * @param {string} type - 'carburant', 'gaz' ou 'gaz_medical'.
     * @param {string} destination - Le lien de destination.
     */
    const handleSelection = (type, destination) => {
        // Mettre à jour l'état visuel local (pour l'effet de clic immédiat)
        setSelectedOption(type); 
        
        // Mettre à jour le CONTEXTE/LocalStorage
        handleChangeLicence(type); 
        
        // Rediriger immédiatement avec Inertia
        router.visit(destination);
    };

    const options = [
        {
            type: 'carburant',
            label: 'Gérer le Carburant',
            description: 'Gérez le stock et la distribution de produits pétroliers.',
            href: route('magasin.fuel_citerne_index'),  
            icon: (
                <svg className="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C12 2 5 10 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z"/>
                </svg>
            ),
        },
        {
            type: 'gaz',
            label: 'Gérer le Gaz',
            description: 'Gérez le stock de bouteilles de gaz.',
            href: route('magasin.index'), 
            icon: (
                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-4-2v4m-4-6v8m5-16l-7 14v-4m0 0L9 3v4m0 0h6m-6 0v4m6-4v4"/>
                </svg>
            ),
        },
        // NOUVELLE LICENCE : Gaz Médical
        {
            type: 'gaz_medical',
            label: 'Gérer le Gaz Médical',
            description: 'Gérez la traçabilité et le parc de bouteilles médicales.',
            href: route('mag-med.index'), // Lien vers notre nouveau tableau de bord
            icon: (
                <svg className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

            {/* J'ai élargi le max-w pour accueillir 3 cartes confortablement (max-w-5xl) */}
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
                {options.map((option) => (
                    <button 
                        key={option.type}
                        onClick={() => handleSelection(option.type, option.href)}
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
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SelectLicence;