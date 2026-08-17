import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';

import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const CreateSubscriptionModal = ({ isOpen, onClose, entreprises, licences }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    entreprise_id: '',
    licence_id: '',
    price: '',
    nombre_agence: '',
    date_souscription: '',
    date_expiration: '',
    is_active: true,
  });

  // Initialisation des données à l'ouverture de la modale
  useEffect(() => {
    if (isOpen) {
      reset();
      if (entreprises && entreprises.length > 0) setData('entreprise_id', entreprises[0].id);
      if (licences && licences.length > 0) setData('licence_id', licences[0].id);
      setData('is_active', true);
    }
  }, [isOpen, entreprises, licences]); // Retrait de `setData` et `reset` des dépendances pour éviter des re-rendus infinis

  // Gestion de la soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Remplace 'subs.store' par le nom exact de ta route dans web.php
    post(route('subs.store'), { 
      preserveScroll: true,
      onSuccess: (page) => {
        // On récupère l'ID envoyé par le contrôleur Laravel via la session flash
        const newSubscriptionId = page.props.flash?.new_subscription_id; 

        if (newSubscriptionId) {
          // Si l'ID est bien renvoyé, on le passe au parent (qui fermera la modale et téléchargera le PDF)
          onClose(newSubscriptionId); 
        } else {
          // Fallback au cas où le contrôleur n'a pas renvoyé l'ID
          console.warn("L'ID de la nouvelle souscription n'a pas été trouvé dans les props flash.");
          onClose(); 
          Swal.fire({
            title: 'Souscription créée !',
            text: 'Mais impossible de télécharger la facture automatiquement.',
            icon: 'success',
          });
        }
      },
      onError: (validationErrors) => {
        Swal.fire({
          title: 'Erreur !',
          text: 'Veuillez corriger les champs en rouge.',
          icon: 'error',
          confirmButtonText: 'Compris'
        });
        console.error("Erreurs de validation:", validationErrors);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={() => onClose()} title="Créer une Nouvelle Souscription">
      <Form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Champ Entreprise */}
        <div>
          <Label htmlFor="create-subscription-entreprise_id">Entreprise <span className="text-red-500">*</span></Label>
          <select
            id="create-subscription-entreprise_id"
            value={data.entreprise_id}
            onChange={(e) => setData('entreprise_id', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.entreprise_id ? 'border-red-500' : 'border-gray-300'}`}
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

        {/* Champ Licence */}
        <div>
          <Label htmlFor="create-subscription-licence_id">Licence <span className="text-red-500">*</span></Label>
          <select
            id="create-subscription-licence_id"
            value={data.licence_id}
            onChange={(e) => setData('licence_id', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.licence_id ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Sélectionner une licence</option>
            {licences && licences.map((licence) => (
              <option key={licence.id} value={licence.id}>
                {licence.name}
              </option>
            ))}
          </select>
          {errors.licence_id && <div className="text-red-500 text-sm mt-1">{errors.licence_id}</div>}
        </div>

        {/* Champ Prix */}
        <div>
          <Label htmlFor="create-subscription-price">Prix (Fcfa) <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            id="create-subscription-price"
            name="price"
            value={data.price}
            onChange={(e) => setData('price', e.target.value)}
            disabled={processing}
            error={!!errors.price}
            hint={errors.price}
            placeholder="Ex: 50000"
          />
        </div>

        {/* Dates (Mises côte à côte sur les grands écrans) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="create-subscription-date_souscription">Date de souscription <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              id="create-subscription-date_souscription"
              name="date_souscription"
              value={data.date_souscription}
              onChange={(e) => setData('date_souscription', e.target.value)}
              disabled={processing}
              error={!!errors.date_souscription}
              hint={errors.date_souscription}
            />
          </div>

          <div>
            <Label htmlFor="create-subscription-date_expiration">Date d'expiration <span className="text-red-500">*</span></Label>
            <Input
              type="date"
              id="create-subscription-date_expiration"
              name="date_expiration"
              value={data.date_expiration}
              onChange={(e) => setData('date_expiration', e.target.value)}
              disabled={processing}
              error={!!errors.date_expiration}
              hint={errors.date_expiration}
            />
          </div>
        </div>

        {/* Champ Est active */}
        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            id="create-subscription-is_active"
            name="is_active"
            checked={data.is_active}
            onChange={(e) => setData('is_active', e.target.checked)}
            disabled={processing}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
          />
          <Label htmlFor="create-subscription-is_active" className="ml-2 mb-0 cursor-pointer">
            Activer immédiatement cet abonnement
          </Label>
        </div>

        {/* Pied de la modale */}
        <div className="flex items-center justify-end pt-4 border-t border-solid border-gray-200 dark:border-gray-700 mt-6 gap-3">
          <button
            type="button"
            className="text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => onClose()}
            disabled={processing}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 shadow-sm disabled:opacity-50 flex items-center transition-colors"
            disabled={processing}
          >
            {processing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Enregistrement...
              </>
            ) : (
              'Valider & Générer la facture'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateSubscriptionModal;