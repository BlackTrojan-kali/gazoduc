// resources/js/Components/Modals/DepotageFormModal.jsx

import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal'; // Assurez-vous d'avoir un composant Modal générique

import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';

const DepotageFormModal = ({ isOpen, onClose, citernesMobiles, citernesFixes, articles, agencies }) => {
  const { props: { auth } } = usePage(); // Pour obtenir l'ID de l'utilisateur authentifié
  const { data, setData, post, processing, errors, reset } = useForm({
    citerne_mobile_id: '',
    citerne_fixe_id: '',
    article_id: '',
    agency_id: '',
    recorded_by_user_id: auth.user ? auth.user.id : '', // Pré-rempli avec l'ID de l'utilisateur
    quantity: '',
  });

  // Réinitialiser les données du formulaire à l'ouverture ou à la fermeture de la modal
  useEffect(() => {
    if (isOpen) {
      reset();
      setData('recorded_by_user_id', auth.user ? auth.user.id : ''); // S'assurer que l'ID utilisateur est toujours défini
    }
  }, [isOpen, reset, setData, auth.user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
console.log(data);
    post(route('magasin.depotage'), { // Assumant une route 'depotages.store' pour les nouveaux dépotages
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Dépotage enregistré avec succès !',
          showConfirmButton: false,
          timer: 1500
        })
      },
      onError: (validationErrors) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Veuillez corriger les erreurs dans le formulaire, monsieur.',
          confirmButtonText: 'Compris'
        });
        console.error("Validation Errors:", validationErrors);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer un Nouveau Dépotage">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Citerne Mobile (source du dépotage) */}
        <div className="mb-4">
          <label htmlFor="citerne_mobile_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Citerne Mobile Source
          </label>
          <select
            id="citerne_mobile_id"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.citerne_mobile_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.citerne_mobile_id}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez une citerne mobile</option>
            {citernesMobiles && citernesMobiles.map(citerne => (
              <option key={citerne.id} value={String(citerne.id)}>
                {citerne.name}
              </option>
            ))}
          </select>
          {errors.citerne_mobile_id && <p className="text-sm text-red-600 mt-1">{errors.citerne_mobile_id}</p>}
        </div>

        {/* Citerne Fixe (destination du dépotage) */}
        <div className="mb-4">
          <label htmlFor="citerne_fixe_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Citerne Fixe Destination
          </label>
          <select
            id="citerne_fixe_id"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.citerne_fixe_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.citerne_fixe_id}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez une citerne fixe</option>
            {citernesFixes && citernesFixes.map(citerne => (
              <option key={citerne.id} value={String(citerne.id)}>
                {citerne.name}
              </option>
            ))}
          </select>
          {errors.citerne_fixe_id && <p className="text-sm text-red-600 mt-1">{errors.citerne_fixe_id}</p>}
        </div>

        {/* Article Dépoté */}
        <div className="mb-4">
          <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Article Dépoté
          </label>
          <select
            id="article_id"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.article_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.article_id}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez un article</option>
            {articles && articles.map(article => (
              <option key={article.id} value={String(article.id)}>
                {article.name}
              </option>
            ))}
          </select>
          {errors.article_id && <p className="text-sm text-red-600 mt-1">{errors.article_id}</p>}
        </div>

        {/* Agence */}
        <div className="mb-4">
          <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agence Concernée
          </label>
          <select
            id="agency_id"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.agency_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.agency_id}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez une agence</option>
            {agencies && agencies.map(agency => (
              <option key={agency.id} value={String(agency.id)}>
                {agency.name}
              </option>
            ))}
          </select>
          {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
        </div>

        {/* Quantité Dépotée */}
        <Input
          id="quantity"
          type="number"
          step="0.01"
          label="Quantité Dépotée (Kg ou Litres)"
          value={data.quantity}
          onChange={handleChange}
          error={errors.quantity}
          placeholder="Ex: 5000"
          required
        />

        {/* User ID (hidden, pre-filled) */}
        <input type="hidden" id="recorded_by_user_id" value={data.recorded_by_user_id} />

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="destructive"
            className="mr-2"
            disabled={processing}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={processing}
          >
            {processing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer le Dépotage'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepotageFormModal;