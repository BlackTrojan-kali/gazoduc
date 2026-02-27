import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Select from 'react-select';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import UserBoutiqueFormModal from '../../../components/Modals/Boutique_Modals/Users/UserBoutiqueFormModal'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faSearch, 
    faPlus, 
    faEdit, 
    faTrash, 
    faStore, 
    faCashRegister, 
    faIdCard,
    faFilter
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../../components/ui/button/Button';
import Swal from 'sweetalert2';
import { debounce } from 'lodash';

const UserBoutiqueIndex = ({ users, roles, agencies, boutiques, counters, filters }) => {
    // --- États ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    // --- Préparation des Options pour React-Select ---
    const roleOptions = roles.map(r => ({ value: r.id, label: r.name.charAt(0).toUpperCase() + r.name.slice(1) }));
    const boutiqueOptions = boutiques.map(b => ({ value: b.id, label: b.name }));

    // --- États pour les filtres ---
    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(roleOptions.find(o => o.value == filters.role_id) || null);
    const [selectedBoutique, setSelectedBoutique] = useState(boutiqueOptions.find(o => o.value == filters.boutique_id) || null);

    // --- Styles communs pour React-Select (Dark Mode compatible) ---
    const rsClassNames = {
        control: (state) => 
            `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-colors text-sm min-h-[38px] ${
                state.isFocused ? 'ring-1 ring-brand-500 border-brand-500' : 'hover:border-gray-300 dark:hover:border-gray-600'
            }`,
        menu: () => 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md mt-1 z-50 text-sm',
        option: (state) => `px-3 py-2 cursor-pointer ${
            state.isSelected ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium' 
            : state.isFocused ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
            : 'text-gray-700 dark:text-gray-300'
        }`,
        singleValue: () => 'text-gray-900 dark:text-gray-100',
        placeholder: () => 'text-gray-400 dark:text-gray-500',
        input: () => 'text-gray-900 dark:text-gray-100',
    };
    
    const rsStyles = {
        control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
        menu: (base) => ({ ...base, backgroundColor: 'transparent' }),
        option: (base) => ({ ...base, backgroundColor: 'transparent', color: 'inherit' }),
        singleValue: (base) => ({ ...base, color: 'inherit' })
    };

    // --- Gestion des filtres ---
    const handleFilter = () => {
        router.get(route('boutique_users.index'), { // Assurez-vous que c'est la bonne route
            search: search,
            role_id: selectedRole?.value || '',
            boutique_id: selectedBoutique?.value || '',
        }, { preserveState: true, replace: true });
    };

    // Recherche avec debounce pour ne pas nécessiter d'appuyer sur le bouton
    const debouncedSearch = React.useCallback(
        debounce((query) => {
             router.get(route('users.index'), { 
                search: query,
                role_id: selectedRole?.value || '',
                boutique_id: selectedBoutique?.value || '',
             }, { preserveState: true, replace: true });
        }, 300),
        [selectedRole, selectedBoutique]
    );

    const onSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    // --- Gestion Modale ---
    const openCreateModal = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // --- Gestion Suppression (Archivage) ---
    const handleDelete = (user) => {
        Swal.fire({
            title: 'Archiver cet utilisateur ?',
            text: `L'accès de ${user.first_name} ${user.last_name} sera suspendu.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, archiver',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('users.destroy', user.id), { // Assurez-vous que c'est la bonne route
                    onSuccess: () => Swal.fire('Archivé!', 'L\'utilisateur a été archivé.', 'success')
                });
            }
        });
    };

    // --- Helper pour Badge Rôle ---
    const getRoleBadge = (roleName) => {
        if (!roleName) return null;
        if (roleName.toLowerCase().includes('commercial')) {
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800">Commercial</span>;
        }
        if (roleName.toLowerCase().includes('magasin')) {
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800">Magasinier</span>;
        }
        if (roleName.toLowerCase().includes('controleur')) {
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800">Contrôleur</span>;
        }
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">{roleName}</span>;
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Utilisateurs Boutique" />

            {/* --- En-tête --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-brand-600"/>
                        Équipe Boutique
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Gestion des vendeurs, magasiniers et affectations caisses.
                    </p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faPlus} /> Nouvel Utilisateur
                </button>
            </div>

            {/* --- Barre de Filtres Avancée --- */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    
                    {/* Recherche Texte */}
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rechercher</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400 text-sm z-10" />
                            <input 
                                type="text" 
                                className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm min-h-[38px] focus:ring-brand-500 focus:border-brand-500 dark:text-white"
                                placeholder="Nom, email, matricule..."
                                value={search}
                                onChange={onSearchChange}
                            />
                        </div>
                    </div>

                    {/* Filtre Rôle */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rôle</label>
                        <Select 
                            options={roleOptions} value={selectedRole} onChange={setSelectedRole}
                            isClearable placeholder="Tous les rôles" classNames={rsClassNames} styles={rsStyles}
                        />
                    </div>

                    {/* Filtre Boutique */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Boutique</label>
                        <Select 
                            options={boutiqueOptions} value={selectedBoutique} onChange={setSelectedBoutique}
                            isClearable placeholder="Toutes les boutiques" classNames={rsClassNames} styles={rsStyles}
                        />
                    </div>

                    {/* Bouton Filtrer */}
                    <div>
                        <Button onClick={handleFilter} className="bg-brand-600 hover:bg-brand-700 text-white w-full h-[38px]">
                            <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filtrer
                        </Button>
                    </div>

                </div>
            </div>

            {/* --- Tableau des Utilisateurs --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Utilisateur</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Rôle & Matricule</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Affectation Boutique</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Caisse (Commercial)</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                        
                                        {/* Identité */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold uppercase text-sm shrink-0 border border-brand-200 dark:border-brand-800">
                                                    {user.first_name[0]}{user.last_name[0]}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{user.phone_number}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Rôle */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1.5">
                                                {getRoleBadge(user.role?.name)}
                                                {user.code && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                        <FontAwesomeIcon icon={faIdCard} className="text-gray-400"/> 
                                                        {user.code}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Boutique */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                                                <FontAwesomeIcon icon={faStore} className="text-gray-400"/>
                                                {user.boutique ? user.boutique.name : <span className="text-red-400 italic font-normal">Non assigné</span>}
                                            </div>
                                            {user.agency && (
                                                <div className="text-xs text-gray-400 mt-1 pl-6">
                                                    Agence: {user.agency.name}
                                                </div>
                                            )}
                                        </td>

                                        {/* Caisse (Si commercial) */}
                                        <td className="px-6 py-4">
                                            {user.role?.name === 'commercial' ? (
                                                user.counter ? (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-1 rounded-md w-fit border border-green-200 dark:border-green-800">
                                                        <FontAwesomeIcon icon={faCashRegister}/>
                                                        {user.counter.name}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faCashRegister}/> Aucune Caisse
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">N/A</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                    title="Modifier"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Archiver"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                 {/* --- Pagination --- */}
                 {users.links && users.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Affichage de <span className="font-semibold">{users.from}</span> à <span className="font-semibold">{users.to}</span> sur <span className="font-semibold">{users.total}</span>
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
                            {users.links.map((link, k) => (
                                <button
                                    key={k}
                                    onClick={() => {
                                        if (link.url) {
                                            router.get(link.url, {
                                                search: search,
                                                role_id: selectedRole?.value || '',
                                                boutique_id: selectedBoutique?.value || '',
                                            }, { preserveState: true });
                                        }
                                    }}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${
                                        link.active 
                                        ? 'bg-brand-600 text-white shadow-sm' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Intégration de la Modale --- */}
            <UserBoutiqueFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                roles={roles}
                agencies={agencies}
                boutiques={boutiques} 
                counters={counters}
                routeName={selectedUser ? 'users.update_boutique' : 'users.store_boutique'} 
            />
        </div>
    );
};

UserBoutiqueIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default UserBoutiqueIndex;