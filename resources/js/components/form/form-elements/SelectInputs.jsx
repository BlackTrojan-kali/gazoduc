// C'est un exemple de votre composant 'Select.jsx' ou 'SelectInput.jsx'
// Assurez-vous qu'il gère les props 'options', 'value', 'onChange', 'placeholder', 'disabled', 'error', 'hint'.

import React from 'react';

const Select = ({ id, name, value, onChange, disabled, error, hint, options, placeholder, className = '' }) => {
  return (
    <div>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`mt-1  block w-full  rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
          error ? 'border-red-500' : ''
        } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options && options.map((option) => (
          <option   key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && <p className={`mt-1.5 text-xs ${error ? 'text-error-500 dark:text-error-400' : 'text-gray-500 dark:text-gray-400'}`}>{hint}</p>}
    </div>
  );
};

export default Select;