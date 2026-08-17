// resources/js/Components/Modal.jsx

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ 
    isOpen, 
    onClose, 
    children, 
    title, 
    maxWidth = '2xl' // Valeur par défaut
}) => {

  // --- Gestion de la touche Échap ---
  useEffect(() => {
    const closeOnEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.addEventListener('keydown', closeOnEscapeKey);
    return () => {
      document.body.removeEventListener('keydown', closeOnEscapeKey);
    };
  }, [onClose]);

  // --- Mapping des tailles Tailwind ---
  const maxWidthClass = {
    'sm': 'sm:max-w-sm',
    'md': 'sm:max-w-md',
    'lg': 'sm:max-w-lg',
    'xl': 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
    '6xl': 'sm:max-w-6xl',
    '7xl': 'sm:max-w-7xl', // Celui dont vous avez besoin
    'full': 'sm:max-w-full',
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-gray-900/50 dark:bg-black/60  transition-all"
      onClick={onClose} // Ferme la modale si on clique sur le fond gris
    >
      <div
        // On applique ici la classe de largeur dynamique
        className={`relative w-full ${maxWidthClass[maxWidth]} mx-auto my-6 px-4 transition-all transform`}
        onClick={e => e.stopPropagation()} // Empêche la fermeture si on clique DANS la modale
      >
        {/* Contenu de la modale */}
        <div className="relative flex flex-col w-full bg-white border-0 rounded-xl shadow-2xl outline-none focus:outline-none dark:bg-gray-800 dark:border dark:border-gray-700">
          
          {/* En-tête de la modale */}
          <div className="flex items-center justify-between p-5 border-b border-solid border-gray-200 rounded-t dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-500 hover:text-gray-800 float-right text-3xl leading-none font-semibold outline-none focus:outline-none dark:text-gray-400 dark:hover:text-white transition-colors"
              onClick={onClose}
            >
              <span className="block w-6 h-6 text-2xl bg-transparent outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>

          {/* Corps de la modale */}
          <div className="relative p-6 flex-auto max-h-[85vh] overflow-y-auto">
            {children}
          </div>
          
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;