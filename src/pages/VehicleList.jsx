import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await vehicleAPI.list();
            setVehicles(response.data.data || response.data); // Adjust based on api response structure
            setLoading(false);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('Failed to load vehicles');
            setLoading(false);
        }
    };

    const handleSelectVehicle = (vehicleId) => {
        localStorage.setItem('vehicle_id', vehicleId);
        navigate('/map');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteVehicle = async (e, vehicleId) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            try {
                await vehicleAPI.delete(vehicleId);
                setVehicles(vehicles.filter(v => v.id !== vehicleId));
            } catch (err) {
                console.error('Error deleting vehicle:', err);
                alert('Failed to delete vehicle');
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                            title="Profile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <h1 className="text-2xl font-bold text-blue-400">Your Vehicles</h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg transition"
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {vehicles.length === 0 ? (
                        <div className="text-center py-10 bg-gray-800 rounded-xl border border-gray-700">
                            <p className="text-gray-400 mb-4">No vehicles found</p>
                            <button
                                onClick={() => navigate('/vehicle-setup')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                            >
                                Setup New Vehicle
                            </button>
                        </div>
                    ) : (
                        vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                onClick={() => handleSelectVehicle(vehicle.id)}
                                className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500 cursor-pointer transition transform hover:scale-[1.02]"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-lg">{vehicle.name}</h3>
                                        <p className="text-gray-400 text-sm">{vehicle.license_plate}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => handleDeleteVehicle(e, vehicle.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition group"
                                            title="Delete Vehicle"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <div className="text-blue-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {vehicles.length > 0 && (
                    <button
                        onClick={() => navigate('/vehicle-setup')}
                        className="w-full mt-8 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-3 rounded-xl transition"
                    >
                        + Add Another Vehicle
                    </button>
                )}
            </div>
        </div>
    );
};

export default VehicleList;
