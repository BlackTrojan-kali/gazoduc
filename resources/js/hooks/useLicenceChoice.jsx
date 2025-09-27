import { useContext } from "react"
import { LincenceContext } from "../context/LicenceChoiceContext"

export default function useLicenceChoice(){
    const context = useContext(LincenceContext);
    if (!context) throw new Error("the useLicenceContext hook must be used under a LicenceChoiceContextProvider");
    return context;
}