import React, { useEffect } from 'react';
import Modal from '../Modals/Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/form-elements/SelectInputs'// <-- Assurez-vous d'importer votre composant Select ici
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const CreateLicenseModal = ({ isOpen, onClose }) => {
  const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
    name: '',
    type: 'Annuel', // Définir une valeur par défaut, par exemple 'Annuel'
    description: '',
  });

  // Options pour le type de licence
  const typeOptions = [
    { value: 'Annuel', label: 'Annuel' },
    { value: 'Mensuel', label: 'Mensuel' },
  ];

  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = () => {
    console.log("Données du formulaire de licence avant soumission, monsieur:", data);
    post(route('licences.store'), {
      preserveScroll: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une nouvelle licence">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom de la licence */}
        <div>
          <Label htmlFor="license-name">Nom de la licence <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="license-name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>

        {/* Sélecteur Type de la licence */}
        <div>
          <Label htmlFor="license-type">Type de la licence <span className="text-red-500">*</span></Label>
          <Select
            id="license-type"
            name="type"
            options={typeOptions} // Passe les options prédéfinies
            value={data.type}
            onChange={(e) => setData('type', e.target.value)}
            disabled={processing}
            error={!!errors.type}
            hint={errors.type}
            placeholder="Sélectionnez un type"
            className="dark:bg-dark-900"
          />
        </div>

        {/* Champ Description de la licence */}
        <div>
          <Label htmlFor="license-description">Description</Label>
          <Input
            type="textarea"
            id="license-description"
            name="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            disabled={processing}
            error={!!errors.description}
            hint={errors.description}
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
                Création...
              </>
            ) : (
              'Créer'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateLicenseModal;