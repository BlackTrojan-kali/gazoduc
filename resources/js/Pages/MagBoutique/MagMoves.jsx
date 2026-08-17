import React, { useState } from 'react';
import { Head, router, Link, usePage } from '@inertiajs/react';
import MagBoutiqueLayout from '../../layout/MagBoutiqueLayout/MagBoutiqueLayout';
import ComBoutiqueLayout from '../../layout/ComBoutiqueLayout/ComBoutiqueLayout'; // Assurez-vous du chemin
import ExportHistoryModal from '../../components/Modals/Boutique_Modals/Moves/ExportHistoryModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHistory, 
    faSearch, 
    faFilePdf, 
    faTrash, 
    faArrowRight, 
    faFilter, 
    faUndo,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// --- 1. Contenu de la page (Logique métier) ---
const MovesContent = ({ moves, filters, products }) => {
  
  // --- États ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [search, setSearch] = useState(filters.search || '');
  const [type, setType] = useState(filters.type || '');

  // --- Gestion Filtres ---
  const handleSearch = (e) => {
      e.preventDefault();
      router.get(route('mag-boutique.history'), { search, type }, { preserveState: true });
  };

  const handleTypeChange = (e) => {
      setType(e.target.value);
      router.get(route('mag-boutique.history'), { search, type: e.target.value }, { preserveState: true });
  };

  const handleReset = () => {
      setSearch('');
      setType('');
      router.get(route('mag-boutique.history'));
  };

  // --- Gestion Suppression ---
  const handleDelete = (move) => {
      Swal.fire({
          title: 'Annuler ce mouvement ?',
          html: `
            <p>Vous êtes sur le point de supprimer le mouvement : <br/>
            <b>${move.type.toUpperCase()} - ${move.product.designation} (${move.qty})</b></p>
            <p class="text-sm text-red-500 mt-2"><i class="fas fa-exclamation-triangle"></i> Cela va impacter les stocks actuels !</p>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Oui, supprimer',
          cancelButtonText: 'Annuler'
      }).then((result) => {
          if (result.isConfirmed) {
              router.delete(route('magasin.boutique.destroy', move.id), {
                  onSuccess: () => Swal.fire('Supprimé', 'Le mouvement a été annulé et les stocks ajustés.', 'success')
              });
          }
      });
  };

  return (
    <div className="p-6 space-y-6">
      <Head title="Historique des Mouvements" />

      {/* --- En-tête --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faHistory} className="text-brand-600"/>
                Journal des Mouvements
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Trace complète des entrées, sorties et transferts de stock.
            </p>
        </div>

        {/* --- Bouton Rapport --- */}
        <button 
            onClick={() => setIsExportModalOpen(true)}
            className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
        >
            <FontAwesomeIcon icon={faFilePdf} className="text-red-500"/>
            Générer un Rapport
        </button>
      </div>

      {/* --- Barre de Filtres --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input 
                type="text"
                placeholder="Rechercher (Produit, SKU, Utilisateur)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-brand-500"
            />
        </form>

        <div className="w-full md:w-48 relative">
            <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-3 text-gray-400" />
            <select 
                value={type}
                onChange={handleTypeChange}
                className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:ring-brand-500 appearance-none"
            >
                <option value="">Tous les types</option>
                <option value="entree">Entrées (+)</option>
                <option value="sortie">Sorties (-)</option>
            </select>
        </div>

        {(search || type) && (
            <button onClick={handleReset} className="text-gray-500 hover:text-gray-700 px-3 py-2 bg-gray-100 rounded-lg">
                <FontAwesomeIcon icon={faUndo} />
            </button>
        )}
      </div>

      {/* --- Tableau --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Article</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Quantité</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Flux (Origine/Dest.)</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Auteur</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {moves.data.length > 0 ? (
                    moves.data.map((move) => (
                        <tr key={move.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                            {/* Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300"/>
                                    {new Date(move.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
                                    })}
                                </div>
                            </td>

                            {/* Article */}
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    {move.product.image_url && (
                                        <img src={`/storage/${move.product.image_url}`} alt="" className="h-8 w-8 rounded object-cover mr-2 border border-gray-200"/>
                                    )}
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            {move.product.designation}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            SKU: {move.product.sku}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Type (Badge) */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                {move.type === 'entree' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800">
                                        Entrée
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-200 dark:border-red-800">
                                        Sortie
                                    </span>
                                )}
                            </td>

                            {/* Quantité */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`font-mono font-bold text-sm ${move.type === 'entree' ? 'text-green-600' : 'text-red-600'}`}>
                                    {move.type === 'entree' ? '+' : '-'}{parseFloat(move.qty)}
                                </span>
                            </td>

                            {/* Flux */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {move.departure || 'N/A'}
                                    </span>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-[10px]"/>
                                    <span className={`px-2 py-1 rounded font-bold ${
                                        move.destination === 'Perte' 
                                        ? 'bg-red-50 text-red-600' 
                                        : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {move.destination || 'N/A'}
                                    </span>
                                </div>
                                {move.label && (
                                    <p className="text-[10px] text-gray-400 mt-1 italic max-w-[150px] truncate" title={move.label}>
                                        "{move.label}"
                                    </p>
                                )}
                            </td>

                            {/* Auteur */}
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                {move.user ? `${move.user.first_name} ${move.user.last_name?.charAt(0)}.` : 'Système'}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={() => handleDelete(move)}
                                    className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                                    title="Supprimer / Annuler"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                            Aucun mouvement trouvé pour ces critères.
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        {moves.links && moves.links.length > 3 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                 <div className="flex-1 flex justify-between sm:hidden">
                    <Link href={moves.prev_page_url} disabled={!moves.prev_page_url} className="btn-secondary">Précédent</Link>
                    <Link href={moves.next_page_url} disabled={!moves.next_page_url} className="btn-secondary">Suivant</Link>
                 </div>
                 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                    <div className="flex gap-1">
                        {moves.links.map((link, key) => (
                            <Link
                                key={key}
                                href={link.url}
                                className={`px-3 py-1 text-xs rounded border ${
                                    link.active 
                                    ? 'bg-brand-600 text-white border-brand-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                 </div>
            </div>
        )}
      </div>

      {/* --- MODALE D'EXPORTATION --- */}
      <ExportHistoryModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        products={products}
        routeExportName="mag-boutique.export_history"
      />
    </div>
  );
};

// --- 2. Composant Principal (Gestion des Layouts) ---
const MagMoves = ({ moves, filters, products }) => {
    const { auth } = usePage().props;

    // Vérification du rôle (Adapté selon votre backend : ex: 'commercial', 'commercial_boutique', etc.)
    // Utilisation de .includes() ou == selon la structure de vos données
    const isCommercial = auth.user.role && auth.user.role.toLowerCase().includes('commercial');

    if (isCommercial) {
        return (
            <ComBoutiqueLayout>
                <MovesContent moves={moves} filters={filters} products={products} />
            </ComBoutiqueLayout>
        );
    }

    // Par défaut (Magasinier)
    return (
        <MagBoutiqueLayout>
            <MovesContent moves={moves} filters={filters} products={products} />
        </MagBoutiqueLayout>
    );
};

export default MagMoves;