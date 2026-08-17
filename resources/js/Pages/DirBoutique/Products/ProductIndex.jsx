import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Swal from 'sweetalert2'; // Importation de SweetAlert2
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import ProductFormModal from '../../../components/Modals/Boutique_Modals/Produits/ProductFormModal';
import Button from '../../../components/ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faEdit, 
    faTrash, 
    faSearch, 
    faBoxes, 
    faCogs, 
    faExclamationTriangle,
    faBarcode
} from '@fortawesome/free-solid-svg-icons';

const ProductIndex = ({ products, categories, units }) => {
  // --- États ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);

  // --- Filtrage Client-Side (Rapide) ---
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      setFilteredProducts(
        products.filter((p) => 
          p.designation.toLowerCase().includes(lowerTerm) ||
          p.sku.toLowerCase().includes(lowerTerm) ||
          (p.barcode && p.barcode.includes(lowerTerm))
        )
      );
    }
  }, [searchTerm, products]);

  // --- Actions Modale ---
  const openCreateModal = () => {
    setCurrentProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  // --- Actions CRUD & Stocks avec SweetAlert ---

  // 1. Suppression
  const handleDelete = (id) => {
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Cette action est irréversible ! L'article sera supprimé définitivement.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            router.delete(route('products.destroy', id), {
                onSuccess: () => {
                    Swal.fire(
                        'Supprimé !',
                        'L\'article a été supprimé avec succès.',
                        'success'
                    );
                },
                onError: () => {
                    Swal.fire(
                        'Erreur',
                        'Une erreur est survenue lors de la suppression.',
                        'error'
                    );
                }
            });
        }
    });
  };

  // 2. Initialisation Stock Unitaire
  const handleInitStock = (id, name) => {
    Swal.fire({
        title: 'Initialiser les stocks ?',
        html: `Ceci va créer des stocks à <b>0</b> pour l'article <b>"${name}"</b> dans le Magasin et le Comptoir de toutes les boutiques.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f97316', // Orange
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Oui, initialiser',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            router.post(route('products.init-stock', id), {}, {
                onSuccess: () => {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });
                    Toast.fire({
                        icon: 'success',
                        title: 'Stocks initialisés avec succès'
                    });
                }
            });
        }
    });
  };

  // 3. Initialisation Globale (Traitement long)
  const handleInitAllStocks = () => {
      Swal.fire({
        title: 'Attention !',
        text: "Ceci va vérifier et créer les lignes de stock manquantes pour TOUS les produits dans TOUTES les boutiques. Cela peut prendre du temps.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ea580c', // Orange foncé
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Oui, lancer le traitement',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
            // Afficher un loader pendant le traitement
            let timerInterval;
            Swal.fire({
                title: 'Traitement en cours...',
                html: 'Veuillez patienter pendant la génération des stocks.',
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                },
                allowOutsideClick: false
            });

            router.post(route('products.init-all-stocks'), {}, {
                onSuccess: () => {
                    Swal.fire(
                        'Terminé !',
                        'Tous les stocks ont été vérifiés et initialisés.',
                        'success'
                    );
                },
                onError: () => {
                    Swal.fire(
                        'Erreur',
                        'Le traitement a rencontré un problème.',
                        'error'
                    );
                }
            });
        }
      });
  };

  // Helper pour formater le prix (FCFA)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(price);
  };

  return (
    <div className="p-6 space-y-6">
      <Head title="Gestion des Produits" />

      {/* --- En-tête --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faBoxes} className="text-brand-600"/>
            Catalogue Produits
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredProducts.length} référence(s) enregistrée(s).
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
            {/* Bouton Initialisation Globale */}
            <Button 
                onClick={handleInitAllStocks}
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all"
                title="Générer les stocks manquants pour tous les produits"
            >
                <FontAwesomeIcon icon={faCogs} className="mr-2" />
                Générer Tout Stock
            </Button>

            {/* Bouton Création */}
            <Button 
                onClick={openCreateModal}
                className="bg-brand-600 hover:bg-brand-700 text-white shadow-md transition-all"
            >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Nouveau Produit
            </Button>
        </div>
      </div>

      {/* --- Barre de Recherche --- */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher (Désignation, SKU, Code-barres)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:ring-brand-500 focus:border-brand-500 text-gray-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      {/* --- Tableau --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prix (Vente)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unité & Seuil</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    
                    {/* Colonne Image & Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                            {product.image_url ? (
                                <img 
                                    src={`/storage/${product.image_url}`} 
                                    alt={product.designation} 
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <FontAwesomeIcon icon={faBoxes} className="text-gray-400 text-xl" />
                            )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {product.designation}
                          </div>
                          <div className="text-xs text-gray-500 flex flex-col">
                            <span>SKU: {product.sku}</span>
                            {product.barcode && (
                                <span className="flex items-center gap-1 mt-0.5"><FontAwesomeIcon icon={faBarcode}/> {product.barcode}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Colonne Catégorie */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {product.category?.name || 'Non classé'}
                      </span>
                    </td>

                    {/* Colonne Prix */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(product.prix_vente)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Achat: {product.prix_achat ? formatPrice(product.prix_achat) : '-'} | TVA: {product.tva}%
                      </div>
                    </td>

                    {/* Colonne Unité */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                             {product.value_per_unit} {product.unit}
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-1" title="Seuil d'alerte stock">
                             <FontAwesomeIcon icon={faExclamationTriangle}/> Alerte à {product.stock_alert}
                        </div>
                    </td>

                    {/* Colonne Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                            {/* Bouton Init Stock Individuel */}
                            <button 
                                onClick={() => handleInitStock(product.id, product.designation)}
                                className="text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 p-2 rounded-full transition-colors"
                                title="Générer les stocks pour cet article"
                            >
                                <FontAwesomeIcon icon={faCogs} />
                            </button>

                            {/* Bouton Modifier */}
                            <button 
                                onClick={() => openEditModal(product)}
                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 p-2 rounded-full transition-colors"
                                title="Modifier"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>

                            {/* Bouton Supprimer */}
                            <button 
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 p-2 rounded-full transition-colors"
                                title="Supprimer"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faBoxes} className="text-4xl opacity-20 mb-2"/>
                        <p>Aucun produit ne correspond à votre recherche.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Intégration Modale --- */}
      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={currentProduct}
        categories={categories}
        units={units}
      />
    </div>
  );
};

ProductIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default ProductIndex;