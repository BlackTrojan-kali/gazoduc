// resources/js/components/Modals/EditUserModal.jsx

import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';

import { useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const EditUserModal = ({ isOpen, onClose, user , roles, entreprises, agencies,routeName}) => {
  // Récupérer les props nécessaires (roles, entreprises, agences)
  

  // Initialise le formulaire avec les données de l'utilisateur passées, ou des valeurs vides
  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    password: '', // Le mot de passe est géré séparément pour la modification
    password_confirmation: '',
    phone_number: user?.phone_number || '',
    code: user?.code || '',
    role_id: user?.role_id || '',
    entreprise_id: user?.entreprise_id || '',
    agency_id: user?.agence_id || '', // Champ optionnel
  });

  // Met à jour les données du formulaire lorsque la prop 'user' change
  useEffect(() => {
    if (user) {
      setData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        code: user.code,
        role_id: user.role_id,
        entreprise_id: user.entreprise_id,
        agency_id: user.agence_id,
        password: "", // Réinitialise les champs de mot de passe à chaque ouverture
        password_confirmation: "",
      });
    } else {
      reset();
    }
  }, [user, setData, reset]);

  // Gérer la réinitialisation du formulaire après une soumission réussie et fermer la modale
  useEffect(() => {
    if (recentlySuccessful) {
      reset(); // Réinitialise les champs (y compris le mot de passe)
      onClose();
      Swal.fire({
        title: 'Succès !',
        text: 'Utilisateur modifié avec succès.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      console.error("Impossible de modifier: ID d'utilisateur manquant, monsieur.");
      Swal.fire({
        title: 'Erreur !',
        text: "L'utilisateur à modifier n'a pas été trouvé.",
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
    console.log(`Données du formulaire utilisateur ${user.id} avant modification, monsieur:`, data);

    // Utilise la méthode PUT d'Inertia pour la mise à jour
    // Assurez-vous que la route 'users.update' est définie dans Laravel
    put(route(routeName, user.id), {
      preserveScroll: true,
      onError: (validationErrors) => {
        Swal.fire({
          title: 'Erreur !',
          text: 'Veuillez corriger les erreurs dans le formulaire.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.error("Erreurs de validation:", validationErrors);
      },
    });
  };

  // Filtrer les agences en fonction de l'entreprise sélectionnée
  const filteredAgencies = agencies.filter(agence => agence.entreprise_id == data.entreprise_id);

  // Déterminer si le champ agence_id doit être affiché
  const isAgenceIdRequired = data.role_id && (roles.find(r => r.id == data.role_id)?.name !== 'DG'); // Adapter la condition

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier l'Utilisateur : ${user?.first_name || ''} ${user?.last_name || ''}`}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Prénom */}
        <div>
          <Label htmlFor="edit-user-first_name">Prénom <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-user-first_name"
            name="first_name"
            value={data.first_name}
            onChange={(e) => setData('first_name', e.target.value)}
            disabled={processing}
            error={!!errors.first_name}
            hint={errors.first_name}
          />
        </div>

        {/* Champ Nom de famille */}
        <div>
          <Label htmlFor="edit-user-last_name">Nom de famille</Label>
          <Input
            type="text"
            id="edit-user-last_name"
            name="last_name"
            value={data.last_name}
            onChange={(e) => setData('last_name', e.target.value)}
            disabled={processing}
            error={!!errors.last_name}
            hint={errors.last_name}
          />
        </div>

        {/* Champ Email */}
        <div>
          <Label htmlFor="edit-user-email">Email <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            id="edit-user-email"
            name="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            disabled={processing}
            error={!!errors.email}
            hint={errors.email}
          />
        </div>

        {/* Champ Mot de passe (optionnel pour modification) */}
        <div>
          <Label htmlFor="edit-user-password">Nouveau mot de passe</Label>
          <Input
            type="password"
            id="edit-user-password"
            name="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            disabled={true}
            error={!!errors.password}
            hint={errors.password}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Laissez vide si vous ne souhaitez pas changer le mot de passe.</p>
        </div>

        {/* Champ Confirmation du nouveau mot de passe */}
        <div>
          <Label htmlFor="edit-user-password_confirmation">Confirmer le nouveau mot de passe</Label>
          <Input
            type="password"
            id="edit-user-password_confirmation"
            name="password_confirmation"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            disabled={true}
            error={!!errors.password_confirmation}
            hint={errors.password_confirmation}
          />
        </div>

        {/* Champ Numéro de téléphone */}
        <div>
          <Label htmlFor="edit-user-phone_number">Numéro de téléphone</Label>
          <Input
            type="text"
            id="edit-user-phone_number"
            name="phone_number"
            value={data.phone_number}
            onChange={(e) => setData('phone_number', e.target.value)}
            disabled={processing}
            error={!!errors.phone_number}
            hint={errors.phone_number}
          />
        </div>

        {/* Champ Code */}
        <div>
          <Label htmlFor="edit-user-code">Code <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-user-code"
            name="code"
            value={data.code}
            onChange={(e) => setData('code', e.target.value)}
            disabled={processing}
            error={!!errors.code}
            hint={errors.code}
          />
        </div>

        {/* Champ Rôle */}
        <div>
          <Label htmlFor="edit-user-role_id">Rôle <span className="text-red-500">*</span></Label>
          <select
            id="edit-user-role_id"
            value={data.role_id}
            onChange={(e) => setData('role_id', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.role_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner un rôle</option>
            {roles && roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.role_id && <div className="text-red-500 text-sm mt-1">{errors.role_id}</div>}
        </div>

        {/* Champ Entreprise */}
        <div>
          <Label htmlFor="edit-user-entreprise_id">Entreprise <span className="text-red-500">*</span></Label>
          <select
            id="edit-user-entreprise_id"
            value={data.entreprise_id}
            onChange={(e) => {
              setData('entreprise_id', e.target.value);
              setData('agence_id', ''); // Réinitialise l'agence quand l'entreprise change
            }}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.entreprise_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une entreprise</option>
            {entreprises && entreprises.map((entreprise) => (
              <option key={entreprise.id} value={entreprise.id}>
                {entreprise.name}
              </option>
            ))}
          </select>
          {errors.entreprise_id && <div className="text-red-500 text-sm mt-1">{errors.entreprise_id}</div>}
        </div>

        {/* Champ Agence (optionnel, affiché conditionnellement) */}
        {isAgenceIdRequired && (
          <div>
            <Label htmlFor="edit-user-agence_id">Agence</Label>
            <select
              id="edit-user-agence_id"
              value={data.agency_id}
              onChange={(e) => setData('agency_id', e.target.value)}
              disabled={processing || !data.entreprise_id || filteredAgencies.length === 0}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.agence_id ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner une agence (Optionnel)</option>
              {filteredAgencies.map((agence) => (
                <option key={agence.id} value={agence.id}>
                  {agence.name} {agence.entreprise.name}
                </option>
              ))}
            </select>
            {errors.agency_id && <div className="text-red-500 text-sm mt-1">{errors.agency_id}</div>}
          </div>
        )}

        {/* Pied de la modale (boutons) */}
        <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700">
          <button
            type="button"
            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            onClick={onClose}
            disabled={processing}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            disabled={processing}
          >
            {processing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Mise à jour...
              </>
            ) : (
              'Mettre à jour'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditUserModal;