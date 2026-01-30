import React, { useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../../Modal'; 
import InputField from '../../../form/input/InputField'; 
import Button from '../../../ui/button/Button'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSave, 
    faTimes, 
    faUserTag, 
    faStore, 
    faCashRegister, 
    faLock, 
    faIdCard,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import Select from "react-select";
import Swal from 'sweetalert2';

const UserBoutiqueFormModal = ({ 
    isOpen, 
    onClose, 
    user, 
    roles = [], 
    // agencies = [], // RETIRÉ : Plus nécessaire
    boutiques = [], 
    counters = [], 
    routeName = 'boutique_users.store' // Vérifiez si c'est 'users.store' ou 'users.store_boutique' selon vos routes
}) => {
  const isEditMode = !!user;

  // --- Initialisation du Formulaire ---
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    code: '',
    role_id: '',
    // agency_id: '', // RETIRÉ
    boutique_id: '', 
    counter_id: '',
    password: '',
    password_confirmation: '',
    is_boutique: true, 
  });

  // --- Remplissage des données (Mode Édition) ---
  useEffect(() => {
    if (isOpen) {
      clearErrors();
      if (isEditMode) {
        setData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          code: user.code || '',
          role_id: user.role_id || '',
          // agency_id: user.agency_id || '', // RETIRÉ
          boutique_id: user.boutique_id || '', 
          counter_id: user.counter_id || '',
          password: '', 
          password_confirmation: '',
          is_boutique: true,
        });
      } else {
        reset();
      }
    }
  }, [isOpen, isEditMode, user]);

  // --- Préparation des Options pour les Selects ---
  const roleOptions = useMemo(() => roles.map(r => ({ value: String(r.id), label: r.name, name: r.name })), [roles]);
  // const agencyOptions = useMemo(...) // RETIRÉ
  const boutiqueOptions = useMemo(() => boutiques.map(b => ({ value: String(b.id), label: b.name })), [boutiques]);
  const counterOptions = useMemo(() => counters.map(c => ({ value: String(c.id), label: c.name })), [counters]);

  // --- Logique Métier : Est-ce un Commercial ? ---
  const selectedRoleObj = roleOptions.find(r => r.value === String(data.role_id));
  const isCommercial = selectedRoleObj && selectedRoleObj.name.toLowerCase().includes('commercial');

  // --- Soumission ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation Client-side
    if (isCommercial && !data.counter_id) {
        Swal.fire('Attention', 'Un commercial doit obligatoirement avoir une caisse assignée.', 'warning');
        return;
    }

    if (!data.boutique_id) {
        Swal.fire('Attention', 'Veuillez sélectionner la boutique de rattachement.', 'warning');
        return;
    }

    const submitMethod = isEditMode ? put : post;
    // Assurez-vous que la route correspond à celle définie dans Laravel (resource ou custom)
    const submitRoute = isEditMode ? route('boutique_users.update', user.id) : route('boutique_users.store');

    submitMethod(submitRoute, {
        onSuccess: () => {
            onClose();
        },
        onError: (err) => {
            console.error("Erreur soumission", err);
            if (Object.keys(err).length > 0) {
                 Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Veuillez vérifier les champs du formulaire.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                 });
            }
        }
    });
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={isEditMode ? "Modifier Utilisateur Boutique" : "Nouvel Utilisateur Boutique"} 
        maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* --- BLOC 1 : IDENTITÉ --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
                id="first_name" label="Prénom" required
                value={data.first_name} onChange={e => setData('first_name', e.target.value)}
                errorMessage={errors.first_name}
                icon={faUser}
            />
            <InputField
                id="last_name" label="Nom" required
                value={data.last_name} onChange={e => setData('last_name', e.target.value)}
                errorMessage={errors.last_name}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
                id="email" label="Email de connexion" type="email" required
                value={data.email} onChange={e => setData('email', e.target.value)}
                errorMessage={errors.email}
            />
            <InputField
                id="phone_number" label="Téléphone"
                value={data.phone_number} onChange={e => setData('phone_number', e.target.value)}
                errorMessage={errors.phone_number}
            />
        </div>

        {/* --- BLOC 2 : AFFECTATION ET RÔLE --- */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 border-b border-gray-200 dark:border-gray-600 pb-2">
                <FontAwesomeIcon icon={faStore} className="text-brand-600"/> 
                Structure & Rôle
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Boutique (Déplacé en premier pour la logique) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <FontAwesomeIcon icon={faStore} className="mr-1 text-gray-400"/>
                        Boutique de rattachement <span className="text-red-500">*</span>
                    </label>
                    <Select 
                        options={boutiqueOptions}
                        value={boutiqueOptions.find(b => b.value === String(data.boutique_id))}
                        onChange={opt => setData('boutique_id', opt ? opt.value : '')}
                        placeholder="Choisir la boutique..."
                        className="text-sm"
                    />
                    {errors.boutique_id && <p className="text-xs text-red-500 mt-1">{errors.boutique_id}</p>}
                </div>

                {/* Code / Matricule */}
                <InputField
                    id="code" label="Code / Matricule"
                    value={data.code} onChange={e => setData('code', e.target.value)}
                    errorMessage={errors.code}
                    placeholder="Ex: VENDEUR-01"
                    icon={faIdCard}
                />

                {/* Rôle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <FontAwesomeIcon icon={faUserTag} className="mr-1 text-gray-400"/>
                        Rôle <span className="text-red-500">*</span>
                    </label>
                    <Select 
                        options={roleOptions}
                        value={roleOptions.find(r => r.value === String(data.role_id))}
                        onChange={opt => setData('role_id', opt ? opt.value : '')}
                        placeholder="Définir le rôle..."
                        className="text-sm"
                    />
                    {errors.role_id && <p className="text-xs text-red-500 mt-1">{errors.role_id}</p>}
                </div>

                {/* Caisse (Conditionnel) */}
                <div className={`transition-all duration-300 ${isCommercial ? 'bg-orange-50 dark:bg-orange-900/10 p-2 rounded-lg -m-2 border border-orange-100 dark:border-orange-800' : ''}`}>
                    <label className={`block text-sm font-medium mb-1 ${isCommercial ? 'text-orange-700 dark:text-orange-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                        <FontAwesomeIcon icon={faCashRegister} className="mr-1"/>
                        Caisse d'affectation
                        {isCommercial && <span className="text-red-500 ml-1">* (Requis)</span>}
                    </label>
                    <Select 
                        options={counterOptions}
                        value={counterOptions.find(c => c.value === String(data.counter_id))}
                        onChange={opt => setData('counter_id', opt ? opt.value : '')}
                        placeholder={isCommercial ? "Sélectionnez impérativement une caisse" : "Aucune caisse"}
                        className="text-sm"
                        isClearable={!isCommercial}
                        styles={{ control: (base) => ({ ...base, borderColor: isCommercial && !data.counter_id ? '#ef4444' : base.borderColor }) }}
                    />
                    {errors.counter_id && <p className="text-xs text-red-500 mt-1">{errors.counter_id}</p>}
                </div>
            </div>
        </div>

        {/* --- BLOC 3 : SÉCURITÉ --- */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <h3 className="text-xs uppercase font-bold text-gray-400 mb-3 flex items-center gap-2">
                <FontAwesomeIcon icon={faLock}/> Sécurité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                    id="password" 
                    label={isEditMode ? "Nouveau Mot de passe (Optionnel)" : "Mot de passe"} 
                    type="password" 
                    required={!isEditMode}
                    value={data.password} onChange={e => setData('password', e.target.value)}
                    errorMessage={errors.password}
                    placeholder={isEditMode ? "••••••••" : "Minimum 8 caractères"}
                />
                <InputField
                    id="password_confirmation" 
                    label="Confirmer le mot de passe" 
                    type="password" 
                    required={!isEditMode && data.password.length > 0}
                    value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)}
                    errorMessage={errors.password_confirmation}
                />
            </div>
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Annuler
            </Button>
            <Button type="submit" disabled={processing} className="bg-brand-600 text-white hover:bg-brand-700 shadow-md">
                <FontAwesomeIcon icon={faSave} className="mr-2" /> 
                {processing ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserBoutiqueFormModal;