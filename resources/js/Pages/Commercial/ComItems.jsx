import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import ComLayout from '../../layout/ComLayout/ComLayout';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { Head, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import ExportItemsModal from '../../components/Modals/Sales/ExportItemModal';
import MagLayout from '../../layout/MagLayout/MagLayout';

// ✅ Fonction utilitaire pour formater les nombres
const number_format = (number, decimals, decPoint, thousandsSep) => {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousandsSep === 'undefined' ? ',' : thousandsSep,
    dec = typeof decPoint === 'undefined' ? '.' : decPoint,
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

const PageContent = ({ factureItems, articles, agencies }) => {
  const [filters, setFilters] = useState({
    selectedArticle: '',
    selectedAgency: '',
    startDate: '',
    endDate: '',
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const items = factureItems?.data || [];

  // ✅ Styles pour react-select
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
      color: isDarkMode ? 'rgb(156 163 175)' : 'rgb(107 114 128)',
    }),
    input: (provided) => ({
      ...provided,
      color: isDarkMode ? 'white' : 'black',
    }),
  };

  const articleOptions = articles?.map((article) => ({ value: article.name, label: article.name })) || [];
  const agencyOptions = agencies?.map((agency) => ({ value: agency.name, label: agency.name })) || [];

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

  // ✅ Filtrage frontend des items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const articleName = item.article?.name?.toLowerCase() || '';
      const agencyName = item.facture?.agency?.name?.toLowerCase() || '';
      const factureDate = item.facture?.created_at ? new Date(item.facture.created_at) : null;

      const matchArticle =
        !filters.selectedArticle ||
        articleName.includes(filters.selectedArticle.toLowerCase());

      const matchAgency =
        !filters.selectedAgency ||
        agencyName.includes(filters.selectedAgency.toLowerCase());

      const matchStartDate =
        !filters.startDate || (factureDate && factureDate >= new Date(filters.startDate));

      const matchEndDate =
        !filters.endDate || (factureDate && factureDate <= new Date(filters.endDate));

      return matchArticle && matchAgency && matchStartDate && matchEndDate;
    });
  }, [items, filters]);

  return (
    <>
      <Head title="Articles Vendus" />
      <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-900">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Liste des Articles Vendus
          </h1>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-green-700 dark:border-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            <FontAwesomeIcon icon={faFilePdf} /> Exporter
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          {/* 🔍 Filtres Frontend */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtre Article */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Article</label>
              <Select
                value={articleOptions.find(o => o.value === filters.selectedArticle)}
                onChange={(opt) => setFilters({ ...filters, selectedArticle: opt ? opt.value : '' })}
                options={[{ value: '', label: 'Tous les articles' }, ...articleOptions]}
                isClearable
                styles={customStyles}
                placeholder="Sélectionner un article"
              />
            </div>

            {/* Filtre Agence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agence</label>
              <Select
                value={agencyOptions.find(o => o.value === filters.selectedAgency)}
                onChange={(opt) => setFilters({ ...filters, selectedAgency: opt ? opt.value : '' })}
                options={[{ value: '', label: 'Toutes les agences' }, ...agencyOptions]}
                isClearable
                styles={customStyles}
                placeholder="Sélectionner une agence"
              />
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent focus:border-brand-300 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent focus:border-brand-300 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          </div>

          {/* 🧾 Tableau filtré */}
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader>ID Facture</TableCell>
                  <TableCell isHeader>Article</TableCell>
                  <TableCell isHeader>Quantité</TableCell>
                  <TableCell isHeader>Prix Unitaire</TableCell>
                  <TableCell isHeader>Sous-total</TableCell>
                  <TableCell isHeader>Agence</TableCell>
                  <TableCell isHeader>Date</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>#{item.facture_id}</TableCell>
                      <TableCell>{item.article?.name || 'N/A'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{number_format(item.unit_price, 2, ',', ' ')} F</TableCell>
                      <TableCell>{number_format(item.subtotal, 2, ',', ' ')} F</TableCell>
                      <TableCell>{item.facture?.agency?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {item.facture?.created_at
                          ? new Date(item.facture.created_at).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                      Aucun article ne correspond à vos filtres, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <ExportItemsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        articles={articles}
        agencies={agencies}
      />
    </>
  );
};

const ComItems = ({ factureItems, articles, agencies }) => {
  const { auth } = usePage().props;
  if (auth.user.role === 'commercial') {
    return (
      <ComLayout>
        <PageContent factureItems={factureItems} articles={articles} agencies={agencies} />
      </ComLayout>
    );
  }
  if (auth.user.role === 'magasin') {
    return (
      <MagLayout>
        <PageContent factureItems={factureItems} articles={articles} agencies={agencies} />
      </MagLayout>
    );
  }
};
export default ComItems;
