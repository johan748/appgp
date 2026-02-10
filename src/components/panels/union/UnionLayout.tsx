import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut, Network } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useBackend } from '../../../context/BackendContext';
import { Union } from '../../../types';

const UnionLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { backend } = useBackend();
    const navigate = useNavigate();
    const location = useLocation();
    const [union, setUnion] = React.useState<Union | null>(null);

    // Fetch Union data based on user
    React.useEffect(() => {
        const loadUnion = async () => {
            if (user?.role === 'UNION' && user.relatedEntityId) {
                try {
                    const u = await backend.getUnionById(user.relatedEntityId);
                    setUnion(u || null);
                } catch (e) { console.error(e); }
            }
        };
        loadUnion();
    }, [user, backend]);

    if (!union) return <div>Cargando...</div>;

    const navItems = [
        { path: '/union', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/union/associations', icon: <Network size={20} />, label: 'Asociaciones' },
        { path: '/union/reports', icon: <FileText size={20} />, label: 'Reportes Globales' },
    ];

    return (
        <div className="flex h-screen bg-[#f1f5f9]">
            {/* Sidebar */}
            <aside className="w-64 bg-[#3e8391] text-white shadow-xl flex flex-col">
                <div className="p-6 flex flex-col items-center">
                    <img src="/logo_gp_dia_transparent.png" alt="Logo" className="w-32 mb-4" />
                    <h1 className="text-xl font-bold tracking-wider text-center">AppGP</h1>
                    <p className="text-white/80 text-xs mt-1">{union.name}</p>
                </div>

                <nav className="mt-6 px-4 space-y-2 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-white/20 text-white'
                                : 'text-white/80 hover:bg-white/10'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="flex items-center space-x-3 text-white/80 hover:text-white w-full px-4 py-2"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {navItems.find(i => i.path === location.pathname)?.label || 'Panel'}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {user?.name} ({user?.role})
                            </span>
                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet context={{ union }} />
                </div>
            </main>
        </div>
    );
};

export default UnionLayout;
