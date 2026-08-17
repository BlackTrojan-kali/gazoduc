import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField';
import MagLayout from '../layout/MagLayout/MagLayout';
import RegLayout from '../layout/RegLayout/RegLayout';
import DirLayout from '../layout/DirLayout/DirLayout';
import useLicenceChoice from '../hooks/useLicenceChoice';
import MagFuelLayout from '../layout/FuelLayout/MagFuelLayout';
import DirFuelLayout from '../layout/DirFuelLayout/DirFuelLayout';

// --- IMPORTS POUR LE GRAPHIQUE ---
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Enregistrement des composants ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- COMPOSANT DE CONTENU PRINCIPAL ---
const PageContent = ({ 
    releves, 
    agencies, 
    citernes = [], // Nouvelle prop pour filtrer par citerne
    chartData = [], // Données du graphique venant du backend
    licence,
    // Filtres actuels venant du backend pour garder l'état après rechargement
    filters: initialFilters 
}) => { 
  
  // État local pour les champs de filtre (initialisé avec les valeurs URL ou vide)
  const [filterState, setFilterState] = useState({
    search: initialFilters?.search || '',
    start_date: initialFilters?.start_date || '',
    end_date: initialFilters?.end_date || '',
    agency_id: initialFilters?.agency_id || '',
    citerne_id: initialFilters?.citerne_id || '',
  });

  // --- GESTION DU GRAPHIQUE ---
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { 
        display: true, 
        text: `Évolution du Stock - ${licence === 'automatique' ? 'Sondes IoT' : 'Relevés Manuels'}` 
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'Volume (Litres)' }
      }
    }
  };

  const reactChartData = {
    labels: chartData.map(d => new Date(d.date).toLocaleDateString('fr-FR')),
    datasets: [
      {
        label: 'Niveau Moyen (L)',
        data: chartData.map(d => d.avg_qty),
        borderColor: 'rgb(59, 130, 246)', // Bleu
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
      // Vous pouvez décommenter ceci si vous voulez afficher le min/max
      /*
      {
        label: 'Max (L)',
        data: chartData.map(d => d.max_qty),
        borderColor: 'rgb(16, 185, 129)', // Vert
        borderDash: [5, 5],
        fill: false,
        tension: 0.3,
        pointRadius: 0,
      }
      */
    ],
  };

  // --- GESTION DES FILTRES SERVEUR (INERTIA) ---
  const applyFilters = () => {
    // On nettoie les filtres vides
    const query = Object.keys(filterState).reduce((acc, key) => {
        if (filterState[key]) acc[key] = filterState[key];
        return acc;
    }, {});

    // Appel Inertia vers l'index avec le type (licence) et les filtres
    router.get(route('releves.index', { type: licence }), query, {
        preserveState: true,
        preserveScroll: true,
        replace: true, // Remplace l'historique URL pour ne pas pourrir le bouton retour
    });
  };

  // Gestion des changements d'input
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilterState(prev => ({ ...prev, [id]: value }));
  };

  // Réinitialisation
  const resetFilters = () => {
    setFilterState({
      search: '',
      start_date: '',
      end_date: '',
      agency_id: '',
      citerne_id: '',
    });
    router.get(route('releves.index', { type: licence }));
  };

  // Déclencheur pour appliquer les filtres (touche Entrée ou bouton)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applyFilters();
  };

  // --- GESTION DE L'EXPORTATION ---
  const handleExport = (exportType) => {
    // Construction de l'URL avec tous les filtres actuels pour que l'export corresponde à la vue
    const queryParams = new URLSearchParams({
        ...filterState,
        type: exportType,
        licence: licence // 'automatique' ou 'manuel'
    }).toString();
    
    // Redirection vers la route d'exportation
    window.location.href = route('releves.export') + '?' + queryParams;
  };

  return (
    <>
      <Head title={`Relevés ${licence}`} />
      <div className="p-6 space-y-6">
        
        {/* --- BLOC 1 : GRAPHIQUE --- */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="h-72 w-full">
                {chartData.length > 0 ? (
                    <Line options={chartOptions} data={reactChartData} />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        Aucune donnée graphique pour la période sélectionnée.
                    </div>
                )}
            </div>
        </div>

        {/* --- BLOC 2 : FILTRES & TABLEAU --- */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste des Relevés
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Boutons d'export directs */}
              <Button onClick={() => handleExport('pdf')} variant="secondary" className="border-red-200 text-red-700 hover:bg-red-50">
                <FontAwesomeIcon icon={faFileExport} className="mr-2"/> PDF
              </Button>
              <Button onClick={() => handleExport('excel')} variant="secondary" className="border-green-200 text-green-700 hover:bg-green-50">
                <FontAwesomeIcon icon={faFileExport} className="mr-2"/> Excel
              </Button>
            </div>
          </div>

          {/* --- Section de Filtrage --- */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilter} /> Filtres
                </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Filtre Agence */}
              {agencies && agencies.length > 0 && (
                <div>
                  <label htmlFor="agency_id" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Agence</label>
                  <select
                    id="agency_id"
                    className="h-10 w-full rounded-lg border border-gray-300 text-sm px-3 focus:border-brand-500"
                    value={filterState.agency_id}
                    onChange={handleFilterChange}
                  >
                    <option value="">Toutes</option>
                    {agencies.map(a => <option key={a.id} value={String(a.id)}>{a.name}</option>)}
                  </select>
                </div>
              )}

              {/* Filtre Citerne (Nouveau) */}
              <div>
                  <label htmlFor="citerne_id" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Citerne</label>
                  <select
                    id="citerne_id"
                    className="h-10 w-full rounded-lg border border-gray-300 text-sm px-3 focus:border-brand-500"
                    value={filterState.citerne_id}
                    onChange={handleFilterChange}
                  >
                    <option value="">Toutes</option>
                    {citernes.map(c => <option key={c.id} value={String(c.id)}>{c.name} ({c.product_type})</option>)}
                  </select>
              </div>

              {/* Date Début */}
              <Input
                id="start_date"
                type="date"
                label="Date de début"
                value={filterState.start_date}
                onChange={handleFilterChange}
                className="h-10"
              />
              
              {/* Date Fin */}
              <Input
                id="end_date"
                type="date"
                label="Date de fin"
                value={filterState.end_date}
                onChange={handleFilterChange}
                className="h-10"
              />

              {/* Boutons d'action Filtre */}
              <div className="flex items-end gap-2">
                  <Button onClick={applyFilters} variant="primary" className="h-10 w-full justify-center">
                    Filtrer
                  </Button>
                  <Button onClick={resetFilters} variant="destructive" className="h-10 w-12 justify-center px-0">
                    <FontAwesomeIcon icon={faTimes} />
                  </Button>
              </div>
            </div>
          </div>

          {/* --- Tableau des Données --- */}
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y bg-gray-50/50">
                <TableRow>
                  <TableCell isHeader className="py-3 text-start">Citerne</TableCell>
                  <TableCell isHeader className="py-3 text-start">Agence</TableCell>
                  <TableCell isHeader className="py-3 text-end">Théorique</TableCell>
                  <TableCell isHeader className="py-3 text-end">Mesurée</TableCell>
                  <TableCell isHeader className="py-3 text-end">Différence</TableCell>
                  <TableCell isHeader className="py-3 text-center">Date</TableCell>
                  <TableCell isHeader className="py-3 text-start">Utilisateur</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {releves.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-400">
                        Aucun relevé trouvé pour ces critères.
                    </TableCell>
                  </TableRow>
                ) : (
                  releves.data.map(releve => (
                    <TableRow key={releve.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <TableCell className="py-3 font-medium text-gray-800">{releve.citerne?.name || '-'}</TableCell>
                      <TableCell className="py-3 text-gray-600">{releve.agency?.name || '-'}</TableCell>
                      <TableCell className="py-3 text-end font-mono text-gray-600">{Number(releve.theorical_quantity).toFixed(2)}</TableCell>
                      <TableCell className="py-3 text-end font-mono font-bold text-blue-600">{Number(releve.measured_quantity).toFixed(2)}</TableCell>
                      <TableCell className="py-3 text-end font-mono">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${releve.difference < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {releve.difference > 0 ? '+' : ''}{Number(releve.difference).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center text-sm text-gray-500">
                        {new Date(releve.reading_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' })}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-500">
                        {releve.user ? `${releve.user.first_name} ${releve.user.last_name || ''}` : 'Robot/Système'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* --- PAGINATION --- */}
            {releves.links && releves.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-1">
                  {releves.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-1 text-sm rounded-md transition-colors
                        ${link.active
                          ? 'bg-blue-600 text-white'
                          : link.url
                            ? 'bg-white border hover:bg-gray-100 text-gray-700'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      onClick={(e) => !link.url && e.preventDefault()}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// --- WRAPPER PRINCIPAL (Gestion des Rôles) ---
const Releve = (props) => {
  // On déstructure les props envoyées par le contrôleur Laravel
  // Attention: releves, agencies, citernes, chartData, startDate, endDate, agencyId, citerneId, type
  
  const { auth } = usePage().props;
  const { licence, DirLicence } = useLicenceChoice(); // Hook personnalisé pour le choix Gaz/Fuel
  
  // On normalise les props pour les passer au contenu
  // Le backend envoie "type" (automatique/manuel) qui correspond à la licence
  const commonProps = {
    ...props, 
    // On mappe les filtres initiaux depuis les props du backend
    filters: {
        agency_id: props.agencyId,
        citerne_id: props.citerneId,
        start_date: props.startDate,
        end_date: props.endDate,
        search: '' // Recherche texte si besoin
    }
  };

  // Logique d'affichage selon le Rôle et le type de produit (Gaz/Fuel)
  
  // 1. Rôle Magasinier
  if (auth.user.role.name === "magasin" || auth.user.role === "magasin") {
    const activeLicence = licence; // Gaz ou Fuel
    if (activeLicence === "gaz") {
        return <MagLayout title="Relevés"><PageContent {...commonProps} licence={activeLicence} /></MagLayout>;
    } else {
        return <MagFuelLayout><PageContent {...commonProps} licence={activeLicence} /></MagFuelLayout>;
    }
  }
  
  // 2. Rôle Contrôleur
  if (auth.user.role.name === "controleur" || auth.user.role === "controleur") {
     return <RegLayout title="Relevés"><PageContent {...commonProps} licence={DirLicence} /></RegLayout>;
  }

  // 3. Rôle Direction
  if (auth.user.role.name === "direction" || auth.user.role === "direction") {
    if (DirLicence === "gaz") {
        return <DirLayout><PageContent {...commonProps} licence={DirLicence} /></DirLayout>;
    } else {
        return <DirFuelLayout><PageContent {...commonProps} licence={DirLicence} /></DirFuelLayout>;
    }
  }

  // Fallback
  return <div className="p-10 text-center text-red-500">Rôle non reconnu ou accès non autorisé.</div>;
};

export default Releve;