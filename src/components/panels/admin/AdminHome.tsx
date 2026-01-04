import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Shield, Settings, Users, Building, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { Database, Shield, Settings, Users, Building, Activity } from 'lucide-react';

const AdminHome: React.FC = () => {
    const navigate = useNavigate();
    const { backend } = useBackend();
    const [stats, setStats] = React.useState({ users: 0, unions: 0 });

    React.useEffect(() => {
        const loadStats = async () => {
            try {
                const [users, unions] = await Promise.all([
                    backend.getUsers(),
                    backend.getUnions()
                ]);
                setStats({ users: users.length, unions: unions.length });
            } catch (e) { console.error(e); }
        };
        loadStats();
    }, [backend]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard General</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users className="text-[#3e8391]" size={20} />} label="Usuarios Totales" value={stats.users.toString()} />
                <StatCard icon={<Building className="text-[#3e8391]" size={20} />} label="Uniones" value={stats.unions.toString()} />
                <StatCard icon={<Database className="text-[#3e8391]" size={20} />} label="Almacenamiento" value="Supabase" />
                <StatCard icon={<Activity className="text-[#3e8391]" size={20} />} label="Estado" value="Online" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shortcuts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Accesos Directos</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <ShortcutButton
                            icon={<Building className="mb-2 text-[#3e8391]" size={24} />}
                            label="Gestionar Uniones"
                            onClick={() => navigate('unions')}
                        />
                        <ShortcutButton
                            icon={<Users className="mb-2 text-[#3e8391]" size={24} />}
                            label="Usuarios"
                            onClick={() => navigate('users')}
                        />
                        <ShortcutButton
                            icon={<Database className="mb-2 text-[#3e8391]" size={24} />}
                            label="Backup/Restore"
                            onClick={() => navigate('data')}
                        />
                        <ShortcutButton
                            icon={<Shield className="mb-2 text-[#3e8391]" size={24} />}
                            label="Seguridad"
                            onClick={() => navigate('config')}
                        />
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Información Técnica</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Versión</span>
                            <span className="font-mono text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-xs">v1.2.0-beta</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Backend</span>
                            <span className="font-mono text-[#3e8391] text-xs">Express + PostgreSQL</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Base de Datos</span>
                            <span className="font-mono text-green-600 text-xs">Neon PostgreSQL Serverless</span>
                        </li>
                        <li className="flex justify-between border-b border-gray-50 pb-2">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Environment</span>
                            <span className="font-mono text-gray-900 text-xs">Vite + React + TS</span>
                        </li>
                        <li className="border-b border-gray-50 pb-2">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Backend Activo</span>
                            <div className="mt-1 text-xs text-gray-700">
                                <div className="flex flex-wrap gap-1">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Supabase</span>
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">PostgreSQL</span>
                                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Real-time</span>
                                </div>
                            </div>
                        </li>
                        <li className="border-b border-gray-50 pb-2">
                            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Compatibilidad</span>
                            <div className="mt-1 text-xs text-gray-700">
                                <div className="flex flex-wrap gap-1">
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Supabase Auth</span>
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">PostgreSQL 14+</span>
                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">Row Level Security</span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-all">
        <div className="p-3 bg-[#3e839110] rounded-xl">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none">{label}</p>
        </div>
    </div>
);

const ShortcutButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-2xl bg-white hover:bg-[#3e839105] hover:border-[#3e839140] hover:shadow-lg transition-all group">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-sm font-bold text-gray-600 text-center mt-2">{label}</span>
    </button>
);

export default AdminHome;
