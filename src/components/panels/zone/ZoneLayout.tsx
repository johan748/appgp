import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockBackend } from '../../../services/mockBackend';
import { Zone } from '../../../types';
import { ArrowLeft, Home, MapPin, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const ZoneLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [zone, setZone] = useState<Zone | null>(null);

    useEffect(() => {
        if (user && user.relatedEntityId) {
            const zoneData = mockBackend.getZones().find(z => z.id === user.relatedEntityId);
            setZone(zoneData || null);
        }
    }, [user]);

    const getWelcomeMessage = () => {
        return `Bienvenido Director ${user?.name}`;
    };

    if (!zone) return <div className="p-4">Cargando información...</div>;

    const isHome = location.pathname === '/zone' || location.pathname === '/zone/';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation / Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {!isHome && (
                                <button onClick={() => navigate('/zone')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-[#3e8391]">{zone.name}</h1>
                                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Zona</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="font-bold text-gray-800 text-sm">{getWelcomeMessage()}</p>
                                <button onClick={() => { logout(); navigate('/login'); }} className="text-xs font-semibold text-red-500 hover:text-red-700">Cerrar Sesión</button>
                            </div>
                            <div className="h-10 w-10 bg-[#3e8391] text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}


                {/* Main Content */}
                <main className="flex-1">
                    <Outlet context={{ zone }} />
                </main>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(to)}
            className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${active
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

export default ZoneLayout;
