import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockBackend } from '../../../services/mockBackend';
import { District } from '../../../types';
import { ArrowLeft } from 'lucide-react';

const PastorLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [district, setDistrict] = useState<District | null>(null);

    useEffect(() => {
        if (user && user.relatedEntityId) {
            const districtData = mockBackend.getDistricts().find(d => d.id === user.relatedEntityId);
            setDistrict(districtData || null);
        }
    }, [user]);

    const getWelcomeMessage = () => {
        return `Bienvenido Pr. ${user?.name}`;
    };

    if (!district) return <div className="p-4">Cargando información...</div>;

    const isHome = location.pathname === '/pastor' || location.pathname === '/pastor/';

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Top Navigation / Header */}
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {!isHome && (
                                <button onClick={() => navigate('/pastor')} className="p-1 hover:bg-gray-100 rounded-full">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-primary">{district.name}</h1>
                                <p className="text-sm text-gray-500">Distrito</p>
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
                <Outlet context={{ district }} />
            </main>
        </div>
    );
};

export default PastorLayout;
