import React, { useState, useMemo } from 'react';
import ComLayout from '../../layout/ComLayout/ComLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react'; // Import usePage
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPrint, faTrash, faPlus, faFilter, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Select from 'react-select';

// Importez les modales
import InvoiceDetailsModal from '../../components/Modals/Sales/InvoiceDetailModal';
import NewSaleModal from '../../components/Modals/Sales/NewSaleModal';
import ExportSalesModal from '../../components/Modals/Sales/ExportSalesModal'; // Import de la nouvelle modale
import MagFuelLayout from '../../layout/FuelLayout/MagFuelLayout';

const PageContent = ({ factures, clients, articles, agencies }) => {
  const { delete: inertiaDelete } = useForm();
  const { auth } = usePage().props; // Get auth.user from Inertia's page props

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false); // État pour la modale d'export

  // --- États pour les filtres frontend ---
  const [filterClient, setFilterClient] = useState(null);
  const [filterAgency, setFilterAgency] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // --- canDelete function (integrated) ---
  const canDelete = (movementCreatedAt) => {
    // If the user does not have `modification_days` defined or it is 0, we do not allow deletion.
    // Ensure auth.user exists and has modif_days property.
    if (!auth.user || typeof auth.user.modif_days === 'undefined' || auth.user.modif_days <= 0) {
      return false;
    }
    const today = new Date();
    const creationDate = new Date(movementCreatedAt);
    
    // Calculate the difference in days
    const diffTime = today.getTime() - creationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Return true if the movement was created within the allowed period
    return diffDays <= auth.user.modif_days;
  };

  // --- Filtrage des factures selon les filtres (optimisé avec useMemo) ---
  const filteredFactures = useMemo(() => {
    if (!factures || !factures.data) {
      return [];
    }
    
    return factures.data.filter(facture => {
      // 1. Filtrer par client
      const matchesClient = !filterClient || (facture.client && String(facture.client.id) === filterClient.value);
      
      // 2. Filtrer par agence
      const matchesAgency = !filterAgency || (facture.agency && String(facture.agency.id) === filterAgency.value);
      
      // 3. Filtrer par période de date
      const factureDate = new Date(facture.created_at);
      const start = filterStartDate ? new Date(filterStartDate) : null;
      const end = filterEndDate ? new Date(filterEndDate) : null;
      
      const matchesDateRange = (!start || factureDate >= start) && (!end || factureDate <= end);
      
      return matchesClient && matchesAgency && matchesDateRange;
    });
  }, [factures.data, filterClient, filterAgency, filterStartDate, filterEndDate]);

  // --- Fonctions pour les modales ---
  const openDetailsModal = (facture) => {
    setSelectedFacture(facture);
    setIsDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedFacture(null);
  };

  const openNewSaleModal = () => {
    setIsNewSaleModalOpen(true);
  };
  const closeNewSaleModal = () => {
    setIsNewSaleModalOpen(false);
  };

  // Fonctions pour la nouvelle modale d'exportation
  const openExportModal = () => {
    setIsExportModalOpen(true);
  };
  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  // --- Fonction de Suppression de Facture ---
  const handleDeleteFacture = (facture) => { // Pass the full facture object
    if (!canDelete(facture.created_at)) {
      Swal.fire(
        'Accès Refusé',
        `Monsieur, vous ne pouvez pas supprimer cette facture car elle a été créée il y a plus de ${auth.user.modif_days} jours (ou les jours de modification ne sont pas définis).`,
        'error'
      );
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: "Vous êtes sur le point de supprimer cette facture. Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('factures.delete', facture.id), { // Use facture.id here
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimée !',
              'La facture a été supprimée avec succès.',
              'success'
            );
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de la facture.',
              'error'
            );
          },
        });
      }
    });
  };

  // --- Fonction d'Impression mise à jour pour télécharger le PDF ---
  const handlePrintFacture = (factureId) => {
    window.open(route('factures.print', { facture: factureId }), '_blank');
    Swal.fire(
      'Téléchargement en cours',
      'Votre facture PDF est en cours de préparation et de téléchargement, monsieur.',
      'info'
    );
  };
  
  // Options pour le sélecteur de clients
  const clientOptions = Array.isArray(clients)
    ? clients.map(client => ({ value: String(client.id), label: client.name }))
    : [];
    
  // Options pour le sélecteur d'agences
  const agencyOptions = Array.isArray(agencies)
    ? agencies.map(agency => ({ value: String(agency.id), label: agency.name }))
    : [];

  // Définition des variables CSS pour les couleurs en fonction du thème
  const colors = {
    '--text-color': 'rgb(31 41 55)',
    '--placeholder-color': 'rgb(107 114 128)',
    '--border-color': 'rgb(209 213 219)',
    '--bg-menu': 'rgb(255 255 255)',
    '--bg-option-hover': 'rgb(243 244 246)',
  };
  if (document.documentElement.classList.contains('dark')) {
    colors['--text-color'] = 'rgb(249 250 251 / 0.9)';
    colors['--placeholder-color'] = 'rgb(156 163 175)';
    colors['--border-color'] = 'rgb(75 85 99)';
    colors['--bg-menu'] = 'rgb(31 41 55)';
    colors['--bg-option-hover'] = 'rgb(55 65 81)';
  }

  // Styles personnalisés pour react-select, utilisant les variables CSS
  const selectStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: '44px',
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : 'var(--border-color)',
      backgroundColor: 'transparent',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
      },
    }),
    singleValue: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)' }),
    placeholder: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
    input: (baseStyles) => ({ ...baseStyles, color: 'var(--text-color)' }),
    menu: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--bg-menu)', zIndex: 9999 }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? 'var(--bg-option-hover)' : 'var(--bg-menu)',
      color: state.isSelected ? 'white' : 'var(--text-color)',
      '&:hover': { backgroundColor: 'var(--bg-option-hover)', color: 'var(--text-color)' },
    }),
    indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: 'var(--border-color)' }),
    dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)' }),
    clearIndicator: (baseStyles) => ({ ...baseStyles, color: 'var(--placeholder-color)', '&:hover': { color: '#EF4444' } }),
  };
  
  return (
    <>
      <Head title="Liste des Ventes" />

      <div className="p-6" style={colors}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Liste des Ventes Effectuées
          </h1>
          <div className="flex gap-2">
            {/* Nouveau Bouton Exporter */}
            <button
              onClick={openExportModal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-green-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-green-700 dark:border-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              <FontAwesomeIcon icon={faFilePdf} /> Exporter
            </button>
            {/* Bouton Nouvelle Vente existant */}
            <button
              onClick={openNewSaleModal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <FontAwesomeIcon icon={faPlus} /> Nouvelle Vente
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          {/* Section de filtrage */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-white/[0.02]">
            <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
              <FontAwesomeIcon icon={faFilter} className="mr-2 text-blue-500" />
              Filtres
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtre par client */}
              <div>
                <label htmlFor="filterClient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client
                </label>
                <Select
                  id="filterClient"
                  options={clientOptions}
                  value={filterClient}
                  onChange={setFilterClient}
                  isClearable={true}
                  placeholder="Tous les clients"
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
              </div>

              {/* Filtre par agence */}
              <div>
                <label htmlFor="filterAgency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Agence
                </label>
                <Select
                  id="filterAgency"
                  options={agencyOptions}
                  value={filterAgency}
                  onChange={setFilterAgency}
                  isClearable={true}
                  placeholder="Toutes les agences"
                  classNamePrefix="react-select"
                  styles={selectStyles}
                />
              </div>

              {/* Filtre par date de début */}
              <div>
                <label htmlFor="filterStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de Début
                </label>
                <input
                  id="filterStartDate"
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              {/* Filtre par date de fin */}
              <div>
                <label htmlFor="filterEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de Fin
                </label>
                <input
                  id="filterEndDate"
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>
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
                    Client
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Agent Commercial
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Agence
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Montant Total
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Statut
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredFactures && filteredFactures.length > 0 ? (
                  filteredFactures.map((facture) => (
                    <TableRow key={facture.id}>
                      <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        #{facture.id}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.client ? `${facture.client.name} ` : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.user ? `${facture.user.first_name} ${facture.user.last_name}` : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.agency ? facture.agency.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {facture.total_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.invoice_type || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {facture.status || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(facture.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="py-3 flex items-center justify-center gap-2">
                        {/* Bouton Voir */}
                        <button
                          onClick={() => openDetailsModal(facture)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          title="Voir les détails"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        {/* Bouton Imprimer (maintenant un téléchargement) */}
                        <button
                          onClick={() => handlePrintFacture(facture.id)}
                          className="p-2 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                          title="Imprimer la facture"
                        >
                          <FontAwesomeIcon icon={faPrint} />
                        </button>
                        {/* Bouton Supprimer (conditionnel) */}
                        {canDelete(facture.created_at) && (
                          <button
                            onClick={() => handleDeleteFacture(facture)} // Pass the full facture object
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                            title="Supprimer la facture"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucune vente trouvée pour les filtres appliqués, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {factures.links && factures.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {factures.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                        ${link.active
                          ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                          : link.url === null
                            ? 'bg-white border-gray-300 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
                      }`}
                      preserveState
                      preserveScroll
                      only={['factures']}
                      onClick={(e) => {
                        if (!link.url) e.preventDefault();
                      }}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Modale de Détails de Facture */}
      <InvoiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        facture={selectedFacture}
      />

      {/* Modale Nouvelle Vente : IMPORTANT - Passage des props clients et articles */}
      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={closeNewSaleModal}
        clients={clients}   
        articles={articles}
      />

      {/* Nouvelle Modale d'exportation */}
      <ExportSalesModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        clients={clients}
        agencies={agencies}
      />
    </>
  );
};
const  ComSales = ({ factures, clients, articles, agencies })=>{
  const {auth}= usePage().props
  if(auth.user.role == "commercial"){
    return(
      <ComLayout>
        <PageContent factures={factures} clients={clients} articles={articles} agencies={agencies}/>
      </ComLayout>
    )
  }
  if(auth.user.role = "magasin"){
    return(
    <MagFuelLayout>
    <PageContent factures={factures} clients={clients} articles={articles} agencies={agencies}/>
    </MagFuelLayout>
    )
  }
}
export default ComSales;