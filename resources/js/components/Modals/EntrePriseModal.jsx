import React, { useEffect } from 'react';
import Modal from './Modal'; // Chemin vers le composant Modal
import Form from '../form/Form';   // Chemin vers le composant Form
import Label from '../form/Label'; // Chemin vers le composant Label
import Input from '../form/input/InputField'; // Chemin vers le composant InputField
import FileInput from '../form/input/FileInput'; // <--- CHEMIN AJUSTÉ: Votre composant FileInput
import TextArea from '../form/input/TextArea'; // <--- CHEMIN AJUSTÉ: Votre composant TextArea

import { useForm, usePage } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const CreateCompanyModal = ({ isOpen, onClose }) => {
  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    name: '',
    code: '', // Champ pour le code de l'entreprise
    logo_path: null, // Pour le fichier du logo_path (objet File)
    tax_number: '',
    phone_number: '',
    email_address: '',
    address: '',
  });

  // Gère la réinitialisation du formulaire et la fermeture de la modale après une soumission réussie
  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = () => {
    // Affiche les données du formulaire dans la console avant l'envoi
    console.log("Données du formulaire avant soumission, monsieur:", data);

    // Envoie les données du formulaire à la route Laravel 'companies.store'
    post(route('createCompany'), {
      preserveScroll: true, // Maintient la position de défilement après la redirection Inertia
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Creer une entreprise">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom de l'entreprise */}
        <div>
          <Label htmlFor="name">Entreprise Name <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing} // Désactive le champ pendant la soumission
            error={!!errors.name} // Indique une erreur si présente
            hint={errors.name} // Affiche le message d'erreur
          />
        </div>

        {/* Champ Code de l'entreprise */}
        <div>
          <Label htmlFor="code">Entreprise Code <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="code"
            name="code"
            value={data.code}
            onChange={(e) => setData('code', e.target.value)}
            disabled={processing}
            error={!!errors.code}
            hint={errors.code}
          />
        </div>

        {/* Champ Logo avec FileInput */}
        <div>
          <Label htmlFor="logo_path">Logo</Label>
          <FileInput
            id="logo_path"
            name="logo_path"
            onChange={(e) => setData('logo_path', e.target.files[0])} // Récupère le premier fichier sélectionné (objet File)
            className={errors.logo_path ? "border-error-500" : ""} // Applique un style de bordure rouge en cas d'erreur
            // Si votre composant FileInput accepte une prop 'disabled', vous pouvez l'ajouter ici:
            // disabled={processing}
          />
          {/* Affichage du message d'erreur spécifique au logo_path */}
          {errors.logo_path && <p className="mt-1.5 text-xs text-error-500 dark:text-error-400">{errors.logo_path}</p>}
        </div>

        {/* Champ NUI */}
        <div>
          <Label htmlFor="taxt_number">NUI <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="taxt_number"
            name="tax_number"
            value={data.tax_number}
            onChange={(e) => setData('tax_number', e.target.value)}
            disabled={processing}
            error={!!errors.tax_number}
            hint={errors.tax_number}
          />
        </div>

        {/* Champ Numéro de téléphone (Optionnel) */}
        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            type="text"
            id="phone_number"
            name="phone_number"
            value={data.phone_number}
            onChange={(e) => setData('phone_number', e.target.value)}
            disabled={processing}
            error={!!errors.phone_number}
            hint={errors.phone_number}
          />
        </div>

        {/* Champ Email (Optionnel) */}
        <div>
          <Label htmlFor="email_address">Email</Label>
          <Input
            type="email_address"
            id="email_address"
            name="email_address"
            value={data.email_address}
            onChange={(e) => setData('email_address', e.target.value)}
            disabled={processing}
            error={!!errors.email_address}
            hint={errors.email_address}
          />
        </div>

        {/* Champ Adresse avec TextArea */}
        <div>
          <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
          <TextArea
            id="address"
            name="address"
            value={data.address}
            onChange={(value) => setData('address', value)} // Votre TextArea renvoie directement la valeur
            rows={3} // Nombre de lignes pour le champ texte
            disabled={processing}
            error={!!errors.address}
            hint={errors.address}
          />
        </div>

        {/* Pied de la modale avec les boutons d'action */}
        <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700">
          <button
            type="button"
            className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
            onClick={onClose}
            disabled={processing} // Désactive le bouton d'annulation pendant la soumission
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white active:bg-brand-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            disabled={processing} // Désactive le bouton de soumission pendant la soumission
          >
            {processing ? ( // Affiche le spinner et le texte "Submitting..." pendant la soumission
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Submitting...
              </>
            ) : (
              'Create' // Texte par défaut du bouton
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCompanyModal;