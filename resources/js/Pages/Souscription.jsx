import React, { useState } from 'react';
import AppLayout from "../layout/AppLayout";
import { Head, Link, usePage, router } from '@inertiajs/react'; // Ajout de `router`
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSyncAlt, faDownload, faBan, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'; // Ajout de nouvelles icônes
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Swal from 'sweetalert2';

import CreateSubscriptionModal from "../components/Modals/CreateSubscriptionModal";
import Badge from '../components/ui/badge/Badge';

const Souscription = ({ subs, entreprises, licences }) => {
  const [isCreateSubscriptionModalOpen, setIsCreateSubscriptionModalOpen] = useState(false);
  const { props: { inertia } } = usePage();

  const openCreateSubscriptionModal = () => setIsCreateSubscriptionModalOpen(true);
  const closeCreateSubscriptionModal = () => {
    setIsCreateSubscriptionModalOpen(false);
    router.reload({ only: ['subs'] }); // Utilisation propre de reload via Inertia
  };

  // --- Calcul des jours restants ---
  const getDaysRemainingAndBadge = (expirationDateString) => {
    const today = new Date();
    const expirationDate = new Date(expirationDateString);

    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);

    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let badgeColor = "info";
    let badgeText = `${diffDays} jours`;

    if (diffDays > 10) {
      badgeColor = "success";
    } else if (diffDays >= 3 && diffDays <= 10) {
      badgeColor = "warning";
    } else if (diffDays < 3 && diffDays >= 0) {
      badgeColor = "error";
    } else if (diffDays < 0) {
      badgeColor = "secondary";
      badgeText = `Expirée (${Math.abs(diffDays)}j)`;
    }

    return { diffDays, badgeColor, badgeText };
  };

  // --- Actions ---

  const handleRenewSubscription = (subscription) => {
    Swal.fire({
      title: 'Renouveler la souscription ?',
      text: `Voulez-vous prolonger d'un mois l'abonnement de "${subscription.entreprise.name}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, renouveler',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Envoi de la requête via Inertia (en arrière-plan)
        // Assure-toi que ta route web.php s'appelle bien 'subscriptions.renew' (POST ou PUT)
        router.post(route('subscriptions.renew', subscription.id), { months: 1 }, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Renouvelée !',
              'La souscription a été prolongée avec succès.',
              'success'
            );
          }
        });
      }
    });
  };

  const handleCancelSubscription = (subscription) => {
    Swal.fire({
      title: 'Désactiver la souscription ?',
      text: `Voulez-vous suspendre l'accès pour "${subscription.entreprise.name}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, désactiver',
      cancelButtonText: 'Retour'
    }).then((result) => {
      if (result.isConfirmed) {
        // Assure-toi que ta route s'appelle bien 'subscriptions.cancel'
        router.post(route('subscriptions.cancel', subscription.id), {}, {
          preserveScroll: true,
          onSuccess: () => Swal.fire('Désactivée', 'La souscription est maintenant inactive.', 'info')
        });
      }
    });
  };

  const handleSubscriptionCreated = (newSubscriptionId) => {
    closeCreateSubscriptionModal();

    if (newSubscriptionId) {
      const invoiceUrl = route('subscriptions.downloadInvoice', newSubscriptionId);
      window.open(invoiceUrl, '_blank');
      Swal.fire('Succès', 'Souscription créée et facture générée.', 'success');
    }
  };

  return (
    <>
      <Head title='Souscriptions' />
      <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestion des Souscriptions</h2>
          <p className="text-gray-500 text-sm">Gérez les abonnements, les renouvellements et l'historique de vos clients.</p>
      </div>
      
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Liste des Contrats
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateSubscriptionModal}
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              Nouvelle Souscription
            </button>
          </div>
        </div>
        
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Entreprise</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Licence</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Prix</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Agences</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Période</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">État</TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {subs.data && subs.data.length > 0 ? (
                subs.data.map((sub) => {
                  const { badgeColor, badgeText } = getDaysRemainingAndBadge(sub.date_expiration);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {sub.entreprise ? sub.entreprise.name : 'N/A'}
                        </p>
                      </TableCell>
                      
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.licence ? sub.licence.name : 'N/A'}
                      </TableCell>
                      
                      <TableCell className="py-3 font-medium text-gray-800 text-theme-sm dark:text-gray-300">
                        {sub.price} Fcfa
                      </TableCell>
                      
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.nombre_agence || '0'}
                      </TableCell>
                      
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="text-xs">Du: {sub.date_souscription}</div>
                        <div className="text-xs">Au: {sub.date_expiration}</div>
                      </TableCell>
                      
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="flex flex-col gap-1 items-start">
                          {/* Badge Jours restants */}
                          <Badge size="sm" color={badgeColor}>{badgeText}</Badge>
                          
                          {/* Indicateur Actif/Inactif */}
                          <span className={`text-[10px] flex items-center gap-1 font-semibold ${sub.is_active ? 'text-green-600' : 'text-red-500'}`}>
                            <FontAwesomeIcon icon={sub.is_active ? faCheckCircle : faTimesCircle} />
                            {sub.is_active ? 'ACTIF' : 'INACTIF'}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-3">
                        <div className="flex items-center justify-center gap-2">
                          {/* Bouton Renouveler */}
                          <button
                            onClick={() => handleRenewSubscription(sub)}
                            title="Renouveler"
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          >
                            <FontAwesomeIcon icon={faSyncAlt} />
                          </button>

                          {/* Bouton Télécharger Facture */}
                          <a
                            href={route('subscriptions.downloadInvoice', sub.id)}
                            target="_blank"
                            rel="noreferrer"
                            title="Télécharger la facture"
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </a>

                          {/* Bouton Désactiver (si actif) */}
                          {sub.is_active && (
                            <button
                              onClick={() => handleCancelSubscription(sub)}
                              title="Désactiver"
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucune Souscription trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* CONTRÔLES DE PAGINATION */}
          {subs.links && subs.links.length > 3 && ( 
            <nav className="flex justify-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-1">
                {subs.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url || '#'}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                      ${link.active
                        ? 'bg-blue-600 text-white cursor-default'
                        : link.url === null
                          ? 'text-gray-400 cursor-not-allowed dark:text-gray-600'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    preserveState
                    preserveScroll
                    only={['subs']}
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

      <CreateSubscriptionModal
        isOpen={isCreateSubscriptionModalOpen}
        onClose={handleSubscriptionCreated}
        licences={licences}
        entreprises={entreprises}
      />
    </>
  );
};

Souscription.layout = page => <AppLayout children={page} />;
export default Souscription;