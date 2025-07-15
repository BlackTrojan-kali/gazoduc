import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react"; // <--- IMPORT usePage HERE

import { useSidebar } from "../../context/SidebarContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faDashboard, faDotCircle, faDriversLicense, faGlobe,  faRepeat,  faUser,  } from "@fortawesome/free-solid-svg-icons";


const navItems = [
  {
    icon:  <FontAwesomeIcon icon={faDashboard} />,
    name: "Dashboard",
    subItems: [
      { name:"Stocks", path: "/magasin-index", pro: false },
      { name: "citernes", path: "/magasin-citernes", pro: false },
    ],
  },
  {
    icon:  <FontAwesomeIcon icon={faRepeat} />,
    name: "Mouvements",
      subItems: [
      { name: "entrees", path: "/magasin-moves/entree", pro: false },
      { name: "sorties", path: "/magasin-moves/sortie", pro: false },
      { name: "releves", path: "/releves", pro: false },
      { name: "depotages", path: "/depotages", pro: false },
      { name: "reception", path: "/receptions", pro: false },
    ],
  },
  {
    icon:  <FontAwesomeIcon icon={faDriversLicense} />,
    name: "Bordereaux de Route",
    subItems: [
      { name: "liste", path: "/magasin-route", pro: false },
    ],
  },
 
];

const othersItems= [
  { icon:  <FontAwesomeIcon icon={faUser} />,
    name: "Users",
    subItems: [-
      { name: "Regional", path: "/regional", pro: false },
      { name: "Magasin", path: "/magasin", pro: false },
      { name: "Production", path: "/production", pro: false },
      { name: "Commercial", path: "/commercial", pro: false },
    ],
  }
];

const MagSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { url } = usePage(); // <--- GET CURRENT URL FROM INERTIA
  const {auth} = usePage().props
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  // --- CORRECTED isActive FUNCTION ---
  const isActive = useCallback((path) => {
    // This checks if the current URL exactly matches or starts with the path
    // For example, if current URL is '/dashboard/ecommerce' and path is '/', it will be active.
    // Adjust logic if you need exact match for parent items vs. startsWith for sub-items.
    return url === path || url.startsWith(path + '/'); // Simplified to handle common cases
  }, [url]); // <--- DEPENDENCY ON URL

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType, // <--- ENSURE TYPE IS SET
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [isActive]); // <--- Dependency on isActive, which depends on url

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <FontAwesomeIcon icon={faChevronDown}
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link // <--- CORRECTED: use Link
                href={nav.path} // <--- CORRECTED: use href
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link // <--- CORRECTED: use Link
                      href={subItem.path} // <--- CORRECTED: use href
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/"> {/* <--- CORRECTED: use href */}
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src={"/images/clients/"+auth.user.entreprice.logo_path}
                alt="Logo"
                width={80}
                height={40}
              />
              <img
                className="hidden dark:block"
                src={"/images/clients/"+auth.user.entreprice.logo_path}
                alt="Logo"
                width={80}
                height={40}
              />
            </>
          ) : (
            <img
                src={"/images/clients/"+auth.user.entreprice.logo_path}
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>

      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>

          <h1 className="text-2xl dark:text-white ">{auth.user.entreprice.name}</h1>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <FontAwesomeIcon icon={faDotCircle} className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Users"
                ) : (
                  <FontAwesomeIcon icon={faDotCircle} /> 
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default MagSidebar;