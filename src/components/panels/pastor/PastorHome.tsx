import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Church as ChurchIcon, UserCog, PlusCircle, Edit, FileText, TrendingUp, AlertTriangle, BarChart } from 'lucide-react';
import { District } from '../../../types';

const PastorHome: React.FC = () => {
    const navigate = useNavigate();
    const { district } = useOutletContext<{ district: District }>();

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Panel Pastoral</h2>

            {/* District Goals Section */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-md border-l-4 border-blue-600">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Metas del Distrito</h3>
                {district.goals && Object.keys(district.goals).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {district.goals.baptisms && (
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Bautismos</p>
                                <p className="text-2xl font-bold text-blue-600">{district.goals.baptisms.target}</p>
                                <p className="text-xs text-gray-400">{district.goals.baptisms.period}</p>
                            </div>
                        )}
                        {district.goals.weeklyAttendanceMembers && (
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Asist. Miembros</p>
                                <p className="text-2xl font-bold text-green-600">{district.goals.weeklyAttendanceMembers.target}%</p>
                                <p className="text-xs text-gray-400">{district.goals.weeklyAttendanceMembers.period}</p>
                            </div>
                        )}
                        {district.goals.weeklyAttendanceGp && (
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Asist. GP</p>
                                <p className="text-2xl font-bold text-green-600">{district.goals.weeklyAttendanceGp.target}%</p>
                                <p className="text-xs text-gray-400">{district.goals.weeklyAttendanceGp.period}</p>
                            </div>
                        )}
                        {district.goals.missionaryPairs && (
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Parejas Mis.</p>
                                <p className="text-2xl font-bold text-red-600">{district.goals.missionaryPairs.target}</p>
                                <p className="text-xs text-gray-400">{district.goals.missionaryPairs.period}</p>
                            </div>
                        )}
                        {district.goals.friends && (
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Amigos</p>
                                <p className="text-2xl font-bold text-purple-600">{district.goals.friends.target}</p>
                                <p className="text-xs text-gray-400">{district.goals.friends.period}</p>
                            </div>
                        )}
                        {district.goals.bibleStudies && (
                            <div className="bg-white p-3 rounded shadow-sm">
                                <p className="text-xs text-gray-500 uppercase">Estudios Bíb.</p>
                                <p className="text-2xl font-bold text-orange-600">{district.goals.bibleStudies.target}</p>
                                <p className="text-xs text-gray-400">{district.goals.bibleStudies.period}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-600">No hay metas registradas para este distrito.</p>
                )}
            </div>

            {/* Action Buttons Grid */}
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <MenuButton icon={<ChurchIcon size={32} />} label="Iglesias" onClick={() => navigate('churches')} />
                <MenuButton icon={<UserCog size={32} />} label="Roles" onClick={() => navigate('roles')} />
                <MenuButton icon={<PlusCircle size={32} />} label="Crear Iglesia" onClick={() => navigate('create-church')} />
                <MenuButton icon={<PlusCircle size={32} />} label="Crear Grupo" onClick={() => navigate('create-group')} />
                <MenuButton icon={<Edit size={32} />} label="Editar Grupo" onClick={() => navigate('edit-group')} />
                <MenuButton icon={<FileText size={32} />} label="Reporte de GP" onClick={() => navigate('reports')} />
                <MenuButton icon={<TrendingUp size={32} />} label="Top" onClick={() => navigate('top')} />
                <MenuButton icon={<AlertTriangle size={32} />} label="Alertas" onClick={() => navigate('alerts')} />
                <MenuButton icon={<BarChart size={32} />} label="Reportes Auto" onClick={() => navigate('auto-reports')} />
                <MenuButton icon={<BarChart size={32} />} label="Reportes Globales" onClick={() => navigate('global-reports')} />
            </section>
        </div>
    );
};

const MenuButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-100 group h-full"
    >
        <div className="text-primary mb-4 p-4 bg-blue-50 rounded-full group-hover:bg-white transition-colors">{icon}</div>
        <span className="font-bold text-center text-gray-700">{label}</span>
    </button>
);

export default PastorHome;
