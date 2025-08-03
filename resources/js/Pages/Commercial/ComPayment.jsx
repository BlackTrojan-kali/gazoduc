import React, { useState, useMemo } from 'react';
import ComLayout from '../../layout/ComLayout/ComLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPrint, faTrash, faPlus, faFilter, faEraser, faLink, faUnlink, faFilePdf } from '@fortawesome/free-solid-svg-icons'; // <-- Ajout de faFilePdf
import Swal from 'sweetalert2';
import Select from 'react-select';

// --- Importation de la modale de versement depuis le dossier 'modals' ---
import NewPaymentModal from '../../components/Modals/Payment/NewPaymentModal';

// --- IMPORTATION DE LA MODALE D'ASSOCIATION ---
import AssociatePaymentModal from '../../components/Modals/Payment/AssociateModal';

// --- IMPORTATION DE LA NOUVELLE MODALE DE DISSOCIATION ---
import DisassociatePaymentModal from '../../components/Modals/Payment/DissociateModal';

// --- NOUVELLE IMPORTATION : Modale d'exportation PDF ---
import ExportPaymentPdfModal from '../../components/Modals/Payment/ExportPaymentPdfModal'; // <-- Nouvelle importation

// Styles personnalisés pour react-select, définis une seule fois
const getSelectStyles = () => {
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

  return {
    control: (baseStyles, state) => ({
      ...baseStyles,
      height: '44px',
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : colors['--border-color'],
      backgroundColor: 'transparent',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3B82F6' : '#9CA3AF',
      },
    }),
    singleValue: (baseStyles) => ({ ...baseStyles, color: colors['--text-color'] }),
    placeholder: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'] }),
    input: (baseStyles) => ({ ...baseStyles, color: colors['--text-color'] }),
    menu: (baseStyles) => ({ ...baseStyles, backgroundColor: colors['--bg-menu'], zIndex: 9999 }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? colors['--bg-option-hover'] : colors['--bg-menu'],
      color: state.isSelected ? 'white' : colors['--text-color'],
      '&:hover': { backgroundColor: colors['--bg-option-hover'], color: colors['--text-color'] },
    }),
    indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: colors['--border-color'] }),
    dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'] }),
    clearIndicator: (baseStyles) => ({ ...baseStyles, color: colors['--placeholder-color'], '&:hover': { color: '#EF4444' } }),
  };
};

const ComPayment = ({ payments, clients, agencies, banks, sales }) => {
  // --- États pour les modales ---
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedPaymentForAssociation, setSelectedPaymentForAssociation] = useState(null);
  
  // NOUVEAU : États pour la modale de dissociation
  const [isDisassociateModalOpen, setIsDisassociateModalOpen] = useState(false);
  const [selectedPaymentForDisassociation, setSelectedPaymentForDisassociation] = useState(null);

  // NOUVEAU : État pour la modale d'exportation PDF
  const [isExportPdfModalOpen, setIsExportPdfModalOpen] = useState(false); // <-- Nouvel état

  // --- États pour les filtres frontend ---
  const [filterClient, setFilterClient] = useState(null);
  const [filterAgency, setFilterAgency] = useState(null);
  const [filterBank, setFilterBank] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Utilisation de useForm pour la suppression
  const { delete: inertiaDelete } = useForm({});

  // --- Filtrage des paiements selon les filtres (optimisé avec useMemo) ---
  const filteredPayments = useMemo(() => {
    // S'assurer que 'payments.data' est une liste avant de la filtrer
    if (!payments || !Array.isArray(payments.data)) {
      return [];
    }
    
    return payments.data.filter(payment => {
      const matchesClient = !filterClient || (payment.client && String(payment.client.id) === filterClient.value);
      const matchesAgency = !filterAgency || (payment.agency && String(payment.agency.id) === filterAgency.value);
      const matchesBank = !filterBank || (payment.bank && String(payment.bank.id) === filterBank.value);
      
      const paymentDate = new Date(payment.created_at);
      const start = filterStartDate ? new Date(filterStartDate) : null;
      const end = filterEndDate ? new Date(filterEndDate) : null;
      
      const matchesDateRange = (!start || paymentDate >= start) && (!end || paymentDate <= end);
      
      return matchesClient && matchesAgency && matchesBank && matchesDateRange;
    });
  }, [payments.data, filterClient, filterAgency, filterBank, filterStartDate, filterEndDate]);

  // --- Fonctions pour les modales et actions ---
  const openNewPaymentModal = () => setIsNewPaymentModalOpen(true);
  const closeNewPaymentModal = () => setIsNewPaymentModalOpen(false);

  const openAssociateModal = (paymentId) => {
    const paymentToAssociate = payments.data.find(p => p.id === paymentId);
    setSelectedPaymentForAssociation(paymentToAssociate);
    setIsAssociateModalOpen(true);
  };
  const closeAssociateModal = () => {
    setIsAssociateModalOpen(false);
    setSelectedPaymentForAssociation(null);
  };
  
  // NOUVEAU : Fonctions pour la modale de dissociation
  const openDisassociateModal = (payment) => {
    console.log("clicked")
    setSelectedPaymentForDisassociation(payment);
    setIsDisassociateModalOpen(true);
  };
  const closeDisassociateModal = () => {
    setIsDisassociateModalOpen(false);
    setSelectedPaymentForDisassociation(null);
  };

  // NOUVEAU : Fonctions pour la modale d'exportation PDF
  const openExportPdfModal = () => setIsExportPdfModalOpen(true); // <-- Nouvelle fonction
  const closeExportPdfModal = () => setIsExportPdfModalOpen(false); // <-- Nouvelle fonction

  const handleDeletePayment = (paymentId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: "Vous ne pourrez pas annuler cette action !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('payments.destroy', paymentId), { // Assurez-vous que cette route existe
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'Le versement a été supprimé avec succès, monsieur.',
              'success'
            );
          },
          onError: (errors) => {
            console.error(errors);
            Swal.fire(
              'Erreur',
              'Une erreur est survenue lors de la suppression.',
              'error'
            );
          },
        });
      }
    });
  };
  
  const handleClearFilters = () => {
    setFilterClient(null);
    setFilterAgency(null);
    setFilterBank(null);
    setFilterStartDate('');
    setFilterEndDate('');
  };

  // Options pour les sélecteurs de filtres
  const clientOptions = useMemo(() => 
    Array.isArray(clients) ? clients.map(client => ({ value: String(client.id), label: client.name })) : [],
    [clients]
  );
  
  const agencyOptions = useMemo(() => 
    Array.isArray(agencies) ? agencies.map(agency => ({ value: String(agency.id), label: agency.name })) : [],
    [agencies]
  );

  const bankOptions = useMemo(() => 
    Array.isArray(banks) ? banks.map(bank => ({ value: String(bank.id), label: bank.name })) : [],
    [banks]
  );

  // NOUVELLES OPTIONS : Types de versement pour le filtre PDF
  const paymentTypeOptions = useMemo(() => [
    { value: 'Cash', label: 'Cash' },
    { value: 'Mobile Money', label: 'Mobile Money' },
    { value: 'Virement bancaire', label: 'Virement bancaire' },
    { value: 'Chèque', label: 'Chèque' },
  ], []);

  const selectStyles = getSelectStyles();
  
  return (
    <>
      <Head title="Liste des Versements" />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Liste des Versements
          </h1>
          <div className="flex gap-2">
            {/* NOUVEAU BOUTON : Exporter PDF */}
            <button
              onClick={openExportPdfModal} // <-- Appel de la nouvelle fonction
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-red-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-red-700 dark:border-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              <FontAwesomeIcon icon={faFilePdf} /> Exporter PDF
            </button>
            <button
              onClick={openNewPaymentModal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 dark:border-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <FontAwesomeIcon icon={faPlus} /> Nouveau Versement
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

              {/* Filtre par banque */}
              <div>
                <label htmlFor="filterBank" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Banque
                </label>
                <Select
                  id="filterBank"
                  options={bankOptions}
                  value={filterBank}
                  onChange={setFilterBank}
                  isClearable={true}
                  placeholder="Toutes les banques"
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
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-white/90 dark:border-gray-700 dark:hover:bg-white/[0.03]"
              >
                <FontAwesomeIcon icon={faEraser} /> Réinitialiser les filtres
              </button>
            </div>
          </div>
          

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Client
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Banque
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Somme
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Note
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Commentaire Somme
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Agence
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredPayments && filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {payment.client ? payment.client.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {payment.bank ? payment.bank.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                        {payment.amount}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {payment.type || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {payment.notes || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {payment.amount_notes || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {payment.agency ? payment.agency.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 flex items-center justify-center gap-2">
                        <button
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                          title="Voir les détails"
                          onClick={() => { /* Logique pour voir les détails */ }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-colors"
                          title="Associer d'autres factures"
                          onClick={() => openAssociateModal(payment.id)}
                        >
                          <FontAwesomeIcon icon={faLink} />
                        </button>
                        {/* NOUVEAU BOUTON : Dissocier les factures */}
                        <button
                          className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors"
                          title="Dissocier des factures"
                          onClick={() => openDisassociateModal(payment)}
                          // Le bouton est désactivé si aucune facture n'est associée
                          disabled={!payment.factures || payment.factures.length === 0}
                        >
                          <FontAwesomeIcon icon={faUnlink} />
                        </button>
                        <button
                          className="p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                          title="Supprimer le versement"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun versement trouvé pour les filtres appliqués, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modale Nouveau Versement */}
      <NewPaymentModal
        isOpen={isNewPaymentModalOpen}
        onClose={closeNewPaymentModal}
        clients={clients}
        banks={banks}
        sales={sales}
      />

      {/* Modale pour l'association de factures à un versement existant */}
      <AssociatePaymentModal
        isOpen={isAssociateModalOpen}
        onClose={closeAssociateModal}
        sales={sales}
        selectedPayment={selectedPaymentForAssociation}
      />

      {/* NOUVEAU : Modale pour la dissociation de factures */}
      <DisassociatePaymentModal
        isOpen={isDisassociateModalOpen}
        onClose={closeDisassociateModal}
        selectedPayment={selectedPaymentForDisassociation}
      />

      {/* NOUVEAU : Modale pour l'exportation PDF */}
      <ExportPaymentPdfModal
        isOpen={isExportPdfModalOpen}
        onClose={closeExportPdfModal}
        clients={clients} // Passer la liste des clients pour le filtre
        paymentTypes={paymentTypeOptions} // Passer les types de versement
        agencies={agencies}
        banks={banks}
      />
    </>
  );
};

ComPayment.layout = page => <ComLayout children={page} />;
export default ComPayment;