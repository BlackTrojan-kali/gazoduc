import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, usePage } from "@inertiajs/react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { auth } = usePage().props;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      {/* Bouton du menu utilisateur */}
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <span className="w-9 h-9 overflow-hidden rounded-full mr-2">
          {/* Si vous avez une image d'avatar, utilisez la source de l'utilisateur */}
          <img src="/images/admin.png" alt="User" className="w-full h-full object-cover" />
        </span>
        <span className="block font-medium text-sm">{auth.user.last_name}</span>
        <svg
          className={`w-4 h-4 ml-1 fill-current transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>

      {/* Menu déroulant */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <div className="p-4 text-center border-b border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">{auth.user.first_name} {auth.user.last_name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{auth.user.role}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{auth.user.email}</p>
          {auth.user.agency?.name && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{auth.user.agency.name}</p>
          )}
        </div>

        <div className="p-2">
          <Link
            href={route("logout")}
            method="post" // Important pour la déconnexion
            as="button" // Permet à Inertia de gérer la requête en tant que POST
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-red-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Déconnexion
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}