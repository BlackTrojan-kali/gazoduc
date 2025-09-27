import React, { useState } from 'react';
import { useForm, router, usePage } from '@inertiajs/react'; // Importez useForm et router

const SelectLicence = () => {
    // L'état local est conservé pour l'effet visuel de sélection
    const [selectedOption, setSelectedOption] = useState(null);
    const {licence_choice,auth} = usePage().props
    // Initialisation du formulaire Inertia pour la requête POST
    const { post, processing } = useForm(); // 'processing' permet de désactiver l'UI pendant l'envoi

    /**
     * Gère la sélection de la licence, envoie le choix au serveur via POST,
     * puis navigue vers la page de destination.
     * @param {string} type - 'carburant' ou 'gaz'.
     * @param {string} destination - Le lien de destination après la mise à jour de la session.
     */
    const handleSelection = (type, destination) => {
        // 1. Mettre à jour l'état visuel immédiatement
        setSelectedOption(type);
        // 2. Envoyer la requête POST à la route Laravel
        // (route('update.licence.session') serait utilisé si la fonction route était disponible ici)
        post('/update-licence-session', { // Utilisez directement l'URI si la fonction route() n'est pas disponible
            licence_type: type,
        }, {
            // Options pour la requête Inertia
            preserveScroll: false, // Recharger la page si nécessaire (dépend de ce que back() renvoie)
            onSuccess: () => {
                // 3. Rediriger après la mise à jour réussie de la session
                // Puisque la route Laravel retourne 'back()', cela met à jour la session.
                // Nous devons ensuite naviguer explicitement vers le tableau de bord souhaité.
                // Nous utilisons 'router.visit' pour une navigation Inertia.
              //  router.visit(destination);
            },
            onError: (errors) => {
                console.error("Erreur lors de la mise à jour de la licence:", errors);
                // Optionnel: Afficher une alerte d'erreur à l'utilisateur
            }
        });
    };
    const options = [
        {
            type: 'carburant',
            label: 'Gérer le Carburant',
            description: 'Gérez le stock et la distribution de produits pétroliers.',
            href: route('magasin.fuel_index'), // Remplacer par la fonction route() pour l'URL Inertia
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
            href: route('magasin.index'), // Remplacer par la fonction route() pour l'URL Inertia
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
    console.log(licence_choice)
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
                    <button // Remplacer <a> par <button> pour la soumission du formulaire
                        key={option.type}
                        // Désactive le bouton si une autre requête est en cours
                        disabled={processing}
                        onClick={() => handleSelection(option.type, option.href)}
                        className={`
                            flex flex-col items-center p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-lg
                            hover:shadow-2xl transition-all duration-300 ease-in-out
                            ${selectedOption === option.type || (processing && selectedOption === option.type) ? 'ring-4 ring-blue-500 transform scale-105' : 'ring-2 ring-transparent'}
                            focus:outline-none focus:ring-4 focus:ring-blue-500
                            w-full cursor-pointer
                            ${processing ? 'opacity-70 cursor-wait' : ''}
                        `}
                    >
                        {processing && selectedOption === option.type ? (
                            <svg className="animate-spin h-6 w-6 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <div className="mb-4">
                                {option.icon}
                            </div>
                        )}
                        
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