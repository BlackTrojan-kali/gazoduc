import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import ComLayout from '../../layout/ComLayout/ComLayout';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { Head, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import ExportItemsModal from '../../components/Modals/Sales/ExportItemModal'; // Import de la modale d'exportation
import RegLayout from '../../layout/RegLayout/RegLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';

// Fonction utilitaire pour le formatage des nombres
const number_format = (number, decimals, decPoint, thousandsSep) => {
    // eslint-disable-next-line
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep,
        dec = (typeof decPoint === 'undefined') ? '.' : decPoint,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + (Math.round(n * k) / k).toFixed(prec);
        };
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
};

const PageContent = ({ factureItems, articles, agencies, onPageChange, onFilterChange }) => {
 // Utilisation d'un seul objet d'état pour tous les filtres
    const [filters, setFilters] = useState({
        selectedArticle: '',
        selectedAgency: '',
        startDate: '',
        endDate: '',
        page: 1,
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Effet pour détecter le mode sombre
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    // Styles personnalisés pour react-select
    const customStyles = {
        control: (provided) => ({
            ...provided,
            backgroundColor: isDarkMode ? '#1f2937' : 'transparent',
            borderColor: isDarkMode ? 'rgb(55 65 81)' : 'rgb(209 213 219)',
            borderRadius: '0.5rem',
            minHeight: '2.75rem',
            height: '2.75rem',
            boxShadow: 'none',
            '&:hover': {
                borderColor: isDarkMode ? 'rgb(55 65 81)' : 'rgb(209 213 219)',
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? (isDarkMode ? '#374151' : '#f3f4f6') : (isDarkMode ? '#1f2937' : 'white'),
            color: isDarkMode ? 'white' : 'black',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDarkMode ? 'white' : 'rgb(55 65 81)',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDarkMode ? 'rgb(156 163 175)' : 'rgb(107 114 128)', // dark:text-gray-400
        }),
        input: (provided) => ({
            ...provided,
            color: isDarkMode ? 'white' : 'black',
        }),
    };

    // Mise en forme des options pour react-select
    const articleOptions = articles?.map(article => ({ value: article.name, label: article.name })) || [];
    const agencyOptions = agencies?.map(agency => ({ value: agency.name, label: agency.name })) || [];

    // Affiche les items de la page actuelle qui sont passés par la prop factureItems
    const items = factureItems?.data || [];
    const totalPages = factureItems?.last_page || 1;
    const currentPage = factureItems?.current_page || 1;

    // Fonction pour gérer le changement de page
    const handlePageChange = (pageNumber) => {
        if (onPageChange && pageNumber > 0 && pageNumber <= totalPages) {
            onPageChange(pageNumber);
        }
    };

    /**
     * Gère les changements de filtre et les envoie au composant parent.
     * @param {string} filterName - Le nom du filtre ('selectedArticle', 'selectedAgency', etc.).
     * @param {any} value - La nouvelle valeur du filtre.
     */
    const handleFilterChange = (filterName, value) => {
        // Crée un nouvel objet de filtres en réinitialisant la page à 1
        const newFilters = { ...filters, [filterName]: value, page: 1 };
        // Met à jour l'état local du filtre
        setFilters(newFilters);
        // Appelle la fonction onFilterChange du parent pour qu'il puisse mettre à jour la liste des articles en fonction des nouveaux filtres
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };
    
    // Fonctions pour gérer l'ouverture et la fermeture de la modale
    const openExportModal = () => setIsExportModalOpen(true);
    const closeExportModal = () => setIsExportModalOpen(false);

    return (
        <>
            <Head title="Articles Vendus" />
            <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-900">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Liste des Articles Vendus
                    </h1>
                    <button
                        onClick={openExportModal}
                        className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-green-700 dark:border-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                    >
                        <FontAwesomeIcon icon={faFilePdf} /> Exporter
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    {/* Section de filtres */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Filtre par Article */}
                        <div>
                            <label htmlFor="article-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Article</label>
                            <Select
                                id="article-filter"
                                value={articleOptions.find(option => option.value === filters.selectedArticle)}
                                onChange={(selectedOption) => handleFilterChange('selectedArticle', selectedOption ? selectedOption.value : '')}
                                options={[{ value: '', label: 'Tous les articles' }, ...articleOptions]}
                                isClearable={true}
                                styles={customStyles}
                                className="w-full text-sm dark:bg-gray-900 dark:text-white/90"
                                placeholder="Sélectionner un article"
                            />
                        </div>

                        {/* Filtre par Agence */}
                        <div>
                            <label htmlFor="agency-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agence</label>
                            <Select
                                id="agency-filter"
                                value={agencyOptions.find(option => option.value === filters.selectedAgency)}
                                onChange={(selectedOption) => handleFilterChange('selectedAgency', selectedOption ? selectedOption.value : '')}
                                options={[{ value: '', label: 'Toutes les agences' }, ...agencyOptions]}
                                isClearable={true}
                                styles={customStyles}
                                className="w-full text-sm dark:bg-gray-900 dark:text-white/90"
                                placeholder="Sélectionner une agence"
                            />
                        </div>

                        {/* Filtre par Période (Date de début) */}
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                            <input
                                type="date"
                                id="start-date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90"
                            />
                        </div>

                        {/* Filtre par Période (Date de fin) */}
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                            <input
                                type="date"
                                id="end-date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90"
                            />
                        </div>
                    </div>

                    <div className="max-w-full overflow-x-auto">
                        <Table>
                            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                <TableRow>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        ID Facture
                                    </TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Article
                                    </TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Quantité
                                    </TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Prix Unitaire
                                    </TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Sous-total
                                    </TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Agence
                                    </TableCell>
                                    <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                        Date de Facture
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items && items.length > 0 ? (
                                    items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                #{item.facture_id}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {item.article?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                                                {number_format(item.unit_price, 2, ',', ' ')} F
                                            </TableCell>
                                            <TableCell className="py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                                                {number_format(item.subtotal, 2, ',', ' ')} F
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {item.facture?.agency?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {item.facture?.created_at ? new Date(item.facture.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-3 text-center text-gray-500 dark:text-gray-400">
                                            Aucun article vendu trouvé pour la recherche, monsieur.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Contrôles de pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                Précédent
                            </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Page <strong className="font-semibold">{currentPage}</strong> sur <strong className="font-semibold">{totalPages}</strong>
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                Suivant
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ExportItemsModal
                isOpen={isExportModalOpen}
                onClose={closeExportModal}
                articles={articles}
                agencies={agencies}
            />
        </>
    );
};

const RegItems = ({ factureItems, articles, agencies, onPageChange, onFilterChange }) => {
 const {auth} = usePage().props
 
    if(auth.user.role=="controleur"){
        return(
        <RegLayout>
            <PageContent factureItems={factureItems} articles={articles} agencies={agencies} onPageChange={onPageChange} onFilterChange={onFilterChange}/>
        </RegLayout>
        )
    }
 
    if(auth.user.role=="direction"){
        return(
        <DirLayout>
            <PageContent factureItems={factureItems} articles={articles} agencies={agencies} onPageChange={onPageChange} onFilterChange={onFilterChange}/>
        </DirLayout>
        )
    }
}
export default RegItems;
