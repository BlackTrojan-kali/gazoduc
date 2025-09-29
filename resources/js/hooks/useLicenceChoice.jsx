import { useContext } from "react"
import { LicenceContext } from "../context/LicenceChoiceContext"

export default function useLicenceChoice(){
    const context = useContext(LicenceContext);
    if (!context) throw new Error("the useLicenceContext hook must be used under a LicenceChoiceContextProvider");
    return context;
}