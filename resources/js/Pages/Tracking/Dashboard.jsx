// resources/js/Pages/Tracking/Dashboard.jsx

export default function Dashboard({ fleet, recentAlerts }) {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Barre latérale : Liste des véhicules */}
      <div className="w-1/3 bg-white p-4 overflow-y-auto border-r">
        <h2 className="text-xl font-bold mb-4">Ma Flotte ({fleet.length})</h2>
        
        {fleet.map((truck) => (
          <div key={truck.id} className="mb-4 p-3 border rounded-lg shadow-sm hover:bg-blue-50 cursor-pointer">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800">{truck.name}</span>
              
              {/* Badge de statut */}
              <span className={`px-2 py-1 text-xs rounded-full ${
                truck.status === 'MOVING' ? 'bg-green-100 text-green-800' :
                truck.status === 'OFFLINE' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {truck.status}
              </span>
            </div>

            {/* Jauge Carburant Simplifiée */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Carburant</span>
                <span>{truck.fuel_level} L</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${truck.fuel_level < 50 ? 'bg-red-500' : 'bg-blue-600'}`} 
                  style={{ width: `${(truck.fuel_level / truck.tank_capacity) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Alerte Vol ! */}
            {truck.alerts_count > 0 && (
               <div className="mt-2 text-xs text-red-600 font-bold flex items-center">
                  ⚠️ {truck.alerts_count} alerte(s) carburant
               </div>
            )}
          </div>
        ))}
      </div>

      {/* Zone Principale : La Carte */}
      <div className="w-2/3">
        {/* Ici vous mettrez votre composant Map (Leaflet ou Google Maps) */}
        {/* Vous passerez "fleet" à la carte pour afficher les marqueurs */}
        <div className="h-full flex items-center justify-center text-gray-400">
           Carte Interactive ici...
        </div>
      </div>
    </div>
  );
}