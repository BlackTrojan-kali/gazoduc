import React, { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import Select from 'react-select';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCashRegister, 
    faSearch, 
    faFilter, 
    faEye, 
    faStoreAlt,
    faUser,
    faClock,
    faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../../components/ui/button/Button'; // Adaptez le chemin
import DirBoutiqueLayout from '../../../layout/DirBoutiqueLayout/DirBoutiqueLayout';

const SessionIndex = ({ sessions, boutiques, filters }) => {
    // --- Options pour React-Select ---
    const boutiqueOptions = boutiques.map(b => ({ value: b.id, label: b.name }));
    const statusOptions = [
        { value: 'ouvert', label: 'En cours (Ouvert)' },
        { value: 'ferme', label: 'Clôturé (Fermé)' }
    ];

    // --- États des filtres ---
    const [search, setSearch] = useState(filters.search || '');
    const [selectedBoutique, setSelectedBoutique] = useState(boutiqueOptions.find(o => o.value == filters.boutique_id) || null);
    const [selectedStatus, setSelectedStatus] = useState(statusOptions.find(o => o.value == filters.status) || null);
    const [dateStart, setDateStart] = useState(filters.date_start || '');
    const [dateEnd, setDateEnd] = useState(filters.date_end || '');

    // --- Styles React-Select (Dark Mode) ---
    const rsClassNames = {
        control: (state) => `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-sm min-h-[38px] ${state.isFocused ? 'ring-1 ring-brand-500 border-brand-500' : ''}`,
        menu: () => 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md mt-1 z-50 text-sm',
        option: (state) => `px-3 py-2 cursor-pointer ${state.isSelected ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-medium' : state.isFocused ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`,
        singleValue: () => 'text-gray-900 dark:text-gray-100',
        placeholder: () => 'text-gray-400 dark:text-gray-500',
    };
    const rsStyles = {
        control: (base) => ({ ...base, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }),
        menu: (base) => ({ ...base, backgroundColor: 'transparent' }),
        option: (base) => ({ ...base, backgroundColor: 'transparent', color: 'inherit' }),
        singleValue: (base) => ({ ...base, color: 'inherit' })
    };

    // --- Gestion du filtrage ---
    const applyFilters = () => {
        router.get(route('pos-sessions.index'), {
            search,
            boutique_id: selectedBoutique?.value || '',
            status: selectedStatus?.value || '',
            date_start: dateStart,
            date_end: dateEnd,
        }, { preserveState: true, replace: true });
    };

    const debouncedSearch = useCallback(
        debounce((query) => {
            router.get(route('pos-sessions.index'), {
                search: query,
                boutique_id: selectedBoutique?.value || '',
                status: selectedStatus?.value || '',
                date_start: dateStart,
                date_end: dateEnd,
            }, { preserveState: true, replace: true });
        }, 300),
        [selectedBoutique, selectedStatus, dateStart, dateEnd]
    );

    const onSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    // --- Formatage (Date et Monnaie) ---
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Historique des Caisses" />

            {/* --- En-tête --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faCashRegister} className="text-brand-600"/>
                        Historique des Sessions de Caisse
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Surveillez les ouvertures, fermetures et fonds de caisse de vos commerciaux.
                    </p>
                </div>
            </div>

            {/* --- Barre de Filtres Avancée --- */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    {/* Recherche */}
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Caissier / ID</label>
                        <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-gray-400 text-sm z-10" />
                            <input 
                                type="text" 
                                className="pl-9 w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm min-h-[38px] focus:ring-brand-500 dark:text-white"
                                placeholder="Nom..."
                                value={search}
                                onChange={onSearchChange}
                            />
                        </div>
                    </div>

                    {/* Filtre Boutique */}
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Boutique</label>
                        <Select 
                            options={boutiqueOptions} value={selectedBoutique} onChange={setSelectedBoutique}
                            isClearable placeholder="Toutes..." classNames={rsClassNames} styles={rsStyles}
                        />
                    </div>

                    {/* Filtre Statut */}
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Statut</label>
                        <Select 
                            options={statusOptions} value={selectedStatus} onChange={setSelectedStatus}
                            isClearable placeholder="Tous..." classNames={rsClassNames} styles={rsStyles}
                        />
                    </div>

                    {/* Filtres Dates */}
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Du</label>
                        <input 
                            type="date" 
                            className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm min-h-[38px] dark:text-white"
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Au</label>
                        <input 
                            type="date" 
                            className="w-full rounded-lg border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm min-h-[38px] dark:text-white"
                            value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)}
                        />
                    </div>

                    {/* Bouton Filtrer */}
                    <div className="lg:col-span-1">
                        <Button onClick={applyFilters} className="bg-brand-600 hover:bg-brand-700 text-white w-full h-[38px]">
                            <FontAwesomeIcon icon={faFilter} className="mr-2" /> Filtrer
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- Tableau --- */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Session & Caissier</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Boutique</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ouverture</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fermeture</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Statut</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {sessions.data.length > 0 ? sessions.data.map((session) => (
                                <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                                    
                                    {/* Caissier & ID */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm shrink-0">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {session.user ? `${session.user.first_name} ${session.user.last_name}` : 'Inconnu'}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                    Session #{session.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Boutique */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-200 font-medium">
                                            <FontAwesomeIcon icon={faStoreAlt} className="text-gray-400" />
                                            {session.boutique ? session.boutique.name : 'N/A'}
                                        </div>
                                    </td>

                                    {/* Ouverture */}
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs"/>
                                            {formatDate(session.opened_at)}
                                        </div>
                                        <div className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1 mt-1">
                                            <FontAwesomeIcon icon={faMoneyBillWave}/>
                                            Fond: {formatCurrency(session.opening_balance)}
                                        </div>
                                    </td>

                                    {/* Fermeture */}
                                    <td className="px-6 py-4">
                                        {session.closed_at ? (
                                            <>
                                                <div className="text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                                    <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs"/>
                                                    {formatDate(session.closed_at)}
                                                </div>
                                                <div className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 mt-1">
                                                    <FontAwesomeIcon icon={faMoneyBillWave}/>
                                                    Caisse: {formatCurrency(session.closing_balance)}
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">En attente...</span>
                                        )}
                                    </td>

                                    {/* Statut */}
                                    <td className="px-6 py-4 text-center">
                                        {session.status === 'ouvert' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 animate-pulse border border-green-200 dark:border-green-800">
                                                En cours
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                Clôturé
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => router.get(route('pos-sessions.show', session.id))}
                                            className="p-2 text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
                                            title="Consulter les détails"
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                        Aucune session de caisse trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                {sessions.links && sessions.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Affichage de <span className="font-semibold">{sessions.from}</span> à <span className="font-semibold">{sessions.to}</span> sur <span className="font-semibold">{sessions.total}</span>
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
                            {sessions.links.map((link, k) => (
                                <button
                                    key={k}
                                    onClick={() => link.url && router.get(link.url, { search, boutique_id: selectedBoutique?.value, status: selectedStatus?.value, date_start: dateStart, date_end: dateEnd }, { preserveState: true })}
                                    disabled={!link.url || link.active}
                                    className={`px-3 py-1.5 rounded text-sm whitespace-nowrap transition-colors ${link.active ? 'bg-brand-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

SessionIndex.layout = (page) => <DirBoutiqueLayout children={page} />;

export default SessionIndex;