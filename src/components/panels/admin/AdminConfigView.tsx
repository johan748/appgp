import React, { useState } from 'react';
import { Shield, Lock, Save, Globe } from 'lucide-react';

const AdminConfigView: React.FC = () => {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowRegistration, setAllowRegistration] = useState(false);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Shield className="mr-2" /> Configuración Global y Seguridad
            </h2>

            <div className="bg-white shadow rounded-lg p-6 space-y-8">

                {/* Global Settings */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                        <Globe className="mr-2" size={20} /> Parámetros del Sistema
                    </h3>
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                            <p className="font-medium text-gray-900">Modo Mantenimiento</p>
                            <p className="text-sm text-gray-500">Impide el acceso a todos los usuarios excepto administradores.</p>
                        </div>
                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="toggle1"
                                checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)}
                                className={`toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer ${maintenanceMode ? 'right-0 border-green-400' : 'left-0 border-gray-300'}`} />
                            <label htmlFor="toggle1" className={`toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${maintenanceMode ? 'bg-green-400' : ''}`}></label>
                        </div>
                    </div>
                </div>

                {/* Security Logs (Mock) */}
                <div>
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                        <Lock className="mr-2" size={20} /> Logs de Auditoría (Reciente)
                    </h3>
                    <div className="bg-gray-900 text-gray-300 p-4 rounded-md font-mono text-xs h-64 overflow-y-auto">
                        <p><span className="text-green-400">[2023-12-12 10:00:01]</span> SYS: Startup complete.</p>
                        <p><span className="text-blue-400">[2023-12-12 10:05:22]</span> AUTH: User 'admin' logged in.</p>
                        <p><span className="text-blue-400">[2023-12-12 10:10:15]</span> DATA: Association 'AsoCen' updated.</p>
                        <p><span className="text-yellow-400">[2023-12-12 10:15:00]</span> WARN: High memory usage detected (mock).</p>
                        <p><span className="text-blue-400">[2023-12-12 11:30:45]</span> AUTH: User 'pastor1' password changed.</p>
                        {/* Static mock logs */}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="btn btn-primary">
                        <Save size={18} className="mr-2" /> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminConfigView;
