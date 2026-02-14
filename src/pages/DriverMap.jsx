import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { locationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigation, Power, AlertTriangle, LogOut } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Updater Component
const MapRecenter = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 16);
        }
    }, [position, map]);
    return null;
};

const DriverMap = () => {
    const [position, setPosition] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [tracking, setTracking] = useState(false);
    const [error, setError] = useState(null);
    const vehicleId = localStorage.getItem('vehicle_id');
    const watchId = useRef(null);
    const wakeLock = useRef(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        if (!vehicleId) {
            navigate('/vehicle-setup');
        }
    }, [vehicleId, navigate]);

    // Request Wake Lock
    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLock.current = await navigator.wakeLock.request('screen');
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    };

    const toggleTracking = () => {
        if (tracking) {
            // Stop tracking
            if (watchId.current) {
                navigator.geolocation.clearWatch(watchId.current);
                watchId.current = null;
            }
            if (wakeLock.current) {
                wakeLock.current.release();
                wakeLock.current = null;
            }
            setTracking(false);
        } else {
            // Start tracking
            if (!navigator.geolocation) {
                setError('Geolocation is not supported by your browser');
                return;
            }

            requestWakeLock();
            setTracking(true);
            setError(null);

            watchId.current = navigator.geolocation.watchPosition(
                async (pos) => {
                    const { latitude, longitude, speed } = pos.coords;
                    const newPos = [latitude, longitude];
                    setPosition(newPos);
                    setLastUpdated(new Date().toLocaleTimeString());

                    // Send to API
                    try {
                        await locationAPI.create({
                            latitude,
                            longitude,
                            // Speed is in m/s, convert to km/h if needed, or send as is
                            speed: speed || 0,
                            vehicle_id: parseInt(vehicleId)
                        });
                    } catch (err) {
                        console.error('Failed to update location', err);
                        // Don't stop tracking on network error, just log
                    }
                },
                (err) => {
                    setError('Unable to retrieve location');
                    console.error(err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    };

    const handleLogout = () => {
        if (tracking) {
            if (!window.confirm('Tracking is active. Are you sure you want to stop and logout?')) return;
        }
        toggleTracking(); // ensure clean up
        logout();
        navigate('/login');
    };

    return (
        <div className="h-[100dvh] flex flex-col relative bg-slate-900">
            {/* Map Area */}
            <div className="flex-1 z-0">
                {!position ? (
                    <div className="h-full flex items-center justify-center bg-slate-800 text-slate-400 p-8 text-center">
                        <div>
                            <Navigation className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
                            <p>Waiting for GPS signal...</p>
                            {!tracking && <p className="text-sm mt-2">Press Start Tracking to begin</p>}
                        </div>
                    </div>
                ) : (
                    <MapContainer
                        center={position}
                        zoom={16}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OSM'
                        />
                        <Marker position={position}>
                            <Popup>You are here</Popup>
                        </Marker>
                        <MapRecenter position={position} />
                    </MapContainer>
                )}
            </div>

            {/* Overlay Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent z-[1000]">
                {error && (
                    <div className="mb-4 bg-red-500/90 text-white p-3 rounded-lg flex items-center gap-2 text-sm backdrop-blur-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTracking}
                        className={`
                            flex-1 btn flex items-center justify-center gap-2 text-lg h-14 shadow-xl
                            ${tracking
                                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
                        `}
                    >
                        <Power className="w-6 h-6" />
                        {tracking ? 'Stop Tracking' : 'Start Tracking'}
                    </button>

                    <button
                        onClick={() => navigate('/vehicles')}
                        className="btn bg-slate-700 text-white h-14 w-14 flex items-center justify-center rounded-lg"
                        title="Back to Vehicle List"
                    >
                        <Navigation className="w-6 h-6 rotate-180" />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="btn bg-red-600/20 border border-red-500/50 text-red-500 h-14 w-14 flex items-center justify-center rounded-lg hover:bg-red-600 hover:text-white transition"
                        title="Logout"
                    >
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>

                {position && (
                    <div className="mt-4 text-center text-xs text-slate-400 font-mono flex flex-col gap-1">
                        <div>{position[0].toFixed(6)}, {position[1].toFixed(6)}</div>
                        <div className="opacity-70">Last updated: {lastUpdated}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverMap;
