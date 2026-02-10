import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, WeeklyReport, Member, MissionaryPair } from '../../../types';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const EditReportView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [report, setReport] = useState<WeeklyReport | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [pairs, setPairs] = useState<MissionaryPair[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (gp && id) {
                try {
                    const gpMembers = await backend.getMembersByGP(gp.id);
                    setMembers(gpMembers);

                    const allPairs = await backend.getMissionaryPairs();
                    setPairs(allPairs.filter(p => p.gpId === gp.id));

                    const allReports = await backend.getReports();
                    const found = allReports.find(r => r.id === id);
                    if (found) {
                        setReport(JSON.parse(JSON.stringify(found))); // Deep copy
                    }
                } catch (error) {
                    console.error("Error loading report data:", error);
                }
            }
        };
        loadData();
    }, [gp, id, backend]);

    const handleAttendanceChange = (idx: number, field: string, value: any) => {
        if (!report) return;
        const newAttendance = [...report.attendance];
        newAttendance[idx] = { ...newAttendance[idx], [field]: value };

        // Recalculate summary
        const newSummary = {
            totalAttendance: newAttendance.filter(r => r.present).length,
            totalStudies: newAttendance.filter(r => r.studiesGiven).length,
            totalGuests: newAttendance.reduce((sum, r) => sum + (r.guests || 0), 0),
            baptisms: report.summary.baptisms // Should be editable separately
        };

        setReport({ ...report, attendance: newAttendance, summary: newSummary });
    };

    const handlePairChange = (idx: number, value: number) => {
        if (!report) return;
        const newStats = [...report.missionaryPairsStats];
        newStats[idx] = { ...newStats[idx], studiesGiven: value };
        setReport({ ...report, missionaryPairsStats: newStats });
    };

    const handleSave = async () => {
        if (report) {
            try {
                await backend.updateReport(report);
                showToast('Reporte actualizado exitosamente', 'success');
                navigate('/leader/reports');
            } catch (error) {
                console.error("Error updating report:", error);
                showToast('Error al actualizar reporte', 'error');
            }
        }
    };

    const getMemberName = (id: string) => {
        const m = members.find(mem => mem.id === id);
        return m ? `${m.firstName} ${m.lastName}` : 'Desconocido';
    };

    const getPairName = (id: string) => {
        const p = pairs.find(pair => pair.id === id);
        if (!p) return 'Pareja Desconocida';
        return `${getMemberName(p.member1Id)} & ${getMemberName(p.member2Id)}`;
    };

    if (!report) return <div>Cargando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/leader/reports')} className="mr-4 text-gray-600 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Editar Reporte: {report.date}</h2>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-bold">Asistencia y Actividad</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miembro</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Presente</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Participó</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estudios</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invitados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.attendance.map((record, idx) => (
                                <tr key={idx} className="bg-white hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {getMemberName(record.memberId)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input type="checkbox" checked={record.present}
                                            onChange={e => handleAttendanceChange(idx, 'present', e.target.checked)} className="h-5 w-5" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input type="checkbox" checked={record.participated}
                                            onChange={e => handleAttendanceChange(idx, 'participated', e.target.checked)} className="h-5 w-5" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input type="checkbox" checked={record.studiesGiven}
                                            onChange={e => handleAttendanceChange(idx, 'studiesGiven', e.target.checked)} className="h-5 w-5" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input type="number" min="0" value={record.guests || 0}
                                            onChange={e => handleAttendanceChange(idx, 'guests', parseInt(e.target.value) || 0)} className="w-16 border rounded p-1" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="font-bold mb-4">Parejas Misioneras (Estudios Dados)</h3>
                    <div className="space-y-4">
                        {report.missionaryPairsStats.map((stat, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="text-sm font-medium">{getPairName(stat.pairId)}</span>
                                <input
                                    type="number"
                                    min="0"
                                    value={stat.studiesGiven}
                                    onChange={e => handlePairChange(idx, parseInt(e.target.value) || 0)}
                                    className="w-20 border rounded p-1"
                                />
                            </div>
                        ))}
                        {report.missionaryPairsStats.length === 0 && <p className="text-gray-500 text-sm">No hay parejas asignadas.</p>}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="font-bold mb-4">Resumen Adicional</h3>
                    <div className="flex justify-between items-center bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <span className="font-medium text-orange-800">Bautismos esta semana:</span>
                        <input
                            type="number"
                            min="0"
                            value={report.summary?.baptisms || 0}
                            onChange={e => {
                                const value = parseInt(e.target.value) || 0;
                                setReport({ ...report, baptisms: value, summary: { ...report.summary, baptisms: value } })
                            }}
                            className="w-20 border border-orange-300 rounded p-1 text-center font-bold"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} className="btn btn-primary px-8">
                    <Save className="mr-2" size={18} />
                    Guardar Cambios
                </button>
            </div>
        </div>
    );
};

export default EditReportView;
