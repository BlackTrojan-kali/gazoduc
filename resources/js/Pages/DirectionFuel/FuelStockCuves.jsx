import React, { useState, useMemo, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { 
    Filter, 
    Droplets, 
    Warehouse, 
    Info, 
    ChevronDown, 
    ChevronRight, 
    Folder, 
    FolderOpen, 
    Building,
    Search
} from 'lucide-react';
import DirFuelLayout from '../../layout/DirFuelLayout/DirFuelLayout';

const FuelStockCuves = ({ cuves, agencies }) => {
    const [selectedAgencyFilter, setSelectedAgencyFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // --- ÉTATS D'EXPANSION ---
    // Clés : Nom de l'agence / Nom de l'article combiné (ex: "Yaounde-Super")
    const [expandedAgencies, setExpandedAgencies] = useState({});
    const [expandedArticles, setExpandedArticles] = useState({});

    // --- 1. FILTRAGE INITIAL ---
    const filteredCuves = useMemo(() => {
        return cuves.filter(cuve => {
            // Filtre par Select (Agence)
            const matchAgency = selectedAgencyFilter === 'all' || cuve.agency_id.toString() === selectedAgencyFilter.toString();
            // Filtre par Recherche
            const matchSearch = cuve.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (cuve.article?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchAgency && matchSearch;
        });
    }, [cuves, selectedAgencyFilter, searchTerm]);

    // --- 2. REGROUPEMENT (AGENCE -> ARTICLE -> CUVES) ---
    const groupedData = useMemo(() => {
        const structure = {};

        filteredCuves.forEach(cuve => {
            const agencyName = cuve.agency?.name || 'Agence Inconnue';
            const articleName = cuve.article?.name || cuve.product_type || 'Produit Inconnu';

            if (!structure[agencyName]) {
                structure[agencyName] = {};
            }
            if (!structure[agencyName][articleName]) {
                structure[agencyName][articleName] = [];
            }

            structure[agencyName][articleName].push(cuve);
        });

        return structure;
    }, [filteredCuves]);

    // --- 3. OUVERTURE AUTOMATIQUE SI RECHERCHE ---
    useEffect(() => {
        if (searchTerm) {
            const allAgencies = {};
            const allArticles = {};
            
            Object.keys(groupedData).forEach(agency => {
                allAgencies[agency] = true;
                Object.keys(groupedData[agency]).forEach(article => {
                    allArticles[`${agency}-${article}`] = true;
                });
            });
            setExpandedAgencies(allAgencies);
            setExpandedArticles(allArticles);
        }
    }, [searchTerm, groupedData]);

    // --- HELPERS TOGGLE ---
    const toggleAgency = (agencyName) => {
        setExpandedAgencies(prev => ({ ...prev, [agencyName]: !prev[agencyName] }));
    };

    const toggleArticle = (agencyName, articleName) => {
        const key = `${agencyName}-${articleName}`;
        setExpandedArticles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="p-6">
            <Head title="Gestion des Stocks - Cuves" />

            {/* En-tête et Filtres */}
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">État des Cuves</h1>
                        <p className="text-sm text-gray-500">Vue hiérarchique : Agence &gt; Produit &gt; Stocks</p>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        Total : {filteredCuves.length} cuve(s)
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    {/* Recherche Texte */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher une cuve, un produit..." 
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtre Select Agence */}
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Filter size={18} className="text-gray-400" />
                        <select 
                            className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 min-w-[200px]"
                            value={selectedAgencyFilter}
                            onChange={(e) => setSelectedAgencyFilter(e.target.value)}
                        >
                            <option value="all">Toutes les agences</option>
                            {agencies.map(agency => (
                                <option key={agency.id} value={agency.id}>{agency.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- RENDU DES DOSSIERS --- */}
            <div className="space-y-6">
                {Object.entries(groupedData).map(([agencyName, articlesMap]) => {
                    const isAgencyOpen = expandedAgencies[agencyName];
                    const totalCuvesInAgency = Object.values(articlesMap).flat().length;

                    return (
                        <div key={agencyName} className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
                            
                            {/* NIVEAU 1 : DOSSIER AGENCE */}
                            <div 
                                onClick={() => toggleAgency(agencyName)}
                                className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isAgencyOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'} transition-colors`}>
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">{agencyName}</h2>
                                        <p className="text-xs text-gray-500">{Object.keys(articlesMap).length} produit(s) • {totalCuvesInAgency} cuve(s)</p>
                                    </div>
                                </div>
                                {isAgencyOpen ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                            </div>

                            {/* CONTENU AGENCE */}
                            {isAgencyOpen && (
                                <div className="p-4 space-y-4 bg-white dark:bg-gray-800 animate-fadeIn">
                                    {Object.entries(articlesMap).map(([articleName, cuvesList]) => {
                                        const articleKey = `${agencyName}-${articleName}`;
                                        const isArticleOpen = expandedArticles[articleKey];

                                        return (
                                            <div key={articleKey} className="ml-0 md:ml-4 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                                                
                                                {/* NIVEAU 2 : SOUS-DOSSIER ARTICLE */}
                                                <div 
                                                    onClick={() => toggleArticle(agencyName, articleName)}
                                                    className="flex items-center justify-between py-2 pr-2 cursor-pointer group select-none"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-yellow-500 dark:text-yellow-600">
                                                            {isArticleOpen ? <FolderOpen size={18} /> : <Folder size={18} />}
                                                        </div>
                                                        <h3 className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                                                            {articleName}
                                                        </h3>
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500">
                                                            {cuvesList.length}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-300 group-hover:text-gray-500">
                                                        {isArticleOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    </div>
                                                </div>

                                                {/* NIVEAU 3 : GRILLE DES CUVES */}
                                                {isArticleOpen && (
                                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                                        {cuvesList.map((cuve) => {
                                                            // Calculs Jauges
                                                            const realPercent = Math.min((cuve.stock?.quantity / cuve.capacity_liter) * 100, 100) || 0;
                                                            const theoPercent = Math.min((cuve.stock?.theorical_quantity / cuve.capacity_liter) * 100, 100) || 0;
                                                            
                                                            return (
                                                                <div key={cuve.id} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                                                                    {/* En-tête Carte */}
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="bg-white dark:bg-gray-800 p-1.5 rounded shadow-sm">
                                                                                <Droplets size={16} className="text-blue-500" />
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{cuve.name}</h4>
                                                                                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Cap: {cuve.capacity_liter} L</span>
                                                                            </div>
                                                                        </div>
                                                                        {realPercent <= 10 && (
                                                                            <Info size={16} className="text-red-500 animate-pulse" title="Niveau Critique" />
                                                                        )}
                                                                    </div>

                                                                    {/* Jauges Compactes */}
                                                                    <div className="space-y-3">
                                                                        {/* Réel */}
                                                                        <div>
                                                                            <div className="flex justify-between text-[10px] mb-1">
                                                                                <span className="text-blue-600 font-bold">Réel</span>
                                                                                <span className="font-mono">{cuve.stock?.quantity ?? 0} L</span>
                                                                            </div>
                                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                                <div 
                                                                                    className="bg-blue-500 h-2 rounded-full" 
                                                                                    style={{ width: `${realPercent}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Théorique */}
                                                                        <div>
                                                                            <div className="flex justify-between text-[10px] mb-1">
                                                                                <span className="text-purple-600 font-bold">Théorique</span>
                                                                                <span className="font-mono">{cuve.stock?.theorical_quantity ?? 0} L</span>
                                                                            </div>
                                                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                                <div 
                                                                                    className="bg-purple-500 h-2 rounded-full opacity-70" 
                                                                                    style={{ width: `${theoPercent}%` }}
                                                                                ></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Footer Carte */}
                                                                    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-[10px] text-gray-400">
                                                                        <span>ID: {cuve.id}</span>
                                                                        <span>Écart: {(cuve.stock?.quantity - cuve.stock?.theorical_quantity).toFixed(2)} L</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
                
                {Object.keys(groupedData).length === 0 && (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <Warehouse size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Aucune donnée trouvée pour cette sélection.</p>
                        <p className="text-xs text-gray-400 mt-1">Essayez de modifier les filtres ou la recherche.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

FuelStockCuves.layout = page => <DirFuelLayout children={page} />;
export default FuelStockCuves;