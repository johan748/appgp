import React from 'react';
import { BarChart2, TrendingUp, Award } from 'lucide-react';

const PastorAutoReportsView: React.FC = () => {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Reportes Automáticos</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Multiplication Report */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4 text-green-600">
                        <TrendingUp size={24} className="mr-2" />
                        <h3 className="text-lg font-bold">Multiplicación</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                        GPs listos para multiplicarse (cumplen requisitos de asistencia y líderes en formación).
                    </p>
                    <div className="space-y-2">
                        {/* Placeholder Data */}
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <span className="font-medium">GP Ebenezer</span>
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Listo</span>
                        </div>
                    </div>
                </div>

                {/* Intervention Report */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4 text-red-600">
                        <BarChart2 size={24} className="mr-2" />
                        <h3 className="text-lg font-bold">Intervención</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                        GPs que requieren apoyo inmediato debido a métricas bajas sostenidas.
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                            <span className="font-medium">GP Shalom</span>
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Crítico</span>
                        </div>
                    </div>
                </div>

                {/* Recognition Report */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4 text-yellow-600">
                        <Award size={24} className="mr-2" />
                        <h3 className="text-lg font-bold">Reconocimiento</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                        GPs y Líderes destacados por cumplimiento de metas y crecimiento.
                    </p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                            <span className="font-medium">GP Maranatha</span>
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Top 1</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PastorAutoReportsView;
