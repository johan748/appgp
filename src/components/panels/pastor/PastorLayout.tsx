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
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {!isHome && (
                                <button onClick={() => navigate('/pastor')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-[#3e8391]">{district.name}</h1>
                                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Distrito</p>
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

            <main className="container mx-auto px-4 py-6">
                <Outlet context={{ district }} />
            </main>
        </div>
    );
};

export default PastorLayout;
