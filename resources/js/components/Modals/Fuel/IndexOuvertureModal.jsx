import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '../Modal'; 
import Input from '../../form/input/InputField'; 
import Button from '../../ui/button/Button'; 
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faWrench, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const IndexOuvertureModal = ({ isOpen, onClose, pistolet }) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        current_index: '', 
    });

    useEffect(() => {
        if (isOpen && pistolet) {
            setData('current_index', pistolet.current_index || 0);
        } else {
            reset();
        }
    }, [isOpen, pistolet]);

    const handleChange = (e) => {
        setData('current_index', e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // ⚠️ NOTE : Tu dois créer cette route dans web.php et la méthode dans ton contrôleur !
        // Exemple: Route::put('/pistolets/{pistolet}/index', [PistoletController::class, 'updateIndex'])->name('pistolets.updateIndex');
        
        put(route('pistolets.updateIndex', pistolet.id), { 
            onSuccess: () => {
                 Swal.fire({
                     icon: 'success',
                     title: 'Index mis à jour',
                     text: `Le nouvel index de départ du pistolet "${pistolet.name}" est de ${data.current_index}.`,
                     confirmButtonText: 'Terminer'
                 });
                 onClose();
            },
            onError: (validationErrors) => {
                console.error("Erreur de mise à jour de l'index:", validationErrors);
            },
        });
    };

    if (!pistolet) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ajustement de l'Index">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 p-4 rounded-xl text-sm border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="mt-0.5 text-amber-500" />
                    <div>
                        <p className="font-bold mb-1">Attention, modification technique</p>
                        <p>
                            Cette action modifie directement la valeur de départ du compteur pour ce pistolet. 
                            Elle ne doit être utilisée qu'en cas de changement matériel du volucompteur ou de réinitialisation physique de la pompe.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Pistolet</span>
                            <span className="font-semibold text-slate-800 dark:text-white">{pistolet.name}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Produit distribué</span>
                            <span className="font-semibold text-slate-800 dark:text-white">{pistolet.citerne?.article?.name || 'Inconnu'}</span>
                        </div>
                    </div>
                </div>

                <Input
                    id="current_index"
                    type="number"
                    step="0.01" 
                    min="0"
                    label={<span className="flex items-center gap-2"><FontAwesomeIcon icon={faWrench} /> Nouvel Index de Départ (Ouverture)</span>}
                    value={data.current_index}
                    onChange={handleChange}
                    error={errors.current_index}
                    placeholder="Ex: 0.00 ou 1450.00"
                    required
                />
                
                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="destructive"
                        className="mr-3"
                        disabled={processing}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={processing || data.current_index === ''}
                    >
                        {processing ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Mise à jour...
                            </>
                        ) : (
                            'Forcer la mise à jour'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default IndexOuvertureModal;