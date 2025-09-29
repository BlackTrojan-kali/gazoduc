import { usePage } from "@inertiajs/react";
import React, { createContext, useEffect, useState } from "react"; 
// L'import de usePage n'est plus nécessaire ici si vous n'utilisez pas les props Inertia
// import { usePage } from "@inertiajs/react"; 

export const LicenceContext = createContext({});

export function LicenceContextProvider({ children }){
    

    // 1. Initialiser l'état en lisant directement localStorage
    // Cela garantit que l'état initial est la valeur persistante (ou "gaz" par défaut).
    const [licence, setLicence] = useState(() => {
        const storedLicence = localStorage.getItem("licence");
        return storedLicence || "gaz";
    });
    
 
    const handleChangeLicence = (value) =>{
        setLicence(value);
        // Persistance immédiate dans localStorage
        localStorage.setItem("licence", value);
        
        // Note: C'est l'endroit idéal pour déclencher l'action Inertia/Laravel
        // si vous voulez que ce choix persiste dans la session serveur
    }

    // 4. Utilisation du contexte inchangée
    return(
        <LicenceContext.Provider value={{licence, handleChangeLicence}}> 
            {children}
        </LicenceContext.Provider>
    )
}