import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCog, PlusCircle, Edit, FileText, TrendingUp } from 'lucide-react';

const DirectorHome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>

            {/* Action Buttons Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <MenuButton icon={<Users size={32} />} label="Grupos" onClick={() => navigate('groups')} />
                <MenuButton icon={<UserCog size={32} />} label="Roles" onClick={() => navigate('roles')} />
                <MenuButton icon={<PlusCircle size={32} />} label="Crear Grupo" onClick={() => navigate('create-group')} />
                <MenuButton icon={<Edit size={32} />} label="Editar Grupo" onClick={() => navigate('edit-group')} />
                <MenuButton icon={<FileText size={32} />} label="Reporte de GP" onClick={() => navigate('reports')} />
                <MenuButton icon={<TrendingUp size={32} />} label="Top" onClick={() => navigate('top')} />
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

export default DirectorHome;
