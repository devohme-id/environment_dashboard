import React from 'react';
import { Link, useLocation } from 'react-router-dom';


import {
    IconDashboard,
    IconTemperature,
    IconMapPin,
    IconBuildingFactory2,
    IconBolt,
    IconSettings
} from '@tabler/icons-react';

const Sidebar = ({ isOpen }) => {
    const location = useLocation();

    const menuItems = [
        { name: 'Settings', path: '/admin/settings', icon: <IconSettings size={20} /> },
        { name: 'SMT Monitor', path: '/admin/smt', icon: <IconTemperature size={20} /> },
        { name: 'Area Monitor', path: '/admin/akt', icon: <IconMapPin size={20} /> },
        { name: 'Facility Monitor', path: '/admin/fct', icon: <IconBuildingFactory2 size={20} /> },
        { name: 'Grounding Monitor', path: '/admin/grd', icon: <IconBolt size={20} /> },
    ];

    return (
        <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col`}>
            <div className="px-6 py-4 flex items-center justify-center h-16 border-b border-gray-700">
                <h1 className={`${isOpen ? 'block' : 'hidden'} text-xl font-bold`}>Admin Panel</h1>
                <span className={`${isOpen ? 'hidden' : 'block'} text-xl font-bold`}>AP</span>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${location.pathname === item.path
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {item.icon}
                        <span className={`${isOpen ? 'ml-3' : 'hidden'} font-medium`}>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
