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
    const [isLoadingUnion, setIsLoadingUnion] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Fetch Union data based on user
    React.useEffect(() => {
        const loadUnion = async () => {
            if (user?.role === 'UNION' && user.relatedEntityId) {
                try {
                    console.log('Fetching union for ID:', user.relatedEntityId);
                    const u = await backend.getUnionById(user.relatedEntityId);
                    if (u) {
                        setUnion(u);
                    } else {
                        setError(`No se encontró la Unión con ID: ${user.relatedEntityId}`);
                    }
                } catch (e) {
                    console.error(e);
                    setError('Error al cargar los datos de la Unión');
                } finally {
                    setIsLoadingUnion(false);
                }
            } else {
                setIsLoadingUnion(false);
                if (user?.role !== 'UNION') setError('El usuario no tiene rol de Unión');
                else if (!user.relatedEntityId) setError('El usuario no tiene una Unión vinculada');
            }
        };
        loadUnion();
    }, [user, backend]);

    if (isLoadingUnion) return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3e8391] mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Cargando datos de la Unión...</p>
            </div>
        </div>
    );

    if (error || !union) return (
        <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border-l-4 border-red-500">
                <div className="text-red-500 mb-4 flex justify-center">
                    <LogOut size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Error de Configuración</h2>
                <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información de la Unión.'}</p>
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full bg-[#3e8391] text-white py-2 rounded-lg font-bold hover:bg-[#336d7a] transition-colors"
                >
                    Volver al Inicio
                </button>
            </div>
        </div>
    );

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
