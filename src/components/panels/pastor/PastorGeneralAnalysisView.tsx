import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, Member, Church, District, WeeklyReport } from '../../../types';
import { Users, UserPlus, Heart, TrendingUp, BarChart3, ChevronRight, Activity, Award } from 'lucide-react';

const PastorGeneralAnalysisView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const { backend } = useBackend();

    const [loading, setLoading] = useState(true);
    const [churches, setChurches] = useState<Church[]>([]);
    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [reports, setReports] = useState<WeeklyReport[]>([]);

    useEffect(() => {
        const loadAllData = async () => {
            if (!district) return;
            try {
                setLoading(true);
                const [allChurches, allGps, allMembers, allReports] = await Promise.all([
                    backend.getChurches(),
                    backend.getGPs(),
                    backend.getMembers(),
                    backend.getReports()
                ]);

                // Filter by district
                const districtChurches = allChurches.filter(c => c.districtId === district.id);
                const districtChurchIds = districtChurches.map(c => c.id);

                const districtGps = allGps.filter(g => districtChurchIds.includes(g.churchId));
                const districtGpIds = districtGps.map(g => g.id);

                const districtMembers = allMembers.filter(m => districtGpIds.includes(m.gpId));
                const districtReports = allReports.filter(r => districtGpIds.includes(r.gpId));

                setChurches(districtChurches);
                setGps(districtGps);
                setMembers(districtMembers);
                setReports(districtReports);
            } catch (error) {
                console.error("Error loading analysis data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAllData();
    }, [district, backend]);

    // Data Aggregation
    const stats = useMemo(() => {
        const friends = members.filter(m => !m.isBaptized);
        const actualMembers = members.filter(m => m.isBaptized);

        // Permanence Funnel
        const funnel = {
            invited: friends.filter(m => m.friendProgress?.invitedDate).length,
            regular: friends.filter(m => m.friendProgress?.regularAttenderDate).length,
            student: friends.filter(m => m.friendProgress?.studentDate).length,
            baptized: members.filter(m => m.friendProgress?.baptizedDate).length // Friends who became members
        };

        // Attendance Stats (Friends vs Members)
        // Note: reports carry attendance list. We need to average or get latest.
        // For simplicity, let's get current week's total guests and member attendance
        const latestReports = reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, gps.length);

        let totalGuests = 0;
        let totalMemberAttendance = 0;
        let totalReportedMembers = 0;

        latestReports.forEach(r => {
            totalGuests += r.summary.totalGuests || 0;
            totalMemberAttendance += r.attendance.filter(a => a.present).length;
            totalReportedMembers += r.attendance.length;
        });

        // Leadership development
        const leadership = {
            formacion: actualMembers.filter(m => m.leadershipProgress?.liderEnFormacionDate).length,
            secretario: actualMembers.filter(m => m.leadershipProgress?.secretarioDate).length,
            lider: actualMembers.filter(m => m.leadershipProgress?.liderGpDate).length
        };

        return {
            totalFriends: friends.length,
            totalMembers: actualMembers.length,
            funnel,
            leadership,
            latestAttendance: {
                guests: totalGuests,
                members: totalMemberAttendance,
                memberPercent: totalReportedMembers > 0 ? Math.round((totalMemberAttendance / totalReportedMembers) * 100) : 0
            }
        };
    }, [members, reports, gps]);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando Análisis General...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Análisis General</h2>
                    <p className="text-gray-500 font-medium">Distrito: {district.name}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                    <TrendingUp className="text-blue-600" size={28} />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Amigos en GP */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Amigos en GP</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 text-center">
                            <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-1">Total Amigos</p>
                            <p className="text-4xl font-black text-purple-900">{stats.totalFriends}</p>
                        </div>
                        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 text-center">
                            <p className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-1">Visitas Semanales</p>
                            <p className="text-4xl font-black text-orange-900">{stats.latestAttendance.guests}</p>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-700 mb-4 flex items-center">
                        <Activity className="mr-2 text-gray-400" size={18} />
                        Desarrollo de Permanencia
                    </h4>

                    <div className="space-y-4">
                        <FunnelStep label="Invitados" count={stats.funnel.invited} total={stats.totalFriends} color="bg-blue-500" />
                        <FunnelStep label="Asistentes Regulares" count={stats.funnel.regular} total={stats.totalFriends} color="bg-indigo-500" />
                        <FunnelStep label="Estudiantes Bíblicos" count={stats.funnel.student} total={stats.totalFriends} color="bg-purple-500" />
                        <FunnelStep label="Bautizados (IASD)" count={stats.funnel.baptized} total={stats.totalFriends} color="bg-green-500" />
                    </div>
                </section>

                {/* 2. Miembros en GP */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <UserPlus size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Miembros en GP</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Asistencia</p>
                            <p className="text-4xl font-black text-blue-900">{stats.latestAttendance.memberPercent}%</p>
                        </div>
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-center">
                            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Líderes Formados</p>
                            <p className="text-4xl font-black text-indigo-900">{stats.leadership.lider}</p>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-700 mb-4 flex items-center">
                        <Award className="mr-2 text-gray-400" size={18} />
                        Desarrollo de Liderazgo
                    </h4>

                    <div className="space-y-4">
                        <FunnelStep label="Líderes en Formación" count={stats.leadership.formacion} total={stats.totalMembers} color="bg-blue-400" icon={<Activity size={14} />} />
                        <FunnelStep label="Secretarios" count={stats.leadership.secretario} total={stats.totalMembers} color="bg-blue-500" />
                        <FunnelStep label="Líderes de GP" count={stats.leadership.lider} total={stats.totalMembers} color="bg-blue-600" />
                    </div>
                </section>

                {/* 3. Retención y 4. Desarrollo Integral */}
                <section className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl shadow-xl text-white lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <Heart className="mr-3" />
                                Retención de Bautizados
                            </h3>
                            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
                                <p className="text-6xl font-black mb-2">{stats.funnel.baptized}</p>
                                <p className="text-white/60 font-medium">Nuevos miembros retenidos en el discipulado</p>
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold">Meta de Integración</span>
                                        <span className="text-sm font-bold">85%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-400 w-[85%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <TrendingUp className="mr-3" />
                                Desarrollo Integral
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-white/80">Salud de GPs</span>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={`h-2 w-8 rounded-full ${i <= 4 ? 'bg-orange-400' : 'bg-white/20'}`}></div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed bg-white/5 p-4 rounded-lg">
                                    El desarrollo integral se mide por la participación activa en parejas misioneras, estudios bíblicos y asistencia constante.
                                </p>
                                <button className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors">
                                    Ver Detalle por GP
                                    <ChevronRight size={18} className="ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const FunnelStep = ({ label, count, total, color, icon }: { label: string, count: number, total: number, color: string, icon?: React.ReactNode }) => {
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium flex items-center">
                    {icon && <span className="mr-2">{icon}</span>}
                    {label}
                </span>
                <span className="font-bold text-gray-900">{count} <span className="text-gray-400 text-xs">({percent}%)</span></span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                    className={`h-full ${color} transition-all duration-1000 rounded-full`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
        </div>
    );
};

export default PastorGeneralAnalysisView;
