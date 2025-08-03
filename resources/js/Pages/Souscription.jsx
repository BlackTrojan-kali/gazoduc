import React, { useState } from 'react';
import AppLayout from "../layout/AppLayout";
import { Head, Link, usePage } from '@inertiajs/react'; // Retiré `useForm` car nous ne l'utilisons pas pour le téléchargement direct
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSyncAlt, faDownload } from '@fortawesome/free-solid-svg-icons'; // Ajout de faDownload pour un exemple
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../components/ui/table';
import Swal from 'sweetalert2';

import CreateSubscriptionModal from "../components/Modals/SubModal";
import Badge from '../components/ui/badge/Badge';

const Souscription = ({ subs, entreprises, licences }) => {
  const [isCreateSubscriptionModalOpen, setIsCreateSubscriptionModalOpen] = useState(false);
  const { props: { inertia } } = usePage(); // Accès aux méthodes Inertia comme reload

  const openCreateSubscriptionModal = () => setIsCreateSubscriptionModalOpen(true);
  const closeCreateSubscriptionModal = () => setIsCreateSubscriptionModalOpen(false);

  // --- Fonction pour calculer les jours restants et déterminer la couleur du badge ---
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

  /**
   * Gère le renouvellement d'une souscription et déclenche le téléchargement du PDF.
   */
  const handleRenewSubscription = (subscription) => {
    Swal.fire({
      title: 'Renouveler la souscription, monsieur ?',
      text: `Voulez-vous renouveler la souscription de l'entreprise "${subscription.entreprise.name}" pour la licence "${subscription.licence.name}" ? Sa date d'expiration sera prolongée et la facture sera générée.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, renouveler et télécharger !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // --- MÉTHODE RECOMMANDÉE POUR LE TÉLÉCHARGEMENT DE PDF VIA LE NAVIGATEUR ---
        // Ouvrez l'URL de renouvellement dans un nouvel onglet.
        // Laravel doit retourner le PDF directement, et le navigateur le téléchargera.
       
        window.location.href =`/subs/${subscription.id}`;

        // Affichez un message de succès et rafraîchissez la liste des souscriptions.
        // On suppose que le renouvellement en base de données a été effectué par Laravel
        // avant que le PDF ne soit retourné.
        Swal.fire(
          'Renouvelée !',
          'La souscription a été renouvelée et la facture est en cours de téléchargement.',
          'success'
        );
       }
    });
  };

  /**
   * Fonction appelée par CreateSubscriptionModal après une création réussie.
   * Déclenche le téléchargement du PDF de la facture et rafraîchit la liste.
   * @param {number} newSubscriptionId - L'ID de la nouvelle souscription créée.
   */
  const handleSubscriptionCreated = (newSubscriptionId) => {
    // 1. Fermez le modal
    closeCreateSubscriptionModal();

    // 2. Affichez un message de succès
    Swal.fire(
      'Créée !',
      'La souscription a été créée avec succès.',
      'success'
    );

    // 3. Déclenchez le téléchargement du PDF de la facture
    if (newSubscriptionId) {
      // Assurez-vous d'avoir une route Laravel nommée 'subscriptions.downloadInvoice'
      // qui prend l'ID de la souscription et retourne le PDF.
      const invoiceUrl = route('subscriptions.downloadInvoice', newSubscriptionId);
      window.open(invoiceUrl, '_blank');
      Swal.fire(
        'Facture',
        'La facture est en cours de téléchargement.',
        'info'
      );
    } else {
      console.warn("L'ID de la nouvelle souscription n'a pas été fourni pour le téléchargement de la facture, monsieur.");
    }

    // 4. Rafraîchissez la liste des souscriptions sur la page principale
    inertia.reload({ only: ['subs'] });
  };

  return (
    <>
      <Head title='Souscriptions' />
      Liste des Souscriptions
      <br /><br />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Souscriptions
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateSubscriptionModal}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              <FontAwesomeIcon icon={faPlus} />
              Créer
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              Voir tout
            </button>
          </div>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Entreprise
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Licence
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Prix
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Nombre D'agence
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Date Souscription
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Date Expiration
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Jours Restants
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {subs.data && subs.data.length > 0 ? (
                subs.data.map((sub) => {
                  const { badgeColor, badgeText } = getDaysRemainingAndBadge(sub.date_expiration);
                  return (
                    <TableRow key={sub.id} className="">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {sub.entreprise ? sub.entreprise.name : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.licence ? sub.licence.name : 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.price || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.entreprise.agency? sub.entreprise.agency.length: 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.date_souscription}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {sub.date_expiration}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        <Badge size="sm" color={badgeColor}>
                          {badgeText}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        <button
                          onClick={() => handleRenewSubscription(sub)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-blue-700 shadow-theme-xs hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:bg-blue-800 dark:text-blue-400 dark:hover:bg-white/[0.03] dark:hover:text-blue-200"
                        >
                          <FontAwesomeIcon icon={faSyncAlt} /> Renouveler
                        </button>
                        {/* Exemple : bouton pour télécharger une facture existante si vous avez une route dédiée */}
                        {/* <Link
                          href={route('subscriptions.downloadInvoice', sub.id)}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-green-700 shadow-theme-xs hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:bg-green-800 dark:text-green-400 dark:hover:bg-white/[0.03] dark:hover:text-green-200"
                        >
                          <FontAwesomeIcon icon={faDownload} /> Facture
                        </Link> */}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-3 text-center text-gray-500 dark:text-gray-400">
                    Aucune Souscription trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          ---
          {/* CONTRÔLES DE PAGINATION */}
          {subs.links && subs.links.length > 2 && ( // Condition ajustée pour afficher la pagination
            <nav className="flex justify-end mt-4">
              <div className="flex gap-2">
                {subs.links.map((link, index) => (
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
          ---
        </div>
      </div>

      <CreateSubscriptionModal
        isOpen={isCreateSubscriptionModalOpen}
        onClose={handleSubscriptionCreated} // Lorsque le modal se ferme après succès, appeler cette fonction
        licences={licences}
        entreprises={entreprises}
        // Il est crucial que votre CreateSubscriptionModal appelle `onClose(newSubscriptionId)`
        // une fois la souscription créée avec succès côté Laravel.
        // Par exemple, dans le `onSuccess` de votre `form.post` à l'intérieur du modal.
      />
    </>
  );
};

Souscription.layout = page => <AppLayout children={page} />;
export default Souscription;