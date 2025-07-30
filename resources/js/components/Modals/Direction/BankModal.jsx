import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; // Chemin correct vers votre Modal
import InputField from '../../form/input/InputField'; // Chemin correct vers votre InputField
import Button from '../../ui/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

// La modale prend une prop 'bank' (optionnelle) pour la modification
const BankModal = ({ isOpen, onClose, bank, routeName }) => {
  const isEditMode = !!bank;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: bank?.name || '',
    account_number: bank?.account_number || '',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setData({
          name: bank.name || '',
          account_number: bank.account_number || '',
        });
      } else {
        reset(); // Vide le formulaire pour une nouvelle création
      }
    }
  }, [isOpen, isEditMode, bank, setData, reset]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode) {
      put(route(routeName, bank.id), {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          console.error("Erreur lors de la modification de la banque :", err);
        },
      });
    } else {
      post(route(routeName), {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          console.error("Erreur lors de la création de la banque :", err);
        },
      });
    }
  };

  const modalTitle = isEditMode ? "Modifier la Banque" : "Créer une Nouvelle Banque";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="p-4">
        <div className="space-y-4">
          {/* Champ Nom de la Banque */}
          <InputField
            id="name"
            label="Nom de la Banque"
            type="text"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            errorMessage={errors.name}
            required
            placeholder="Ex: Banque Centrale"
          />

          {/* Champ Numéro de Compte */}
          <InputField
            id="account_number"
            label="Numéro de Compte"
            type="text" // Peut être 'text' si le numéro de compte peut contenir des lettres ou des tirets
            value={data.account_number}
            onChange={(e) => setData('account_number', e.target.value)}
            errorMessage={errors.account_number}
            required
            placeholder="Ex: 1234567890ABC"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="inline-flex items-center"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={processing}
            className="inline-flex items-center bg-brand-600 text-white hover:bg-brand-700"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            {processing ? (isEditMode ? 'Mise à jour...' : 'Enregistrement...') : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BankModal;