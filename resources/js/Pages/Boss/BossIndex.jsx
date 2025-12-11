import React, { useState } from 'react'; // 1. Import de useState
import CEOLayout from '../../layout/CEOLayout/CEOLayout';
// NOTE: L'import de CEOLayout est laissé mais commenté/simplifié pour éviter l'erreur de résolution de chemin.
// Dans un environnement Inertia/Laravel réel, ce chemin serait correct.
// import CEOLayout from '../../layout/CEOLayout/CEOLayout';

// Utilisation de fonctions simulées pour Head et Link dans cet environnement de prévisualisation
const Head = ({ title }) => null; 
const Link = ({ href, className, children }) => <a href={href} className={className}>{children}</a>;
// Remplacement des icônes FontAwesome par des Emojis ou des SVG simples pour la compilation
const IconWrapper = ({ icon, className }) => {
    // Mapping simple des icônes demandées vers des Emojis
    const iconMap = {
        faUsers: "👥", // Utilisateurs
        faBoxOpen: "📦", // Projets
        faCalendarCheck: "📅", // RDV
        faHandHoldingUsd: "💰", // Revenus
        faChartBar: "📈", // Croissance
        faHandshake: "🤝", // Clients
        faClock: "⏱️", // Licence
        faWarehouse: "🏭", // Inventaire
        faMoon: "🌙", // Icône Dark Mode
        faSun: "☀️", // Icône Light Mode
    };

    return (
        <span className={`text-4xl ${className} leading-none`} role="img" aria-label="Icon">
            {iconMap[icon] || "⭐️"}
        </span>
    );
};

// Déstructuration pour recevoir les données : stats (pour les cartes) et inventorySummary (pour le tableau)
const BossIndex = ({ stats, inventorySummary }) => {

    // 2. État pour le champ de recherche
    const [searchTerm, setSearchTerm] = useState('');
    
    // Définition des statistiques par défaut si non fournies (inchangé)
    const defaultStats = stats || {
        activeUsers: '0',
        completedProjects: '0',
        weeklyAppointments: '0',
        monthlyRevenue: '0F',
        growthRate: '0%',
        licenseDaysRemaining: 0, 
        totalClients: 0, 
    };

    // Logique pour mettre en évidence le statut critique de la licence (inchangé)
    const isLicenseCritical = defaultStats.licenseDaysRemaining > 0 && defaultStats.licenseDaysRemaining <= 30;

    // Données d'inventaire par défaut pour la démo si non fournies (inchangé)
    const defaultInventorySummary = inventorySummary || [
        { id: 1, code: 'REF-001', name: 'Produit Alpha', stock_sum_quantity: 550, unit: 'pce' },
        { id: 2, code: 'REF-002', name: 'Composant Beta', stock_sum_quantity: 1200, unit: 'kg' },
        { id: 3, code: 'REF-003', name: 'Service Gamma', stock_sum_quantity: 80, unit: 'h' },
    ];
    // 3. Logique de filtrage
    const filteredInventorySummary = defaultInventorySummary.filter(article => {
        const searchLower = searchTerm.toLowerCase();
        // Le filtre correspond si le code ou le nom de l'article contient le terme de recherche
        return (
            article.code.toLowerCase().includes(searchLower) ||
            article.name.toLowerCase().includes(searchLower)
        );
    });

    return (
        <>
            <Head title="Tableau de Bord CEO" />

            {/* Application de la mise en page. Utilise dark:bg-gray-900 pour le fond. */}
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-500"> 
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    
                    {/* Titre principal sans le bouton de bascule */}
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-700 pb-2 mb-8">
                        Aperçu Opérationnel Global
                    </h1>

                    {/* --- STATISTIQUES PRINCIPALES (7 Cartes - Grille flexible) --- (Inchangé) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-10">
                        
                        {/* Carte 6 : Total Clients */}
                        <Link 
                            className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-between border-t-4 border-lime-500 dark:hover:bg-gray-700"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Total Clients</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {defaultStats.totalClients.toLocaleString('fr-FR')}
                                </p>
                            </div>
                            <IconWrapper icon="faHandshake" className="text-lime-500 opacity-60" />
                        </Link>

                        {/* Carte 7 : Jours Restants Licence */}
                        <Link 
                            className={`bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-between border-t-4 ${isLicenseCritical ? 'border-red-600' : 'border-indigo-600'} dark:hover:bg-gray-700`}
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                                    Jours Licence Restants
                                </p>
                                <p className={`text-3xl font-bold mt-1 ${isLicenseCritical ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                    {parseInt(defaultStats.licenseDaysRemaining.toLocaleString('fr-FR'),10)} Jrs
                                </p>
                                {isLicenseCritical && (
                                    <span className="text-xs text-red-600 font-semibold mt-1">
                                        Critique ! Renouveler.
                                    </span>
                                )}
                            </div>
                            <IconWrapper icon="faClock" className={`${isLicenseCritical ? 'text-red-600' : 'text-indigo-600'} opacity-60`} />
                        </Link>
                        
                        {/* Carte 1 : Utilisateurs Actifs */}
                        <Link 
                            className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-between border-t-4 border-blue-500 dark:hover:bg-gray-700"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Utilisateurs Actifs</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{defaultStats.activeUsers}</p>
                            </div>
                            <IconWrapper icon="faUsers" className="text-blue-500 opacity-60" />
                        </Link>

                        {/* Carte 4 : Revenus (Mois) */}
                        <Link 
                            className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-between border-t-4 border-red-500 dark:hover:bg-gray-700"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">Revenus (Mois)</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{defaultStats.monthlyRevenue}</p>
                            </div>
                            <IconWrapper icon="faHandHoldingUsd" className="text-red-500 opacity-60" />
                        </Link>
                    </div>

                    {/* --- INVENTAIRE GLOBAL (Tableau détaillé) --- */}
                    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 lg:p-8 mt-10 transition-colors duration-500">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
                            <div className="flex items-center mb-3 md:mb-0">
                                <IconWrapper icon="faWarehouse" className="text-indigo-600 mr-3" />
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                    Inventaire Global Total (Toutes Agences)
                                </h2>
                            </div>
                            
                            {/* 4. Champ de recherche */}
                            <input
                                type="text"
                                placeholder="Rechercher par Code ou Nom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-300"
                            />
                        </div>

                        {filteredInventorySummary && filteredInventorySummary.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Code Article
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Nom Article
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Quantité Totale
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Unité
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {/* Utilisation des données FILTRÉES */}
                                        {filteredInventorySummary.map((article) => ( 
                                            <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {article.code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                    {article.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-900 dark:text-white">
                                                    {/* Affichage de la quantité totale agrégée par Laravel */}
                                                    {article.stock_sum_quantity.toLocaleString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                    {article.unit}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            // Message si aucun article ne correspond à la recherche
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                {searchTerm.length > 0 ? 
                                    `Aucun article ne correspond à la recherche "${searchTerm}".` :
                                    "Aucun article en stock n'a été trouvé dans toutes les agences."
                                }
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// NOTE: L'assignation du layout est maintenue pour le contexte Inertia
BossIndex.layout = page => <CEOLayout children={page} />;
export default BossIndex;