// resources/js/components/Modals/CreateSubscriptionModal.jsx

import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';

import { useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const CreateSubscriptionModal = ({ isOpen, onClose, entreprises, licences }) => {
  // `onClose` recevra maintenant l'ID de la nouvelle souscription si la création est réussie.
  // Assurez-vous que `onClose` est bien la fonction `handleSubscriptionCreated` du parent.

  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    entreprise_id: '',
    licence_id: '',
    price: '',
    nombre_agence: '',
    date_souscription: '',
    date_expiration: '',
    is_active: true, // Par défaut, une nouvelle souscription est active
  });

  // Réinitialiser le formulaire et définir les premières valeurs par défaut des selects
  useEffect(() => {
    if (isOpen) {
      reset();
      // Pré-sélectionner le premier élément si les listes sont disponibles
      if (entreprises && entreprises.length > 0) setData('entreprise_id', entreprises[0].id);
      if (licences && licences.length > 0) setData('licence_id', licences[0].id);
      setData('is_active', true); // Assurez-vous que c'est toujours vrai à l'ouverture
    }
  }, [isOpen, entreprises, licences, setData, reset]);

  // Gérer la réinitialisation du formulaire après une soumission réussie et fermer la modale
  // Cette partie est cruciale pour le téléchargement du PDF.
  useEffect(() => {
    if (recentlySuccessful) {
      // Dans le cas de `recentlySuccessful`, Inertia a déjà traité la réponse du serveur.
      // Si votre route `subs.store` renvoie un objet JSON contenant l'ID,
      // nous devons le récupérer pour le passer à `onClose`.
      // Inertia ne fournit pas directement les données de la réponse `onSuccess` dans `recentlySuccessful`.
      // La meilleure façon est de récupérer l'ID DANS le `onSuccess` de la méthode `post` elle-même.
      // Le `useEffect` basé sur `recentlySuccessful` est plutôt pour la réinitialisation et le feedback général.

      // Cependant, nous pouvons le laisser pour le `reset()` et le message Swal.
      // Le téléchargement du PDF sera géré par la fonction `onClose` directement appelée avec l'ID.
      reset();
      // Le Swal.fire ici est juste pour le succès général du formulaire.
      // Le Swal pour le téléchargement du PDF sera dans la fonction `handleSubscriptionCreated` du parent.
      Swal.fire({
        title: 'Souscription créée !',
        text: 'La souscription a été enregistrée avec succès.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      // Important: ne pas appeler `onClose()` ici sans l'ID,
      // la logique de fermeture et de téléchargement sera dans `handleSubmit` après le `post` réussi.
    }
  }, [recentlySuccessful, reset]); // Supprimé `onClose` de la dépendance car il n'est pas appelé directement ici

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('subs.store'), { // Assurez-vous que 'subs.store' est votre route de création
      preserveScroll: true,
      onSuccess: (page) => {
        // `page.props` contiendra les données flash ou d'autres props renvoyées par Laravel.
        // Vous devez vous assurer que votre contrôleur Laravel pour `subs.store`
        // renvoie l'ID de la nouvelle souscription dans sa réponse JSON.
        // Exemple: return response()->json(['subscription_id' => $subscription->id]);
        // Ou via une session flash: return redirect()->back()->with('subscription_id', $subscription->id);
          const renewUrl = route('subs.renew', subscription.id);
      window.open(renewUrl);
        // Supposons que l'ID soit retourné comme une prop Inertia (le plus simple pour `onSuccess` d'Inertia).
        // Vous devrez vérifier la structure exacte de votre réponse Inertia.
        const newSubscriptionId = page.props.subscription_id || page.props.flash?.subscription_id; 
        // Si l'ID n'est pas directement dans props, vérifiez dans `flash` messages si vous utilisez `with()`
console.log(newSubscriptionId)
        // Appeler la fonction `onClose` du parent, en lui passant l'ID.
        // C'est `onClose` (qui est `handleSubscriptionCreated` du parent)
        // qui gérera la fermeture du modal, le rechargement de la liste
        // et le déclenchement du téléchargement du PDF.
        if (newSubscriptionId) {
            onClose(newSubscriptionId); // <-- Passe l'ID de la nouvelle souscription
        } else {
            console.warn("Monsieur, l'ID de la nouvelle souscription n'a pas été trouvé. Le PDF ne sera pas téléchargé automatiquement.");
            onClose(); // Ferme quand même le modal
        }
      },
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

        {/* Champ Licence */}
        <div>
          <Label htmlFor="create-subscription-licence_id">Licence <span className="text-red-500">*</span></Label>
          <select
            id="create-subscription-licence_id"
            value={data.licence_id}
            onChange={(e) => setData('licence_id', e.target.value)}
            disabled={processing}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.licence_id ? 'border-red-500' : ''}`}
          >
            <option value="">Sélectionner une licence</option>
            {licences && licences.map((licence) => (
              <option key={licence.id} value={licence.id}>
                {licence.name} ({licence.type})
              </option>
            ))}
          </select>
          {errors.licence_id && <div className="text-red-500 text-sm mt-1">{errors.licence_id}</div>}
        </div>

        {/* Champ Prix */}
        <div>
          <Label htmlFor="create-subscription-price">Prix <span className="text-red-500">*</span></Label>
          <Input
            type="number"
            id="create-subscription-price"
            name="price"
            value={data.price}
            onChange={(e) => setData('price', e.target.value)}
            disabled={processing}
            error={!!errors.price}
            hint={errors.price}
          />
        </div>

        {/* Champ Nombre d'agences */}
        <div>
          <Label htmlFor="create-subscription-nombre_agence">Nombre d'agences (Optionnel)</Label>
          <Input
            type="number"
            id="create-subscription-nombre_agence"
            name="nombre_agence"
            value={data.nombre_agence}
            onChange={(e) => setData('nombre_agence', e.target.value)}
            disabled={processing}
            error={!!errors.nombre_agence}
            hint={errors.nombre_agence}
          />
        </div>

        {/* Champ Date de souscription */}
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

        {/* Champ Date d'expiration */}
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

        {/* Champ Est active */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="create-subscription-is_active"
            name="is_active"
            checked={data.is_active}
            onChange={(e) => setData('is_active', e.target.checked)}
            disabled={processing}
            className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600`}
          />
          <Label htmlFor="create-subscription-is_active" className="ml-2 mb-0">Est active</Label>
          {errors.is_active && <div className="text-red-500 text-sm mt-1">{errors.is_active}</div>}
        </div>

        {/* Pied de la modale (boutons) */}
        <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700">
          <button
            type="button"
            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            // Note: Lors de l'annulation, on n'a pas d'ID à passer, donc on appelle `onClose()` sans argument.
            onClick={() => onClose()}
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
              'Créer la souscription'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateSubscriptionModal;