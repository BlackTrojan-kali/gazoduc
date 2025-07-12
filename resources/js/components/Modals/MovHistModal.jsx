// resources/js/Components/Modals/MovementHistoryPDFExcelModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from '../form/input/InputField';
import Button from '../ui/button/Button';
import { useForm, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const MovementHistoryPDFExcelModal = ({ isOpen, onClose, articles, agencies, services }) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    start_date: '',
    end_date: '',
    agency_id: '',
    service_id: '',
    movement_type: 'global',
    article_id: '',
    file_type: 'pdf', // Nouvelle propriété par défaut à 'pdf'**
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      setData({
        ...data,
        start_date: lastMonth.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        movement_type: 'global',
        file_type: 'pdf', // Assurez-vous que le type de fichier est aussi réinitialisé
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData(id, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const queryString = new URLSearchParams(data).toString();
    const generateRoute = route('movements.generateReport') + '?' + queryString; // Nouvelle route générique

    if (data.file_type === 'pdf' || data.file_type === 'excel') {
      window.open(generateRoute, '_blank'); // Ouvre le PDF/Excel dans un nouvel onglet ou déclenche le téléchargement
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de format',
        text: 'Veuillez sélectionner un type de fichier valide (PDF ou Excel).',
      });
      return;
    }

    Swal.fire({
      icon: 'info',
      title: 'Génération en cours',
      text: `Le rapport d'historique des mouvements au format ${data.file_type.toUpperCase()} est en cours de génération.`,
      showConfirmButton: false,
      timer: 2000
    });

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Générer l'historique des mouvements (PDF/Excel)">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Période */}
        <div className="flex gap-4">
          <Input
            id="start_date"
            type="date"
            label="Date de début"
            value={data.start_date}
            onChange={handleChange}
            error={errors.start_date}
            required
          />
          <Input
            id="end_date"
            type="date"
            label="Date de fin"
            value={data.end_date}
            onChange={handleChange}
            error={errors.end_date}
            required
          />
        </div>

        {/* Agence */}
        <div className="mb-4">
          <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Agence
          </label>
          <select
            id="agency_id"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.agency_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.agency_id}
            onChange={handleChange}
          >
            <option value="">Toutes les agences</option>
            {agencies && agencies.map(agency => (
              <option key={agency.id} value={String(agency.id)}>
                {agency.name}
              </option>
            ))}
          </select>
          {errors.agency_id && <p className="text-sm text-red-600 mt-1">{errors.agency_id}</p>}
        </div>

        {/* Service */}
        <div className="mb-4">
          <label htmlFor="service_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Service
          </label>
          <select
            id="service_id"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.service_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.service_id}
            onChange={handleChange}
          >
            <option value="">Tous les services</option>
            {services && services.map(service => (
              <option key={service.id} value={String(service.id)}>
                {service.name}
              </option>
            ))}
          </select>
          {errors.service_id && <p className="text-sm text-red-600 mt-1">{errors.service_id}</p>}
        </div>

        {/* Type de Mouvement */}
        <div className="mb-4">
          <label htmlFor="movement_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de Mouvement
          </label>
          <select
            id="movement_type"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.movement_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.movement_type}
            onChange={handleChange}
          >
            <option value="global">Entrée / Sortie (Global)</option>
            <option value="entree">Entrée</option>
            <option value="sortie">Sortie</option>
          </select>
          {errors.movement_type && <p className="text-sm text-red-600 mt-1">{errors.movement_type}</p>}
        </div>

        {/* Article */}
        <div className="mb-4">
          <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Article
          </label>
          <select
            id="article_id"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.article_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.article_id}
            onChange={handleChange}
          >
            <option value="">Tous les articles</option>
            {articles && articles.map(article => (
              <option key={article.id} value={String(article.id)}>
                {article.name}
              </option>
            ))}
          </select>
          {errors.article_id && <p className="text-sm text-red-600 mt-1">{errors.article_id}</p>}
        </div>

        {/* --- Nouveau Champ : Type de Fichier --- */}
        <div className="mb-4">
          <label htmlFor="file_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Format de Fichier
          </label>
          <select
            id="file_type"
            className={`h-11 w-full appearance-none rounded-lg border px-4 py-2.5 pr-11 text-sm shadow-theme-xs
              ${errors.file_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}
              bg-transparent placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
              dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={data.file_type}
            onChange={handleChange}
            required
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
          </select>
          {errors.file_type && <p className="text-sm text-red-600 mt-1">{errors.file_type}</p>}
        </div>
        {/* ------------------------------------- */}

        <div className="flex justify-end mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="destructive"
            className="mr-2"
            disabled={processing}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={processing}
          >
            {processing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Génération...
              </>
            ) : (
              'Générer le Rapport'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MovementHistoryPDFExcelModal;