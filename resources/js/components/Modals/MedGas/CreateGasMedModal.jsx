// resources/js/components/Modals/GasMedModal.jsx

import React, { useEffect } from 'react';
import Modal from '../Modal';
import Form from '../../form/Form';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';

import { useForm } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

// Ajout de la prop "matieresPremieres" pour la liste des gaz disponibles
const GasMedModal = ({ isOpen, onClose, entreprises, matieresPremieres = [], article = null }) => {

  const isEdit = !!article; 

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    code: '',
    name: '',
    type: 'gaz_medical',
    unit: 'bouteille',
    entreprise_id: '',
    weight_per_unit: '',
    state: 'plein',
    batch_number: '',
    // NOUVEAUX CHAMPS
    product_inside_id: '',
    last_maintenance: '',
    estimated_maintenance_date: ''
  });

  useEffect(() => {
    if (isOpen) {
      clearErrors(); 
      
      if (isEdit) {
        setData({
          code: article.code || '',
          name: article.name || '',
          type: article.type || 'gaz_medical',
          unit: article.unit || 'bouteille',
          entreprise_id: article.entreprise_id || '',
          weight_per_unit: article.weight_per_unit || '',
          state: article.state || 'plein',
          batch_number: article.batch_number || '',
          // NOUVEAUX CHAMPS
          product_inside_id: article.product_inside_id || '',
          last_maintenance: article.last_maintenance || '',
          estimated_maintenance_date: article.estimated_maintenance_date || ''
        });
      } else {
        reset();
        if (entreprises && entreprises.length > 0) {
          setData('entreprise_id', entreprises[0].id);
        }
      }
    }
  }, [isOpen, article, entreprises]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const requestOptions = {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        Swal.fire({
          title: 'Succès !',
          text: isEdit ? 'Article modifié avec succès.' : 'Bouteille enregistrée avec succès.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
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
    };

    if (isEdit) {
      put(route('gas_medical.update', article.id), requestOptions);
    } else {
      post(route('gas_medical.store'), requestOptions);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? `Modifier : ${article.name} (${article.code})` : "Ajouter une Bouteille (Gaz Médical)"}
      maxWidth="2xl"
    >
      <Form onSubmit={handleSubmit} className="space-y-6">
        
        {/* --- SECTION 1 : INFORMATIONS DE BASE --- */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
            <h4 className="font-bold text-gray-700 dark:text-gray-300 border-b pb-2">Informations de la Bouteille</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gas-code">Code (Code-barres) <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  id="gas-code"
                  name="code"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value)}
                  disabled={processing}
                  error={!!errors.code}
                  hint={errors.code}
                  placeholder="Scanner la bouteille..."
                />
              </div>

              <div>
                <Label htmlFor="gas-name">Nom (ex: Bouteille B50) <span className="text-red-500">*</span></Label>
                <Input
                  type="text"
                  id="gas-name"
                  name="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  disabled={processing}
                  error={!!errors.name}
                  hint={errors.name}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gas-entreprise">Entreprise Propriétaire <span className="text-red-500">*</span></Label>
                <select
                  id="gas-entreprise"
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

              <div>
                <Label htmlFor="gas-product-inside">Gaz Contenu (Matière Première)</Label>
                <select
                  id="gas-product-inside"
                  value={data.product_inside_id}
                  onChange={(e) => setData('product_inside_id', e.target.value)}
                  disabled={processing}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.product_inside_id ? 'border-red-500' : ''}`}
                >
                  <option value="">(Vide ou Inconnu)</option>
                  {matieresPremieres && matieresPremieres.map((matiere) => (
                    <option key={matiere.id} value={matiere.id}>
                      {matiere.name}
                    </option>
                  ))}
                </select>
                {errors.product_inside_id && <div className="text-red-500 text-sm mt-1">{errors.product_inside_id}</div>}
              </div>
            </div>
        </div>

        {/* --- SECTION 2 : CARACTÉRISTIQUES PHYSIQUES --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="gas-unit">Unité</Label>
            <Input type="text" id="gas-unit" value={data.unit} onChange={(e) => setData('unit', e.target.value)} disabled={processing} error={!!errors.unit} hint={errors.unit} />
          </div>

          <div>
            <Label htmlFor="gas-weight">Poids / Volume</Label>
            <Input type="number" step="0.01" id="gas-weight" value={data.weight_per_unit} onChange={(e) => setData('weight_per_unit', e.target.value)} disabled={processing} error={!!errors.weight_per_unit} hint={errors.weight_per_unit} />
          </div>

          <div>
            <Label htmlFor="gas-state">État Actuel</Label>
            <select
              id="gas-state"
              value={data.state}
              onChange={(e) => setData('state', e.target.value)}
              disabled={processing}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.state ? 'border-red-500' : ''}`}
            >
              <option value="plein">Plein</option>
              <option value="vide">Vide</option>
              <option value="en_maintenance">En maintenance</option>
            </select>
          </div>

          <div>
            <Label htmlFor="gas-batch">Numéro de lot</Label>
            <Input type="text" id="gas-batch" value={data.batch_number} onChange={(e) => setData('batch_number', e.target.value)} disabled={processing} error={!!errors.batch_number} hint={errors.batch_number} />
          </div>
        </div>

        {/* --- SECTION 3 : MAINTENANCE --- */}
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800/50 space-y-4">
            <h4 className="font-bold text-orange-800 dark:text-orange-300 border-b border-orange-200 dark:border-orange-800 pb-2">Suivi de Maintenance</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="last-maintenance">Dernière Maintenance</Label>
                <Input
                  type="date"
                  id="last-maintenance"
                  value={data.last_maintenance}
                  onChange={(e) => setData('last_maintenance', e.target.value)}
                  disabled={processing}
                  error={!!errors.last_maintenance}
                  hint={errors.last_maintenance}
                />
              </div>

              <div>
                <Label htmlFor="estimated-maintenance">Prochaine Épreuve (Estimée)</Label>
                <Input
                  type="date"
                  id="estimated-maintenance"
                  value={data.estimated_maintenance_date}
                  onChange={(e) => setData('estimated_maintenance_date', e.target.value)}
                  disabled={processing}
                  error={!!errors.estimated_maintenance_date}
                  hint={errors.estimated_maintenance_date}
                />
              </div>
            </div>
        </div>

        {/* --- PIED DE MODALE --- */}
        <div className="flex items-center justify-end pt-4 border-t border-solid border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            onClick={onClose}
            disabled={processing}
          >
            Annuler
          </button>
          <button
            type="submit"
            className={`${isEdit ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150`}
            disabled={processing}
          >
            {processing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                {isEdit ? 'Modification...' : 'Enregistrement...'}
              </>
            ) : (
              isEdit ? 'Enregistrer les modifications' : 'Créer la bouteille'
            )}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default GasMedModal;