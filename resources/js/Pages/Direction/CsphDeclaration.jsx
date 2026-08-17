import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DirLayout from '../../layout/DirLayout/DirLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFilter, faGasPump, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import ManualCsphModal from '../../components/Modals/Direction/ManualCsphModal'; 

// NOUVEAU : Ajout de 'cities' dans les props
const CsphDeclaration = ({ reportData, grandTotal, totalTonnes, startDate, endDate, cities }) => {
    const [filterStart, setFilterStart] = useState(startDate);
    const [filterEnd, setFilterEnd] = useState(endDate);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('direction.csph.index'), { 
            start_date: filterStart, 
            end_date: filterEnd 
        }, { preserveState: true });
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('fr-FR').format(amount);
    const formatWeight = (amount) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 4 }).format(amount);

    const pdfExportUrl = `${route('direction.csph.export')}?start_date=${filterStart}&end_date=${filterEnd}`;
    let currentVille = '';

    return (
        <>
            <Head title="Déclaration Ventes CSPH" />
            <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <span className="bg-brand-600 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-lg">
                                <FontAwesomeIcon icon={faGasPump} />
                            </span>
                            Déclaration Péréq. Transport CSPH
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 ml-14">
                            État récapitulatif basé sur les ventes réelles facturées sur une période donnée.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => setIsManualModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition">
                            <FontAwesomeIcon icon={faEdit} /> Saisie Manuelle
                        </button>

                        <a href={pdfExportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-600 text-white px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-red-700 transition">
                            <FontAwesomeIcon icon={faFilePdf} /> Document Officiel
                        </a>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                            <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} className="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 h-[42px]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                            <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} className="rounded-lg border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 h-[42px]" />
                        </div>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 h-[42px]">
                            <FontAwesomeIcon icon={faFilter} /> Filtrer les ventes
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-100 dark:bg-gray-700">
                                <TableRow>
                                    <TableCell isHeader>Ville</TableCell>
                                    <TableCell isHeader>Gaz (Source & Type)</TableCell>
                                    <TableCell isHeader className="text-right">Quantités (T)</TableCell>
                                    <TableCell isHeader className="text-right">Taux</TableCell>
                                    <TableCell isHeader className="text-right">Total</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.length > 0 ? (
                                    reportData.map((ligne, index) => {
                                        const showVille = ligne.ville !== currentVille;
                                        currentVille = ligne.ville;
                                        return (
                                            <TableRow key={index} className="border-b border-gray-100 dark:border-gray-700">
                                                <TableCell className={`font-bold ${showVille ? 'text-gray-900 dark:text-white' : 'text-transparent border-t-0'}`}>
                                                    {showVille ? ligne.ville : ''}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-gray-800 dark:text-gray-200 font-medium">{ligne.source}</div>
                                                    <div className="text-xs text-gray-500">{ligne.type}</div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-gray-600 dark:text-gray-300">{formatWeight(ligne.quantite)}</TableCell>
                                                <TableCell className={`text-right font-mono ${ligne.taux < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>{formatCurrency(ligne.taux)}</TableCell>
                                                <TableCell className={`text-right font-mono font-bold ${ligne.total < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{formatCurrency(ligne.total)}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            Aucune vente enregistrée.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {reportData.length > 0 && (
                                    <TableRow className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
                                        <TableCell colSpan={2} className="text-right font-bold text-lg text-gray-900 dark:text-white">TOTAL :</TableCell>
                                        <TableCell className="text-right font-bold font-mono text-gray-900 dark:text-white">{formatWeight(totalTonnes)} T</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className={`text-right font-bold font-mono text-lg ${grandTotal < 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>{formatCurrency(grandTotal)} FCFA</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* NOUVEAU : On passe la liste des villes à la modale */}
            <ManualCsphModal 
                isOpen={isManualModalOpen} 
                onClose={() => setIsManualModalOpen(false)} 
                cities={cities} 
            />
        </>
    );
};

CsphDeclaration.layout = (page) => <DirLayout children={page} />;
export default CsphDeclaration;