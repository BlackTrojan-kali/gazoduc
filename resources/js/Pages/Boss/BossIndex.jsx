import React from 'react';
import CEOLayout from '../../layout/CEOLayout/CEOLayout';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBoxOpen, faCalendarCheck, faHandHoldingUsd, faChartBar } from '@fortawesome/free-solid-svg-icons';

// Composant pour la jauge
const Gauge = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const colorClass = percentage > 75 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div
                className={`h-2.5 rounded-full ${colorClass}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

// Nouveau composant pour une carte de stock individuelle
const StockCard = ({ articleName, quantity }) => {
    const maxQuantity = 100000;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <h4 className="text-md font-semibold text-gray-700 truncate dark:text-gray-200">{articleName}</h4>
            <p className="text-xl font-bold text-gray-800 mt-1 dark:text-white">{quantity} Unités</p>
            <Gauge value={quantity} max={maxQuantity} />
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                {quantity} sur {maxQuantity} ({ (quantity / maxQuantity * 100).toFixed(0) }%)
            </p>
        </div>
    );
};

// Composant de pagination réutilisable
const Pagination = ({ links }) => {
    return (
        <nav className="flex justify-center mt-4 space-x-2">
            {links.map((link) => (
                <Link
                    key={link.label}
                    href={link.url || '#'}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md
                                ${link.active
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-900 dark:border-indigo-700 dark:text-indigo-200'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'}
                                ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </nav>
    );
};


const BossIndex = ({ consolidatedPayments, monthlyConsolidatedPayments, clientsCount, globalStockByArticle, daysRemainingForLicence }) => {

    const formatCurrency = (amount) => {
        // Gère les cas où l'amount pourrait être NaN ou null/undefined
        if (typeof amount !== 'number' || isNaN(amount)) {
            amount = 0; // Définit à 0 pour éviter le NaN dans le formatage
        }
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatMonthYear = (monthYear) => {
        const [year, month] = monthYear.split('-');
        const date = new Date(year, month - 1, 1);
        return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
    };

    const daysRemaining = daysRemainingForLicence !== null ? Math.floor(daysRemainingForLicence) : null;


    return (
        <>
            <Head title="Dashboard" />

            <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-900">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 dark:text-white">Tableau de Bord</h1>

                {/* Section des cartes récapitulatives principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {/* Carte du Nombre de Clients */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Nombre de clients</h3>
                            <p className="text-4xl font-extrabold text-indigo-600 mt-2">{clientsCount}</p>
                        </div>
                        <div className="bg-indigo-100 p-3 rounded-full">
                           <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                    
                    {/* Carte des Jours Restants pour la Licence */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between dark:bg-gray-800">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Jours restants pour la licence</h3>
                            <p className={`text-4xl font-extrabold mt-2 ${daysRemaining > 7 ? 'text-green-600' : daysRemaining > 0 ? 'text-orange-500' : 'text-red-600'}`}>
                                {daysRemaining !== null ? daysRemaining : 'N/A'}
                            </p>
                            {daysRemaining !== null && daysRemaining <= 0 && (
                                <p className="text-sm text-red-500 mt-1">Licence expirée ! Veuillez renouveler.</p>
                            )}
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                           <FontAwesomeIcon icon={faCalendarCheck} className="w-8 h-8 text-red-600" />
                        </div>
                    </div>
                    
                    {/* Carte Total Versements Réalisés (Global) - Occupant la largeur entière sur grand écran */}
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between col-span-1 md:col-span-2 dark:bg-gray-800">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Total Versements Réalisés (Global)</h3>
                            <p className="text-5xl font-extrabold text-teal-600 mt-2">
                                {/* Utilisation de parseFloat pour s'assurer que payment_value est un nombre, et || 0 pour gérer les NaN */}
                                {formatCurrency(
                                    consolidatedPayments.data.reduce((acc, p) => acc + (parseFloat(p.payment_value) || 0), 0)
                                )}
                            </p>
                        </div>
                        <div className="bg-teal-100 p-3 rounded-full">
                           <FontAwesomeIcon icon={faHandHoldingUsd} className="w-8 h-8 text-teal-600" />
                        </div>
                    </div>
                    
                </div>

                <hr className="my-10 border-gray-300 " />

                {/* Section des Statistiques Mensuelles des Versements */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 shadow-lg mb-10 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center dark:text-white">
                                <FontAwesomeIcon icon={faChartBar} className="mr-3 text-brand-600" />
                                Statistiques Mensuelles des Versements
                            </h3>
                        </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Mois</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Total Versements</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Total Ventes Associées</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Écart Mensuel</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {monthlyConsolidatedPayments.data && monthlyConsolidatedPayments.data.length > 0 ? (
                                    monthlyConsolidatedPayments.data.map((monthData) => (
                                        <tr key={monthData.month_year} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {formatMonthYear(monthData.month_year)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold dark:text-gray-300">
                                                {formatCurrency(parseFloat(monthData.total_payment_value_month) || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {formatCurrency(parseFloat(monthData.total_associated_sales_month) || 0)}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${monthData.total_difference_month === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(parseFloat(monthData.total_difference_month) || 0)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                                            Aucune statistique mensuelle à afficher pour le moment, monsieur.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Liens de pagination pour les statistiques mensuelles */}
                    {monthlyConsolidatedPayments.links && monthlyConsolidatedPayments.links.length > 3 && (
                        <Pagination links={monthlyConsolidatedPayments.links} />
                    )}
                </div>

                <hr className="my-10 border-gray-300 dark:border-gray-700" />

                {/* Section du Stock Global par Article */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center dark:text-white">
                    <FontAwesomeIcon icon={faBoxOpen} className="mr-3 text-brand-600" />
                    Stocks par Article
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                    {Object.keys(globalStockByArticle).length > 0 ? (
                        Object.entries(globalStockByArticle).map(([articleName, quantity]) => (
                            <StockCard key={articleName} articleName={articleName} quantity={quantity} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500 dark:text-gray-400">Aucun article en stock à afficher.</p>
                    )}
                </div>

                <hr className="my-10 border-gray-300 dark:border-gray-700" />

                {/* Section du tableau des statistiques de versement (individuelles) */}
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center dark:text-white">
                                <FontAwesomeIcon icon={faHandHoldingUsd} className="mr-3 text-brand-600" />
                                Détails des Derniers Versements
                            </h3>
                        </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Nom du Client</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Date du Versement</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Valeur du Versement</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Total Ventes Associées</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Écart</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                {consolidatedPayments.data && consolidatedPayments.data.length > 0 ? (
                                    consolidatedPayments.data.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{payment.client_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{payment.payment_date}</td>
                                            {/* Utilisation de parseFloat pour s'assurer que payment_value est un nombre, et || 0 pour gérer les NaN */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold dark:text-gray-300">{formatCurrency(parseFloat(payment.payment_value) || 0)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{formatCurrency(parseFloat(payment.total_associated_sales) || 0)}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${payment.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(parseFloat(payment.difference) || 0)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                                            Aucun versement à afficher pour le moment, monsieur.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Liens de pagination pour les détails des versements */}
                    {consolidatedPayments.links && consolidatedPayments.links.length > 3 && (
                        <Pagination links={consolidatedPayments.links} />
                    )}
                </div>
            </div>
        </>
    );
};

BossIndex.layout = page => <CEOLayout children={page} />;
export default BossIndex;