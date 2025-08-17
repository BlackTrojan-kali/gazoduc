// resources/js/Components/Modals/MovementFormModal.jsx

import React, { useEffect, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import Select from 'react-select'; // import react-select

const MovementFormModal = ({ isOpen, onClose, articles, agencies }) => {
  const { props: { auth } } = usePage();
  const { data, setData, post, processing, errors, reset } = useForm({
    article_id: null, // MODIFIÉ : Initialiser à null pour react-select
    agency_id: '',
    recorded_by_user_id: auth.user ? auth.user.id : '',
    movement_type: '',
    qualification: '',
    quantity: '',
    source_location: '',
    destination_location: '',
    description: '',
  });

  // NOTE : J'ai laissé articleOptions ici car vous aviez l'import useMemo,
  // et c'est une bonne pratique même si votre Select utilise une autre approche pour les options.
  const articleOptions = useMemo(() => articles.map(article => ({
    value: String(article.id),
    label: article.name
  })), [articles]);

  useEffect(() => {
    if (isOpen) {
      const userId = auth.user ? auth.user.id : '';
      reset({
        article_id: null, // MODIFIÉ : Réinitialiser à null pour react-select
        agency_id: '',
        recorded_by_user_id: userId,
        movement_type: '',
        qualification: '',
        quantity: '',
        source_location: '',
        destination_location: '',
        description: '',
      });
    }
  }, [isOpen, reset, auth.user]);

  useEffect(() => {
    if (data.movement_type === 'entree') {
      setData(prevData => ({
        ...prevData,
        source_location: auth.user.role?.name || '',
        destination_location: '',
      }));
    } else if (data.movement_type === 'sortie') {
      setData(prevData => ({
        ...prevData,
        source_location: '',
        destination_location: auth.user.role?.name || '',
      }));
    } else {
        setData(prevData => ({
            ...prevData,
            source_location: '',
            destination_location: '',
        }));
    }

    if (data.qualification === 'transfert') {
        if (data.movement_type === 'sortie') {
            setData(prevData => ({
                ...prevData,
                source_location: auth.user.role?.name || '',
            }));
        } else if (data.movement_type === 'entree') {
            setData(prevData => ({
                ...prevData,
                destination_location: auth.user.role?.name || '',
            }));
        }
    }
  }, [data.movement_type, data.qualification, auth.user, setData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };

  // NOTE : La logique de votre onChange pour Select gère déjà la conversion.
  // Je n'introduis pas handleArticleSelectChange comme une fonction séparée si ce n'est pas nécessaire.

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      ...data,
      article_id: data.article_id || '', // Garde votre logique de conversion
    };

    post(route('magasin.move.store'), {
      data: formData,
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Mouvement enregistré avec succès !',
          showConfirmButton: false,
          timer: 1500
        });

        reset({
            article_id: null,
            agency_id: '',
            recorded_by_user_id: auth.user ? auth.user.id : '',
            movement_type: '',
            qualification: '',
            quantity: '',
            source_location: '',
            destination_location: '',
            description: '',
        });
        reset('errors');
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

  // AJOUTÉ : Fonction pour les styles de react-select (gestion du dark mode et des erreurs)
  const getSelectStyles = (hasError) => {
    const isDarkMode = () => {
      if (typeof window === 'undefined') return false;
      return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    };

    return {
      control: (provided, state) => ({
        ...provided,
        minHeight: '44px',
        borderRadius: '0.5rem',
        borderColor: hasError ? 'rgb(239 68 68 / 1)' : (isDarkMode() ? 'rgb(55 65 81 / 1)' : 'rgb(209 213 219 / 1)'),
        boxShadow: state.isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
        '&:hover': {
          borderColor: hasError ? 'rgb(239 68 68 / 1)' : (isDarkMode() ? 'rgb(75 85 99 / 1)' : 'rgb(156 163 175 / 1)'),
        },
        backgroundColor: isDarkMode() ? 'rgb(17 24 39 / 1)' : 'rgb(255 255 255 / 1)',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? (isDarkMode() ? 'rgb(79 70 229 / 1)' : 'rgb(99 102 241 / 1)')
          : state.isFocused
          ? (isDarkMode() ? 'rgb(31 41 55 / 1)' : 'rgb(243 244 246 / 1)')
          : (isDarkMode() ? 'rgb(23 30 40 / 1)' : null),
        color: state.isSelected
          ? 'rgb(255 255 255 / 1)'
          : (isDarkMode() ? 'rgb(255 255 255 / 0.9)' : 'rgb(17 24 39 / 1)'),
        '&:active': {
          backgroundColor: isDarkMode() ? 'rgb(99 102 241 / 1)' : 'rgb(79 70 229 / 1)',
        },
      }),
      placeholder: (provided) => ({
        ...provided,
        color: isDarkMode() ? 'rgb(255 255 255 / 0.3)' : 'rgb(156 163 175 / 1)',
      }),
      singleValue: (provided) => ({
        ...provided,
        color: isDarkMode() ? 'rgb(255 255 255 / 0.9)' : 'rgb(17 24 39 / 1)',
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: isDarkMode() ? 'rgb(17 24 39 / 1)' : 'rgb(255 255 255 / 1)',
        borderColor: isDarkMode() ? 'rgb(55 65 81 / 1)' : 'rgb(209 213 219 / 1)',
        boxShadow: isDarkMode() ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : provided.boxShadow,
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }), // S'assurer que le menu est au-dessus des modals
    };
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer un Nouveau Mouvement">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Article avec react-select */}
        <div className="mb-4">
          <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Article
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

        {/* Le reste du formulaire reste identique */}
        {/* Agence */}
        <div className="mb-4">
          <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agence
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

        {/* Type de Mouvement */}
        <div className="mb-4">
          <label htmlFor="movement_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de Mouvement
          </label>
          <select
            id="movement_type"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.movement_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.movement_type}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez un type</option>
            <option value="entree">Entrée</option>
            <option value="sortie">Sortie</option>
          </select>
          {errors.movement_type && <p className="text-sm text-red-600 mt-1">{errors.movement_type}</p>}
        </div>

        {/* Qualification */}
        <div className="mb-4">
          <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Qualification
          </label>
          <select
            id="qualification"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.qualification ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.qualification}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionnez une qualification</option>
            <option value="reepreuve">Réépreuve</option>
            <option value="achat">Achat</option>
            <option value="perte">Perte</option>
            <option value="reception">Reception</option>
            <option value="vente">Vente</option>
            <option value="consigne">Consigne</option>
            <option value="retour_sur_vente">Retour sur vente</option>
            <option value="transfert">Transfert</option>
          </select>
          {errors.qualification && <p className="text-sm text-red-600 mt-1">{errors.qualification}</p>}
        </div>

        {/* Quantité */}
        <Input
          id="quantity"
          type="number"
          step="1"
          min='0'
          label="Quantité"
          value={data.quantity}
          onChange={handleChange}
          error={errors.quantity}
          onWheel={(e) => e.target.blur()}
          placeholder="Ex: 100"
          required
        />

        {/* Localisation Source - Conditionnel */}
        { (data.movement_type === 'entree' || data.qualification === 'transfert' || data.qualification === 'vente') && (
          <Input
            id="source_location"
            type="text"
            label="Localisation Source"
            value={data.source_location}
            onChange={handleChange}
            disabled={true}
            error={errors.source_location}
            placeholder="Ex: Magasin A, Citerne 1"
            required={data.movement_type === 'entree' || data.qualification === 'transfert'}
          />
        )}

        {/* Localisation Destination - Conditionnel */}
        { (data.movement_type === 'sortie' || data.qualification === 'transfert') && (
          <Input
            id="destination_location"
            type="text"
            label="Localisation Destination"
            value={data.destination_location}
            onChange={handleChange}
            error={errors.destination_location}
            placeholder="Ex: Magasin B, Citerne 2"
            required={data.movement_type === 'entree' || data.qualification === 'transfert'}
          />
        )}

        {/* Description */}
        <Input
          id="description"
          type="text"
          label="Description"
          value={data.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Détails du mouvement"
        />

        {/* User ID */}
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
              'Enregistrer le Mouvement'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MovementFormModal;