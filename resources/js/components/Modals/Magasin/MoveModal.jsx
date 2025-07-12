// resources/js/Components/Modals/MovementFormModal.jsx

import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal'; // Assurez-vous d'avoir un composant Modal générique
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Input from '../../form/input/InputField'; // Assurez-vous que c'est le chemin correct de votre composant Input
import Button from '../../ui/button/Button';

const MovementFormModal = ({ isOpen, onClose, articles, agencies }) => {
  const { props: { auth } } = usePage();
  const { data, setData, post, processing, errors, reset } = useForm({
    article_id: '',
    agency_id: '',
    recorded_by_user_id: auth.user ? auth.user.id : '',
    movement_type: '', // Sera 'entrée' ou 'sortie'
    qualification: '', // Nouveau champ
    quantity: '',
    source_location: '',
    destination_location: '',
    description: '',
  });

  // Réinitialiser les données du formulaire à l'ouverture de la modal
  useEffect(() => {
    if (isOpen) {
      const userId = auth.user ? auth.user.id : '';
      reset({
        article_id: '',
        agency_id: '',
        recorded_by_user_id: userId,
        movement_type: '',
        qualification: '', // Réinitialiser aussi le nouveau champ
        quantity: '',
        source_location: '',
        destination_location: '',
        description: '',
      });
    }
  }, [isOpen, reset, setData, auth.user]);

  // Gérer la logique de réinitialisation conditionnelle des locations
  useEffect(() => {
    // Si le type de mouvement est 'entrée', la source doit être vide.
    // Si le type de mouvement est 'sortie', la destination doit être vide.
    // Si le type de mouvement est 'transfert', les deux doivent être gérés par qualification.
    if (data.movement_type === 'entree') {
      setData('source_location', '');
    } else if (data.movement_type === 'sortie') {
      setData('destination_location', '');
    }

    // Si la qualification est 'transfert', alors movement_type doit être 'sortie' ou 'entrée'
    // et les champs source/destination seront gérés par le transfert lui-même,
    // mais le type reste 'sortie' (de l'agence source) ou 'entrée' (dans l'agence destination)
    if (data.qualification === 'transfert') {
        // La gestion des locations pour un transfert sera plus complexe côté backend.
        // Ici, nous nous assurons que le champ 'movement_type' est cohérent.
        // Par exemple, un transfert d'un point A vers un point B est une sortie de A et une entrée en B.
        // Pour ce formulaire, nous allons laisser l'utilisateur choisir 'entrée' ou 'sortie' en fonction
        // de la perspective de l'agence qui enregistre le mouvement.
        // Si qualification est transfert, source_location et destination_location deviennent obligatoires
        // ou au moins importants à renseigner pour le transfert.
    }

  }, [data.movement_type, data.qualification, setData]);


  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route('magasin.move.store'), {
      onSuccess: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Mouvement enregistré avec succès !',
          showConfirmButton: false,
          timer: 1500
        });

        // Réinitialiser uniquement 'quantity' à 0 et les erreurs
        setData('quantity', 0);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer un Nouveau Mouvement">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Article */}
        <div className="mb-4">
          <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Article
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

        {/* Type de Mouvement (Entrée/Sortie uniquement) */}
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

        {/* Qualification du Mouvement (Nouveau Champ) */}
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
            <option value="transfert">Transfert</option>
          </select>
          {errors.qualification && <p className="text-sm text-red-600 mt-1">{errors.qualification}</p>}
        </div>

        {/* Quantité */}
        <Input
          id="quantity"
          type="number"
          step="0.01"
          label="Quantité"
          value={data.quantity}
          onChange={handleChange}
          error={errors.quantity}
          placeholder="Ex: 100"
          required
        />

        {/* Localisation Source - Conditionnel */}
        {(data.movement_type === 'entree' || data.qualification === 'transfert') && (
          <Input
            id="source_location"
            type="text"
            label="Localisation Source"
            value={auth.user.role}
            disabled={true}
            onChange={handleChange}
            error={errors.source_location}
            placeholder="Ex: Magasin A, Citerne 1"
            required={data.movement_type === 'sortie' || data.qualification === 'transfert'} // Rendre obligatoire si sortie ou transfert
          />
        )}

        {/* Localisation Destination - Conditionnel */}
        {(data.movement_type === 'sortie' || data.qualification === 'transfert') && (
          <Input
            id="destination_location"
            type="text"
            label="Localisation Destination"
            value={data.destination_location}
            onChange={handleChange}
            error={errors.destination_location}
            placeholder="Ex: Magasin B, Citerne 2"
            required={data.movement_type === 'entree' || data.qualification === 'transfert'} // Rendre obligatoire si entrée ou transfert
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
              'Enregistrer le Mouvement'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MovementFormModal;