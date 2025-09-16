// resources/js/Components/Modal.jsx

import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children, title }) => {

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-gray-900/20 dark:bg-white/10 bg-opacity-70"
      // Optionnel: Fermer la modale si l'on clique en dehors du contenu
     
    >
      {/*
        Le conteneur interne de la modale.
        Le 'mx-auto' et 'my-auto' sont utilisés ici car ils agissent sur le contenu
        plutôt que sur la modale elle-même.
        Le 'onClick={e => e.stopPropagation()}' empêche la fermeture de la modale
        lorsque l'on clique sur son contenu.
      */}
      <div
        className="relative w-full max-w-lg mx-auto my-auto" // <<<--- Modifications ici
        onClick={e => e.stopPropagation()} // Important pour éviter la fermeture au clic sur le contenu
      >
        {/* Contenu de la modale */}
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none dark:bg-gray-800">
          {/* En-tête de la modale */}
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <button
              className="p-1 ml-auto bg-transparent border-0 text-gray-700 float-right text-3xl leading-none font-semibold outline-none focus:outline-none dark:text-gray-400"
              onClick={onClose}
            >
              <span className="text-gray-700 h-6 w-6 text-2xl block outline-none focus:outline-none dark:text-gray-400">
                ×
              </span>
            </button>
          </div>
          {/* Corps de la modale */}
          <div className=" relative p-6 flex-auto">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;