import React, { useState, useMemo } from 'react'; // Importez useState et useMemo
import MagLayout from '../layout/MagLayout/MagLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import ReleveHistoryPDFExcelModal from '../components/Modals/ReleveHistModal';
import RegLayout from '../layout/RegLayout/RegLayout';
import DirLayout from '../layout/DirLayout/DirLayout';
import useLicenceChoice from '../hooks/useLicenceChoice';
import MagFuelLayout from '../layout/FuelLayout/MagFuelLayout';

const PageContent = ({ releves: initialReleves, agencies }) => { // 'filters' est retiré des props
  // --- États pour la modale d'exportation ---
  const [isPDFExcelModalOpen, setIsPDFExcelModalOpen] = useState(false);
  const openPDFExcelModal = () => setIsPDFExcelModalOpen(true);
  const closePDFExcelModal = () => setIsPDFExcelModalOpen(false);

  // --- Gestion des filtres frontend AVEC useState ---
  const [filterState, setFilterState] = useState({
    search: '',
    start_date: '',
    end_date: '',
    agency_id: '',
  });

  // Gérer le changement des champs de filtre
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilterState(prev => ({ ...prev, [id]: value }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilterState({
      search: '',
      start_date: '',
      end_date: '',
      agency_id: '',
    });
  };

  // --- Filtrage côté frontend des données de relevés ---
  const filteredReleves = useMemo(() => {
    let currentReleves = initialReleves.data; // Utiliser les données brutes paginées

    // Filtrer par agence (si sélectionnée)
    if (filterState.agency_id) {
        currentReleves = currentReleves.filter(releve =>
            releve.agency && String(releve.agency.id) === filterState.agency_id
        );
    }

    // Filtrer par dates (si sélectionnées)
    if (filterState.start_date && filterState.end_date) {
      const startDate = new Date(filterState.start_date + 'T00:00:00'); // Assurez-vous d'avoir l'heure de début du jour
      const endDate = new Date(filterState.end_date + 'T23:59:59');     // Assurez-vous d'avoir l'heure de fin du jour
      currentReleves = currentReleves.filter(releve => {
        const releveDate = new Date(releve.reading_date);
        return releveDate >= startDate && releveDate <= endDate;
      });
    }

    // Filtrer par recherche textuelle/numérique générique
    if (filterState.search) {
      const searchTerm = filterState.search.toLowerCase();
      currentReleves = currentReleves.filter(releve => {
        // Recherche par nom de citerne
        if (releve.citerne && releve.citerne.name.toLowerCase().includes(searchTerm)) return true;
        // Recherche par nom d'agence
        if (releve.agency && releve.agency.name.toLowerCase().includes(searchTerm)) return true;
        // Recherche par nom d'utilisateur
        if (releve.user && (`${releve.user.first_name} ${releve.user.last_name || ''}`).toLowerCase().includes(searchTerm)) return true;
        // Recherche par ID
        if (String(releve.id).includes(searchTerm)) return true;
        // Recherche par quantités (théorique, mesurée, différence)
        if (String(releve.theorical_quantity).includes(searchTerm)) return true;
        if (String(releve.measured_quantity).includes(searchTerm)) return true;
        if (String(releve.difference).includes(searchTerm)) return true;
        // Recherche par date de lecture (format YYYY-MM-DD pour la comparaison simple)
        if (String(releve.reading_date).includes(searchTerm)) return true;

        return false;
      });
    }

    return currentReleves;
  }, [initialReleves.data, filterState]); // Recalcule quand les données initiales ou les filtres changent

  return (
    <>
      <Head title="Relevés" />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste des Relevés
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {/* Bouton Exporter */}
              <Button
                onClick={openPDFExcelModal}
                variant="secondary"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faFileExport} />
                Exporter
              </Button>
            </div>
          </div>

          {/* --- Section de Filtrage Frontend --- */}
          <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Rechercher & Filtrer</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Recherche générique */}
              <Input
                id="search"
                type="text"
                label="Rechercher par mot-clé"
                placeholder="Citerne, agence, quantité, date..."
                value={filterState.search} // Utilisez filterState.search
                onChange={handleFilterChange}
                className="col-span-full md:col-span-1"
                icon={<FontAwesomeIcon icon={faSearch} className="text-gray-400" />}
              />
              {/* Filtre Agence (si disponible et pertinent) */}
              {agencies && agencies.length > 0 && (
                <div>
                  <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Agence
                  </label>
                  <select
                    id="agency_id"
                    className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={filterState.agency_id} // Utilisez filterState.agency_id
                    onChange={handleFilterChange}
                  >
                    <option value="">Toutes les agences</option>
                    {agencies.map(agency => (
                      <option key={agency.id} value={String(agency.id)}>
                        {agency.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Date de début */}
              <Input
                id="start_date"
                type="date"
                label="Date de début"
                value={filterState.start_date} // Utilisez filterState.start_date
                onChange={handleFilterChange}
              />
              {/* Date de fin */}
              <Input
                id="end_date"
                type="date"
                label="Date de fin"
                value={filterState.end_date} // Utilisez filterState.end_date
                onChange={handleFilterChange}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={resetFilters} variant="destructive" className="inline-flex items-center gap-2">
                <FontAwesomeIcon icon={faTimes} />
                Réinitialiser
              </Button>
            </div>
          </div>
          {/* --- Fin Section de Filtrage Frontend --- */}

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Citerne</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agence</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Qté Théorique (L)</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Qté Mesurée (L)</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">Différence (L)</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date Lecture</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Enregistré par</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Créé le</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReleves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-6 text-center text-gray-400">Aucun relevé trouvé avec ces filtres, monsieur.</TableCell>
                  </TableRow>
                ) : (
                  filteredReleves.map(releve => (
                    <TableRow key={releve.id}>
                      {/* Ajoutez py-4 ou py-3 sur chaque TableCell pour plus de padding vertical */}
                      <TableCell className="py-4">{releve.id}</TableCell>
                      <TableCell className="py-4">{releve.citerne ? releve.citerne.name : '—'}</TableCell>
                      <TableCell className="py-4">{releve.agency ? releve.agency.name : '—'}</TableCell>
                      <TableCell className="py-4">{releve.theorical_quantity.toLocaleString('fr-FR')}</TableCell>
                      <TableCell className="py-4">{releve.measured_quantity.toLocaleString('fr-FR')}</TableCell>
                      <TableCell className="py-4">{releve.difference.toLocaleString('fr-FR')}</TableCell>
                      <TableCell className="py-4">{new Date(releve.reading_date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="py-4">{releve.user ? `${releve.user.first_name} ` : '—'}</TableCell>
                      <TableCell className="py-4">{new Date(releve.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION D'INERTIA --- */}
            {initialReleves.links && initialReleves.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {initialReleves.links.map((link, index) => (
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
                      // 'only' ne doit plus inclure 'filters' car nous ne les persistons pas dans l'URL
                      only={['releves']}
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

      {/* La modale de génération de PDF/Excel */}
      <ReleveHistoryPDFExcelModal
        isOpen={isPDFExcelModalOpen}
        onClose={closePDFExcelModal}
        agencies={agencies}
        // Passez les données de filtre actuelles à la modale
        currentFilters={filterState} // Passez filterState
      />
    </>
  );
};

const Releve =({releves,agencies})=>{
  const  {auth} = usePage().props
  const {licence} = useLicenceChoice()
  if(auth.user.role == "magasin"){
    if(licence == "gaz"){
    return (
      <MagLayout title="releves">
        <PageContent releves={releves} agencies={agencies}/>
      </MagLayout>
    )
  }else{
    return(
      <MagFuelLayout>
        <PageContent releves={releves} agencies={agencies}/>
      </MagFuelLayout>
    )
  }
  }
   if(auth.user.role == "controleur"){
    return (
      <RegLayout title="releves">
        <PageContent releves={releves} agencies={agencies}/>
      </RegLayout>
    )
  }
   if(auth.user.role == "direction"){
    return (
      <DirLayout title="releves">
        <PageContent releves={releves} agencies={agencies}/>
      </DirLayout>
    )
  }
}
export default Releve;