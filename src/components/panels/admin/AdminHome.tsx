import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Shield, Settings, Users, Building, Activity } from 'lucide-react';
import { mockBackend } from '../../../services/mockBackend';

const AdminHome: React.FC = () => {
    const navigate = useNavigate();

    // Quick Stats from mockBackend
    // Quick Stats from mockBackend
    const userCount = mockBackend.getUsers().length;
    const assocCount = mockBackend.getAssociations().length;
    // And getGPs, getMembers, etc.

    // Let's stick to what's available or infer.
    // Actually, mockBackend.getAssociation returns the main one. If I want list, I need to check implementation.
    // The previous implementation of getAssociation returns "this.get<Association>(STORAGE_KEYS.ASSOCIATION)[0]".
    // So it assumes singleton. But user wants "Create Association" (multiple).
    // I will need to update mockBackend.getAssociation to return array or generic.
    // For now, I'll assume singleton pattern and we are just "Replacing" or "Configuring" the main one? 
    // OR, the User said "Create Association" implying multiple.
    // If multiple, `getAssociation` returning `[0]` is problematic. I should check `mockBackend.ts`.

    // Checked mockBackend:
    // getAssociation() { return this.get<Association>(STORAGE_KEYS.ASSOCIATION)[0]; }

    // I will update this view to be simple for now and rely on specific views for data.

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard General</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users className="text-blue-500" />} label="Usuarios Totales" value={userCount.toString()} />
                <StatCard icon={<Building className="text-green-500" />} label="Asociaciones" value={assocCount.toString()} />
                <StatCard icon={<Database className="text-purple-500" />} label="Uso de Almacenamiento" value="Mock LowDB" />
                <StatCard icon={<Activity className="text-red-500" />} label="Estado del Sistema" value="Online" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Shortcuts */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Accesos Directos</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <ShortcutButton
                            icon={<Building className="mb-2 text-indigo-500" size={24} />}
                            label="Gestionar Asociaciones"
                            onClick={() => navigate('associations')}
                        />
                        <ShortcutButton
                            icon={<Users className="mb-2 text-blue-500" size={24} />}
                            label="Usuarios"
                            onClick={() => navigate('users')}
                        />
                        <ShortcutButton
                            icon={<Database className="mb-2 text-purple-500" size={24} />}
                            label="Backup/Restore"
                            onClick={() => navigate('data')}
                        />
                        <ShortcutButton
                            icon={<Shield className="mb-2 text-green-500" size={24} />}
                            label="Seguridad"
                            onClick={() => navigate('config')}
                        />
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Información Técnica</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex justify-between border-b pb-2">
                            <span>Versión de Cliente</span>
                            <span className="font-mono text-gray-900">v1.2.0-beta</span>
                        </li>
                        <li className="flex justify-between border-b pb-2">
                            <span>Backend</span>
                            <span className="font-mono text-gray-900">LocalStorage Mock Service</span>
                        </li>
                        <li className="flex justify-between border-b pb-2">
                            <span>Build Environment</span>
                            <span className="font-mono text-gray-900">Vite + React + TS</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
        <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        </div>
    </div>
);

const ShortcutButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
        {icon}
        <span className="text-sm font-medium text-gray-700 text-center">{label}</span>
    </button>
);

export default AdminHome;
