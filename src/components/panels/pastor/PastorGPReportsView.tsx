import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { District, SmallGroup, WeeklyReport, Member, Church } from '../../../types';
import { Check, X } from 'lucide-react';

const PastorGPReportsView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const [churches, setChurches] = useState<Church[]>([]);
    const [selectedChurchId, setSelectedChurchId] = useState('');
    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [selectedGpId, setSelectedGpId] = useState('');
    const [reports, setReports] = useState<WeeklyReport[]>([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentReport, setCurrentReport] = useState<WeeklyReport | null>(null);
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        // Load churches
        const allChurches = mockBackend.getChurches();
        setChurches(allChurches.filter(c => c.districtId === district.id));
    }, [district.id]);

    useEffect(() => {
        if (selectedChurchId) {
            setGps(mockBackend.getGPs().filter(g => g.churchId === selectedChurchId));
            setSelectedGpId('');
            setReports([]);
            setCurrentReport(null);
        } else {
            setGps([]);
        }
    }, [selectedChurchId]);

    useEffect(() => {
        if (selectedGpId) {
            const gpReports = mockBackend.getReports().filter(r => r.gpId === selectedGpId);
            setReports(gpReports);
            setMembers(mockBackend.getMembersByGP(selectedGpId));
            setSelectedDate('');
            setCurrentReport(null);
        }
    }, [selectedGpId]);

    useEffect(() => {
        if (selectedDate) {
            const report = reports.find(r => r.date === selectedDate);
            setCurrentReport(report || null);
        }
    }, [selectedDate, reports]);

    const getMemberName = (id: string) => {
        const m = members.find(mem => mem.id === id);
        return m ? `${m.firstName} ${m.lastName}` : 'Desconocido';
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Reportes de Grupos Pequeños</h2>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Iglesia</label>
                    <select
                        className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={selectedChurchId}
                        onChange={e => setSelectedChurchId(e.target.value)}
                    >
                        <option value="">Seleccione una Iglesia...</option>
                        {churches.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar GP</label>
                    <select
                        className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={selectedGpId}
                        onChange={e => setSelectedGpId(e.target.value)}
                        disabled={!selectedChurchId}
                    >
                        <option value="">Seleccione un GP...</option>
                        {gps.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Fecha</label>
                    <select
                        className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        disabled={!selectedGpId}
                    >
                        <option value="">Seleccione Fecha...</option>
                        {reports.map(r => (
                            <option key={r.id} value={r.date}>{r.date}</option>
                        ))}
                    </select>
                </div>
            </div>

            {currentReport ? (
                <div className="space-y-6 animate-fade-in">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">Seleccione una iglesia, GP y fecha para ver el reporte.</p>
                </div>
            )}
        </div>
    );
};

export default PastorGPReportsView;
