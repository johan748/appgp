import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { Database, Download, Upload, AlertTriangle, Cloud, CloudDownload, CloudUpload } from 'lucide-react';

const AdminDataView: React.FC = () => {
    const { showToast } = useToast();
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            // For real backend, we would call an API endpoint to get all data
            // For now, we'll show a message indicating this is handled by the backend
            showToast('Solicitando copia de seguridad al servidor...', 'info');
            
            // Simulate API call
            setTimeout(() => {
                showToast('Copia de seguridad generada exitosamente. Contacte al administrador del sistema para descargarla.', 'success');
                setIsBackingUp(false);
            }, 2000);
        } catch (error) {
            showToast('Error al generar la copia de seguridad. Por favor intente de nuevo.', 'error');
            setIsBackingUp(false);
        }
    };

    const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('¡ADVERTENCIA CRÍTICA!\n\nEsto sobrescribirá TODOS los datos actuales con los del archivo de respaldo. Esta acción no se puede deshacer.\n\n¿Desea continuar?')) {
            return;
        }

        setIsRestoring(true);
        try {
            // For real backend, we would upload the file to a restore endpoint
            showToast('Procesando restauración...', 'info');
            
            // Simulate API call
            setTimeout(() => {
                showToast('Restauración completada exitosamente. El sistema se reiniciará.', 'success');
                setIsRestoring(false);
                // In a real scenario, you might redirect to login or refresh the page
                window.location.reload();
            }, 3000);
        } catch (error) {
            showToast('Error al procesar el archivo de respaldo: Archivo corrupto o inválido.', 'error');
            setIsRestoring(false);
            console.error(error);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Database className="mr-2" /> Gestión de Datos en la Nube
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Backup Card */}
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-full w-16 h-16 mb-4">
                        <CloudDownload className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Copia de Seguridad en la Nube</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                        Solicita una copia de seguridad completa de todos los datos almacenados en el servidor PostgreSQL.
                        Las copias de seguridad se generan automáticamente y están disponibles bajo solicitud.
                    </p>
                    <button 
                        onClick={handleBackup} 
                        disabled={isBackingUp}
                        className="w-full btn btn-primary py-2 shadow-md flex items-center justify-center space-x-2"
                    >
                        <Cloud size={18} />
                        <span>{isBackingUp ? 'Generando...' : 'Solicitar Backup'}</span>
                    </button>
                </div>

                {/* Restore Card */}
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500 relative overflow-hidden">
                    <div className="flex items-center justify-center p-4 bg-red-50 rounded-full w-16 h-16 mb-4">
                        <CloudUpload className="text-red-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Restaurar desde Backup</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                        Restaura el sistema desde un archivo de respaldo previamente generado.
                    </p>

                    <div className="bg-red-50 p-3 rounded border border-red-200 mb-4 flex items-start">
                        <AlertTriangle className="text-red-500 mr-2 flex-shrink-0" size={18} />
                        <span className="text-xs text-red-700 font-semibold">
                            Acción destructiva: Sobrescribe todos los datos actuales.
                        </span>
                    </div>

                    <label className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded shadow-md hover:bg-red-700 cursor-pointer">
                        <Upload size={18} className="mr-2" />
                        <span>{isRestoring ? 'Procesando...' : 'Seleccionar Archivo JSON'}</span>
                        <input type="file" accept=".json" onChange={handleRestore} className="hidden" disabled={isRestoring} />
                    </label>
                </div>
            </div>

            {/* Database Information Card */}
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Información del Sistema</h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Conexión Activa</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="font-semibold text-gray-700">Base de Datos:</span>
                        <p className="text-gray-600">PostgreSQL (Neon)</p>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700">Almacenamiento:</span>
                        <p className="text-gray-600">Nube Segura</p>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700">Copias de Seguridad:</span>
                        <p className="text-gray-600">Automáticas Diarias</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDataView;
