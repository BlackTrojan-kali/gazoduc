import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { usePage, router } from "@inertiajs/react";

export default function NotificationDropdown() {
  const { auth } = usePage().props;
  const initialUnreadNotifications = auth.user.notifications || [];
  const [isOpen, setIsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(initialUnreadNotifications);

  const hasUnreadNotifications = unreadNotifications.length > 0;

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  const handleMarkAsRead = (id) => {
    router.post(route('notifications.markAsRead', { notification: id }), {}, {
      onSuccess: () => {
        setUnreadNotifications(
          unreadNotifications.filter((notif) => notif.id !== id)
        );
      },
      preserveState: true,
    });
  };

  const handleMarkAllAsRead = () => {
    router.post(route('notifications.markAllAsRead'), {}, {
      onSuccess: () => {
        setUnreadNotifications([]);
      },
      preserveState: true,
    });
  };

  return (
    <div className="relative">
      {/* Bouton de la cloche avec indicateur */}
      <button
        className="relative p-2 text-gray-700 rounded-full hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        onClick={handleClick}
      >
        <span
          className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 ${
            !hasUnreadNotifications ? "hidden" : "block"
          }`}
        ></span>
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 15h12a1 1 0 00.707-1.707L14 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
          />
        </svg>
      </button>

      {/* Menu déroulant des notifications */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 z-50 w-80 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h5 className="font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          {hasUnreadNotifications && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <ul className="max-h-[300px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notif) => (
              <li key={notif.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <DropdownItem className="flex items-start p-4 space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white text-xs font-bold rounded-full bg-blue-500">
                    {notif.type.substring(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-0.5">
                      {notif.data.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {notif.created_at} {/* ou une autre propriété de temps */}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-auto">
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-1 text-xs font-semibold text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </DropdownItem>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Vous n'avez aucune notification non lue.
            </li>
          )}
        </ul>
      </Dropdown>
    </div>
  );
}