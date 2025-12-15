import React, { useState } from 'react';
import { Database, Download, Upload, AlertTriangle } from 'lucide-react';

const AdminDataView: React.FC = () => {

    const handleBackup = () => {
        const data: Record<string, any> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                data[key] = localStorage.getItem(key);
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_asoc_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('¡ADVERTENCIA CRÍTICA!\n\nEsto sobrescribirá TODOS los datos actuales con los del archivo de respaldo. Esta acción no se puede deshacer.\n\n¿Desea continuar?')) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                localStorage.clear();
                Object.keys(data).forEach(key => {
                    // Check if value behaves like stringified JSON (starts with [ or {) and was stored as string
                    // But our export dumped the raw strings from localStorage.
                    // So we just put them back raw.
                    const val = data[key];
                    // If the stored value was null (unlikely from helper), handle it
                    if (val !== null) localStorage.setItem(key, val);
                });
                alert('Restauración completada. La página se recargará.');
                window.location.reload();
            } catch (err) {
                alert('Error al procesar el archivo de respaldo: Archivo corrupto o inválido.');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Database className="mr-2" /> Gestión de Datos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Backup Card */}
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
                    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-full w-16 h-16 mb-4">
                        <Download className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Copia de Seguridad (Backup)</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                        Descarga un archivo JSON conteniendo toda la base de datos actual (Usuarios, Asociaciones, GPs, Reportes).
                        Ideal para guardar estados antes de cambios importantes.
                    </p>
                    <button onClick={handleBackup} className="w-full btn bg-blue-600 text-white py-2 rounded hover:bg-blue-700 shadow-md">
                        Descargar Backup
                    </button>
                </div>

                {/* Restore Card */}
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-500 relative overflow-hidden">
                    <div className="flex items-center justify-center p-4 bg-red-50 rounded-full w-16 h-16 mb-4">
                        <Upload className="text-red-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Restaurar Datos</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                        Carga un archivo de backup previo.
                    </p>

                    <div className="bg-red-50 p-3 rounded border border-red-200 mb-4 flex items-start">
                        <AlertTriangle className="text-red-500 mr-2 flex-shrink-0" size={18} />
                        <span className="text-xs text-red-700 font-semibold">
                            Acción destructiva: Sobrescribe todos los datos actuales.
                        </span>
                    </div>

                    <label className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded shadow-md hover:bg-red-700 cursor-pointer">
                        <Upload size={18} className="mr-2" />
                        <span>Seleccionar Archivo JSON</span>
                        <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default AdminDataView;
