import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { SmallGroup, Member, MissionaryPair } from '../../../types';
import { Save } from 'lucide-react';

const AttendanceView: React.FC = () => {
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);
    const [pairs, setPairs] = useState<MissionaryPair[]>([]);
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [baptisms, setBaptisms] = useState(0);

    // Form State
    const [attendanceData, setAttendanceData] = useState<Record<string, { present: boolean, participated: boolean, studies: boolean, guests: number }>>({});
    const [pairStudiesData, setPairStudiesData] = useState<Record<string, number>>({});

    useEffect(() => {
        if (gp) {
            const gpMembers = mockBackend.getMembersByGP(gp.id);
            setMembers(gpMembers);
            setPairs(mockBackend.getMissionaryPairs().filter(p => p.gpId === gp.id));

            // Initialize form data
            const initialData: any = {};
            gpMembers.forEach(m => {
                initialData[m.id] = { present: false, participated: false, studies: false, guests: 0 };
            });
            setAttendanceData(initialData);

            const initialPairData: any = {};
            mockBackend.getMissionaryPairs().filter(p => p.gpId === gp.id).forEach(p => {
                initialPairData[p.id] = 0;
            });
            setPairStudiesData(initialPairData);
        }
    }, [gp]);

    const handleMemberChange = (memberId: string, field: string, value: any) => {
        setAttendanceData(prev => ({
            ...prev,
            [memberId]: { ...prev[memberId], [field]: value }
        }));
    };

    const handlePairChange = (pairId: string, value: number) => {
        setPairStudiesData(prev => ({
            ...prev,
            [pairId]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate summaries
        const totalAttendance = Object.values(attendanceData).filter(d => d.present).length;
        const totalGuests = Object.values(attendanceData).reduce((sum, d) => sum + Number(d.guests), 0);
        const totalStudies = Object.values(pairStudiesData).reduce((sum, val) => sum + Number(val), 0);

        const newReport = {
            id: Math.random().toString(36).substr(2, 9),
            gpId: gp.id,
            date: reportDate,
            attendance: Object.entries(attendanceData).map(([memberId, data]) => ({
                memberId,
                present: data.present,
                participated: data.participated,
                studiesGiven: data.studies,
                guests: Number(data.guests)
            })),
            missionaryPairsStats: Object.entries(pairStudiesData).map(([pairId, studies]) => ({
                pairId,
                studiesGiven: Number(studies)
            })),
            baptisms: Number(baptisms),
            summary: {
                totalAttendance,
                totalStudies,
                totalGuests
            }
        };

        const reports = mockBackend.getReports();
        reports.push(newReport);
        localStorage.setItem('app_reports', JSON.stringify(reports));

        alert('Reporte enviado con éxito');
        navigate('/leader/reports');
    };

    const getMemberName = (id: string) => {
        const m = members.find(mem => mem.id === id);
        return m ? `${m.firstName} ${m.lastName}` : 'Desconocido';
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">Reporte Semanal de Asistencia</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Date Selection */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Reporte</label>
                    <input
                        type="date"
                        required
                        className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={reportDate}
                        onChange={e => setReportDate(e.target.value)}
                    />
                </div>

                {/* Member Attendance Table */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">Asistencia de Miembros</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miembro</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Asistencia</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Participación</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Est. Bíblicos</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invitados</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {members.map(member => (
                                    <tr key={member.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {member.firstName} {member.lastName}
                                            <div className="text-xs text-gray-500">{member.cedula}</div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input type="checkbox" className="h-5 w-5 text-blue-600 rounded"
                                                checked={attendanceData[member.id]?.present || false}
                                                onChange={e => handleMemberChange(member.id, 'present', e.target.checked)} />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input type="checkbox" className="h-5 w-5 text-blue-600 rounded"
                                                checked={attendanceData[member.id]?.participated || false}
                                                onChange={e => handleMemberChange(member.id, 'participated', e.target.checked)} />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input type="checkbox" className="h-5 w-5 text-blue-600 rounded"
                                                checked={attendanceData[member.id]?.studies || false}
                                                onChange={e => handleMemberChange(member.id, 'studies', e.target.checked)} />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <input type="number" min="0" className="w-16 border border-gray-300 rounded p-1 text-center"
                                                value={attendanceData[member.id]?.guests || 0}
                                                onChange={e => handleMemberChange(member.id, 'guests', e.target.value)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Missionary Pairs Stats */}
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">Parejas Misioneras</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        {pairs.map(pair => (
                            <div key={pair.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">{getMemberName(pair.member1Id)} & {getMemberName(pair.member2Id)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-600">Estudios Bíblicos dados:</label>
                                    <input type="number" min="0" className="w-20 border border-gray-300 rounded p-1"
                                        value={pairStudiesData[pair.id] || 0}
                                        onChange={e => handlePairChange(pair.id, Number(e.target.value))} />
                                </div>
                            </div>
                        ))}
                        {pairs.length === 0 && <p className="text-gray-500 text-sm">No hay parejas misioneras registradas.</p>}
                    </div>
                </div>

                {/* Baptisms */}
                <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Bautismos de la Semana</h3>
                    <input type="number" min="0" className="w-24 border border-gray-300 rounded p-2 text-lg font-bold"
                        value={baptisms}
                        onChange={e => setBaptisms(Number(e.target.value))} />
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary px-8 py-3 text-lg shadow-lg">
                        <Save className="mr-2" />
                        Enviar Reporte
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AttendanceView;
