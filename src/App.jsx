import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import VehicleSetup from './pages/VehicleSetup';
import DriverMap from './pages/DriverMap';
import Register from './pages/Register';
import VehicleList from './pages/VehicleList';
import Profile from './pages/Profile';
import { useEffect, useState } from 'react';
import { vehicleAPI } from './services/api';

function App() {
  const [hasVehicles, setHasVehicles] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      checkVehicles();
    } else {
      setHasVehicles(false);
    }
  }, [token]);

  const checkVehicles = async () => {
    try {
      const response = await vehicleAPI.list();
      const vehicles = response.data.data || response.data;
      setHasVehicles(vehicles && vehicles.length > 0);
    } catch (error) {
      console.error('Error checking vehicles:', error);
      setHasVehicles(false);
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/vehicle-setup" element={<VehicleSetup />} />
        <Route path="/vehicles" element={<VehicleList />} />
        <Route path="/map" element={<DriverMap />} />
        <Route path="/profile" element={<Profile />} />

        {/* Default logic: 
            1. If active vehicle session -> map
            2. If has vehicles -> list
            3. If no vehicles -> setup
        */}
        <Route path="/" element={
          localStorage.getItem('vehicle_id')
            ? <Navigate to="/map" replace />
            : hasVehicles === null
              ? <div className="min-h-screen bg-gray-900" /> // Loading state
              : hasVehicles
                ? <Navigate to="/vehicles" replace />
                : <Navigate to="/vehicle-setup" replace />
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
