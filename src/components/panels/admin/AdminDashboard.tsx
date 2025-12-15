import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Database, Shield, Settings, Users } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
                    <button onClick={logout} className="text-red-600 hover:text-red-800 font-medium">Cerrar Sesión</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AdminCard icon={<Database size={40} />} title="Gestión de Datos" description="Acceso crudo a todas las tablas (Usuarios, GPs, Iglesias, etc.)" />
                    <AdminCard icon={<Shield size={40} />} title="Seguridad" description="Logs de auditoría, gestión de roles y permisos." />
                    <AdminCard icon={<Settings size={40} />} title="Configuración Global" description="Variables del sistema, periodos de reporte, etc." />
                    <AdminCard icon={<Users size={40} />} title="Usuarios" description="Gestión centralizada de cuentas de usuario." />
                </div>

                <div className="mt-12 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Estado del Sistema</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b pb-2">
                            <span>Versión</span>
                            <span className="font-mono">v1.0.0</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Base de Datos</span>
                            <span className="text-green-600 font-medium">Conectado (Mock LocalStorage)</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span>Último Backup</span>
                            <span>Hace 2 horas</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
        <div className="text-gray-700 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default AdminDashboard;
