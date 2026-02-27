import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import MagBoutiqueLayout from '../../layout/MagBoutiqueLayout/MagBoutiqueLayout';
import ProductMoveFormModal from '../../components/Modals/Boutique_Modals/Moves/ProductMoveFormModal'; // Assurez-vous du chemin
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBoxes, 
    faSearch, 
    faFilter, 
    faPlusCircle, 
    faWarehouse, 
    faStoreAlt,
    faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';

const MagBoutiqueIndex = ({ stocks, userBoutique, filters, products }) => {
  // --- États ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState(filters.search || '');
  const [service, setService] = useState(filters.service || '');

  // --- Gestion Filtres ---
  const handleSearch = (e) => {
      e.preventDefault();
      router.get(route('magasin.boutique.index'), { search, service }, { preserveState: true });
  };

  const handleServiceChange = (e) => {
      setService(e.target.value);
      router.get(route('magasin.boutique.index'), { search, service: e.target.value }, { preserveState: true });
  };

  // --- Composant Jauge (Mini) ---
  const StockGauge = ({ available, alert }) => {
      const percentage = alert > 0 ? (available / (alert * 3)) * 100 : 100;
      const width = Math.min(Math.max(percentage, 5), 100);
      
      let color = "bg-green-500";
      if(available <= alert) color = "bg-red-500 animate-pulse";
      else if(available <= alert * 1.5) color = "bg-orange-400";

      return (
          <div className="w-full max-w-[140px]">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{parseFloat(available)} disp.</span>
                  <span>Seuil: {alert}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${color}`} style={{ width: `${width}%` }}></div>
              </div>
          </div>
      );
  };

  return (
    <div className="p-6 space-y-6">
      <Head title={`Stock - ${userBoutique.name}`} />

      {/* --- En-tête --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                    {userBoutique.name}
                </span>
                {userBoutique.is_central && (
                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                        Centrale
                    </span>
                )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faBoxes} className="text-gray-400"/>
                Gestion des Stocks
            </h1>
        </div>

        {/* --- BOUTON D'ACTION PRINCIPAL --- */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
        >
            <FontAwesomeIcon icon={faPlusCircle} className="text-lg"/>
            Enregistrer un Mouvement
        </button>
      </div>

      {/* --- Barre de Filtres --- */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
            <input 
                type="text"
                placeholder="Rechercher un produit (Nom, SKU, Code barre)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-brand-500"
            />
        </form>

        <div className="w-full md:w-64 relative">
            <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-3 text-gray-400" />
            <select 
                value={service}
                onChange={handleServiceChange}
                className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:ring-brand-500 appearance-none"
            >
                <option value="">Tous les services</option>
                <option value="magasin">Magasin (Stockage)</option>
                <option value="comptoir">Comptoir (Vente)</option>
            </select>
        </div>
      </div>

      {/* --- Tableau des Stocks --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Produit</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Emplacement (Service)</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase w-40">Niveau de Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Dernière MAJ</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stocks.data.length > 0 ? (
                    stocks.data.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                            {/* Produit */}
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded bg-gray-100 flex-shrink-0 flex items-center justify-center mr-3 border border-gray-200">
                                        {/* Image placeholder ou réelle */}
                                        <span className="text-gray-400 font-bold text-xs">{item.product.sku.substring(0,3)}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            {item.product.designation}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            SKU: {item.product.sku}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Service */}
                            <td className="px-6 py-4">
                                {item.service === 'magasin' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        <FontAwesomeIcon icon={faWarehouse} /> Magasin
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                        <FontAwesomeIcon icon={faStoreAlt} /> Comptoir
                                    </span>
                                )}
                            </td>

                            {/* Jauge */}
                            <td className="px-6 py-4">
                                <StockGauge 
                                    available={item.available_qty} 
                                    alert={item.product.stock_alert || 5} 
                                />
                                {item.available_qty <= (item.product.stock_alert || 5) && (
                                    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                        <FontAwesomeIcon icon={faExclamationTriangle} /> Stock bas
                                    </p>
                                )}
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4 text-right text-xs text-gray-500">
                                {new Date(item.updated_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit'
                                })}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                                <FontAwesomeIcon icon={faBoxes} className="text-4xl text-gray-200 mb-2"/>
                                <p>Aucun produit en stock pour cette recherche.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      {/* Intégrez ici votre composant de pagination (ex: <Pagination links={stocks.links} />) */}

      {/* --- MODALE DE MOUVEMENT --- */}
      <ProductMoveFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        boutiqueId={userBoutique.id} // On passe l'ID boutique
        products={products}          // On passe la liste des produits pour le Select
      />

    </div>
  );
};

MagBoutiqueIndex.layout = page => <MagBoutiqueLayout children={page}/>
export default MagBoutiqueIndex