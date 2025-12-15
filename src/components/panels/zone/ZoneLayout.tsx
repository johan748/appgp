import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockBackend } from '../../../services/mockBackend';
import { Zone } from '../../../types';
import { ArrowLeft } from 'lucide-react';

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
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Top Navigation / Header */}
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {!isHome && (
                                <button onClick={() => navigate('/zone')} className="p-1 hover:bg-gray-100 rounded-full">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-primary">{zone.name}</h1>
                                <p className="text-sm text-gray-500">Zona</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-gray-900 text-sm md:text-base">{getWelcomeMessage()}</p>
                            <button onClick={logout} className="text-xs text-red-500 hover:text-red-700">Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <Outlet context={{ zone }} />
            </main>
        </div>
    );
};

export default ZoneLayout;
