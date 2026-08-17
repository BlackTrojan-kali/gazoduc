import React, { useEffect } from 'react';
import Modal from './Modal';
import Form from '../form/Form';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import Select from '../form/form-elements/SelectInputs'; 
import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const EditCityModal = ({ isOpen, onClose, city, regions }) => {
  const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
    name: city ? city.name : '',
    region_id: city ? city.region_id : '',
    transport_cost_per_tonne: city ? city.transport_cost_per_tonne : 0, // NOUVEL ETAT
  });

  useEffect(() => {
    if (city) {
      setData({
        name: city.name || '',
        region_id: city.region_id || '',
        transport_cost_per_tonne: city.transport_cost_per_tonne || 0,
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
    if (!city || !city.id) return;
    
    put(route('cities.edit', city.id), {
      preserveScroll: true,
    });
  };

  const regionOptions = regions ? regions.map(region => ({
    value: region.id,
    label: region.name,
  })) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Modifier la ville: ${city ? city.name : ''}`}>
      <Form onSubmit={handleSubmit} className="space-y-4">
        
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
            className="dark:bg-dark-900" 
          />
        </div>

        {/* NOUVEAU CHAMP : TARIF CSPH */}
        <div>
          <Label htmlFor="edit-city-transport">Tarif Transport CSPH (FCFA par Tonne)</Label>
          <Input
            type="number"
            step="0.01"
            id="edit-city-transport"
            name="transport_cost_per_tonne"
            value={data.transport_cost_per_tonne}
            onChange={(e) => setData('transport_cost_per_tonne', e.target.value)}
            disabled={processing}
            error={!!errors.transport_cost_per_tonne}
            hint={errors.transport_cost_per_tonne || "Ex: -94858.41 pour Garoua"}
          />
        </div>

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
              <><FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> Mise à jour...</>
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