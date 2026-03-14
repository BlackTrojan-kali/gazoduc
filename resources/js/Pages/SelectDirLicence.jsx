import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react'; 
import useLicenceChoice from '../hooks/useLicenceChoice'; 

const SelectDirLicence = () => {
    const { DirLicence, handleChangeDirLicence } = useLicenceChoice(); 
    const [selectedOption, setSelectedOption] = useState(DirLicence); 

    useEffect(() => {
        setSelectedOption(DirLicence);
    }, [DirLicence]);

    const handleSelection = (type, destination) => {
        setSelectedOption(type); 
        handleChangeDirLicence(type); 
        router.visit(destination);
    };

    const options = [
        {
            type: 'carburant',
            label: 'Gérer le Carburant',
            description: 'Gérez le stock et la distribution de produits pétroliers.',
            href: route('fuel_article.index'),  
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
            href: route("director.index"), 
            icon: (
                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-4-2v4m-4-6v8m5-16l-7 14v-4m0 0L9 3v4m0 0h6m-6 0v4m6-4v4"/>
                </svg>
            ),
        },
        // --- OPTION MISE À JOUR : GAZ MÉDICAL ---
        {
            type: 'gaz_medical',
            label: 'Gérer le Gaz Médical',
            description: 'Gérez le stock et la distribution des gaz à usage médical.',
            href: route("gases.index"), // Redirige désormais vers le GasController
            icon: (
                <svg className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            type: 'Boutique',
            label: 'Gérer les Boutiques',
            description: 'Gérez le stock des Boutiques.',
            href: route("boutiques.index"), 
            icon: (
                <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v2H3V3zm0 2l1.6 4h14.8l1.6-4H3zm2 4v12h14V9H5zm5 5h4v7h-4v-7z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                    Sélectionnez votre DirLicence
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    Choisissez le type de produits que vous souhaitez gérer avec votre système de stock.
                </p>
            </div>

            <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 w-full max-w-6xl">
                {options.map((option) => (
                    <button 
                        key={option.type}
                        onClick={() => handleSelection(option.type, option.href)}
                        className={`
                            flex flex-col items-center p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg
                            hover:shadow-2xl transition-all duration-300 ease-in-out
                            ${selectedOption === option.type ? 'ring-4 ring-blue-500 transform scale-105' : 'ring-2 ring-transparent'}
                            focus:outline-none focus:ring-4 focus:ring-blue-500
                            w-full md:w-64 cursor-pointer
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

export default SelectDirLicence;