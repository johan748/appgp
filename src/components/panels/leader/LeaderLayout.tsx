import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockBackend } from '../../../services/mockBackend';
import { SmallGroup, Member } from '../../../types';
import { Settings, ArrowLeft } from 'lucide-react';

const LeaderLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [gp, setGp] = useState<SmallGroup | null>(null);
    const [leader, setLeader] = useState<Member | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [configForm, setConfigForm] = useState({
        name: '', motto: '', verse: '', meetingDay: '', meetingTime: ''
    });

    useEffect(() => {
        if (user && user.relatedEntityId) {
            const gpData = mockBackend.getGPById(user.relatedEntityId);
            if (gpData) {
                setGp(gpData);
                setConfigForm({
                    name: gpData.name,
                    motto: gpData.motto,
                    verse: gpData.verse,
                    meetingDay: gpData.meetingDay,
                    meetingTime: gpData.meetingTime
                });

                const gpMembers = mockBackend.getMembersByGP(gpData.id);
                const leaderMember = gpMembers.find(m => m.id === gpData.leaderId);
                setLeader(leaderMember || null);
            }
        }
    }, [user]);

    const handleSaveConfig = (e: React.FormEvent) => {
        e.preventDefault();
        if (gp) {
            const updatedGp = { ...gp, ...configForm };
            mockBackend.updateGP(updatedGp);
            setGp(updatedGp);
            setIsConfigOpen(false);
        }
    };

    const getWelcomeMessage = () => {
        if (!leader) return `Bienvenido Líder ${user?.name}`;
        const prefix = leader.gender === 'M' ? 'Bienvenido' : 'Bienvenida';
        return `${prefix} Líder ${leader.firstName} ${leader.lastName}`;
    };

    if (!gp) return <div className="p-4">Cargando información del GP...</div>;

    const isHome = location.pathname === '/leader' || location.pathname === '/leader/';

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Top Navigation / Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {!isHome && (
                                <button onClick={() => navigate('/leader')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-[#3e8391]">{gp.name}</h1>
                                <div className="flex items-center space-x-2">
                                    <p className="text-xs text-gray-500 font-medium hidden md:block">{gp.motto}</p>
                                    <span className="text-gray-300 hidden md:block">|</span>
                                    <p className="text-xs text-gray-400 italic">{gp.meetingDay} - {gp.meetingTime}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="font-bold text-gray-800 text-sm">{getWelcomeMessage()}</p>
                                <button onClick={() => { logout(); navigate('/login'); }} className="text-xs font-semibold text-red-500 hover:text-red-700">Cerrar Sesión</button>
                            </div>
                            <div className="h-10 w-10 bg-[#3e8391] text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>

                    {/* Config Toggle */}
                    <div className="mt-2 text-right">
                        <button
                            onClick={() => setIsConfigOpen(!isConfigOpen)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-[#3e8391] transition-colors"
                        >
                            <Settings size={14} />
                            <span>Configuración</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Config Section (Toggle) */}
            {isConfigOpen && (
                <div className="container mx-auto px-4 py-4">
                    <div className="card animate-fade-in border-l-4 border-primary">
                        <h3 className="text-lg font-bold mb-4">Editar Información del GP</h3>
                        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre del GP</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={configForm.name} onChange={e => setConfigForm({ ...configForm, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Lema</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={configForm.motto} onChange={e => setConfigForm({ ...configForm, motto: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Versículo</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={configForm.verse} onChange={e => setConfigForm({ ...configForm, verse: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Día</label>
                                    <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={configForm.meetingDay} onChange={e => setConfigForm({ ...configForm, meetingDay: e.target.value })}>
                                        {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora</label>
                                    <input type="time" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={configForm.meetingTime} onChange={e => setConfigForm({ ...configForm, meetingTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="md:col-span-2 text-right">
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <main className="container mx-auto px-4 py-6">
                <Outlet context={{ gp }} />
            </main>
        </div>
    );
};

export default LeaderLayout;
