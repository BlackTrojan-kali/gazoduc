import React, { useEffect, useState, useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from '../Modal';
import Form from '../../form/Form';
import Label from '../../form/Label';
import Input from '../../form/input/InputField';
import Select from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faTrash, faPlus, faMinus, faBoxOpen, faBarcode } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const RoadbillFormModal = ({ isOpen, onClose, roadbill, routeName, vehicles, drivers, agencies, articles }) => {
  const { auth } = usePage().props;
  const userAgencyId = auth.user.agency_id;

  const { data, setData, post, put, processing, errors, reset, recentlySuccessful } = useForm({
    vehicle_id: '',
    driver_id: '',
    co_driver_id: '',
    departure_location_id: '',
    arrival_location_id: '',
    departure_date: '',
    arrival_date: '',
    status: 'en_cours',
    type: '',
    note: '',
    articles: [], // Tableau PLAT pour le backend (chaque bouteille médicale aura sa propre ligne ici)
  });

  const [scanCode, setScanCode] = useState('');

  // --- Options pour les selects ---
  const vehicleOptions = vehicles.map(v => ({ value: v.id, label: `${v.brand} - ${v.licence_plate}` }));
  const driverOptions = drivers.map(d => ({ value: d.id, label: d.name }));
  const agencyOptions = agencies.map(a => ({ value: a.id, label: a.name }));
  const typeOptions = [
    { value: 'livraison', label: 'Livraison' }, 
    { value: 'ramassage', label: 'Ramassage' }, 
    { value: 'transit', label: 'Transit' }
  ];

  // Enrichissement des options d'articles avec le type et le code pour la logique métier
  const articleOptions = articles.map(a => ({ 
    value: a.id, 
    label: `${a.name} ${a.code ? `[${a.code}]` : ''}`, 
    name: a.name,
    unit: a.unit,
    type: a.type,
    code: a.code
  }));

  // --- Chargement des données à l'ouverture ---
  useEffect(() => {
    if (isOpen) {
      if (roadbill) {
        setData({
          ...roadbill,
          departure_date: roadbill.departure_date ? new Date(roadbill.departure_date).toISOString().slice(0, 16) : '',
          articles: roadbill.articles.map(a => {
            // Retrouver les métadonnées de l'article pour conserver la logique médicale
            const foundArt = articles.find(art => art.id === a.id);
            return {
              article_id: a.id,
              quantity: a.pivot ? a.pivot.qty : a.quantity,
              name: a.name,
              unit: a.unit,
              type: foundArt ? foundArt.type : a.type,
              code: foundArt ? foundArt.code : a.code
            };
          })
        });
      } else {
        reset();
        setData(prev => ({ ...prev, departure_location_id: userAgencyId, articles: [] }));
      }
      setScanCode('');
    }
  }, [isOpen, roadbill]);

  useEffect(() => {
    if (recentlySuccessful) onClose();
  }, [recentlySuccessful]);


  // --- LOGIQUE DE SCAN ET D'AJOUT D'ARTICLES ---

  // 1. Écoute du Scanner (Entrée)
  const handleScan = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = scanCode.trim().toLowerCase();
      if (!term) return;

      // Recherche par code OU par nom (insensible à la casse)
      const found = articleOptions.find(a => 
        (a.code && a.code.toLowerCase() === term) || 
        (a.name && a.name.toLowerCase() === term)
      );

      if (found) {
        addArticleLine(found);
      } else {
        Swal.fire({ icon: 'error', title: 'Introuvable', text: `Aucun article trouvé pour "${term}".`, timer: 2000 });
      }
      setScanCode(''); // Réinitialise le champ pour le prochain scan
    }
  };

  // 2. Ajout au panier (Gère la différence Standard vs Médical)
  const addArticleLine = (selectedOption) => {
    if (!selectedOption) return;
    
    const isMedical = selectedOption.type === 'gaz_medical';

    if (isMedical) {
      // Pour le médical : On vérifie si CETTE bouteille précise est déjà dans le panier
      const alreadyIn = data.articles.some(a => a.article_id === selectedOption.value);
      if (alreadyIn) {
        Swal.fire({ icon: 'warning', title: 'Déjà scannée', text: 'Cette bouteille est déjà dans la liste.', timer: 1500, showConfirmButton: false });
        return;
      }
      // On ajoute une ligne unique pour cette bouteille
      const newArticle = {
        article_id: selectedOption.value,
        name: selectedOption.name,
        unit: selectedOption.unit,
        type: selectedOption.type,
        code: selectedOption.code,
        quantity: 1 // Toujours 1 pour le tracking individuel
      };
      setData('articles', [...data.articles, newArticle]);

    } else {
      // Pour le standard : Si l'article existe, on incrémente la quantité
      const existingIndex = data.articles.findIndex(a => a.article_id === selectedOption.value);
      if (existingIndex > -1) {
        updateStandardQuantity(selectedOption.value, data.articles[existingIndex].quantity + 1);
      } else {
        const newArticle = {
          article_id: selectedOption.value,
          name: selectedOption.name,
          unit: selectedOption.unit,
          type: selectedOption.type,
          quantity: 1
        };
        setData('articles', [...data.articles, newArticle]);
      }
    }
  };


  // --- MODIFICATION DU PANIER ---

  const updateStandardQuantity = (id, qte) => {
    const newArticles = data.articles.map(a => 
      a.article_id === id ? { ...a, quantity: Math.max(1, parseInt(qte) || 0) } : a
    );
    setData('articles', newArticles);
  };

  // Retire la DERNIÈRE bouteille scannée de ce nom (pour le bouton Moins)
  const decrementMedicalQuantity = (name) => {
    const index = data.articles.map(a => a.name).lastIndexOf(name);
    if (index > -1) {
      const newArticles = [...data.articles];
      newArticles.splice(index, 1);
      setData('articles', newArticles);
    }
  };

  // Retire un groupe entier (Bouton Corbeille)
  const removeGroup = (key, isMedical, name) => {
    if (isMedical) {
      setData('articles', data.articles.filter(a => a.name !== name));
    } else {
      setData('articles', data.articles.filter(a => a.article_id !== key));
    }
  };


  // --- REGROUPEMENT FRONTEND POUR L'AFFICHAGE ---
  // On génère une vue condensée à la volée à partir du state plat "data.articles"
  const groupedArticlesForUI = useMemo(() => {
    return Object.values(data.articles.reduce((acc, item) => {
      const isMed = item.type === 'gaz_medical';
      // Clé unique : Nom pour le médical, ID pour le standard
      const key = isMed ? `med_${item.name}` : `std_${item.article_id}`;
      
      if (!acc[key]) {
        acc[key] = { 
          key: key,
          is_medical: isMed,
          article_id: item.article_id,
          name: item.name, 
          unit: item.unit, 
          quantity: item.quantity 
        };
      } else {
        if (isMed) {
          acc[key].quantity += 1; // On additionne virtuellement les bouteilles
        } else {
          acc[key].quantity += item.quantity;
        }
      }
      return acc;
    }, {}));
  }, [data.articles]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.articles.length === 0) {
      Swal.fire('Attention', 'Veuillez ajouter au moins un article au bordereau.', 'warning');
      return;
    }

    const action = roadbill ? put : post;
    const url = roadbill ? route(routeName, roadbill.id) : route(routeName);
    action(url, { preserveScroll: true });
  };

  const customStyles = { control: (base) => ({ ...base, minHeight: '42px', borderRadius: '0.375rem' }) };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={roadbill ? "Modifier Bordereau" : "Nouveau Bordereau de Route"} maxWidth="4xl">
      <Form onSubmit={handleSubmit} className="p-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLONNE GAUCHE : INFOS GÉNÉRALES */}
          <div className="lg:col-span-1 space-y-4 border-r border-gray-200 dark:border-gray-700 pr-0 lg:pr-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
               <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
               Informations Transport
            </h3>
            
            <div>
              <Label>Véhicule *</Label>
              <Select
                options={vehicleOptions}
                value={vehicleOptions.find(o => o.value === data.vehicle_id)}
                onChange={val => setData('vehicle_id', val?.value)}
                styles={customStyles}
                placeholder="Choisir..."
              />
              {errors.vehicle_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_id}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Chauffeur *</Label>
                <Select
                  options={driverOptions}
                  value={driverOptions.find(o => o.value === data.driver_id)}
                  onChange={val => setData('driver_id', val?.value)}
                  styles={customStyles}
                />
              </div>
              <div>
                <Label>Co-Chauffeur</Label>
                <Select
                  options={driverOptions}
                  value={driverOptions.find(o => o.value === data.co_driver_id)}
                  onChange={val => setData('co_driver_id', val?.value)}
                  styles={customStyles}
                />
              </div>
            </div>

            <div>
              <Label>Destination *</Label>
              <Select
                options={agencyOptions}
                value={agencyOptions.find(o => o.value === data.arrival_location_id)}
                onChange={val => setData('arrival_location_id', val?.value)}
                styles={customStyles}
              />
            </div>

            <div>
              <Label>Date de Départ *</Label>
              <Input
                type="datetime-local"
                value={data.departure_date}
                onChange={e => setData('departure_date', e.target.value)}
                error={errors.departure_date}
              />
            </div>

            <div>
              <Label>Type *</Label>
              <Select
                options={typeOptions}
                value={typeOptions.find(o => o.value === data.type)}
                onChange={val => setData('type', val?.value)}
                styles={customStyles}
              />
            </div>
          </div>

          {/* COLONNE DROITE : SÉLECTION ARTICLES (STYLE PANIER/SAP) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center">
               <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
               Articles à transférer
            </h3>

            {/* BARRES DE RECHERCHE ET SCAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <div>
                <Label><FontAwesomeIcon icon={faBarcode} className="mr-2"/> Scanner (Code ou Nom)</Label>
                <Input
                  type="text"
                  placeholder="Scannez + Entrée..."
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  onKeyDown={handleScan}
                />
              </div>
              <div>
                <Label>Recherche Manuelle</Label>
                <Select
                  options={articleOptions}
                  onChange={addArticleLine}
                  placeholder="Parcourir la liste..."
                  value={null} // Réinitialisation automatique après clic
                  styles={customStyles}
                />
              </div>
            </div>

            {/* TABLEAU FRONTEND (VUE REGROUPÉE) */}
            <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-32">Quantité</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupedArticlesForUI.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-gray-400">
                        <FontAwesomeIcon icon={faBoxOpen} className="text-3xl mb-2 block mx-auto" />
                        Le bordereau est vide.
                      </td>
                    </tr>
                  ) : (
                    groupedArticlesForUI.map((item) => (
                      <tr key={item.key} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            {item.name} 
                            {item.is_medical && <span className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-full font-bold">Médical (Scanné)</span>}
                          </div>
                          <div className="text-xs text-gray-500 italic">{item.unit}</div>
                        </td>
                        
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              type="button"
                              onClick={() => item.is_medical ? decrementMedicalQuantity(item.name) : updateStandardQuantity(item.article_id, item.quantity - 1)}
                              className="p-1 text-gray-500 hover:text-red-500"
                            >
                              <FontAwesomeIcon icon={faMinus} className="text-xs" />
                            </button>

                            <input
                              type={item.is_medical ? "text" : "number"}
                              className={`w-16 text-center border-gray-300 rounded py-1 ${item.is_medical ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 cursor-not-allowed' : 'dark:bg-gray-700 dark:border-gray-600'}`}
                              value={item.quantity}
                              onChange={(e) => !item.is_medical && updateStandardQuantity(item.article_id, e.target.value)}
                              readOnly={item.is_medical}
                              title={item.is_medical ? "Scanner des bouteilles pour augmenter la quantité" : ""}
                            />

                            <button 
                              type="button"
                              onClick={() => {
                                if (item.is_medical) {
                                  Swal.fire({ icon: 'info', title: 'Scanner requis', text: 'Pour les articles médicaux, veuillez scanner chaque bouteille pour assurer la traçabilité.', timer: 2000 });
                                } else {
                                  updateStandardQuantity(item.article_id, item.quantity + 1);
                                }
                              }}
                              className={`p-1 ${item.is_medical ? 'text-gray-300' : 'text-gray-500 hover:text-green-500'}`}
                            >
                              <FontAwesomeIcon icon={faPlus} className="text-xs" />
                            </button>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeGroup(item.article_id, item.is_medical, item.name)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {errors.articles && <p className="text-red-500 text-sm mt-1">{errors.articles}</p>}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-bold mr-4"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={processing}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow-lg transition-all flex items-center"
          >
            {processing && <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />}
            {roadbill ? 'Mettre à jour le Bordereau' : 'Valider le Bordereau'}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default RoadbillFormModal;