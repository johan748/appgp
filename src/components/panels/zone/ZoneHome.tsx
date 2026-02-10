import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const ZoneHome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Panel de Zona</h2>

            {/* Zone Goals Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Metas de la Zona</h3>
                <p className="text-gray-600">Progreso general de los distritos en la zona.</p>
            </div>

            {/* Action Buttons Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <MenuButton icon={<Map size={32} />} label="Distritos" onClick={() => navigate('districts')} />
                <MenuButton icon={<Users size={32} />} label="Liderazgo" onClick={() => navigate('leadership')} />
                <MenuButton icon={<TrendingUp size={32} />} label="Estadísticas" onClick={() => navigate('stats')} />
                <MenuButton icon={<AlertTriangle size={32} />} label="Alertas" onClick={() => navigate('alerts')} />
            </section>
        </div>
    );
};

const MenuButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-100 group"
    >
        <div className="text-primary mb-4 p-4 bg-blue-50 rounded-full group-hover:bg-white transition-colors">{icon}</div>
        <span className="font-bold text-lg text-gray-700">{label}</span>
    </button>
);

export default ZoneHome;
