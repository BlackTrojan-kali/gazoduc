// resources/js/components/Modals/Tranferts/ArticlesSelectionModal.jsx

import React, { useState, useEffect, useCallback, memo } from 'react';
import Modal from '../Modal';
import Input from '../../form/input/InputField';
import Label from '../../form/Label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';

// Composant pour une ligne d'article individuelle.
// Nous utilisons React.memo pour éviter les re-rendus inutiles.
const ArticleItem = memo(({ article, quantity, onIncrement, onDecrement, onQuantityChange }) => {
  return (
    <div key={article.id} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 py-2">
      <Label className="text-gray-800 dark:text-white flex-1 mr-4">{article.name} ({article.unit})</Label>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onDecrement(article.id)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-l focus:outline-none transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>
        <Input
          type="number"
          min="0"
          value={quantity || ''}
          onChange={(e) => onQuantityChange(article.id, e.target.value)}
          className="w-24 text-center dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          inputClassName="text-center"
        />
        <button
          type="button"
          onClick={() => onIncrement(article.id)}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-r focus:outline-none transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  );
});

const ArticlesSelectionModal = ({ isOpen, onClose, articles, onSaveArticles, initialSelectedArticles }) => {
  const [selectedArticles, setSelectedArticles] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      initialSelectedArticles.forEach(item => {
        initial[item.article_id] = item.quantity;
      });
      setSelectedArticles(initial);
    } else {
      setSelectedArticles({});
    }
  }, [isOpen, initialSelectedArticles]);

  // J'utilise useCallback pour que ces fonctions ne soient recréées que si leurs dépendances changent.
  // Cela est important pour que React.memo fonctionne correctement sur ArticleItem.
  const handleQuantityChange = useCallback((articleId, quantity) => {
    const qte = Math.max(0, parseInt(quantity, 10) || 0);
    setSelectedArticles(prev => {
      const newState = { ...prev };
      if (qte > 0) {
        newState[articleId] = qte;
      } else {
        delete newState[articleId];
      }
      return newState;
    });
  }, []);

  const handleIncrement = useCallback((articleId) => {
    setSelectedArticles(prev => {
      const currentQuantity = prev[articleId] || 0;
      return { ...prev, [articleId]: currentQuantity + 1 };
    });
  }, []);

  const handleDecrement = useCallback((articleId) => {
    setSelectedArticles(prev => {
      const currentQuantity = prev[articleId] || 0;
      if (currentQuantity > 1) { // Correction: décrémenter tant que la quantité est > 1
        return { ...prev, [articleId]: currentQuantity - 1 };
      }
      // Si la quantité est 1, on la passe à 0, ce qui la supprime.
      if (currentQuantity === 1) {
          const newState = { ...prev };
          delete newState[articleId];
          return newState;
      }
      // Sinon, on ne fait rien
      return prev;
    });
  }, []);

  const handleSubmit = () => {
    const formattedArticles = Object.keys(selectedArticles).map(articleId => ({
      article_id: parseInt(articleId, 10),
      quantity: selectedArticles[articleId],
    }));
    onSaveArticles(formattedArticles);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sélectionner les Articles et Quantités">
      <div className="space-y-4 max-h-96 overflow-y-auto p-2">
        {articles.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Aucun article disponible.</p>
        ) : (
          articles.map(article => (
            <ArticleItem
              key={article.id}
              article={article}
              quantity={selectedArticles[article.id]}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onQuantityChange={handleQuantityChange}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b dark:border-gray-700 mt-4">
        <button
          type="button"
          className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
          onClick={onClose}
        >
          Annuler
        </button>
        <button
          type="button"
          className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
          onClick={handleSubmit}
        >
          Confirmer la sélection
        </button>
      </div>
    </Modal>
  );
};

export default ArticlesSelectionModal;
