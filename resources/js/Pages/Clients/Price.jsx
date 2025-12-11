// resources/js/Pages/Prices/Price.jsx
import React, { useMemo, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faPlus,
  faTrash,
  faDollarSign,
  faFileCsv,
  faSearch,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import PriceFormModal from "../../components/Modals/Clients/PriceModal";
import RegLayout from '../../layout/RegLayout/RegLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';
import DirFuelLayout from '../../layout/DirFuelLayout/DirFuelLayout';
import useLicenceChoice from '../../hooks/useLicenceChoice';
import ExportPricesModal from '../../components/Modals/Clients/ExportPriceModal';

const PageContent = ({ prices, clientCategories, articles, agencies }) => {
  // modale / sélection
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isFormExportModalOpen, setIsFormExportModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);

  // filtres
  const [selectedArticle, setSelectedArticle] = useState(null); // { value, label }
  const [selectedAgency, setSelectedAgency] = useState(null); // { value, label }
  const [categorySearch, setCategorySearch] = useState('');

  const { auth } = usePage().props;
  const { delete: inertiaDelete, processing } = useForm();

  const openCreateModal = () => { setSelectedPrice(null); setIsFormModalOpen(true); };
  const openEditModal = (price) => { setSelectedPrice(price); setIsFormModalOpen(true); };
  const closeFormModal = () => { setSelectedPrice(null); setIsFormModalOpen(false); };
  const closeExportFormModal = () => {  setIsFormExportModalOpen(false); };

  const canDelete = () => auth.user.role === 'admin';

  const handleDelete = (priceId) => {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous êtes sur le point de supprimer ce prix. Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('price.delete', priceId), {
          preserveScroll: true,
          onSuccess: () => Swal.fire('Supprimé !', 'Le prix a été supprimé avec succès.', 'success'),
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire('Erreur !', 'Une erreur est survenue. Veuillez réessayer.', 'error');
          },
        });
      }
    });
  };

  const handleExportCsv = () => {
    if (!prices.data || prices.data.length === 0) {
      Swal.fire('Information', 'Aucune donnée de prix à exporter.', 'info');
      return;
    }
    const headers = ["Article", "Catégorie Client", "Agence", "Prix Principal", "Prix Consigne", "Date de Création"];
    const csvContent = prices.data.map(price => {
      const articleName = price.article ? price.article.name : 'N/A';
      const categoryName = price.category ? price.category.name : 'N/A';
      const agencyName = price.agency ? price.agency.name : 'N/A';
      const priceValue = price.price ? new Intl.NumberFormat('fr-CM').format(price.price) : 'N/A';
      const consignePriceValue = price.consigne_price != null ? new Intl.NumberFormat('fr-CM').format(price.consigne_price) : 'N/A';
      const creationDate = new Date(price.created_at).toLocaleString('fr-FR');
      return `"${articleName}";"${categoryName}";"${agencyName}";"${priceValue}";"${consignePriceValue}";"${creationDate}"`;
    });
    const csvString = [headers.join(';'), ...csvContent].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'prix_par_categories.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Swal.fire('Succès', 'Les données ont été exportées en CSV.', 'success');
  };

  // options react-select
  const articleOptions = articles.map(a => ({ value: a.id, label: a.name }));
  const agencyOptions = agencies.map(a => ({ value: a.id, label: a.name }));

  // filtrage côté client (useMemo pour perf)
  const filteredPrices = useMemo(() => {
    const q = categorySearch?.trim().toLowerCase();
    return (prices.data || []).filter(price => {
      const matchArticle = selectedArticle ? price.article_id === selectedArticle.value : true;
      const matchAgency = selectedAgency ? price.agency_id === selectedAgency.value : true;
      const matchCategory = q ? (price.category?.name || '').toLowerCase().includes(q) : true;
      return matchArticle && matchAgency && matchCategory;
    });
  }, [prices.data, selectedArticle, selectedAgency, categorySearch]);

  const resetFilters = () => {
    setSelectedArticle(null);
    setSelectedAgency(null);
    setCategorySearch('');
  };

  // classes react-select via classNames -> utilise Tailwind + dark:
  const reactSelectClassNames = {
    control: () => 'border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-500 border-gray-300 dark:border-gray-700',
    menu: () => 'bg-white dark:bg-gray-800 dark:text-gray-100 z-50 shadow-lg rounded-md',
    option: ({ isFocused, isSelected }) =>
      `${isSelected ? 'bg-blue-600 text-white' : isFocused ? 'bg-gray-100 dark:bg-gray-700' : ''} cursor-pointer px-3 py-2 text-sm`,
    placeholder: () => 'text-gray-500 dark:text-gray-400 text-sm',
    singleValue: () => 'text-gray-900 dark:text-gray-100 text-sm',
    input: () => 'text-gray-900 dark:text-gray-100',
    indicatorSeparator: () => 'hidden',
    dropdownIndicator: () => 'text-gray-500 dark:text-gray-400',
  };

  return (
    <>
      <Head title="Prix par Catégories" />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 text-black bg-white dark:border-gray-800 dark:bg-gray-900 px-4 pb-3 pt-4 sm:px-6">

          {/* header actions */}
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-3">
              <FontAwesomeIcon icon={faDollarSign} className="text-green-600 dark:text-green-400" /> Liste des Prix par Catégories
            </h3>

            <div className="flex items-center gap-3">
              <Button onClick={handleExportCsv} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <FontAwesomeIcon icon={faFileCsv} /> Exporter CSV
              </Button>
              <Button onClick={() => { setIsFormExportModalOpen(true); }} className="inline-flex items-center bg-red-500 gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <FontAwesomeIcon icon={faPlus} /> Exporter PDF
              </Button>
              <Button onClick={() => { setSelectedPrice(null); setIsFormModalOpen(true); }} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <FontAwesomeIcon icon={faPlus} /> Créer un Prix
              </Button>
            </div>
          </div>

          {/* filtres */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="w-full sm:w-1/3">
              <Select
                className="react-select-container text-black"
                classNamePrefix="react-select"
                options={articleOptions}
                value={selectedArticle}
                onChange={setSelectedArticle}
                isClearable
                placeholder="Filtrer par article..."
                menuPlacement="auto"
                menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                classNames={reactSelectClassNames}
              />
            </div>

            <div className="w-full sm:w-1/3">
              <Select
                className="react-select-container text-black"
                classNamePrefix="react-select"
                options={agencyOptions}
                value={selectedAgency}
                onChange={setSelectedAgency}
                isClearable
                placeholder="Filtrer par agence..."
                menuPlacement="auto"
                menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                classNames={reactSelectClassNames}
              />
            </div>

            <div className="w-full sm:w-1/3 relative flex items-center gap-2">
              <span className="absolute left-3 text-gray-400 dark:text-gray-500">
                <FontAwesomeIcon icon={faSearch} />
              </span>
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Rechercher une catégorie client..."
                className="pl-9 pr-10 w-full border rounded-md py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-0"
              />
              <button
                type="button"
                onClick={resetFilters}
                className="ml-2 inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200"
                title="Réinitialiser les filtres"
              >
                <FontAwesomeIcon icon={faRotateLeft} />
              </button>
            </div>
          </div>

          {/* table */}
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-600 dark:text-gray-400 text-start text-xs">Article</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-600 dark:text-gray-400 text-start text-xs">Catégorie Client</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-600 dark:text-gray-400 text-start text-xs">Agence</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-600 dark:text-gray-400 text-start text-xs">Prix Principal</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-600 dark:text-gray-400 text-start text-xs">Prix Consigne</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-600 dark:text-gray-400 text-start text-xs">Date de Création</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-600 dark:text-gray-400 text-start text-xs">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredPrices.length > 0 ? (
                  filteredPrices.map(price => (
                    <TableRow key={price.id}>
                      <TableCell className="py-3 font-medium text-gray-800 dark:text-gray-100">{price.article?.name || 'N/A'}</TableCell>
                      <TableCell className="py-3 text-gray-600 dark:text-gray-400">{price.category?.name || 'N/A'}</TableCell>
                      <TableCell className="py-3 text-gray-600 dark:text-gray-400">{price.agency?.name || 'N/A'}</TableCell>
                      <TableCell className="py-3 text-gray-600 dark:text-gray-400">
                        {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price.price)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-600 dark:text-gray-400">
                        {price.consigne_price != null ? new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(price.consigne_price) : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-600 dark:text-gray-400">
                        {new Date(price.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="py-3 flex items-center gap-2">
                        <Button onClick={() => openEditModal(price)} className="inline-flex items-center gap-2 border rounded-md px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </Button>
                        {canDelete() && (
                          <button disabled={processing} onClick={() => handleDelete(price.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500">
                            <FontAwesomeIcon icon={faTrash} /> Supprimer
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-3 text-center text-gray-500 dark:text-gray-400">Aucun prix trouvé.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* pagination */}
            {prices.links && prices.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {prices.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      preserveState
                      preserveScroll
                      only={['prices']}
                      className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                        ${link.active ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                          : !link.url ? 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      onClick={(e) => { if (!link.url) e.preventDefault(); }}
                    />
                  ))}
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Modale */}
      <PriceFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        price={selectedPrice}
        clientCategories={clientCategories}
        articles={articles}
        agencies={agencies}
        routeName={selectedPrice ? "price.update" : "price.store"}
      />
      <ExportPricesModal
        isOpen={isFormExportModalOpen}
        onClose={closeExportFormModal}
        agencies={agencies}
        clientCategories={clientCategories}
        routeName={"prices.export.pdf"}
        articles={articles}      
      />
    </>
  );
};

const Price = ({ prices, clientCategories, articles, agencies }) => {
  const { auth } = usePage().props;
  const { DirLicence } = useLicenceChoice();

  if (auth.user.role === "controleur") {
    return (
      <RegLayout>
        <PageContent prices={prices} clientCategories={clientCategories} articles={articles} agencies={agencies} />
      </RegLayout>
    );
  }

  if (auth.user.role === "direction") {
    return DirLicence === "gaz" ? (
      <DirLayout>
        <PageContent prices={prices} clientCategories={clientCategories} articles={articles} agencies={agencies} />
      </DirLayout>
    ) : (
      <DirFuelLayout>
        <PageContent prices={prices} clientCategories={clientCategories} articles={articles} agencies={agencies} />
      </DirFuelLayout>
    );
  }

  return null;
};

export default Price;
