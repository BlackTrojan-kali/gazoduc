import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
// Import du nouveau composant unifié (Vérifiez bien le chemin de votre dossier)
import GasMedModal from '../../../components/Modals/MedGas/CreateGasMedModal'; // Chemin adapté basé sur vos messages précédents
import DirLayout from '../../../layout/DirLayout/DirLayout'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// AJOUT DE matieresPremieres DANS LES PROPS
export default function Index({ auth, articles, entreprises, matieresPremieres }) {
    // États unifiés pour la modale
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette bouteille sera supprimée définitivement !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('gas_medical.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Supprimé !', 'La bouteille a été supprimée.', 'success');
                    }
                });
            }
        });
    };

    // Fonction d'initialisation globale des stocks
    const handleInitializeStocks = () => {
        Swal.fire({
            title: 'Initialisation globale',
            text: "Ceci va vérifier et créer les stocks (Magasin, Production, Commercial) à 0 pour TOUTES les bouteilles dans TOUTES les agences. Voulez-vous continuer ?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, initialiser !',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('gas_medical.init_stocks'), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire('Terminé !', 'Les stocks ont été initialisés avec succès.', 'success');
                    }
                });
            }
        });
    };

    return (
        <DirLayout>
            <Head title="Gestion Gaz Médical" />

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                
                {/* En-tête du tableau */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Inventaire des Bouteilles (Gaz Médical)
                    </h2>
                    
                    {/* Conteneur pour grouper les boutons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleInitializeStocks}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition duration-150"
                            title="Créer les lignes de stock manquantes pour toutes les agences"
                        >
                            <FontAwesomeIcon icon={faSync} />
                            Initialiser les stocks
                        </button>

                        <button
                            onClick={() => {
                                setSelectedArticle(null); // Mode Création
                                setIsModalOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition duration-150"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Ajouter une Bouteille
                        </button>
                    </div>
                </div>

                {/* Tableau des articles */}
                <div className="overflow-x-auto p-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bouteille & Contenu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">État</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Maintenance (Dernière)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {articles.data.length > 0 ? (
                                articles.data.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                                            {article.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            <span className="font-semibold">{article.name}</span> <br/>
                                            {/* Affichage du gaz contenu grâce à la relation productInside */}
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                Gaz : {article.product_inside ? article.product_inside.name : 'Vide / Non spécifié'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${article.state === 'plein' ? 'bg-green-100 text-green-800' : 
                                                  article.state === 'vide' ? 'bg-red-100 text-red-800' : 
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {article.state || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {article.last_maintenance ? new Date(article.last_maintenance).toLocaleDateString('fr-FR') : 'Non renseignée'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {article.entreprise ? article.entreprise.name : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => { 
                                                    setSelectedArticle(article); // Mode Modification
                                                    setIsModalOpen(true); 
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4 transition duration-150"
                                                title="Modifier"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(article.id)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition duration-150"
                                                title="Supprimer"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Aucune bouteille de gaz médical enregistrée pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {articles.links && articles.links.length > 3 && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                        <div className="flex flex-wrap gap-1">
                            {articles.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 border rounded text-sm transition duration-150 ${
                                        link.active 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modale unique pour Création & Modification */}
            <GasMedModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                entreprises={entreprises} 
                matieresPremieres={matieresPremieres} // <-- TRANSMISSION DE LA PROP ICI
                article={selectedArticle}
            />
        </DirLayout>
    );
}