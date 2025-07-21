import React, { useState, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faTrash, faFileExport, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Swal from 'sweetalert2';
import Button from '../components/ui/button/Button';
import Input from '../components/form/input/InputField'; // Assurez-vous que c'est le bon chemin pour votre InputField
import MovementHistoryPDFExcelModal from '../components/Modals/MovHistModal'; // Assurez-vous que c'est le bon chemin pour votre modale

// Layouts - assurez-vous que les chemins sont corrects
import MagLayout from '../layout/MagLayout/MagLayout';
import ProdLayout from '../layout/ProdLayout/ProdLayout';
import RegLayout from '../layout/RegLayout/RegLayout';

// --- Composant PageContent: Contient la logique principale de la page ---
const PageContent = ({ movements, articles, agencies, services }) => {
  // --- États pour la modale d'exportation ---
  const [isPDFExcelModalOpen, setIsPDFExcelModalOpen] = useState(false);
  const openPDFExcelModal = () => setIsPDFExcelModalOpen(true);
  const closePDFExcelModal = () => setIsPDFExcelModalOpen(false);

  // --- États pour les filtres frontend ---
  // Initialisez filterMovementType avec une chaîne vide pour "Tous"
  const [filterMovementType, setFilterMovementType] = useState('');
  const [filterArticleName, setFilterArticleName] = useState('');
  const [filterQualification, setFilterQualification] = useState('');
  const [filterAgencyId, setFilterAgencyId] = useState('');

  // --- Filtrage des mouvements selon les filtres (optimisé avec useMemo) ---
  const filteredMovements = useMemo(() => {
    // La source de données pour le filtrage est movements.data (la page actuelle de mouvements reçue de Laravel)
    // C'est important car 'movements' est un objet de pagination Inertia, et les données sont dans 'data'.
    if (!movements || !movements.data) {
      return []; // Retourne un tableau vide si les données ne sont pas encore disponibles
    }

    return movements.data.filter(movement => {
      // 1. Filtrer par type de mouvement
      const matchesType = filterMovementType === '' || movement.movement_type === filterMovementType;

      // 2. Filtrer par nom d'article
      const matchesArticleName = filterArticleName === '' ||
        (movement.article && movement.article.name.toLowerCase().includes(filterArticleName.toLowerCase()));

      // 3. Filtrer par qualification
      // Assurez-vous que movement.qualification existe avant d'appeler .toLowerCase()
      const matchesQualification = filterQualification === '' ||
        (movement.qualification && movement.qualification.toLowerCase() === filterQualification.toLowerCase());

      // 4. Filtrer par agence
      // Convertir agency_id en chaîne pour une comparaison stricte pour s'assurer que '1' (string) == 1 (number)
      const matchesAgency = filterAgencyId === '' || String(movement.agency_id) === String(filterAgencyId);

      return matchesType && matchesArticleName && matchesQualification && matchesAgency;
    });
  }, [movements.data, filterMovementType, filterArticleName, filterQualification, filterAgencyId]); // Dépendances pour useMemo

  // --- useForm d'Inertia pour la suppression ---
  const { delete: inertiaDelete, processing } = useForm();

  // --- Fonction pour gérer la suppression d'un mouvement avec SweetAlert2 ---
  const handleDelete = (movementId) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer ce mouvement. Cette action est irréversible et ajustera le stock de l'article !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('magasin.move.delete', movementId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'Le mouvement a été supprimé avec succès et le stock ajusté.',
              'success'
            );
            // Inertia rafraîchira automatiquement les props 'movements' après une suppression réussie,
            // ce qui re-déclenchera le filtrage si nécessaire.
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression du mouvement. ' + (errors.message || 'Veuillez réessayer.'),
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title="Mouvements" />
      <div className="p-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                <FontAwesomeIcon icon={faCube} className="mr-3 text-brand-600" />
                Liste des Mouvements
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {/* Bouton d'exportation */}
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

          {/* --- Zone de filtrage --- */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-white/[0.02]">
            <h4 className="text-md font-semibold text-gray-700 dark:text-white/80 mb-3">
              <FontAwesomeIcon icon={faFilter} className="mr-2 text-blue-500" />
              Filtres
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtre par type de mouvement */}
              <div>
                <label htmlFor="filterMovementType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de Mouvement
                </label>
                <select
                  id="filterMovementType"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={filterMovementType}
                  onChange={(e) => setFilterMovementType(e.target.value)}
                >
                  <option value="">Tous les types</option>
                  <option value="entree">Entrée</option>
                  <option value="sortie">Sortie</option>
                </select>
              </div>

              {/* Filtre par nom d'article */}
              <Input
                id="filterArticleName"
                type="text"
                label="Nom de l'Article"
                value={filterArticleName}
                onChange={(e) => setFilterArticleName(e.target.value)}
                placeholder="Rechercher par article..."
              />

              {/* Filtre par qualification */}
              <div>
                <label htmlFor="filterQualification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qualification
                </label>
                <select
                  id="filterQualification"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={filterQualification}
                  onChange={(e) => setFilterQualification(e.target.value)}
                >
                  <option value="">Toutes les qualifications</option>
                  <option value="reepreuve">Réépreuve</option>
                  <option value="achat">Achat</option>
                  <option value="perte">Perte</option>
                  <option value="transfert">Transfert</option>
                </select>
              </div>

              {/* Filtre par agence */}
              <div>
                <label htmlFor="filterAgencyId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Agence
                </label>
                <select
                  id="filterAgencyId"
                  className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs border-gray-300 dark:border-gray-700 bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  value={filterAgencyId}
                  onChange={(e) => setFilterAgencyId(e.target.value)}
                >
                  <option value="">Toutes les agences</option>
                  {agencies && agencies.map(agency => (
                    <option key={agency.id} value={String(agency.id)}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {/* --- Fin zone de filtrage --- */}

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Article</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agence</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Quantité</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type Mouvement</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Qualification</TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-6 text-center text-gray-400">Aucun mouvement trouvé pour les filtres appliqués, monsieur.</TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map(movement => (
                    <TableRow key={movement.id}>
                      <TableCell>{movement.article ? movement.article.name : '—'}</TableCell>
                      <TableCell>{movement.agency ? movement.agency.name : '—'}</TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{new Date(movement.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</TableCell>
                      <TableCell className={`font-semibold capitalize ${movement.movement_type === 'entree' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.movement_type}
                      </TableCell>
                      <TableCell>{movement.qualification || '—'}</TableCell>
                      <TableCell>
                        <button
                          disabled={processing}
                          onClick={() => handleDelete(movement.id)}
                          title="Supprimer ce mouvement"
                          className="text-red-600 hover:text-red-800 transition-colors"
                          type="button"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* --- CONTRÔLES DE PAGINATION D'INERTIA (s'appliquent aux données brutes de la page) --- */}
            {movements.links && movements.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {movements.links.map((link, index) => (
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
                      preserveState // Garde l'état des filtres frontend quand vous changez de page
                      preserveScroll
                      // 'only' pour re-requérir seulement les props pertinentes du backend
                      only={['movements', 'articles', 'agencies', 'services']}
                      onClick={(e) => {
                        if (!link.url) e.preventDefault();
                      }}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </nav>
            )}
            {/* --------------------------------------------------------------------------------- */}
          </div>
        </div>
      </div>

      {/* La modale de génération de PDF/Excel */}
      <MovementHistoryPDFExcelModal
        isOpen={isPDFExcelModalOpen}
        onClose={closePDFExcelModal}
        articles={articles}
        agencies={agencies}
        services={services}
      />
    </>
  );
};

// --- Composant principal Entree: Gère le layout en fonction du rôle de l'utilisateur ---
const Entree = ({ movements, articles, agencies, services }) => {
    const { auth } = usePage().props;
    const userRole = auth.user.role; // Accéder au nom du rôle

    // Rendu conditionnel du layout basé sur le rôle de l'utilisateur
    if (userRole === "production") {
        return (
            <ProdLayout>
                <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
            </ProdLayout>
        );
    }
    if (userRole === "magasin") {
        return (
            <MagLayout>
                <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
            </MagLayout>
        );
    }
    if (userRole === "controleur" ) { // Ajout de 'direction' ici
       return (
          <RegLayout>
            <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
          </RegLayout>
        );
    }
    // Fallback pour les rôles non définis ou si auth.user.role n'est pas ce qui est attendu
    return (
        <MagLayout> {/* Ou un layout par défaut si aucun rôle ne correspond */}
            <PageContent movements={movements} articles={articles} agencies={agencies} services={services} />
        </MagLayout>
    );
};

export default Entree;