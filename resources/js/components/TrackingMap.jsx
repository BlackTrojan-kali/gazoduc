import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 1. Configuration des icônes dynamiques (SVG)
// C'est plus léger que des images PNG et on peut changer la couleur facilement
const getIcon = (status, hasAlert) => {
    let color = '#3B82F6'; // Bleu (Défaut)
    
    if (hasAlert) color = '#EF4444'; // Rouge (Alerte !)
    else if (status === 'MOVING') color = '#10B981'; // Vert (Roule)
    else if (status === 'OFFLINE') color = '#6B7280'; // Gris (Hors ligne)
    else if (status === 'IDLE') color = '#F59E0B'; // Orange (Arrêt)

    // SVG d'un camion
    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" class="w-8 h-8 drop-shadow-lg">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.8 0-1.6.8-1.6 1.6V16c0 .6.4 1 1 1h1" />
        <path d="M10 17h4" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="16.5" cy="17.5" r="2.5" />
      </svg>
    `;

    return L.divIcon({
        className: 'custom-icon', // On utilisera ce nom pour supprimer le carré blanc par défaut de Leaflet
        html: svgIcon,
        iconSize: [40, 40],
        iconAnchor: [20, 20], // Point d'ancrage au centre
        popupAnchor: [0, -20],
    });
};

// 2. Petit composant pour recentrer la carte automatiquement si la flotte bouge
const RecenterMap = ({ vehicles }) => {
    const map = useMap();
    useEffect(() => {
        if (vehicles.length > 0) {
            const bounds = L.latLngBounds(vehicles.map(v => [v.position.lat, v.position.lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [vehicles, map]);
    return null;
};

export default function TrackingMap({ vehicles }) {
    // Coordonnées par défaut : Yaoundé, Cameroun
    const defaultCenter = [3.8480, 11.5021];

    return (
        <div className="h-full w-full relative z-0">
             {/* MapContainer doit avoir une hauteur définie par le parent */}
            <MapContainer 
                center={defaultCenter} 
                zoom={7} 
                scrollWheelZoom={true} 
                className="h-full w-full rounded-lg shadow-inner"
            >
                {/* Fond de carte OpenStreetMap (Gratuit) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {vehicles.map((vehicle) => (
                    vehicle.position && (
                        <Marker 
                            key={vehicle.id} 
                            position={[vehicle.position.lat, vehicle.position.lng]}
                            icon={getIcon(vehicle.status, vehicle.alerts_count > 0)}
                        >
                            <Popup>
                                <div className="p-1 min-w-[150px]">
                                    <h3 className="font-bold text-gray-800 text-lg">{vehicle.name}</h3>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <p>🏁 Vitesse: <span className="font-semibold text-black">{Math.round(vehicle.position.speed)} km/h</span></p>
                                        <p>⛽ Carburant: <span className={`font-semibold ${vehicle.fuel_level < 50 ? 'text-red-600' : 'text-green-600'}`}>{Math.round(vehicle.fuel_level)} L</span></p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Mis à jour {vehicle.position.updated_at}
                                        </p>
                                    </div>
                                    
                                    {/* Bouton d'action */}
                                    <a href={`/tracking/${vehicle.id}`} className="block mt-2 text-center bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700">
                                        Voir historique
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                <RecenterMap vehicles={vehicles} />
            </MapContainer>
            
            {/* Légende flottante */}
            <div className="absolute bottom-5 right-5 bg-white p-3 rounded shadow-lg z-[1000] text-xs">
                <div className="flex items-center mb-1"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> En route</div>
                <div className="flex items-center mb-1"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span> À l'arrêt</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span> Alerte !</div>
            </div>
        </div>
    );
}