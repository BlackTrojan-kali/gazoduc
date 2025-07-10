import React, { useState } from 'react';
import DirLayout from '../../layout/DirLayout/DirLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faBoxesStacked } from '@fortawesome/free-solid-svg-icons'; // Importez la nouvelle icône
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';

// Importez la modal ArticleModal
import ArticleModal from '../../components/Modals/Direction/ArticleModal';

import Swal from 'sweetalert2';

const Articles = ({ articles, entreprises }) => {
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // useForm d'Inertia
  const { delete: inertiaDelete, post: inertiaPost } = useForm(); // Importez aussi 'post' pour la création de stocks
  const { props: { auth } } = usePage(); // Accédez aux données de l'utilisateur connecté via 'auth'

  // Fonctions pour ouvrir/fermer la modal d'article
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
    // Rechargez la prop 'articles' après une opération de création/modification/stock
    // Note: 'usePage()' avec '.reload({ only: ['articles'] })' est la meilleure approche ici
    // pour s'assurer que la table est à jour.
    window.location.reload(); // Solution temporaire si inertia.reload() pose problème
  };

  // --- Fonction pour gérer la suppression d'un article avec SweetAlert2 ---
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
          onSuccess: () => {
            Swal.fire(
              'Supprimé !',
              'L\'article a été supprimé avec succès.',
              'success'
            );
            // La page sera rechargée via closeArticleModal qui appelle window.location.reload()
            // ou vous pouvez utiliser inertia.reload({ only: ['articles'] }) ici.
          },
          onError: (errors) => {
            console.error('Erreur de suppression:', errors);
            Swal.fire(
              'Erreur !',
              'Une erreur est survenue lors de la suppression de l\'article.',
              'error'
            );
          },
        });
      }
    });
  };

  // --- NOUVELLE FONCTION : Gérer la création de stocks pour un article ---
  const handleCreateStocks = (articleId, articleName) => {
    // Récupérer l'ID de l'entreprise de l'utilisateur connecté

    const userEntrepriseId = auth.user.entreprice.id;
    if (!userEntrepriseId) {
      Swal.fire('Erreur', 'Impossible de déterminer l\'entreprise de l\'utilisateur connecté.', 'error');
      return;
    }

    Swal.fire({
      title: 'Confirmer la création des stocks, monsieur ?',
      text: `Cela va créer des entrées de stock initiales (quantité 0) pour l'article "${articleName}" dans toutes les agences de votre entreprise.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6', // Bleu pour l'action de confirmation
      cancelButtonColor: '#676c75',
      confirmButtonText: 'Oui, créer les stocks !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        inertiaPost(route('stocks.createForArticle',articleId), { // Assurez-vous que cette route existe
          article_id: articleId,
          entreprise_id: userEntrepriseId, // Passer l'ID de l'entreprise
        }, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Stocks Créés !',
              `Les stocks pour l'article "${articleName}" ont été initialisés dans les agences de votre entreprise.`,
              'success'
            );
            // La page sera rechargée via closeArticleModal qui appelle window.location.reload()
          },
          onError: (errors) => {
            console.error('Erreur de création de stocks:', errors);
            let errorMessage = 'Une erreur est survenue lors de la création des stocks.';
            if (errors && errors.message) {
              errorMessage = errors.message; // Si votre backend renvoie un message d'erreur spécifique
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

  return (
    <>
      <Head title='Articles' />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-4">
          Gestion des Articles
        </h1>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste Des Articles
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openCreateArticleModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Créer Article
              </button>
            </div>
          </div>
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
                      <TableCell>{article.type}</TableCell>
                      <TableCell>{article.unit}</TableCell>
                      <TableCell>{article.weight_per_unit} kg</TableCell>
                      <TableCell>{article.entreprise ? article.entreprise.name : 'N/A'}</TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        <button
                          onClick={() => openEditArticleModal(article)}
                          className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-yellow-700 shadow-theme-xs hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-700 dark:bg-yellow-800 dark:text-yellow-400 dark:hover:bg-white/[0.03] dark:hover:text-yellow-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id, article.name)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-red-700 shadow-theme-xs hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:bg-red-800 dark:text-red-400 dark:hover:bg-white/[0.03] dark:hover:text-red-200"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Supprimer
                        </button>
                        {/* NOUVEAU BOUTON : Créer Stocks */}
                        <button
                          onClick={() => handleCreateStocks(article.id, article.name)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:bg-blue-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-200"
                        >
                          <FontAwesomeIcon icon={faBoxesStacked} /> Créer Stocks
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucun article trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {articles.links && (
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
        title={selectedArticle ? 'Modifier l\'Article' : 'Créer un Nouvel Article'}
      />
    </>
  );
};

Articles.layout = page => <DirLayout children={page} />;
export default Articles;