// resources/js/Pages/Fuel/FuelPaymentHistory.jsx

import React, { useState, useMemo } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faFileExport,
  faSearch,
  faTimes,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import FuelPaymentHistoryPDFExcelModal from "../../components/Modals/Fuel/FuelPaymentHistoryPDFExcelModal";
import NewFuelPaymentModal from "../../components/Modals/Fuel/NewFuelPaymentModal";

import RegLayout from "../../layout/RegLayout/RegLayout";
import DirLayout from "../../layout/DirLayout/DirLayout";
import MagFuelLayout from "../../layout/FuelLayout/MagFuelLayout";
import useLicenceChoice from "../../hooks/useLicenceChoice";
import DirFuelLayout from "../../layout/DirFuelLayout/DirFuelLayout";

// -----------------------------------------------------------------------------
// COMPOSANT PRINCIPAL DU CONTENU DE PAGE
// -----------------------------------------------------------------------------
const PageContent = ({
  payments: initialPayments,
  agencies,
  banks,
  clients,
  paymentTypes,
}) => {
  const { delete: inertiaDelete, processing } = useForm();
  const {
    props: { auth },
  } = usePage();

  // --- États des modales ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // --- Fonctions ouverture/fermeture ---
  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    window.Inertia.reload({ only: ["payments"] });
  };

  // --- États de filtre ---
  const [filterState, setFilterState] = useState({
    search: "",
    start_date: "",
    end_date: "",
    agency_id: "",
    bank_id: "",
    type: "",
  });

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilterState((prev) => ({ ...prev, [id]: value }));
  };

  const resetFilters = () =>
    setFilterState({
      search: "",
      start_date: "",
      end_date: "",
      agency_id: "",
      bank_id: "",
      type: "",
    
    });

  // --- Vérifie si un paiement peut être supprimé ---
  const canDelete = (createdAt) => {
    if (!auth.user?.modif_days || auth.user.modif_days <= 0) return false;
    const today = new Date();
    const created = new Date(createdAt);
    const diffDays = Math.ceil(
      (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= auth.user.modif_days;
  };

  // --- Filtrage côté frontend ---
  const filteredPayments = useMemo(() => {
    let list = initialPayments.data ?? [];

    // Agence
    if (filterState.agency_id) {
      list = list.filter(
        (p) => p.agency && String(p.agency.id) === filterState.agency_id
      );
    }

    // Banque
    if (filterState.bank_id) {
      list = list.filter(
        (p) => p.bank && String(p.bank.id) === filterState.bank_id
      );
    }

    // Type
    if (filterState.type) {
      list = list.filter((p) => p.type === filterState.type);
    }

    // Dates
    if (filterState.start_date && filterState.end_date) {
      const start = new Date(filterState.start_date);
      const end = new Date(filterState.end_date);
      end.setHours(23, 59, 59, 999);
      list = list.filter((p) => {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        return d >= start && d <= end;
      });
    }

    // Recherche texte
    if (filterState.search) {
      const term = filterState.search.toLowerCase();
      list = list.filter((p) => {
        const paymentTypeLabel =
          paymentTypes.find((t) => t.value === p.type)?.label || p.type || "";
        const str = [
          String(p.id),
          p.client?.name,
          p.agency?.name,
          p.bank?.name,
          p.amount,
          p.notes,
          p.bordereau,
          paymentTypeLabel,
          p.user ? `${p.user.first_name} ${p.user.last_name}` : "",
          new Date(p.created_at).toLocaleDateString("fr-FR"),
        ]
          .join(" ")
          .toLowerCase();
        return str.includes(term);
      });
    }

    return list;
  }, [initialPayments.data, filterState, paymentTypes]);

  // --- Suppression d’un paiement ---
  const handleDelete = (id) => {
    Swal.fire({
      title: "Êtes-vous sûr, monsieur ?",
      text: "Vous allez supprimer ce versement. Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#676c75",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route("fuel_payments.destroy", id), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire("Supprimé !", "Le versement a été supprimé.", "success");
            window.Inertia.reload({ only: ["payments"] });
          },
          onError: (err) => {
            console.error(err);
            Swal.fire("Erreur", "Impossible de supprimer ce versement.", "error");
          },
        });
      }
    });
  };

  // --- Options pour les filtres ---
  const agencyOptions = agencies.map((a) => ({
    value: String(a.id),
    label: a.name,
  }));
  const bankOptions = banks.map((b) => ({
    value: String(b.id),
    label: b.name,
  }));
  const typeOptions =
    paymentTypes ||
    [
      { value: "cash", label: "Espèces" },
      { value: "transfer", label: "Virement" },
      { value: "check", label: "Chèque" },
      { value: "other", label: "Autre" },
    ];

  // ---------------------------------------------------------------------------
  return (
    <>
      <Head title="Historique Versements Carburant" />
      <div className="p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:bg-white/[0.03] dark:border-gray-800 px-4 pt-4 pb-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Historique des Versements (Carburant)
            </h3>
            <div className="flex items-center gap-3">
              {auth.user.role  != "direction" ? 
              <Button
                onClick={openCreateModal}
                variant="primary"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faPlus} />
                Nouveau Versement
              </Button>:""
}
              <Button
                onClick={openExportModal}
                variant="secondary"
                className="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 px-4 py-2.5 rounded-lg shadow-theme-xs"
              >
                <FontAwesomeIcon icon={faFileExport} />
                Exporter
              </Button>
            </div>
          </div>

          {/* --- Filtres --- */}
          <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Rechercher & Filtrer
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Input
                id="search"
                type="text"
                label="Recherche"
                placeholder="ID, agence, client, banque..."
                value={filterState.search}
                onChange={handleFilterChange}
                icon={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
                className="col-span-full md:col-span-2"
              />

              {/* Agence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Agence
                </label>
                <select
                  id="agency_id"
                  value={filterState.agency_id}
                  onChange={handleFilterChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                >
                  <option value="">Toutes</option>
                  {agencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Banque */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Banque
                </label>
                <select
                  id="bank_id"
                  value={filterState.bank_id}
                  onChange={handleFilterChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                >
                  <option value="">Toutes</option>
                  {bankOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={filterState.type}
                  onChange={handleFilterChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                >
                  <option value="">Tous</option>
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                id="start_date"
                type="date"
                label="Date début"
                value={filterState.start_date}
                onChange={handleFilterChange}
              />
              <Input
                id="end_date"
                type="date"
                label="Date fin"
                value={filterState.end_date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={resetFilters} variant="destructive">
                <FontAwesomeIcon icon={faTimes} />
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* --- Tableau --- */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {[
                    "ID",
                    "Agence",
                    "Banque",
                    "Client",
                    "Montant",
                    "Type",
                    "Bordereau",
                    "Date",
                    "Actions",
                  ].map((h, i) => (
                    <TableCell
                      key={i}
                      isHeader
                      className={`py-3 text-sm font-medium text-gray-500 ${
                        h === "Montant" ? "text-end" : "text-start"
                      }`}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-6 text-center text-gray-400">
                      Aucun versement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.agency?.name || "—"}</TableCell>
                      <TableCell>{p.bank?.name || "—"}</TableCell>
                      <TableCell>{p.client?.name || "—"}</TableCell>
                      <TableCell className="text-end font-semibold">
                        {Number(p.amout).toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "XOF",
                        })}
                      </TableCell>
                      <TableCell>
                        {typeOptions.find((t) => t.value === p.type)?.label || p.type}
                      </TableCell>
                      <TableCell>{p.bordereau || "—"}</TableCell>
                    
                      <TableCell>
                        {new Date(p.created_at).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          disabled={processing || !canDelete(p.created_at)}
                          onClick={() => handleDelete(p.id)}
                          title={
                            canDelete(p.created_at)
                              ? "Supprimer"
                              : `Suppression désactivée après ${auth.user.modif_days} jour(s)`
                          }
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* --- Pagination --- */}
            {initialPayments.links && initialPayments.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {initialPayments.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || "#"}
                      preserveState
                      preserveScroll
                      only={["payments"]}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      className={`px-3 py-1 text-sm border rounded-lg ${
                        link.active
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                      onClick={(e) => !link.url && e.preventDefault()}
                    />
                  ))}
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>
    

      {/* --- Modales --- */}
      <FuelPaymentHistoryPDFExcelModal
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        agencies={agencies}
        banks={banks}
        paymentTypes={typeOptions}
        currentFilters={filterState}
      />

      <NewFuelPaymentModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        agencies={agencies}
        banks={banks}
        clients={clients}
        types={typeOptions}
      />
    </>
  );
};

// -----------------------------------------------------------------------------
// GESTION DES LAYOUTS SELON LE RÔLE
// -----------------------------------------------------------------------------
const FuelPaymentHistory = ({  payments,
  agencies,
  banks,
  clients,
  paymentTypes,}) => {
  const { auth } = usePage().props;
  const { licence,DirLicence } = useLicenceChoice();

  if (auth.user.role === "magasin")
    return (
      <MagFuelLayout>
        <PageContent   payments={payments}
  agencies={agencies}
  banks={banks}
  clients={clients}
  paymentTypes={paymentTypes} />
      </MagFuelLayout>
    );

  if (auth.user.role === "controleur")
    return (
      <RegLayout>
        <PageContent  payments={payments}
  agencies={agencies}
  banks={banks}
  clients={clients}
  paymentTypes={paymentTypes}  />
      </RegLayout>
    );

  if (auth.user.role === "direction")
    if(DirLicence == "gaz"){
    return (
      <DirLayout>
      
        <PageContent  payments={payments}
  agencies={agencies}
  banks={banks}
  clients={clients}
  paymentTypes={paymentTypes}  />
      </DirLayout>
    );
  }else{
    return(
    <DirFuelLayout>
      
        <PageContent  payments={payments}
  agencies={agencies}
  banks={banks}
  clients={clients}
  paymentTypes={paymentTypes}  />
      </DirFuelLayout>
    );
  }
  return (
    <MagFuelLayout>
      <PageContent {...props} />
    </MagFuelLayout>
  );
};

export default FuelPaymentHistory;
