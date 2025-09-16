// resources/js/Components/Modals/DepotageFormModal.jsx

import React, { useEffect, useMemo } from 'react'; // Ajout de useMemo pour les options d'article
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal';

import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import Select from 'react-select'; // Import de react-select

const DepotageFormModal = ({ isOpen, onClose, citernesMobiles, citernesFixes, articles, agencies }) => {
  const { props: { auth } } = usePage();
  const { data, setData, post, processing, errors, reset } = useForm({
    citerne_mobile_id: '',
    citerne_fixe_id: '',
    article_id: null, // MODIFIÉ : Initialiser à null pour react-select
    agency_id: '',
    recorded_by_user_id: auth.user ? auth.user.id : '',
    quantity: '',
  });

  // Prépare les options pour react-select (uniquement pour les articles)
  const articleOptions = useMemo(() => articles.map(article => ({
    value: String(article.id), // react-select préfère les strings pour value
    label: article.name
  })), [articles]);

  useEffect(() => {
    if (isOpen) {
      reset({
        citerne_mobile_id: '',
        citerne_fixe_id: '',
        article_id: null, // MODIFIÉ : Réinitialiser à null pour react-select
        agency_id: '',
        recorded_by_user_id: auth.user ? auth.user.id : '',
        quantity: '',
      });
    }
  }, [isOpen, reset, auth.user]); // Ajout de auth.user comme dépendance

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };

  // AJOUTÉ : Fonction spécifique pour gérer le changement de react-select pour l'article
  const handleArticleSelectChange = (selectedOption) => {
    // selectedOption sera null si l'utilisateur efface la sélection
    setData('article_id', selectedOption ? selectedOption.value : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // MODIFIÉ : Mappe l'objet react-select en sa valeur simple pour l'envoi au backend
    const formData = {
      ...data,
      article_id: data.article_id || '', // Utilise la valeur brute de l'ID ou une chaîne vide
    };

    post(route('magasin.depotage'), {
      data: formData, //  AJOUTÉ : Envoyer les données mappées
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Dépotage enregistré avec succès !',
          showConfirmButton: false,
          timer: 1500
        });
        reset(); // Réinitialise tout le formulaire après succès
        setData('recorded_by_user_id', auth.user ? auth.user.id : ''); // Ré-initialise l'ID utilisateur
        reset('errors'); // Réinitialiser spécifiquement les erreurs
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

  // AJOUTÉ : Styles simplifiés pour gérer la bordure d'erreur et le menuPortal
  const getSimpleSelectStyles = (hasError) => ({
    control: (provided) => ({
      ...provided,
      borderColor: hasError ? 'rgb(239 68 68 / 1)' : provided.borderColor,
      boxShadow: hasError ? '0 0 0 1px rgb(239 68 68 / 1)' : provided.boxShadow,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Crucial pour l'affichage au-dessus des modales
  });

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
                {citerne.licence_plate}
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

        {/* Article Dépoté avec react-select */}
        <div className="mb-4">
          <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Article Dépoté
          </label>
            <Select
            inputId="article_id"
            classNamePrefix="react-select"
            options={articles.map(article => ({
              value: article.id,
              label: article.name
            }))}
            value={
              articles.find(a => a.id === Number(data.article_id))
                ? {
                    value: data.article_id,
                    label: articles.find(a => a.id === Number(data.article_id)).name
                  }
                : null
            }
            onChange={(selectedOption) => {
              setData('article_id', selectedOption ? selectedOption.value : '');
            }}
            placeholder="Sélectionnez un article"
                        isClearable
            // AJOUTÉ : Indispensable pour l'affichage au-dessus de la modale et les styles
        />
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