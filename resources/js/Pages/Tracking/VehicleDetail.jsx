import React, { useMemo } from 'react'; // Adaptez le chemin selon votre structure réelle
import { Head, Link } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, 
    faGasPump, 
    faTachometerAlt, 
    faClock, 
    faExclamationTriangle,
    faMapMarkedAlt,
    faChartLine
} from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import DirLayout from '../../layout/DirLayout/DirLayout';

// --- Configuration ChartJS ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- Fix Icônes Leaflet (Problème connu avec Webpack/Vite) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VehicleDetail = ({ vehicule, path, chartData, alerts }) => {

    // --- 1. Préparation des données Graphique ---
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Permet de remplir le conteneur CSS
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#94a3b8' // Slate-400 (Lisible Dark & Light)
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)', // Slate-900
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(148, 163, 184, 0.1)' }, // Grille très légère
                ticks: { color: '#94a3b8' }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Carburant (L)', color: '#ef4444' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                ticks: { color: '#94a3b8' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Vitesse (km/h)', color: '#3b82f6' },
                grid: { drawOnChartArea: false }, // Pas de grille pour l'axe de droite
                ticks: { color: '#94a3b8' }
            },
        },
    };

    const dataGraph = {
        labels: chartData.map(d => d.time),
        datasets: [
            {
                label: 'Carburant',
                data: chartData.map(d => d.fuel),
                borderColor: '#ef4444', // Rouge
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                yAxisID: 'y',
                fill: true,
                tension: 0.3,
                pointRadius: 0, // Points invisibles sauf au survol
                pointHoverRadius: 6
            },
            {
                label: 'Vitesse',
                data: chartData.map(d => d.speed),
                borderColor: '#3b82f6', // Bleu
                backgroundColor: 'rgba(59, 130, 246, 0.0)',
                yAxisID: 'y1',
                borderDash: [5, 5],
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 6
            },
        ],
    };

    // --- 2. Préparation Carte ---
    const polylinePositions = path.map(p => [p.latitude, p.longitude]);
    const lastPosition = polylinePositions.length > 0 
        ? polylinePositions[polylinePositions.length - 1] 
        : [3.8480, 11.5021]; // Yaoundé par défaut

    // --- Rendu ---
    return (
        <>
            <Head title={`Détail - ${vehicule.brand}`} />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative p-4 lg:p-6 space-y-6">
                
                {/* Fond Texturé */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>

                {/* --- HEADER --- */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('tracking.dashboard')} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                {vehicule.brand} 
                                <span className="text-slate-400 font-normal text-base">| {vehicule.licence_plate}</span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                                    IMEI: {vehicule.gps_device?.imei || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FontAwesomeIcon icon={faClock} /> 
                                    MàJ: {vehicule.latest_position?.updated_at || '--'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* KPI Cards (Mini Dashboard) */}
                    <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="min-w-[120px] bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                            <div className="text-[10px] uppercase text-indigo-500 font-bold mb-1 flex items-center gap-1">
                                <FontAwesomeIcon icon={faGasPump} /> Niveau
                            </div>
                            <div className="text-xl font-bold text-slate-800 dark:text-white">
                                {Math.round(vehicule.latest_position?.fuel_level || 0)} <span className="text-xs font-normal text-slate-500">L</span>
                            </div>
                        </div>
                        
                        <div className="min-w-[120px] bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                            <div className="text-[10px] uppercase text-emerald-600 font-bold mb-1 flex items-center gap-1">
                                <FontAwesomeIcon icon={faTachometerAlt} /> Vitesse
                            </div>
                            <div className="text-xl font-bold text-slate-800 dark:text-white">
                                {Math.round(vehicule.latest_position?.speed || 0)} <span className="text-xs font-normal text-slate-500">km/h</span>
                            </div>
                        </div>

                        <div className="min-w-[120px] bg-slate-100 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Capacité</div>
                            <div className="text-xl font-bold text-slate-800 dark:text-white">
                                {vehicule.tank_capacity} <span className="text-xs font-normal text-slate-500">L</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MAIN GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                    
                    {/* COLONNE GAUCHE (1/3) : CARTE & HISTORIQUE */}
                    <div className="space-y-6">
                        {/* Carte */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-[350px] relative z-0">
                            <div className="absolute top-3 left-3 z-[1000] bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-lg text-xs font-bold shadow text-slate-700 dark:text-slate-200">
                                <FontAwesomeIcon icon={faMapMarkedAlt} className="mr-2" />
                                Parcours (24h)
                            </div>
                            <MapContainer center={lastPosition} zoom={13} className="h-full w-full" scrollWheelZoom={false}>
                                <TileLayer 
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                                    attribution='&copy; OpenStreetMap'
                                />
                                {polylinePositions.length > 0 && (
                                    <>
                                        <Polyline positions={polylinePositions} color="#3b82f6" weight={4} opacity={0.7} />
                                        <Marker position={lastPosition}>
                                            <Popup>Position Actuelle</Popup>
                                        </Marker>
                                        {/* Point de départ */}
                                        <Marker position={polylinePositions[0]} opacity={0.5}>
                                            <Popup>Début (il y a 24h)</Popup>
                                        </Marker>
                                    </>
                                )}
                            </MapContainer>
                        </div>

                        {/* Liste des Alertes */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500" />
                                Journal d'Alertes
                            </h3>
                            
                            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {alerts.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm italic">
                                        R.A.S. Aucune anomalie détectée.
                                    </div>
                                ) : (
                                    alerts.map(alert => (
                                        <div key={alert.id} className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                            <div className="mt-1 text-red-500">
                                                <FontAwesomeIcon icon={faExclamationTriangle} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-red-700 dark:text-red-400">
                                                    Perte suspecte: -{alert.volume_lost} L
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    De {alert.level_before}L à {alert.level_after}L
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                                    {new Date(alert.detected_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE (2/3) : GRAPHIQUE ANALYTIQUE */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 h-full min-h-[500px] flex flex-col">
                            
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        <FontAwesomeIcon icon={faChartLine} className="text-indigo-500" />
                                        Analyse Croisée
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Corrélation entre Vitesse (Bleu) et Niveau de Carburant (Rouge)
                                    </p>
                                </div>
                                <select className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300">
                                    <option>Dernières 24h</option>
                                    <option>7 jours</option>
                                    <option>30 jours</option>
                                </select>
                            </div>

                            {/* Zone Graphique responsive */}
                            <div className="flex-1 w-full relative">
                                <Line options={chartOptions} data={dataGraph} />
                            </div>

                            {/* Légende Explicative */}
                            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex gap-3 items-start">
                                <span className="text-amber-500 text-lg">💡</span>
                                <div className="text-xs text-slate-600 dark:text-slate-300">
                                    <strong>Comment détecter un vol ?</strong><br/>
                                    Observez les zones où la <span className="text-red-500 font-bold">Ligne Rouge (Carburant)</span> descend verticalement alors que la <span className="text-blue-500 font-bold">Ligne Bleue (Vitesse)</span> est à plat (0 km/h). Cela indique une vidange à l'arrêt.
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

// Layout
VehicleDetail.layout = page => <DirLayout children={page} />;

export default VehicleDetail;