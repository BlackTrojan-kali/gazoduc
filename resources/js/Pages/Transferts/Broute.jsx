import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPrint, faRoute, faInfoCircle, faTrash, faCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../../components/ui/button/Button';
import Select from 'react-select';

// Import du nouveau composant modal
import ExportRoadbillsModal from "../../components/Modals/Tranferts/ExportBrouteModal";
import MagLayout from '../../layout/MagLayout/MagLayout';
import RoadbillFormModal from '../../components/Modals/Tranferts/RoadBillModal';
import RegLayout from '../../layout/RegLayout/RegLayout';
import DirLayout from '../../layout/DirLayout/DirLayout';

// Composant pour remplacer la fonction alert()
const MessageModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm m-4 dark:bg-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Attention</h3>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose} variant="primary">
            Compris
          </Button>
        </div>
      </div>
    </div>
  );
};

// Composant de modal d'exportation adapté
const ExportRoadbillsModalWithAlert = ({ isOpen, onClose, agencies, articles }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    departureAgency: '',
    arrivalAgency: '',
    article: '',
  });

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const customStyles = useMemo(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return {
      control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
        borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
        color: isDarkMode ? '#e5e7eb' : '#374151',
        '&:hover': {
          borderColor: isDarkMode ? '#6b7280' : '#9ca3af',
        },
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
        borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
        color: isDarkMode ? '#e5e7eb' : '#374151',
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? (isDarkMode ? '#3b82f6' : '#2563eb')
          : state.isFocused
            ? (isDarkMode ? '#374151' : '#f3f4f6')
            : (isDarkMode ? '#1f2937' : '#fff'),
        color: state.isSelected
          ? '#fff'
          : (isDarkMode ? '#e5e7eb' : '#374151'),
        '&:active': {
          backgroundColor: (isDarkMode ? '#3b82f6' : '#2563eb'),
        },
      }),
      singleValue: (base) => ({
        ...base,
        color: isDarkMode ? '#e5e7eb' : '#374151',
      }),
      placeholder: (base) => ({
        ...base,
        color: isDarkMode ? '#9ca3af' : '#6b7280',
      }),
    };
  }, []);

  const agencyOptions = useMemo(() => [
    { value: '', label: 'Toutes les agences' },
    ...agencies.map(agency => ({ value: agency.id, label: agency.name }))
  ], [agencies]);

  const departureAgencyOptions = useMemo(() => [
    ...agencies.map(agency => ({ value: agency.id, label: agency.name }))
  ], [agencies]);

  const articleOptions = useMemo(() => [
    { value: '', label: 'Tous les articles' },
    ...articles.map(article => ({ value: article.id, label: article.name }))
  ], [articles]);

  const handleInputChange = (selectedOption, { name }) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: selectedOption,
    }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleExport = () => {
    if (!formData.departureAgency) {
      setAlertMessage("L'agence de départ est obligatoire.");
      setIsAlertOpen(true);
      return;
    }
    const queryParams = {
      startDate: formData.startDate,
      endDate: formData.endDate,
      departureAgency: formData.departureAgency?.value,
      arrivalAgency: formData.arrivalAgency?.value,
      article: formData.article?.value,
    };

    // Assurez-vous d'avoir une route nommée 'broutes.export-pdf-filtered' dans votre backend
    // qui accepte ces paramètres.
    // window.location.href = route('broutes.export-pdf-filtered', queryParams);

    // Pour l'exemple, on simule l'exportation
    console.log("Exportation demandée avec les paramètres:", queryParams);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/10 dark:bg-white/10">
      <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 w-full max-w-xl">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Exporter les Bordereaux de Route</h4>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sélectionnez les critères pour générer un rapport PDF.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de début</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleTextChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de fin</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleTextChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Agence de départ <span className="text-red-500">*</span>
            </label>
            <Select
              name="departureAgency"
              options={departureAgencyOptions}
              value={formData.departureAgency}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="Sélectionner une agence..."
              isClearable={false}
              styles={customStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agence de destination</label>
            <Select
              name="arrivalAgency"
              options={agencyOptions}
              value={formData.arrivalAgency}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="Sélectionner..."
              styles={customStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Article transféré</label>
            <Select
              name="article"
              options={articleOptions}
              value={formData.article}
              onChange={handleInputChange}
              className="mt-1"
              placeholder="Sélectionner..."
              styles={customStyles}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            onClick={onClose}
            variant="secondary"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Exporter
          </Button>
        </div>
      </div>
      <MessageModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} message={alertMessage} />
    </div>
  );
};

const PageContent = ({ roadbills, vehicles, drivers, agencies, articles }) => {
  const { auth } = usePage().props;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRoadbill, setSelectedRoadbill] = useState(null);

  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationData, setValidationData] = useState({
    roadbillId: null,
    comment: ''
  });

  // NOUVEL ÉTAT pour le modal d'exportation PDF
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // États pour les filtres, avec des objets pour react-select
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    departureAgency: null, // Initialisé à null pour react-select
    arrivalAgency: null,   // Initialisé à null pour react-select
    status: null,          // Initialisé à null pour react-select
  });

  // Création des options pour react-select
  const agencyOptions = useMemo(() => [
    { value: '', label: 'Toutes les agences' },
    ...agencies.map(agency => ({ value: agency.id, label: agency.name }))
  ], [agencies]);

  const statusOptions = useMemo(() => [
    { value: '', label: 'Tous les statuts' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'annulee', label: 'Annulée' },
    { value: 'termine', label: 'Terminée' }
  ], []);

  // Gestionnaire de changement pour les champs texte et date
  const handleTextFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Gestionnaire de changement pour react-select
  const handleSelectFilterChange = (selectedOption, { name }) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: selectedOption,
    }));
  };


  // Logique de filtrage en temps réel
  const filteredRoadbills = useMemo(() => {
    if (!roadbills.data) return [];
    return roadbills.data.filter(roadbill => {
      // Filtrer par date
      const departureDate = new Date(roadbill.departure_date);
      const isDateValid = (!filters.startDate || departureDate >= new Date(filters.startDate)) &&
                          (!filters.endDate || departureDate <= new Date(filters.endDate));

      // Filtrer par agence de départ (utilise .value de l'objet react-select)
      const isDepartureAgencyValid = !filters.departureAgency?.value || roadbill.departure_location_id == filters.departureAgency.value;

      // Filtrer par agence de destination (utilise .value de l'objet react-select)
      const isArrivalAgencyValid = !filters.arrivalAgency?.value || roadbill.arrival_location_id == filters.arrivalAgency.value;

      // Filtrer par statut (utilise .value de l'objet react-select)
      const isStatusValid = !filters.status?.value || roadbill.status === filters.status.value;

      return isDateValid && isDepartureAgencyValid && isArrivalAgencyValid && isStatusValid;
    });
  }, [roadbills.data, filters]);

  // --- Fonction pour déterminer si une réception peut être supprimée ---
  const canDelete = (roadbillCreatedAt, roadbillStatus) => {
    // La suppression n'est pas possible si le bordereau est terminé
    if (roadbillStatus === 'termine') {
        return false;
    }

    // Si l'utilisateur n'a pas de `modification_days` défini ou s'il est 0, la suppression n'est pas permise.
    if (!auth.user || !auth.user.modif_days || auth.user.modif_days <= 0) {
      return false;
    }

    const today = new Date();
    const creationDate = new Date(roadbillCreatedAt);
    // Calculer la différence en jours
    const diffTime = today.getTime() - creationDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Renvoyer vrai si la bordereau a été créé dans la période autorisée
    return diffDays <= auth.user.modif_days;
  };

  const openCreateModal = () => {
    setSelectedRoadbill(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setSelectedRoadbill(null);
    setIsFormModalOpen(false);
  };

  const handlePrintToPdf = (roadbill) => {
    window.location.href = route('broutes.download-pdf', { id: roadbill.id });
  };

  const handleDelete = (roadbill) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: "La suppression de ce bordereau réintègrera les articles au stock de départ. Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        router.delete(route('broutes.destroy', { id: roadbill.id }));
      }
    });
  };

  const handleValidate = () => {
    router.post(route('broutes.validate', { id: validationData.roadbillId }), {
      note: validationData.comment,
    }, {
      onSuccess: () => {
        setIsValidationModalOpen(false);
        setValidationData({ roadbillId: null, comment: '' });
      },
      onError: () => {
        // Gérer les erreurs si nécessaire
      }
    });
  };

  const handleExportToCsv = () => {
    if (filteredRoadbills.length === 0) {
      Swal.fire({
        title: 'Aucune donnée à exporter',
        text: 'Les filtres actuels ne correspondent à aucun bordereau.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      return;
    }

    const headers = [
      'Véhicule', 'Chauffeur', 'Co-Chauffeur', 'Agence Départ', 'Agence Arrivée',
      'Date Départ', 'Date Arrivée', 'Statut', 'Type', 'Note'
    ];
    const data = filteredRoadbills.map(roadbill => [
      roadbill.vehicule ? roadbill.vehicule.licence_plate : "N/A",
      roadbill.chauffeur ? roadbill.chauffeur.name : "N/A",
      roadbill.co_chauffeur ? roadbill.co_chauffeur.name : "N/A",
      findNameById(roadbill.departure_location_id, agencies),
      findNameById(roadbill.arrival_location_id, agencies),
      new Date(roadbill.departure_date).toLocaleString('fr-FR'),
      roadbill.arrival_date ? new Date(roadbill.arrival_date).toLocaleString('fr-FR') : 'N/A',
      roadbill.status,
      roadbill.type,
      roadbill.note || 'Aucune'
    ].join(','));

    const csvString = [
      headers.join(','),
      ...data
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'bordereaux_de_route.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'en_cours':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">En cours</span>;
      case 'annulee':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">Annulée</span>;
      case 'termine':
        return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Terminée</span>;
      default:
        return status;
    }
  };

  const findNameById = (id, list, key = 'name') => {
    const item = list.find(item => item.id === id);
    return item ? item[key] : 'N/A';
  };

  // Styles pour react-select en mode clair et sombre
  const customStyles = useMemo(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    return {
      control: (base, state) => ({
        ...base,
        backgroundColor: isDarkMode ? '#1f2937' : '#fff', // bg-gray-800 vs bg-white
        borderColor: isDarkMode ? '#4b5563' : '#d1d5db', // border-gray-700 vs border-gray-300
        color: isDarkMode ? '#e5e7eb' : '#374151', // text-gray-200 vs text-gray-700
        '&:hover': {
          borderColor: isDarkMode ? '#6b7280' : '#9ca3af',
        },
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: isDarkMode ? '#1f2937' : '#fff',
        borderColor: isDarkMode ? '#4b5563' : '#d1d5db',
        color: isDarkMode ? '#e5e7eb' : '#374151',
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? (isDarkMode ? '#3b82f6' : '#2563eb') // blue-500
          : state.isFocused
            ? (isDarkMode ? '#374151' : '#f3f4f6') // gray-700 vs gray-100
            : (isDarkMode ? '#1f2937' : '#fff'),
        color: state.isSelected
          ? '#fff'
          : (isDarkMode ? '#e5e7eb' : '#374151'),
        '&:active': {
          backgroundColor: (isDarkMode ? '#3b82f6' : '#2563eb'),
        },
      }),
      singleValue: (base) => ({
        ...base,
        color: isDarkMode ? '#e5e7eb' : '#374151',
      }),
      placeholder: (base) => ({
        ...base,
        color: isDarkMode ? '#9ca3af' : '#6b7280', // gray-400 vs gray-500
      }),
    };
  }, []);

  return (
    <>
      <Head title='Liste des Bordereaux de Route' />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faRoute} className="mr-3 text-brand-600" />
                Liste des Bordereaux de Route
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Le bouton Exporter en PDF ouvre le nouveau modal */}
              <Button
                onClick={() => setIsExportModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500 px-4 py-2.5 text-theme-sm font-medium bg-red-500 text-white shadow-theme-xs hover:bg-red-600 dark:border-red-600"
              >
                <FontAwesomeIcon icon={faPrint} />
                Exporter en PDF
              </Button>
              {/* Le bouton Exporter en CSV (maintenant en vert) */}
              <Button
                onClick={handleExportToCsv}
                className="inline-flex items-center gap-2 rounded-lg border border-green-500 px-4 py-2.5 text-theme-sm font-medium bg-green-500 text-white shadow-theme-xs hover:bg-green-600 dark:border-green-600"
              >
                <FontAwesomeIcon icon={faDownload} />
                Exporter en CSV
              </Button>
              {/* Le bouton Ajouter existant */}
              {auth.user.role == "magasin" &&
              <Button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Ajouter un Bordereau
              </Button>}
            </div>
          </div>

          {/* SECTION DES FILTRES */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">Filtres de recherche</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de début</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleTextFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleTextFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agence de départ</label>
                <Select
                  name="departureAgency"
                  options={agencyOptions}
                  value={filters.departureAgency}
                  onChange={handleSelectFilterChange}
                  className="mt-1"
                  placeholder="Sélectionner..."
                  styles={customStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agence de destination</label>
                <Select
                  name="arrivalAgency"
                  options={agencyOptions}
                  value={filters.arrivalAgency}
                  onChange={handleSelectFilterChange}
                  className="mt-1"
                  placeholder="Sélectionner..."
                  styles={customStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                <Select
                  name="status"
                  options={statusOptions}
                  value={filters.status}
                  onChange={handleSelectFilterChange}
                  className="mt-1"
                  placeholder="Sélectionner..."
                  styles={customStyles}
                />
              </div>
            </div>
          </div>


          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Véhicule
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Chauffeur
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Co-Chauffeur
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Départ
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Arrivée
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date Départ
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date Arrivée
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Statut
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Note
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredRoadbills.length > 0 ? (
                  filteredRoadbills.map((roadbill) => (
                    <TableRow key={roadbill.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {roadbill.vehicule ? roadbill.vehicule.licence_plate : "N/A"}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {roadbill.chauffeur ? roadbill.chauffeur.name : "N/A"}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {roadbill.co_chauffeur ? roadbill.co_chauffeur.name : "N/A"}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {findNameById(roadbill.departure_location_id, agencies)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {findNameById(roadbill.arrival_location_id, agencies)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(roadbill.departure_date).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {roadbill.arrival_date ? new Date(roadbill.arrival_date).toLocaleString('fr-FR', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }) : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatStatus(roadbill.status)}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {roadbill.type}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {roadbill.note || 'Aucune'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm">
                        <div className="flex flex-wrap items-center gap-1">
                          <Button
                            onClick={() => handlePrintToPdf(roadbill)}
                            variant="secondary"
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                          >
                            <FontAwesomeIcon icon={faPrint} /> Imprimer
                          </Button>
                          {roadbill.articles && roadbill.articles.length > 0 && (
                            <Button
                              onClick={() => Swal.fire({
                                title: 'Articles Transférés',
                                html: roadbill.articles.map(item => `<p>${item.name}: ${item.pivot.quantity} ${item.unit}</p>`).join(''),
                                icon: 'info',
                                confirmButtonText: 'Fermer'
                              })}
                              variant="secondary"
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                            >
                              <FontAwesomeIcon icon={faInfoCircle} /> Articles
                            </Button>
                          )}
                          {roadbill.arrival_location_id === auth.user.agency?.id && roadbill.status !== 'termine' && (
                            <Button
                              onClick={() => {
                                setIsValidationModalOpen(true);
                                setValidationData({ ...validationData, roadbillId: roadbill.id });
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-green-500 px-2 py-1.5 text-xs font-medium text-white shadow-theme-xs hover:bg-green-600 dark:border-green-600"
                            >
                              <FontAwesomeIcon icon={faCheck} /> Valider
                            </Button>
                          )}
                          {roadbill.departure_location_id === auth.user.agency?.id && roadbill.status !== 'termine' && (
                            <button
                              disabled={!canDelete(roadbill.created_at, roadbill.status)}
                              onClick={() => handleDelete(roadbill)}
                              title={
                                canDelete(roadbill.created_at, roadbill.status)
                                  ? "Supprimer ce bordereau"
                                  : roadbill.status === 'termine'
                                    ? "Le bordereau est terminé, il ne peut pas être supprimé"
                                    : `Suppression non autorisée après ${auth.user.modif_days} jour(s)`
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-red-500 bg-red-500 px-2 py-1.5 text-xs font-medium text-white shadow-theme-xs hover:bg-red-600 dark:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              type="button"
                            >
                              <FontAwesomeIcon icon={faTrash} /> Supprimer
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun bordereau de route trouvé, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION --- */}
            {roadbills.links && roadbills.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {roadbills.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-1 text-sm font-medium border rounded-lg shadow-sm
                        ${link.active
                          ? 'bg-blue-600 text-white border-blue-600 cursor-default'
                          : link.url === null
                            ? 'bg-white border-gray-300 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
                        }`}
                      preserveState
                      preserveScroll
                      only={['roadbills']}
                      onClick={(e) => {
                        if (!link.url) e.preventDefault();
                      }}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </nav>
            )}
            {/* -------------------------------------------------------- */}
          </div>
        </div>
      </div>

      {/* La Modale Unifiée pour les Bordereaux de Route */}
      <RoadbillFormModal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        roadbill={selectedRoadbill}
        routeName={selectedRoadbill ? "roadbills.update" : "broutes.store"}
        vehicles={vehicles}
        drivers={drivers}
        agencies={agencies}
        articles={articles}
      />

      {/* Modale de validation */}
      {isValidationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/10 dark:bg-white/10 ">
          <div className="rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Ajouter une note</h4>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Veuillez ajouter un commentaire si nécessaire pour la validation du bordereau.
            </p>
            <textarea
              className="mt-4 w-full rounded-md border border-gray-300 p-2 text-gray-700 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows="4"
              value={validationData.comment}
              onChange={(e) => setValidationData({ ...validationData, comment: e.target.value })}
            ></textarea>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                onClick={() => setIsValidationModalOpen(false)}
                variant="secondary"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              >
                Annuler
              </Button>
              <Button
                onClick={handleValidate}
                className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                Valider
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Le nouveau modal d'exportation PDF */}
      <ExportRoadbillsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        agencies={agencies}
        articles={articles}
      />
    </>
  );
};
const Broute = ({ roadbills, vehicles, drivers, agencies, articles })=>{
  const {auth} = usePage().props
  if(auth.user.role == "controleur"){
    return (
      <RegLayout>
        <PageContent roadbills={roadbills} vehicles={vehicles} drivers={drivers} agencies={agencies} articles={articles}/>
      </RegLayout>
    )
  }

  if(auth.user.role == "magasin"){
    return (
      <MagLayout>
        <PageContent roadbills={roadbills} vehicles={vehicles} drivers={drivers} agencies={agencies} articles={articles}/>
      </MagLayout>
    )
  }
  if(auth.user.role == "direction"){
    return (
      <DirLayout>
        <PageContent roadbills={roadbills} vehicles={vehicles} drivers={drivers} agencies={agencies} articles={articles}/>
      </DirLayout>
    )
  }
}
export default Broute;
