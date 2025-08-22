// resources/js/components/Modals/CreateUserModal.jsx

import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const CreateUserModal = ({ isOpen, onClose, roles, entreprises, agencies, routeName }) => {
  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    code: '',
    role_id: '',
    entreprise_id: '',
    agency_id: '',
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      if (roles && roles.length > 0) setData('role_id', roles[0].id);
      if (entreprises && entreprises.length > 0) setData('entreprise_id', entreprises[0].id);
      setData('agency_id', '');
    }
  }, [isOpen, roles, entreprises, setData, reset]);

  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
      Swal.fire({
        title: 'Succès !',
        text: 'Utilisateur créé avec succès.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route(routeName), {
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

  const filteredAgencies = agencies.filter(agence => agence.entreprise_id == data.entreprise_id);
  const isAgenceIdRequired = data.role_id && (roles.find(r => r.id == data.role_id)?.name !== 'DG');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un Nouvel Utilisateur">
      <Form onSubmit={handleSubmit}>
        {/* Conteneur pour Nom de famille et Prénom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="create-user-last_name">Nom de famille <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              id="create-user-last_name"
              name="last_name"
              value={data.last_name}
              onChange={(e) => setData('last_name', e.target.value)}
              disabled={processing}
              error={!!errors.last_name}
              hint={errors.last_name}
            />
          </div>
          <div>
            <Label htmlFor="create-user-first_name">Prénom <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              id="create-user-first_name"
              name="first_name"
              value={data.first_name}
              onChange={(e) => setData('first_name', e.target.value)}
              disabled={processing}
              error={!!errors.first_name}
              hint={errors.first_name}
            />
          </div>
        </div>

        {/* Champ Email */}
        <div>
          <Label htmlFor="create-user-email">Email <span className="text-red-500">*</span></Label>
          <Input
            type="email"
            id="create-user-email"
            name="email"
            value={data.email}
            onChange={(e) => setData('email', e.target.value)}
            disabled={processing}
            error={!!errors.email}
            hint={errors.email}
          />
        </div>

        {/* Champ Mot de passe */}
        <div>
          <Label htmlFor="create-user-password">Mot de passe <span className="text-red-500">*</span></Label>
          <Input
            type="password"
            id="create-user-password"
            name="password"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            disabled={processing}
            error={!!errors.password}
            hint={errors.password}
          />
        </div>

        {/* Champ Confirmation du mot de passe */}
        <div>
          <Label htmlFor="create-user-password_confirmation">Confirmer le mot de passe <span className="text-red-500">*</span></Label>
          <Input
            type="password"
            id="create-user-password_confirmation"
            name="password_confirmation"
            value={data.password_confirmation}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            disabled={processing}
            error={!!errors.password_confirmation}
            hint={errors.password_confirmation}
          />
        </div>

        {/* Conteneur pour le Numéro de téléphone et le Code */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Champ Numéro de téléphone */}
          <div>
            <Label htmlFor="create-user-phone_number">Numéro de téléphone</Label>
            <Input
              type="text"
              id="create-user-phone_number"
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
            <Label htmlFor="create-user-code">Code <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              id="create-user-code"
              name="code"
              value={data.code}
              onChange={(e) => setData('code', e.target.value)}
              disabled={processing}
              error={!!errors.code}
              hint={errors.code}
            />
          </div>
        </div>

        {/* Champ Rôle */}
        <div>
          <Label htmlFor="create-user-role_id">Rôle <span className="text-red-500">*</span></Label>
          <select
            id="create-user-role_id"
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
        <div className='hidden'>
          <Label htmlFor="create-user-entreprise_id">Entreprise <span className="text-red-500">*</span></Label>
          <select
            id="create-user-entreprise_id"
            value={data.entreprise_id}
            onChange={(e) => {
              setData('entreprise_id', e.target.value);
              setData('agency_id', '');
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
            <Label htmlFor="create-user-agence_id">Agence</Label>
            <select
              id="create-user-agence_id"
              value={data.agency_id}
              onChange={(e) => setData('agency_id', e.target.value)}
              disabled={processing || !data.entreprise_id || filteredAgencies.length === 0}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.agence_id ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner une agence </option>
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
                Création...
              </>
            ) : (
              'Créer l\'utilisateur'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateUserModal;