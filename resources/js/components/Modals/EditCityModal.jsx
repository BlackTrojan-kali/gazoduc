import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/form-elements/SelectInputs'; // <--- Utilisez votre composant Select ici

import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const EditCityModal = ({ isOpen, onClose, city, regions }) => {
  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    name: city ? city.name : '',
    region_id: city ? city.region_id : '',
  });

  useEffect(() => {
    if (city) {
      setData({
        name: city.name || '',
        region_id: city.region_id || '',
      });
    } else {
      reset();
    }
  }, [city, setData, reset]);

  useEffect(() => {
    if (recentlySuccessful) {
      reset();
      onClose();
    }
  }, [recentlySuccessful, reset, onClose]);

  const handleSubmit = () => {
    if (!city || !city.id) {
      console.error("Impossible de modifier: ID de ville manquant, monsieur.");
      return;
    }
    console.log(`Données du formulaire ville ${city.id} avant modification, monsieur:`, data);
    put(route('cities.edit', city.id), {
      preserveScroll: true,
    });
  };

  // Prépare les options pour le composant Select
  const regionOptions = regions ? regions.map(region => ({
    value: region.id,
    label: region.name,
  })) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier la ville: ${city ? city.name : ''}`}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Champ Nom de la ville */}
        <div>
          <Label htmlFor="edit-city-name">Nom de la ville <span className="text-red-500">*</span></Label>
          <Input
            type="text"
            id="edit-city-name"
            name="name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            disabled={processing}
            error={!!errors.name}
            hint={errors.name}
          />
        </div>

        {/* Sélecteur de Région */}
        <div>
          <Label htmlFor="edit-city-region">Région <span className="text-red-500">*</span></Label>
          <Select
            id="edit-city-region"
            name="region_id"
            options={regionOptions}
            value={data.region_id}
            onChange={(e) => setData('region_id', e.target.value)}
            disabled={processing}
            error={!!errors.region_id}
            hint={errors.region_id}
            placeholder="Sélectionnez une région"
            className="dark:bg-dark-900" // Utilise votre classe dark mode
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

export default EditCityModal;