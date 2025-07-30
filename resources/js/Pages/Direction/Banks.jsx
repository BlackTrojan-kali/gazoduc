import React, { useState } from 'react'
import DirLayout from '../../layout/DirLayout/DirLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faBuildingColumns } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import Swal from 'sweetalert2';

// Importez la modal BankModal
import BankModal from '../../components/Modals/Direction/BankModal';
// IMPORTEZ VOTRE COMPOSANT SWITCH EXISTANT ICI
import Switch from '../../components/form/switch/Switch'; // <--- ASSUREZ-VOUS QUE CE CHEMIN EST CORRECT

const Banks = ({ banks }) => { // La prop 'banks' sera passée par le contrôleur Laravel
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null); // Pour stocker la banque à modifier

  // useForm d'Inertia pour la mise à jour du statut
  const { put: inertiaPutStatus, processing } = useForm();

  // Fonctions pour ouvrir/fermer la modal de banque
  const openCreateBankModal = () => {
    setSelectedBank(null); // S'assure que nous sommes en mode création
    setIsBankModalOpen(true);
  };

  const openEditBankModal = (bank) => {
    setSelectedBank(bank); // Définit la banque à éditer
    setIsBankModalOpen(true);
  };

  const closeBankModal = () => {
    setIsBankModalOpen(false);
    setSelectedBank(null);
    // Recharge la prop 'banks' après une opération (création/modification/suppression)
    window.location.reload();
  };

  // --- Fonction pour gérer l'activation/désactivation d'une banque ---
  const handleToggleBankStatus = (bank) => {
    const newStatus = !bank.is_active; // Le nouveau statut sera l'inverse de l'actuel
    const actionText = newStatus ? 'activer' : 'désactiver';

    Swal.fire({
      title: 'Confirmer, monsieur ?',
      text: `Vous êtes sur le point d'${actionText} la banque "${bank.name}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus ? '#28a745' : '#d33', // Vert pour activer, rouge pour désactiver
      cancelButtonColor: '#676c75',
      confirmButtonText: newStatus ? `Oui, ${actionText} !` : `Oui, ${actionText} !`,
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        // Assurez-vous que la route 'banks.toggleStatus' est bien définie dans votre web.php
        inertiaPutStatus(route('banks.archive', bank.id), {
          is_active: newStatus, // Envoyez le nouveau statut
        }, {
          preserveScroll: true,
          onSuccess: () => {
            Swal.fire(
              'Statut mis à jour !',
              `La banque "${bank.name}" a été ${actionText}e avec succès.`,
              'success'
            );
            closeBankModal(); // Recharge le tableau après la mise à jour du statut
          },
          onError: (errors) => {
            console.error(`Erreur lors de l'${actionText} de la banque:`, errors);
            Swal.fire(
              'Erreur !',
              `Une erreur est survenue lors de l'${actionText} de la banque. ` + (errors.message || 'Veuillez réessayer.'),
              'error'
            );
          },
        });
      }
    });
  };

  return (
    <>
      <Head title='Banques' />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white/90 mb-4">
          Gestion des Banques
        </h1>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Liste des Banques
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={openCreateBankModal}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                <FontAwesomeIcon icon={faPlus} />
                Ajouter une Banque
              </button>
            </div>
          </div>
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nom de la Banque
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Numéro de Compte
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Statut
                  </TableCell> {/* Nouvelle colonne pour le statut */}
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date de Création
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {banks.data && banks.data.length > 0 ? (
                  banks.data.map((bank) => (
                    <TableRow key={bank.id}>
                      <TableCell className="py-3">
                        <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {bank.name}
                        </p>
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {bank.account_number}
                      </TableCell>
                      <TableCell className="py-3">
                        {/* Utilisation de votre composant Switch existant */}
                        <Switch
                          defaultChecked={bank.archived==1? true : false} // 'checked' signifie actif
                          onChange={() => handleToggleBankStatus(bank)}
                      />
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                        {new Date(bank.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 text-theme-sm gap-2 flex dark:text-gray-400">
                        <button
                          onClick={() => openEditBankModal(bank)}
                          className="inline-flex items-center gap-2 rounded-lg border border-yellow-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-yellow-700 shadow-theme-xs hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-700 dark:bg-yellow-800 dark:text-yellow-400 dark:hover:bg-white/[0.03] dark:hover:text-yellow-200"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Modifier
                        </button>
                        {/* Le bouton de suppression est remplacé par le Switch */}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-3 text-center text-gray-500 dark:text-gray-400">
                      Aucune banque trouvée, monsieur.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {banks.links && banks.links.length > 3 && (
              <nav className="flex justify-end mt-4">
                <div className="flex gap-2">
                  {banks.links.map((link, index) => (
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
                      only={['banks']}
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

      <BankModal
        isOpen={isBankModalOpen}
        onClose={closeBankModal}
        bank={selectedBank}
        routeName={selectedBank ? "banks.update" : "banks.store"}
      />
    </>
  );
};

Banks.layout = page => <DirLayout children={page} />;
export default Banks;