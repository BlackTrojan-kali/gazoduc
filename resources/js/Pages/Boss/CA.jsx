import React, { useState, useEffect } from 'react';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faStore, faFilter } from '@fortawesome/free-solid-svg-icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'; // Importez les composants Recharts

const CA = () => {
    // Récupérer les props de la page
    const { monthlyChartData, agencySalesData, agencies, invoiceTypes, selectedAgencyId, selectedInvoiceType } = usePage().props;

    // États locaux pour les filtres
    const [filterAgency, setFilterAgency] = useState(selectedAgencyId || '');
    const [filterType, setFilterType] = useState(selectedInvoiceType || '');

    // Fonction pour le formatage de la monnaie
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // --- Configuration du graphique Recharts ---
    // Les données sont déjà formatées du backend, pas besoin de transformation majeure pour Recharts.
    // monthlyChartData est un tableau d'objets comme : [{ month: "janvier 2023", total_ca: 12345 }]

    // Fonction de formatage pour l'axe Y et le tooltip de Recharts
    const formatYAxis = (value) => {
        return formatCurrency(value);
    };

    // Custom Tooltip pour Recharts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-white border border-gray-300 rounded-md shadow-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                    <p className="font-bold">{`Mois : ${label}`}</p>
                    <p className="text-brand-600">{`Chiffre d'Affaires : ${formatCurrency(payload[0].value)}`}</p>
                </div>
            );
        }
        return null;
    };

    // --- Gestion du mode sombre pour Recharts (via CSS ou props conditionnelles) ---
    const [chartColors, setChartColors] = useState({
        textColor: 'rgb(107 114 128)', // text-gray-500
        gridColor: 'rgba(209, 213, 219, 0.2)', // gris clair transparent
        barColor: 'rgba(75, 192, 192, 0.8)', // couleur de la barre
    });

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setChartColors({
            textColor: isDarkMode ? 'rgb(209 213 219)' : 'rgb(107 114 128)', // text-gray-300 vs text-gray-500
            gridColor: isDarkMode ? 'rgba(107, 114, 128, 0.2)' : 'rgba(209, 213, 219, 0.2)',
            barColor: isDarkMode ? 'rgba(0, 150, 136, 0.8)' : 'rgba(75, 192, 192, 0.8)', // Une couleur adaptée pour le mode sombre
        });
    }, [usePage().props]); // Dépendance sur les props de la page pour réagir au changement de thème (si géré par des props) ou juste au chargement initial

    // Fonction pour appliquer les filtres
    const applyFilters = () => {
        router.get(route('boss.sales'), {
            agency_id: filterAgency,
            invoice_type: filterType,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset les filtres
    const resetFilters = () => {
        setFilterAgency('');
        setFilterType('');
        router.get(route('boss.sales'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Chiffre d'Affaires" />

            <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-900">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 dark:text-white">Statistiques de Ventes et Chiffre d'Affaires</h1>

                {/* Section du Graphique de Chiffre d'Affaires Mensuel */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 shadow-lg mb-10 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center dark:text-white">
                                <FontAwesomeIcon icon={faChartLine} className="mr-3 text-brand-600" />
                                Chiffre d'Affaires Global par Mois
                            </h3>
                        </div>
                    </div>
                    <div className="h-96"> {/* Hauteur fixe pour le graphique */}
                        {monthlyChartData && monthlyChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyChartData}
                                    margin={{
                                        top: 20, right: 30, left: 20, bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fill: chartColors.textColor }}
                                        tickLine={{ stroke: chartColors.textColor }}
                                    />
                                    <YAxis
                                        tickFormatter={formatYAxis}
                                        tick={{ fill: chartColors.textColor }}
                                        tickLine={{ stroke: chartColors.textColor }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />
                                    <Legend wrapperStyle={{ color: chartColors.textColor }} />
                                    <Bar dataKey="total_ca" name="Chiffre d'Affaires" fill={chartColors.barColor} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 p-4">Aucune donnée de chiffre d'affaires mensuel à afficher.</p>
                        )}
                    </div>
                </div>

                <hr className="my-10 border-gray-300 dark:border-gray-700" />

                {/* Section des Statistiques par Agence avec Filtres */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 shadow-lg mb-10 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center dark:text-white">
                                <FontAwesomeIcon icon={faStore} className="mr-3 text-brand-600" />
                                Chiffre d'Affaires par Agence
                            </h3>
                        </div>
                    </div>

                    {/* Zone de filtres */}
                    <div className="flex flex-wrap items-end gap-4 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div className="flex-grow">
                            <label htmlFor="agency-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FontAwesomeIcon icon={faStore} className="mr-2" /> Filtrer par Agence
                            </label>
                            <select
                                id="agency-filter"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                value={filterAgency}
                                onChange={(e) => setFilterAgency(e.target.value)}
                            >
                                <option value="">Toutes les agences</option>
                                {agencies.map(agency => (
                                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-grow">
                            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filtrer par Type
                            </label>
                            <select
                                id="type-filter"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="">Tous les types</option>
                                {invoiceTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                            Appliquer les filtres
                        </button>
                        <button
                            onClick={resetFilters}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Agence</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Type de Facture</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Chiffre d'Affaires Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {agencySalesData && agencySalesData.length > 0 ? (
                                    agencySalesData.map((data, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{data.agency_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{data.invoice_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold dark:text-gray-300">{formatCurrency(data.total_ca)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                                            Aucune donnée de vente par agence à afficher pour les filtres sélectionnés, monsieur.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

CA.layout = page => <CEOLayout children={page} />;
export default CA;