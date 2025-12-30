import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { SmallGroup, WeeklyReport, Member, MissionaryPair } from '../../../types';
import { Check, X, Trash2, Calendar } from 'lucide-react';

const ReportsView: React.FC = () => {
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const [reports, setReports] = useState<WeeklyReport[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentReport, setCurrentReport] = useState<WeeklyReport | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [pairs, setPairs] = useState<MissionaryPair[]>([]);

    useEffect(() => {
        if (gp) {
            const gpReports = mockBackend.getReports().filter(r => r.gpId === gp.id);
            setReports(gpReports);
            setMembers(mockBackend.getMembersByGP(gp.id));
            setPairs(mockBackend.getMissionaryPairs().filter(p => p.gpId === gp.id));
        }
    }, [gp]);

    useEffect(() => {
        if (selectedDate) {
            const report = reports.find(r => r.date === selectedDate);
            setCurrentReport(report || null);
        } else {
            setCurrentReport(null);
        }
    }, [selectedDate, reports]);

    const navigate = useNavigate();

    const handleDelete = () => {
        if (currentReport && confirm('¿Estás seguro de eliminar este reporte?')) {
            mockBackend.deleteReport(currentReport.id);
            setReports(reports.filter(r => r.id !== currentReport.id));
            setCurrentReport(null);
            setSelectedDate('');
        }
    };

    const getMemberName = (id: string) => {
        const m = members.find(mem => mem.id === id);
        return m ? `${m.firstName} ${m.lastName}` : 'Desconocido';
    };

    const getPairNames = (id: string) => {
        const p = pairs.find(pair => pair.id === id);
        if (!p) return 'Pareja Desconocida';
        return `${getMemberName(p.member1Id)} & ${getMemberName(p.member2Id)}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Reportes Semanales</h2>
                <select
                    className="block w-64 border border-gray-300 rounded-md shadow-sm p-2"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                >
                    <option value="">Seleccionar Fecha...</option>
                    {reports.map(r => (
                        <option key={r.id} value={r.date}>{r.date}</option>
                    ))}
                </select>
            </div>

            {currentReport ? (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => navigate(`/leader/edit-report/${currentReport.id}`)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                            <Calendar size={18} />
                            <span>Editar</span>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                            <Trash2 size={18} />
                            <span>Eliminar</span>
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow text-center border-t-4 border-blue-500">
                            <p className="text-3xl font-bold text-gray-800">{currentReport.summary.totalAttendance}</p>
                            <p className="text-sm text-gray-500">Asistentes</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center border-t-4 border-green-500">
                            <p className="text-3xl font-bold text-gray-800">{currentReport.summary.totalStudies}</p>
                            <p className="text-sm text-gray-500">Estudios Bíblicos</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center border-t-4 border-purple-500">
                            <p className="text-3xl font-bold text-gray-800">{currentReport.summary.totalGuests}</p>
                            <p className="text-sm text-gray-500">Amigos Invitados</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow text-center border-t-4 border-orange-500">
                            <p className="text-sm text-gray-500">Bautismos</p>
                            <p className="text-3xl font-bold text-gray-800">{currentReport.baptisms || 0}</p>
                        </div>
                    </div>

                    {/* Detailed Attendance */}
                    <div className="bg-white shadow overflow-hidden rounded-lg">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-900">Detalle de Asistencia</h3>
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
                                    {currentReport.attendance.map((record, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {getMemberName(record.memberId)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {record.present ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-300 mx-auto" />}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {record.participated ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-200 mx-auto" />}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {record.studiesGiven ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-gray-200 mx-auto" />}
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                                {record.guests}
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
                            <h3 className="text-lg font-medium text-gray-900">Actividad de Parejas Misioneras</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {currentReport.missionaryPairsStats.map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                                    <span className="font-medium">{getPairNames(stat.pairId)}</span>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {stat.studiesGiven} Estudios
                                    </span>
                                </div>
                            ))}
                            {currentReport.missionaryPairsStats.length === 0 && <p className="text-gray-500">No hay actividad registrada.</p>}
                        </div>
                    </div>

                    {/* Baptisms */}
                    <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Bautismos Reportados</h3>
                        <span className="text-2xl font-bold text-primary">{currentReport.baptisms}</span>
                    </div>

                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">Seleccione una fecha para ver el reporte.</p>
                </div>
            )}
        </div>
    );
};

export default ReportsView;
