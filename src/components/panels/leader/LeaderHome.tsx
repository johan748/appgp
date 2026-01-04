import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, Member } from '../../../types';
import { Calendar, Target, Users, Heart, ClipboardList, UserPlus, UserCheck, Award } from 'lucide-react';

const LeaderHome: React.FC = () => {
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const { backend } = useBackend();
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        const loadMembers = async () => {
            if (gp) {
                try {
                    const data = await backend.getMembersByGP(gp.id);
                    setMembers(data);
                } catch (error) {
                    console.error("Error loading members:", error);
                }
            }
        };
        loadMembers();
    }, [gp, backend]);

    const getBirthdays = () => {
        const currentMonth = new Date().getMonth();
        const birthdaysThisMonth = members
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
        return birthdaysThisMonth;
    };

    return (
        <div className="space-y-6">
            {/* Goals Section */}
            <section className="space-y-2">
                <h3 className="text-lg font-bold flex items-center text-gray-800"><Target className="mr-2 text-primary" size={20} /> Metas del GP</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                <h3 className="text-lg font-bold flex items-center text-gray-800"><Calendar className="mr-2 text-primary" size={20} /> Cumpleañeros del Mes</h3>
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
                <MenuButton icon={<Users size={28} />} label="Miembros" onClick={() => navigate('members')} />
                <MenuButton icon={<Heart size={28} />} label="Parejas Misioneras" onClick={() => navigate('pairs')} />
                <MenuButton icon={<ClipboardList size={28} />} label="Asistencia" onClick={() => navigate('attendance')} />
                <MenuButton icon={<ClipboardList size={28} />} label="Reporte" onClick={() => navigate('reports')} />
                <MenuButton icon={<UserPlus size={28} />} label="Agregar" onClick={() => navigate('add-member')} />
                <MenuButton icon={<UserCheck size={28} />} label="Amigos" onClick={() => navigate('friends')} />
                <MenuButton icon={<Award size={28} />} label="Liderazgo" onClick={() => navigate('leadership')} />
            </section>
        </div>
    );
};

const GoalCard = ({ title, value, period }: { title: string, value: string | number, period: string }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-all duration-300">
        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{period}</p>
        <p className="text-3xl font-bold text-[#3e8391] my-1">{value}</p>
        <p className="text-xs font-bold text-gray-600 uppercase tracking-tight">{title}</p>
    </div>
);

const MenuButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:bg-[#3e839105] transition-all duration-300 border border-gray-100 hover:border-[#3e839140] group"
    >
        <div className="text-[#3e8391] mb-3 p-4 bg-[#3e839110] rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className="font-bold text-gray-700 text-sm">{label}</span>
    </button>
);

export default LeaderHome;
