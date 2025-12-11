import React, { useEffect } from 'react';
import Modal from '../Modals/Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/form-elements/SelectInputs'; // <-- Assurez-vous d'importer votre composant Select ici
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const EditLicenseModal = ({ isOpen, onClose, license }) => {
  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    name: license ? license.name : '',
    type: license ? license.type : 'Annuel', // Définir une valeur par défaut si la licence n'est pas encore chargée
    description: license ? license.description : '',
  });

  // Options pour le type de licence
  const typeOptions = [
    { value: 'Annuel', label: 'Annuel' },
    { value: 'Mensuel', label: 'Mensuel' },
  ];

  // Met à jour les données du formulaire lorsque la prop 'license' change
  useEffect(() => {
    if (license) {
      setData({
        name: license.name || '',
        type: license.type || 'Annuel', // Assurez-vous qu'il y a une valeur par défaut si absente
        description: license.description || '',
      });
    } else {
      reset();
    }
  }, [license, setData, reset]);

  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = () => {
    if (!license || !license.id) {
      console.error("Impossible de modifier: ID de licence manquant, monsieur.");
      return;
    }
    console.log(`Données du formulaire de licence ${license.id} avant modification, monsieur:`, data);
    put(route('licences.edit', license.id), {
      preserveScroll: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier la licence: ${license ? license.name : ''}`}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom de la licence */}
        <div>
          <Label htmlFor="edit-license-name">Nom de la licence <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-license-name"
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
          <Label htmlFor="edit-license-type">Type de la licence <span className="text-red-500">*</span></Label>
          <Select
            id="edit-license-type"
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
          <Label htmlFor="edit-license-description">Description</Label>
          <Input
            type="textarea"
            id="edit-license-description"
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

export default EditLicenseModal;