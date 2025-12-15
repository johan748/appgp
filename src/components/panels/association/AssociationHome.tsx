import { useOutletContext, useNavigate } from 'react-router-dom';
import { Map, Users, TrendingUp, Settings, PieChart } from 'lucide-react';
import { Association } from '../../../types';
import { mockBackend } from '../../../services/mockBackend';
import { useState, useEffect } from 'react';

const AssociationHome: React.FC = () => {
    const navigate = useNavigate();
    const { association } = useOutletContext<{ association: Association }>();
    const [activeGPs, setActiveGPs] = useState(0);

    useEffect(() => {
        if (association) {
            // Calculate Active GPs for this association
            const zones = mockBackend.getZones().filter(z => z.associationId === association.id);
            const districts = mockBackend.getDistricts().filter(d => zones.some(z => z.id === d.zoneId));
            const churches = mockBackend.getChurches().filter(c => districts.some(d => d.id === c.districtId));
            const gps = mockBackend.getGPs().filter(g => churches.some(c => c.id === g.churchId));
            setActiveGPs(gps.length);
        }
    }, [association]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Panel de Asociación</h2>

            {/* Association Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Membresía Total</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        {association?.membershipCount?.toLocaleString() || 0}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">GPs Activos</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{activeGPs}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-medium uppercase">Bautismos (Año)</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                        {association?.config?.annualBaptismGoal?.toLocaleString() || 0}
                    </p>
                </div>
            </div>

            {/* Action Buttons Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MenuButton icon={<Map size={32} />} label="Zonas" onClick={() => navigate('zones')} />
                <MenuButton icon={<Users size={32} />} label="Distritos" onClick={() => navigate('districts')} />
                <MenuButton icon={<TrendingUp size={32} />} label="Crecimiento" onClick={() => navigate('growth')} />
                <MenuButton icon={<PieChart size={32} />} label="Reportes Globales" onClick={() => navigate('reports')} />
                <MenuButton icon={<Settings size={32} />} label="Configuración" onClick={() => navigate('config')} />
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

export default AssociationHome;
