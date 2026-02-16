import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import { Car, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VehicleSetup = () => {
    const [formData, setFormData] = useState({
        name: '',
        license_plate: '',
        type: 'car'
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create vehicle
            const response = await vehicleAPI.create({
                Name: formData.name,
                Plate: formData.license_plate,
                Type: formData.type,
                Status: 'active'
            });

            // Store vehicle ID for current session
            const vehicleId = response.data.data.id;
            localStorage.setItem('vehicle_id', vehicleId);

            // Go to map
            // Go to vehicles list to see the update
            navigate('/vehicles');
        } catch (err) {
            console.error(err);
            alert('Failed to register vehicle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-slate-900 p-6 flex flex-col justify-center">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Vehicle Setup</h1>
                    <p className="text-slate-400">Register your vehicle to start</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/vehicles')}
                        className="px-4 py-2 bg-slate-800 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                    >
                        <Car className="w-4 h-4" />
                        List Vehicle
                    </button>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-red-500 hover:text-white transition"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Vehicle Name</label>
                    <input
                        type="text"
                        required
                        className="input"
                        placeholder="e.g. My Truck 01"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">License Plate</label>
                    <input
                        type="text"
                        required
                        className="input uppercase"
                        placeholder="B 1234 XYZ"
                        value={formData.license_plate}
                        onChange={e => setFormData({ ...formData, license_plate: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Vehicle Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['car', 'truck', 'motorcycle', 'bus'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`
                                    p-3 rounded-lg border text-sm capitalize flex items-center justify-center gap-2
                                    ${formData.type === type
                                        ? 'bg-primary-600 border-primary-500 text-white'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}
                                `}
                            >
                                <Car className="w-4 h-4" />
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full flex items-center justify-center gap-2 mt-8"
                >
                    {loading ? 'Processing...' : (
                        <>
                            Start Driving <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default VehicleSetup;
