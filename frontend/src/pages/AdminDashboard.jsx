import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <p className="text-lg">Welcome to the Admin Dashboard!</p>
                <p className="mt-2 text-gray-400">Manage your environment settings here.</p>
                {/* Add admin features here in the future */}
            </div>
        </div>
    );
};

export default AdminDashboard;
