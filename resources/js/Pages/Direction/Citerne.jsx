import React, { useState, useMemo } from 'react';
import DirLayout from '../../layout/DirLayout/DirLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faBoxesStacked } from '@fortawesome/free-solid-svg-icons'; // faOilCan n'est pas utilisé dans le code existant
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';

// Importez maintenant la modal unique pour la création/modification
import CiterneFormModal from '../../components/Modals/Direction/CiternModal'; // Assurez-vous que le chemin est correct et le nom est à jour

import Swal from 'sweetalert2';

// ----------------------------------------------------------------------------------------------------------------

const Citernes = ({ citernes, entreprises, products, agencies }) => {
  // --- États pour la gestion de la Modal (inchangés) ---
  const [isCiterneFormModalOpen, setIsCiterneFormModalOpen] = useState(false);
  const [selectedCiterne, setSelectedCiterne] = useState(null);

  // --- NOUVEAUX États pour les filtres ---
  const [filterAgency, setFilterAgency] = useState(''); // ID de l'agence sélectionnée
  const [filterProduct, setFilterProduct] = useState(''); // ID du produit sélectionné
  const [filterName, setFilterName] = useState(''); // Nom/partie du nom pour la recherche

  const { delete: inertiaDelete, post: inertiaPost } = useForm();
  const { props: { auth } } = usePage();

  // --- Fonctions de gestion de la Modal (inchangées) ---
  const openCreateCiterneModal = () => {
    setSelectedCiterne(null);
    setIsCiterneFormModalOpen(true);
  };

  const openEditCiterneModal = (citerne) => {
    setSelectedCiterne(citerne);
    setIsCiterneFormModalOpen(true);
  };

  const closeCiterneFormModal = () => {
    setIsCiterneFormModalOpen(false);
    setSelectedCiterne(null);
    // Note: Recharger la page après une opé est déjà géré dans handleDeleteCiterne,
    // si vous voulez recharger après une création/édition, vous devez le faire dans la modal.
  };

  // --- Fonction pour gérer la suppression (inchangée) ---
  const handleDeleteCiterne = (citerneId, citerneName) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer la citerne "${citerneName}". Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('citernes.destroy', citerneId), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Supprimée !',
              'La citerne a été supprimée avec succès.',
              'success'
            );
            window.location.reload(); // Recharger après suppression
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de la citerne.',
              'error'
            );
          },
        });
      }
    });
  };

  // --- Fonction pour gérer la création de stocks (inchangée) ---
  const handleCreateCiterneStock = (citerneId, citerneName, currentProductId) => {
    Swal.fire({
      title: 'Confirmer l\'initialisation du stock de citerne, monsieur ?',
      text: `Cela va créer une entrée de stock initiale (quantité 0) pour la citerne "${citerneName}".`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, initialiser le stock !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaPost(route('citernes.generate-stock', {
          citerne_id: citerneId,
          article_id: currentProductId,
        }, ), {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Stock Citerne Initialisé !',
              `Le stock pour la citerne "${citerneName}" a été initialisé.`,
              'success'
            );
            //window.location.reload(); // Recharger après initialisation du stock si nécessaire
          },
          onError: (errors) => {
            console.error('Erreur de création de stock de citerne:', errors);
            let errorMessage = 'Une erreur est survenue lors de l\'initialisation du stock de citerne.';
            if (errors && errors.message) {
              errorMessage = errors.message;
            }
            Swal.fire(
              'Erreur !',
              errorMessage,
              'error'
            );
          },
        });
      }
    });
  };

  // --- Logique de Filtrage avec useMemo ---
  const filteredCiternes = useMemo(() => {
    if (!citernes.data) return [];

    return citernes.data.filter(citerne => {
      // 1. Filtrer par Agence
      const matchesAgency = filterAgency === '' || citerne.agency_id.toString() === filterAgency;

      // 2. Filtrer par Produit actuel
      const matchesProduct = filterProduct === '' || (citerne.current_product_id && citerne.current_product_id.toString() === filterProduct);

      // 3. Filtrer par Nom (recherche insensible à la casse et partielle)
      const matchesName = filterName === '' || citerne.name.toLowerCase().includes(filterName.toLowerCase());

      return matchesAgency && matchesProduct && matchesName;
    });
  }, [citernes.data, filterAgency, filterProduct, filterName]);

  // ----------------------------------------------------------------------------------------------------------------

  return (
    <>
      <Head title='Citernes' />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-4">
          Gestion des Citernes
        </h1>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          
          {/* Section d'en-tête et Bouton Créer */}
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste Des Citernes
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openCreateCiterneModal} // Ouvre la modal en mode création
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Créer Citerne
              </button>
            </div>
          </div>

          {/* NOUVELLE SECTION: Les Filtres */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Filtre par Nom de Citerne */}
            <input
              type="text"
              placeholder="Rechercher par Nom de Citerne..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="rounded-lg border border-gray-300 p-2.5 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />

            {/* Filtre par Agence */}
            <select
              value={filterAgency}
              onChange={(e) => setFilterAgency(e.target.value)}
              className="rounded-lg border border-gray-300 p-2.5 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">Toutes les Agences</option>
              {agencies && agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>

            {/* Filtre par Produit Actuel */}
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="rounded-lg border border-gray-300 p-2.5 text-theme-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="">Tous les Produits</option>
              {products && products.map((product) => (
                // Assurez-vous que les produits ont un ID et un nom
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          {/* Fin des Filtres */}

          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader>Nom</TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Type Produit</TableCell>
                  <TableCell isHeader>Capacité (L)</TableCell>
                  <TableCell isHeader>Capacité (Kg)</TableCell>
                  <TableCell isHeader>Produit Actuel</TableCell>
                  <TableCell isHeader>Agence</TableCell>
                  <TableCell isHeader>Entreprise</TableCell>
                  <TableCell isHeader>Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Utiliser la liste filtrée ici */}
                {filteredCiternes.length > 0 ? (
                  filteredCiternes.map((citerne) => (
                    <TableRow key={citerne.id}>
                      <TableCell>{citerne.name}</TableCell>
                      <TableCell>{citerne.type}</TableCell>
                      <TableCell>{citerne.product_type}</TableCell>
                      <TableCell>{citerne.capacity_liter} L</TableCell>
                      <TableCell>{citerne.capacity_kg} kg</TableCell>
                      <TableCell>{citerne.article ? citerne.article.name : 'N/A'}</TableCell>
                      <TableCell>{citerne.agency ? citerne.agency.name : 'N/A'}</TableCell>
                      <TableCell>{citerne.entreprise ? citerne.entreprise.name : 'N/A'}</TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        {/* Bouton Modifier */}
                        <button
                          onClick={() => openEditCiterneModal(citerne)}
                          className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-yellow-700 shadow-theme-xs hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-700 dark:bg-yellow-800 dark:text-yellow-400 dark:hover:bg-white/[0.03] dark:hover:text-yellow-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </button>
                        
                        {/* Bouton Générer Stock (pour citernes fixes) */}
                        {citerne.type === 'fixed' && (
                          <button
                            onClick={() => handleCreateCiterneStock(citerne.id, citerne.name, citerne.current_product_id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:bg-green-800 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-200"
                          >
                            <FontAwesomeIcon icon={faBoxesStacked} /> Stock
                          </button>
                        )}

                        {/* Bouton Supprimer (Ajouté car manquant dans l'original) */}
                        <button
                          onClick={() => handleDeleteCiterne(citerne.id, citerne.name)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Supprimer
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      {/* Message d'absence de résultat adapté aux filtres */}
                      {citernes.data && citernes.data.length > 0 ? 
                        'Aucune citerne ne correspond aux critères de filtre.' : 
                        'Aucune citerne trouvée.'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* IMPORTANT: La pagination InertiaJS fonctionne sur les données brutes. 
                Elle doit rester séparée des données filtrées en frontend. 
                Elle ne s'affichera que si le backend a renvoyé des liens de pagination. */}
            {(citernes.links && citernes.links.length > 3) && ( // Vérification simple pour s'assurer qu'il y a plus que First/Prev/Next/Last
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {citernes.links.map((link, index) => (
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
                      only={['citernes']}
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

      {/* Modal unique de formulaire */}
      <CiterneFormModal
        isOpen={isCiterneFormModalOpen}
        onClose={closeCiterneFormModal}
        entreprises={entreprises}
        agencies={agencies}
        products={products}
        selectedCiterne={selectedCiterne}
      />
    </>
  );
};

Citernes.layout = page => <DirLayout children={page} />;
export default Citernes;