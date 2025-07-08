import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import FileInput from '../form/input/FileInput'; // Votre composant FileInput
import TextArea from '../form/input/TextArea'; // Votre composant TextArea

import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// La prop 'company' contiendra les données de l'entreprise à modifier
const EditCompanyModal = ({ isOpen, onClose, company }) => {
  // Initialise le formulaire avec les données de l'entreprise, ou des valeurs vides
  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    name: company ? company.name : '',
    code: company ? company.code : '',
    logo_path: null, // Pour le nouveau fichier du logo, doit être null par défaut
    tax_number: company ? company.tax_number : '', // Correspond à votre 'nui' côté client
    phone_number: company ? company.phone_number : '',
    email_address: company ? company.email_address : '',
    address: company ? company.address : '', // Correspond à votre 'address' côté client
    // _method: 'put', // Ceci est géré automatiquement par useForm.put()
  });

  // Met à jour les données du formulaire lorsque la prop 'company' change
  useEffect(() => {
    if (company) {
      setData({
        name: company.name || '',
        code: company.code || '',
        logo_path: null, // Ne pré-remplit pas le champ fichier, l'utilisateur doit le resélectionner
        tax_number: company.tax_number || '',
        phone_number: company.phone_number || '',
        email_address: company.email_address || '',
        address: company.address || '',
      });
    } else {
      reset(); // Réinitialise si l'entreprise est null ou undefined
    }
  }, [company, setData, reset]);

  // Gère la réinitialisation du formulaire après une soumission réussie
  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = () => {
    if (!company || !company.id) {
      console.error("Impossible de modifier: ID d'entreprise manquant, monsieur.");
      return;
    }
    console.log(`Données du formulaire entreprise ${company.id} avant modification, monsieur:`, data);

    // Utilise la méthode POST avec _method: 'put' pour envoyer des fichiers et simuler PUT
    // ou si vous n'avez pas de fichier, vous pouvez utiliser put directement
    post(route('company.edit', company.id), {
      forceFormData: true, // Important pour envoyer les fichiers avec PUT/PATCH simulé

      preserveScroll: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier l'entreprise: ${company ? company.name : ''}`}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom de l'entreprise */}
        <div>
          <Label htmlFor="edit-company-name">Nom de l'entreprise <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-company-name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>

        {/* Champ Code de l'entreprise */}
        <div>
          <Label htmlFor="edit-company-code">Code de l'entreprise <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-company-code"
            name="code"
            value={data.code}
            onChange={(e) => setData('code', e.target.value)}
            disabled={true}
            error={!!errors.code}
            hint={errors.code}
          />
        </div>

        {/* Affichage du logo actuel et champ FileInput */}
        <div>
          <Label htmlFor="edit-company-logo">Logo Actuel</Label>
          {company && company.logo_path && (
            <div className="mb-2">
              <img src={company.logo_path} alt="Logo actuel" className="max-h-24 max-w-24 object-contain" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Laissez vide pour conserver le logo actuel.
              </span>
            </div>
          )}
          <FileInput
            id="edit-company-logo"
            name="logo_path"
            onChange={(e) => setData('logo_path', e.target.files[0])}
            className={errors.logo_path ? "border-error-500" : ""}
          />
          {errors.logo_path && <p className="mt-1.5 text-xs text-error-500 dark:text-error-400">{errors.logo_path}</p>}
        </div>

        {/* Champ Tax Number / NUI */}
        <div>
          <Label htmlFor="edit-company-tax_number">NUI <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-company-tax_number"
            name="tax_number"
            value={data.tax_number}
            onChange={(e) => setData('tax_number', e.target.value)}
            disabled={true}
            error={!!errors.tax_number}
            hint={errors.tax_number}
          />
        </div>

        {/* Champ Numéro de téléphone */}
        <div>
          <Label htmlFor="edit-company-phone_number">Numéro de téléphone</Label>
          <Input
            type="text"
            id="edit-company-phone_number"
            name="phone_number"
            value={data.phone_number}
            onChange={(e) => setData('phone_number', e.target.value)}
            disabled={processing}
            error={!!errors.phone_number}
            hint={errors.phone_number}
          />
        </div>

        {/* Champ Email */}
        <div>
          <Label htmlFor="edit-company-email_address">Email</Label>
          <Input
            type="email"
            id="edit-company-email_address"
            name="email_address"
            value={data.email_address}
            onChange={(e) => setData('email_address', e.target.value)}
            disabled={processing}
            error={!!errors.email_address}
            hint={errors.email_address}
          />
        </div>

        {/* Champ Adresse */}
        <div>
          <Label htmlFor="edit-company-saddress">Adresse <span className="text-red-500">*</span></Label>
          <TextArea
            id="edit-company-saddress"
            name="saddress"
            value={data.address}
            onChange={(value) => setData('saddress', value)}
            rows={3}
            disabled={processing}
            error={!!errors.address}
            hint={errors.address}
          />
        </div>

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

export default EditCompanyModal;