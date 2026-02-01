import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';
import UserBoutiqueFormModal from '../../../components/Modals/Boutique_Modals/Users/UserBoutiqueFormModal'; // Assurez-vous du chemin
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faSearch, 
    faPlus, 
    faEdit, 
    faTrash, 
    faStore, 
    faCashRegister, 
    faUserTag,
    faIdCard
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

const UserBoutiqueIndex = ({ users, roles, agencies, boutiques, counters, filters }) => {
    // --- États ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    console.log(counters)
    // --- Gestion Recherche ---
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('users.index'), { search }, { preserveState: true });
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
                // Note : Assurez-vous que la route correspond à destroy_boutique
                router.delete(route('users.destroy', user.id), {
                    onSuccess: () => Swal.fire('Archivé!', 'L\'utilisateur a été archivé.', 'success')
                });
            }
        });
    };

    // --- Helper pour Badge Rôle ---
    const getRoleBadge = (roleName) => {
        if (!roleName) return null;
        if (roleName.toLowerCase().includes('commercial')) {
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 border border-orange-200">Commercial</span>;
        }
        if (roleName.toLowerCase().includes('magasin')) {
            return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">Magasinier</span>;
        }
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">{roleName}</span>;
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

            {/* --- Barre de Recherche --- */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSearch} className="relative max-w-md">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Rechercher par nom, email ou matricule..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm focus:ring-brand-500"
                    />
                </form>
            </div>

            {/* --- Tableau des Utilisateurs --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
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
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                                    
                                    {/* Identité */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold uppercase text-sm">
                                                {user.first_name[0]}{user.last_name[0]}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                                <div className="text-xs text-gray-400">{user.phone_number}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Rôle */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-start gap-1">
                                            {getRoleBadge(user.role?.name)}
                                            {user.code && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <FontAwesomeIcon icon={faIdCard} className="text-gray-400"/> 
                                                    {user.code}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Boutique */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                            <FontAwesomeIcon icon={faStore} className="text-gray-400"/>
                                            {user.boutique ? user.boutique.name : <span className="text-red-400 italic">Non assigné</span>}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 pl-6">
                                            Agence: {user.agency?.name}
                                        </div>
                                    </td>

                                    {/* Caisse (Si commercial) */}
                                    <td className="px-6 py-4">
                                        {user.role?.name === 'commercial' ? (
                                            user.counter ? (
                                                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-lg w-fit">
                                                    <FontAwesomeIcon icon={faCashRegister}/>
                                                    {user.counter.name}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faCashRegister}/> Aucune Caisse !
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-xs text-gray-300 italic">N/A</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                    Aucun utilisateur trouvé.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Intégration de la Modale --- */}
            <UserBoutiqueFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                roles={roles}
                agencies={agencies}
                boutiques={boutiques} // On passe les boutiques à la modale
                counters={counters}
                routeName={selectedUser ? 'users.update_boutique' : 'users.store_boutique'} // Adaptation dynamique des routes
            />
        </div>
    );
};

UserBoutiqueIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default UserBoutiqueIndex;