import { usePage } from "@inertiajs/react";
import React, { createContext, useEffect, useState } from "react"; 
// L'import de usePage n'est plus nécessaire ici si vous n'utilisez pas les props Inertia
// import { usePage } from "@inertiajs/react"; 

export const LicenceContext = createContext({});

export function LicenceContextProvider({ children }){
  
    const [licence, setLicence] = useState(() => {
        const storedLicence = localStorage.getItem("licence");
        return storedLicence || "gaz";
    });
    const [DirLicence,setDirLicence] = useState(()=>{
        const storedDirLicence = localStorage.getItem("dir_licence");
        return storedDirLicence || "gaz";
    })
  
    const [CeoLicence,setCeoLicence] = useState(()=>{
        const storedCeoLicence = localStorage.getItem("ceo_licence");
        return storedCeoLicence || "gaz";
    })
    const handleChangeLicence = (value) =>{
        setLicence(value);
        // Persistance immédiate dans localStorage
        localStorage.setItem("licence", value);
        
        // Note: C'est l'endroit idéal pour déclencher l'action Inertia/Laravel
        // si vous voulez que ce choix persiste dans la session serveur
    }
    const handleChangeDirLicence = (value) =>{
        setDirLicence(value);
        // Persistance immédiate dans localStorage
        localStorage.setItem("dir_licence", value);
        
        // Note: C'est l'endroit idéal pour déclencher l'action Inertia/Laravel
        // si vous voulez que ce choix persiste dans la session serveur
    }
    
    const handleChangeCeoLicence = (value) =>{
        setCeoLicence(value);
        // Persistance immédiate dans localStorage
        localStorage.setItem("ceo_licence", value);
        
        // Note: C'est l'endroit idéal pour déclencher l'action Inertia/Laravel
        // si vous voulez que ce choix persiste dans la session serveur
    }
    // 4. Utilisation du contexte inchangée
    return(
        <LicenceContext.Provider value={{licence, handleChangeLicence,handleChangeDirLicence,DirLicence,CeoLicence,handleChangeCeoLicence}}> 
            {children}
        </LicenceContext.Provider>
    )
}