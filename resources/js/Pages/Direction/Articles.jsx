import React, { useState } from 'react';
import DirLayout from '../../layout/DirLayout/DirLayout';
import { Head, useForm, usePage, Link, router } from '@inertiajs/react'; // Import de router ajouté
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faBoxesStacked, faFilePdf, faSearch, faFilter } from '@fortawesome/free-solid-svg-icons'; 
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import ArticleModal from '../../components/Modals/Direction/ArticleModal';
import Swal from 'sweetalert2';

const Articles = ({ articles, entreprises, simpleArticles, filters }) => {
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // États pour les filtres (initialisés avec les props si existantes)
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [typeFilter, setTypeFilter] = useState(filters?.type || '');

  const { delete: inertiaDelete, post: inertiaPost } = useForm(); 
  const { props: { auth } } = usePage(); 

  // --- NOUVEAU : Fonction pour appliquer les filtres ---
  const applyFilters = (e) => {
    e.preventDefault();
    router.get(route('articles.index'), { // Assurez-vous que le nom de la route est correct
      search: searchTerm,
      type: typeFilter
    }, { preserveState: true, preserveScroll: true });
  };

  // --- NOUVEAU : Fonction pour réinitialiser les filtres ---
  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    router.get(route('articles.index'), {}, { preserveState: true, preserveScroll: true });
  };

  // URL dynamique pour le PDF (inclut les filtres actuels)
  const pdfExportUrl = `${route('articles.export.pdf')}?search=${searchTerm}&type=${typeFilter}`;

  const openCreateArticleModal = () => {
    setSelectedArticle(null);
    setIsArticleModalOpen(true);
  };

  const openEditArticleModal = (article) => {
    setSelectedArticle(article);
    setIsArticleModalOpen(true);
  };

  const closeArticleModal = () => {
    setIsArticleModalOpen(false);
    setSelectedArticle(null);
    window.location.reload(); 
  };

  const handleDeleteArticle = (articleId, articleName) => {
    Swal.fire({
      title: 'Êtes-vous sûr, monsieur ?',
      text: `Vous êtes sur le point de supprimer l'article "${articleName}". Cette action est irréversible !`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaDelete(route('articles.destroy', articleId), {
          preserveScroll: true,
        });
      }
    });
  };

  const handleCreateStocks = (articleId, articleName) => {
    const userEntrepriseId = auth.user.entreprice?.id;
    if (!userEntrepriseId) {
      Swal.fire('Erreur', 'Impossible de déterminer l\'entreprise de l\'utilisateur connecté.', 'error');
      return;
    }

    Swal.fire({
      title: 'Confirmer la création des stocks, monsieur ?',
      text: `Cela va créer des entrées de stock initiales pour l'article "${articleName}" dans toutes les agences.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6', 
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, créer les stocks !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaPost(route('stocks.createForArticle', articleId), { 
          article_id: articleId,
          entreprise_id: userEntrepriseId, 
        }, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire('Stocks Créés !', `Les stocks pour "${articleName}" ont été initialisés.`, 'success');
          },
          onError: (errors) => {
            let errorMessage = errors?.message || 'Une erreur est survenue lors de la création des stocks.';
            Swal.fire('Erreur !', errorMessage, 'error');
          },
        });
      }
    });
  };

  return (
    <>
      <Head title='Articles' />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-4">
          Gestion des Articles
        </h1>
        
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          
          {/* EN-TÊTE ET BOUTONS D'ACTION */}
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste Des Articles
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={pdfExportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
              >
                <FontAwesomeIcon icon={faFilePdf} /> Exporter PDF
              </a>

              <button
                onClick={openCreateArticleModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} /> Créer Article
              </button>
            </div>
          </div>

          {/* NOUVEAU : BARRE DE RECHERCHE ET FILTRES */}
          <form onSubmit={applyFilters} className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par code ou nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-64">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Tous les types</option>
                <option value="matiere_premiere">Matière première</option>
                <option value="produit_fini">Produit fini</option>
                <option value="produit">Produit standard</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filtrer
              </button>
              {(searchTerm || typeFilter) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-colors"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </form>

          {/* TABLEAU */}
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader>Code</TableCell>
                  <TableCell isHeader>Nom</TableCell>
                  <TableCell isHeader>Type</TableCell>
                  <TableCell isHeader>Unité</TableCell>
                  <TableCell isHeader>Poids par Unité</TableCell>
                  <TableCell isHeader>Entreprise</TableCell>
                  <TableCell isHeader>Action</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {articles.data && articles.data.length > 0 ? (
                  articles.data.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>{article.code}</TableCell>
                      <TableCell>{article.name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                          {article.type}
                        </span>
                      </TableCell>
                      <TableCell>{article.unit}</TableCell>
                      <TableCell>{article.weight_per_unit ? `${article.weight_per_unit} ${article.unit}` : 'N/A'}</TableCell>
                      <TableCell>{article.entreprise ? article.entreprise.name : 'N/A'}</TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        <button
                          onClick={() => openEditArticleModal(article)}
                          className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-3 py-2 text-theme-sm font-medium text-yellow-700 shadow-theme-xs hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-700 dark:bg-yellow-800 dark:text-yellow-400 dark:hover:bg-white/[0.03] dark:hover:text-yellow-200"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id, article.name)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <button
                          onClick={() => handleCreateStocks(article.id, article.name)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-theme-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:bg-blue-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-200"
                        >
                          <FontAwesomeIcon icon={faBoxesStacked} /> Stocks
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Aucun article ne correspond à votre recherche.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {articles.links && articles.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {articles.links.map((link, index) => (
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
                      only={['articles']}
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

      <ArticleModal
        isOpen={isArticleModalOpen}
        onClose={closeArticleModal}
        entreprises={entreprises}
        article={selectedArticle}
        simpleArticles={simpleArticles || []}
        title={selectedArticle ? 'Modifier l\'Article' : 'Créer un Nouvel Article'}
      />
    </>
  );
};

Articles.layout = page => <DirLayout children={page} />;
export default Articles;