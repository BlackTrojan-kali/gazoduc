import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react'; // Ajout de router pour les requêtes
import Swal from 'sweetalert2'; // Ajout de SweetAlert
import DirBoutiqueLayout from '../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCashRegister, 
    faStore, 
    faMapMarkerAlt, 
    faSearch, 
    faServer,
    faExchangeAlt,
    faEdit // Ajout de l'icône d'édition
} from '@fortawesome/free-solid-svg-icons';

const CounterIndex = ({ counters }) => {
  // --- État pour la recherche locale ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCounters, setFilteredCounters] = useState(counters);

  // --- Filtrage dynamique ---
  useEffect(() => {
    if (searchTerm === '') {
        setFilteredCounters(counters);
    } else {
        const term = searchTerm.toLowerCase();
        setFilteredCounters(
            counters.filter(c => 
                c.name.toLowerCase().includes(term) ||
                c.boutique.name.toLowerCase().includes(term) ||
                c.boutique.city.name.toLowerCase().includes(term)
            )
        );
    }
  }, [searchTerm, counters]);

  // --- Fonction de Mise à jour du Seuil (Transfert Point) ---
  const handleEditLimit = (counter) => {
    Swal.fire({
        title: `Seuil Versement : ${counter.boutique.name}`,
        html: `
            <p class="text-sm text-gray-600 mb-4">Définissez le montant à partir duquel un versement est requis.</p>
            <div class="bg-yellow-50 text-yellow-800 p-2 rounded text-xs text-left border border-yellow-200">
                <i class="fas fa-info-circle"></i> <b>Attention :</b> Cette modification s'appliquera à 
                toutes les caisses de la boutique <u>${counter.boutique.name}</u>.
            </div>
        `,
        input: 'number',
        inputValue: counter.transfert_point,
        inputAttributes: {
            min: 0,
            step: 1000
        },
        showCancelButton: true,
        confirmButtonText: 'Mettre à jour',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#ea580c', // Orange brand
        cancelButtonColor: '#6b7280',
        inputValidator: (value) => {
            if (!value || value < 0) {
                return 'Veuillez entrer un montant valide (positif).';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            router.put(route('counters.update-transfert-point', counter.id), {
                transfert_point: result.value
            }, {
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
                        title: 'Seuil mis à jour pour toute la boutique'
                    });
                },
                onError: () => {
                    Swal.fire('Erreur', 'Impossible de mettre à jour le seuil.', 'error');
                }
            });
        }
    });
  };

  // Helper formattage monétaire
  const formatMoney = (amount) => {
      return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="p-6 space-y-6">
      <Head title="Gestion des Caisses" />

      {/* --- En-tête --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FontAwesomeIcon icon={faCashRegister} className="text-brand-600"/>
            Liste des Caisses (Guichets)
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Vue d'ensemble des points de vente par boutique.
          </p>
        </div>

        {/* --- Statistique Rapide --- */}
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                <FontAwesomeIcon icon={faServer} />
             </div>
             <div>
                 <p className="text-xs text-gray-500 uppercase font-bold">Total Caisses</p>
                 <p className="text-lg font-bold text-gray-800 dark:text-white">{filteredCounters.length}</p>
             </div>
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
                placeholder="Rechercher une caisse, une boutique ou une ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
        </div>
      </div>

      {/* --- Tableau --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Caisse</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Boutique de rattachement</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seuil Versement</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCounters.length > 0 ? (
                filteredCounters.map((counter) => (
                  <tr key={counter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    
                    {/* Colonne Nom Caisse */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400">
                            <FontAwesomeIcon icon={faCashRegister} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {counter.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Type: {counter.type || 'Standard'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Colonne Boutique */}
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faStore} className="text-gray-400 text-xs"/>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                {counter.boutique?.name}
                            </span>
                        </div>
                        {counter.boutique?.is_central ? (
                            <span className="ml-6 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                Centrale
                            </span>
                        ) : (
                            <span className="ml-6 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                Annexe
                            </span>
                        )}
                    </td>

                    {/* Colonne Localisation */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900 dark:text-white flex items-center gap-1">
                             {counter.boutique?.city?.name}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[10px]"/>
                            {counter.boutique?.city?.region?.name}
                        </span>
                      </div>
                    </td>

                    {/* Colonne Transfert Point (Modifiable) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-3">
                           <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600">
                                <FontAwesomeIcon icon={faExchangeAlt} className="text-gray-400"/>
                                <span className="font-mono font-medium">{formatMoney(counter.transfert_point || 0)}</span>
                           </div>
                           
                           <button 
                                onClick={() => handleEditLimit(counter)}
                                className="text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors p-1.5 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-full"
                                title="Modifier le seuil pour cette boutique"
                           >
                               <FontAwesomeIcon icon={faEdit} />
                           </button>
                       </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                        <FontAwesomeIcon icon={faCashRegister} className="text-4xl opacity-20 mb-3"/>
                        <p>Aucune caisse ne correspond à votre recherche.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

CounterIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default CounterIndex;