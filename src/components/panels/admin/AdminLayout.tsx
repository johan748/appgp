import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ArrowLeft, Database, Shield, Settings, Users, Building } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getWelcomeMessage = () => {
        return `Administrador: ${user?.name || 'Admin'}`;
    };

    const isHome = location.pathname === '/admin' || location.pathname === '/admin/';

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Standard Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {!isHome && (
                                <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-[#3e8391]">Panel de Administración</h1>
                                <p className="text-xs text-gray-500">Control Total del Sistema</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700 hidden md:inline">{getWelcomeMessage()}</span>
                            <div className="h-10 w-10 bg-[#3e8391] text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {user?.name?.charAt(0)}
                            </div>
                            <button onClick={() => { logout(); navigate('/login'); }} className="text-xs font-semibold text-red-600 hover:text-red-700 ml-2">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <nav className="flex flex-col">
                            <NavItem to="/admin" icon={<Settings size={18} />} label="Dashboard" active={isHome} />
                            <NavItem to="/admin/unions" icon={<Building size={18} />} label="Gestionar Uniones" active={location.pathname.includes('unions')} />
                            <NavItem to="/admin/users" icon={<Users size={18} />} label="Usuarios" active={location.pathname.includes('users')} />
                            <NavItem to="/admin/data" icon={<Database size={18} />} label="Gestión de Datos" active={location.pathname.includes('data')} />
                            <NavItem to="/admin/config" icon={<Shield size={18} />} label="Seguridad/Config" active={location.pathname.includes('config')} />
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <Outlet />
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
            className={`flex items-center space-x-3 px-4 py-4 text-sm font-semibold transition-all ${active
                ? 'bg-[#3e839115] text-[#3e8391] border-l-4 border-[#3e8391]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                }`}
        >
            <div className={`${active ? 'text-[#3e8391]' : 'text-gray-400'}`}>
                {icon}
            </div>
            <span>{label}</span>
        </button>
    );
}

export default AdminLayout;
