import React, { createContext, useState } from "react"; // 👈 Correction 1: Import de useState
import { usePage } from "@inertiajs/react"; // 👈 Correction 2: Import de usePage pour lire les props Inertia

export const LicenceContext = createContext({});

export function LicenceContextProvider({ children }){ // 👈 Correction 3: Faute de frappe (Lincence -> Licence)
    
    // -----------------------------------------------------------
    // NOUVELLE LOGIQUE : Récupérer la valeur initiale depuis Inertia
    // -----------------------------------------------------------
    const { props } = usePage();
    const initialLicence = props.licence_choice; // Lit la prop partagée par Laravel (ex: 'carburant' ou 'gaz')
    // -----------------------------------------------------------

    // Utilise la valeur initiale d'Inertia comme état de départ
    const [licence, setLicence] = useState(initialLicence); 
    
    // Note: Dans une application Inertia, la mise à jour de cet état local (handleChangeLicence) 
    // devrait toujours être couplée à une requête backend pour mettre à jour la session Laravel, 
    // puis rafraîchir la page (comme fait dans SelectLicence).
    
    const handleChangeLicence = (value) =>{
        setLicence(value);
        // Souvent, ici, vous appelleriez une fonction qui fait une requête 
        // Inertia.post('/update-licence-session', { licence_type: value });
    }

    return(
        <LicenceContext.Provider value={{licence, handleChangeLicence}}> 
            {children}
        </LicenceContext.Provider>
    )
}