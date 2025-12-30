import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockBackend } from '../../../services/mockBackend';
import { SmallGroup, Member } from '../../../types';
import { Settings, Calendar, Target, Users, Heart, ClipboardList, UserPlus, UserCheck, Award } from 'lucide-react';

const LeaderDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [gp, setGp] = useState<SmallGroup | null>(null);
    const [leader, setLeader] = useState<Member | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);

    // Config Form State
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

                // Find leader member profile for gender/name
                const gpMembers = mockBackend.getMembersByGP(gpData.id);
                setMembers(gpMembers);
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

    const getBirthdays = () => {
        const currentMonth = new Date().getMonth();
        return members
            .filter(m => {
                // Parse date without timezone issues
                const [year, month, day] = m.birthDate.split('-').map(Number);
                const birthMonth = month - 1; // JS months are 0-indexed
                return birthMonth === currentMonth;
            })
            .map(m => {
                const [year, month, day] = m.birthDate.split('-').map(Number);
                const age = new Date().getFullYear() - year;
                return { ...m, ageToTurn: age, day };
            })
            .sort((a, b) => a.day - b.day);
    };

    if (!gp) return <div>Cargando...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Top Navigation / Header */}
            <header className="bg-white shadow">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-primary">{gp.name}</h1>
                        <p className="text-sm text-gray-500">{gp.motto} | {gp.verse}</p>
                        <p className="text-xs text-gray-400">{gp.meetingDay} - {gp.meetingTime}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-gray-900">{getWelcomeMessage()}</p>
                        <button onClick={() => { logout(); navigate('/login'); }} className="text-xs text-red-500 hover:text-red-700">Cerrar Sesión</button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 space-y-6">

                {/* Config Button */}
                <div>
                    <button
                        onClick={() => setIsConfigOpen(!isConfigOpen)}
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary"
                    >
                        <Settings size={16} />
                        <span>Configuración</span>
                    </button>
                </div>

                {/* Config Section (Toggle) */}
                {isConfigOpen && (
                    <div className="card animate-fade-in">
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
                            <div className="md:col-span-2">
                                <button type="submit" className="btn btn-primary w-full md:w-auto">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Goals Section */}
                <section className="space-y-2">
                    <h3 className="text-lg font-bold flex items-center"><Target className="mr-2" size={20} /> Metas del GP</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Order: Annual -> Weekly (Desc) - Simplified for display */}
                        <GoalCard title="Bautismos" value={gp.goals.baptisms.target} period={gp.goals.baptisms.period} />
                        <GoalCard title="Parejas Mis." value={gp.goals.missionaryPairs.target} period={gp.goals.missionaryPairs.period} />
                        <GoalCard title="Est. Bíblicos" value={gp.goals.bibleStudies.target} period={gp.goals.bibleStudies.period} />
                        <GoalCard title="Amigos" value={gp.goals.friends.target} period={gp.goals.friends.period} />
                        <GoalCard title="Asist. GP" value={`${gp.goals.weeklyAttendanceGp.target}%`} period={gp.goals.weeklyAttendanceGp.period} />
                        <GoalCard title="Asist. Miembros" value={`${gp.goals.weeklyAttendanceMembers.target}%`} period={gp.goals.weeklyAttendanceMembers.period} />
                    </div>
                </section>

                {/* Birthdays Section */}
                <section className="space-y-2">
                    <h3 className="text-lg font-bold flex items-center"><Calendar className="mr-2" size={20} /> Cumpleañeros del Mes</h3>
                    <div className="bg-white rounded-lg shadow p-4">
                        {getBirthdays().length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getBirthdays().map(m => (
                                    <div key={m.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-blue-50">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {m.day}
                                        </div>
                                        <div>
                                            <p className="font-medium">{m.firstName} {m.lastName}</p>
                                            <p className="text-sm text-gray-500">Cumple {m.ageToTurn} años</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No hay cumpleañeros este mes.</p>
                        )}
                    </div>
                </section>

                {/* Action Buttons Grid */}
                <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <MenuButton icon={<Users size={24} />} label="Miembros" onClick={() => navigate('members')} />
                    <MenuButton icon={<Heart size={24} />} label="Parejas Misioneras" onClick={() => navigate('pairs')} />
                    <MenuButton icon={<ClipboardList size={24} />} label="Asistencia" onClick={() => navigate('attendance')} />
                    <MenuButton icon={<ClipboardList size={24} />} label="Reporte" onClick={() => navigate('reports')} />
                    <MenuButton icon={<UserPlus size={24} />} label="Agregar" onClick={() => navigate('add-member')} />
                    <MenuButton icon={<UserCheck size={24} />} label="Amigos" onClick={() => navigate('friends')} />
                    <MenuButton icon={<Award size={24} />} label="Liderazgo" onClick={() => navigate('leadership')} />
                </section>
            </main>
        </div>
    );
};

const GoalCard = ({ title, value, period }: { title: string, value: string | number, period: string }) => (
    <div className="bg-white p-3 rounded shadow text-center border-t-4 border-blue-500">
        <p className="text-xs text-gray-500 uppercase">{period}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs font-medium text-gray-600">{title}</p>
    </div>
);

const MenuButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-md hover:bg-blue-50 transition-all duration-200"
    >
        <div className="text-primary mb-3">{icon}</div>
        <span className="font-medium text-gray-700">{label}</span>
    </button>
);

export default LeaderDashboard;
