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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Membresía Total</h3>
                    <p className="text-4xl font-bold text-[#3e8391] mt-2">
                        {association?.membershipCount?.toLocaleString() || 0}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">GPs Activos</h3>
                    <p className="text-4xl font-bold text-[#3e8391] mt-2">{activeGPs}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Bautismos (Año)</h3>
                    <p className="text-4xl font-bold text-[#3e8391] mt-2">
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
        className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:bg-[#3e839105] transition-all duration-300 border border-gray-100 hover:border-[#3e839140] group"
    >
        <div className="text-[#3e8391] mb-4 p-5 bg-[#3e839110] rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className="font-bold text-lg text-gray-700">{label}</span>
    </button>
);

export default AssociationHome;
