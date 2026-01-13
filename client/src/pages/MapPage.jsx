// client/src/pages/MapPage.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Search, MapPin, Navigation, Clock, Filter, 
  Shield, Activity, HelpCircle, Download, Phone 
} from 'lucide-react';

// --- UI COMPONENTS (Internal for this page) ---
const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
    outline: 'border border-gray-600 bg-transparent hover:bg-gray-800 text-gray-300',
    ghost: 'hover:bg-gray-800 text-gray-300',
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }) => (
  <div className={`rounded-xl border bg-gray-800 border-gray-700 text-white shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

// --- ASSETS & FIXES ---
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- HELPER: Recenter Map ---
const RecenterMap = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lon) {
            map.flyTo([lat, lon], 13, { animate: true });
        }
    }, [lat, lon, map]);
    return null;
};

// --- MAIN COMPONENT ---
const MapPage = () => {
    const [position, setPosition] = useState([23.2599, 77.4126]); // Default: Bhopal
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);

    // --- STATIC DATA (Restored) ---
    const safeRoutes = [
        { id: 1, name: 'Guwahati to Shillong', safety: 95, time: '3h 30m', distance: '103 km', type: 'highway' },
        { id: 2, name: 'Kaziranga Safari Route', safety: 90, time: '2h', distance: '45 km', type: 'park' },
        { id: 3, name: 'Tawang Mountain Pass', safety: 75, time: '8h', distance: '320 km', type: 'mountain' },
        { id: 4, name: 'Majuli River Crossing', safety: 85, time: '1h 30m', distance: '20 km', type: 'ferry' },
    ];

    const safeZones = [
        { id: 1, name: 'Police Station - MP Nagar', type: 'police', lat: 23.2332, lng: 77.4343 },
        { id: 2, name: 'AIIMS Hospital', type: 'hospital', lat: 23.2122, lng: 77.4623 },
        { id: 3, name: 'Tourist Help Center', type: 'help', lat: 23.2599, lng: 77.4126 },
    ];

    // 📍 Live Location Logic
    const getLiveLocation = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    setLoading(false);
                },
                (err) => {
                    console.error("GPS Error", err);
                    alert("Please enable GPS permission.");
                    setLoading(false);
                }
            );
        } else {
            alert("Geolocation not supported.");
        }
    };

    // 🔍 Search Logic
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;

        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                setPosition([lat, lon]);
            } else {
                alert("Location not found!");
            }
        } catch (error) {
            console.error("Search Error:", error);
            alert("Search failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col p-4 space-y-6 animate-fade-in pb-24">
            
            {/* --- HEADER --- */}
            <div>
                <h1 className="text-4xl font-black mb-2 text-white">Safe Routes</h1>
                <p className="text-gray-300 text-lg">Find and navigate through the safest routes.</p>
            </div>

            {/* --- SEARCH BAR & FILTERS --- */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search city or place..." 
                            className="pl-10 h-12 w-full rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit"><Search className="w-5 h-5" /></Button>
                </form>
                
                <div className="flex gap-2">
                    <Button type="button" onClick={getLiveLocation} className="bg-green-600 hover:bg-green-700">
                        <Navigation className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="w-4 h-4 mr-2" /> Filters
                    </Button>
                </div>
            </div>

            {/* --- FILTERS PANEL (Conditional) --- */}
            {showFilters && (
                <Card className="p-4 animate-slide-up">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Dummy Filters just for UI */}
                        {['Route Type', 'Safety Level', 'Distance', 'Travel Time'].map((label, i) => (
                            <div key={i}>
                                <label className="text-sm mb-2 block text-gray-400">{label}</label>
                                <select className="w-full p-2 border border-gray-600 bg-gray-700 rounded-lg text-sm text-white">
                                    <option>Any</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* --- MAP CONTAINER --- */}
            <div className="h-96 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl relative z-0">
                {loading && (
                    <div className="absolute inset-0 bg-black/60 z-[1000] flex items-center justify-center text-white font-bold backdrop-blur-sm">
                        Searching Location... 🌍
                    </div>
                )}
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                    
                    {/* User Location Marker */}
                    <Marker position={position}>
                        <Popup>📍 You are here</Popup>
                    </Marker>

                    {/* Nearby Safe Zones Markers */}
                    {safeZones.map((zone) => (
                        <Marker key={zone.id} position={[zone.lat, zone.lng]}>
                            <Popup>
                                <strong>{zone.name}</strong><br/>
                                <span className="capitalize text-gray-600">{zone.type}</span>
                            </Popup>
                        </Marker>
                    ))}

                    <RecenterMap lat={position[0]} lon={position[1]} />
                </MapContainer>
            </div>

            {/* --- RECOMMENDED SAFE ROUTES (Restored) --- */}
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-white">Recommended Safe Routes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {safeRoutes.map((route) => (
                        <Card 
                            key={route.id} 
                            className={`p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-900/10 ${selectedRoute === route.id ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => setSelectedRoute(route.id)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-white">{route.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${route.safety >= 90 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                    {route.safety}% Safe
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {route.time}</span>
                                <span className="flex items-center gap-1"><Navigation className="w-4 h-4" /> {route.distance}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300 capitalize">{route.type}</span>
                                <Button size="sm" className="text-xs h-8">View Details</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* --- NEARBY SAFE ZONES (Restored) --- */}
            <div className="space-y-4">
                <h2 className="text-2xl font-black text-white">Nearby Safe Zones</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {safeZones.map((zone) => (
                        <Card key={zone.id} className="p-5 hover:bg-gray-700/50 transition-all">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${zone.type === 'police' ? 'bg-blue-500/10' : zone.type === 'hospital' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                    {zone.type === 'police' ? <Shield className="w-5 h-5 text-blue-500" /> : zone.type === 'hospital' ? <Activity className="w-5 h-5 text-red-500" /> : <HelpCircle className="w-5 h-5 text-green-500" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{zone.name}</h3>
                                    <p className="text-xs text-gray-400 capitalize">{zone.type}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button variant="outline" className="flex-1 text-xs h-8"><Navigation className="w-3 h-3 mr-1" /> Go</Button>
                                <Button variant="outline" className="flex-1 text-xs h-8"><Phone className="w-3 h-3 mr-1" /> Call</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default MapPage;