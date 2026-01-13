// client/src/pages/MapPage.jsx

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, MapPin, Navigation } from 'lucide-react';

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

    // 📍 Live Location
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

    // 🔍 Search Function
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
        <div className="flex flex-col h-[calc(100vh-6rem)] p-4 space-y-4 animate-fade-in">
            {/* Search Bar */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MapPin className="text-blue-400" /> Safe Routes
                    </h2>
                    <p className="text-gray-400 text-sm">Find safe paths & emergency zones</p>
                </div>
                <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
                    <input 
                        type="text" 
                        placeholder="Search city..." 
                        className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition">
                        <Search className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={getLiveLocation} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition">
                        <Navigation className="w-5 h-5" />
                    </button>
                </form>
            </div>

            {/* Map */}
            <div className="flex-1 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl relative">
                {loading && (
                    <div className="absolute inset-0 bg-black/60 z-[1000] flex items-center justify-center text-white font-bold backdrop-blur-sm">
                        Searching... 🌍
                    </div>
                )}
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                    <Marker position={position}><Popup>📍 Selected Location</Popup></Marker>
                    <RecenterMap lat={position[0]} lon={position[1]} />
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;