import React from "react";

const TextArea = ({
  placeholder = "Enter your message",
  rows = 3,
  value = "",
  onChange, // Cette prop doit recevoir l'événement complet
  className = "",
  disabled = false,
  errorMessage = "",
  hint = "",
}) => {
  const hasError = !!errorMessage;

  // Modifiez cette fonction pour passer l'événement `e` directement au parent
  const handleChange = (e) => {
    if (onChange) {
      onChange(e); // <-- Passez l'événement `e` complet au parent
    }
  };

  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className} `;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed opacity40 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (hasError) {
    textareaClasses += ` bg-transparent  border-red-500 focus:border-red-500 focus:ring-3 focus:ring-red-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-red-800`;
  } else {
    textareaClasses += ` bg-transparent text-gray-900 dark:text-gray-300 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={handleChange} // Appelle la handleChange interne
        disabled={disabled}
        className={textareaClasses}
      />
      {hasError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
      {hint && !hasError && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;