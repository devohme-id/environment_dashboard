import React from 'react';
import { IconMenu2, IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-md">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="text-gray-500 focus:outline-none focus:text-gray-700 dark:text-gray-400 dark:focus:text-gray-200"
                >
                    <IconMenu2 size={24} />
                </button>
            </div>
            <div className="flex items-center">
                <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-500 hover:text-red-600 focus:outline-none dark:text-gray-400 dark:hover:text-red-400"
                >
                    <IconLogout size={24} />
                    <span className="ml-2 font-medium">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
