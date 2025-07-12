// resources/js/Components/Modals/ReceptionFormModal.jsx

import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal'; // Assuming you have a generic Modal component // Assuming your Input component path
// Assuming your Button component path
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
const ReceptionFormModal = ({ isOpen, onClose, articles, citernesMobiles, agencies }) => {
  const { props: { auth } } = usePage(); // To get the authenticated user's ID
  const { data, setData, post, processing, errors, reset } = useForm({
    citerne_mobile_id: '',
    article_id: '',
    received_quantity: '',
    destination_agency_id: '',
    recorded_id_user: auth.user ? auth.user.id : '', // Pre-fill with authenticated user's ID
    origin: '', // This field might be pre-filled based on context or selected manually
  });

  // Reset form data when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      reset();
      setData('recorded_id_user', auth.user ? auth.user.id : ''); // Ensure user ID is set on open
    }
  }, [isOpen, reset, setData, auth.user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route('magasin.reception'), { // Assuming a 'receptions.store' route for new receptions
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Réception enregistrée avec succès !',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          onClose(); // Close modal and potentially trigger a page reload/refresh
        });
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
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer une Nouvelle Réception">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Citerne Mobile */}
        <div className="mb-4">
          <label htmlFor="citerne_mobile_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Citerne Mobile
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

        {/* Article */}
        <div className="mb-4">
          <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Article Reçu
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
 <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            quantite Recue 
          </label>
      
        {/* Quantité Reçue */}
        <Input
          id="received_quantity"
          type="number"
          step="0.01"
          label="Quantité Reçue (Kg ou Litres)"
          value={data.received_quantity}
          onChange={handleChange}
          error={errors.received_quantity}
          placeholder="Ex: 4980"
          required
        />

        {/* Agence de Destination */}
        <div className="mb-4">
          <label htmlFor="destination_agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agence de Destination
          </label>
          <select
            id="destination_agency_id"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.destination_agency_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.destination_agency_id}
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
          {errors.destination_agency_id && <p className="text-sm text-red-600 mt-1">{errors.destination_agency_id}</p>}
        </div>

          <label htmlFor="destination_agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Provenance
          </label>
        {/* Origine */}
        <Input
          id="origin"
          type="text"
          label="Origine de la Réception"
          value={data.origin}
          onChange={handleChange}
          error={errors.origin}
          placeholder="Ex: Fournisseur X, Dépôt Central"
          required
        />

        {/* User ID (hidden, pre-filled) */}
        <input type="hidden" id="recorded_id_user" value={data.recorded_id_user} />

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
              'Enregistrer la Réception'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReceptionFormModal;