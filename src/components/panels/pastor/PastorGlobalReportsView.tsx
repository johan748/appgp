import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { District } from '../../../types';
import { BarChart } from 'lucide-react';

interface ChurchGPReport {
    churchId: string;
    churchName: string;
    gpId: string;
    gpName: string;
    attendance: number;
    studies: number;
    guests: number;
    baptisms: number;
    status: 'Activo' | 'Inactivo';
}

const PastorGlobalReportsView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const { backend } = useBackend();
    const [reportData, setReportData] = useState<ChurchGPReport[]>([]);
    const [filters, setFilters] = useState({
        startMonth: '01',
        startYear: '2024',
        endMonth: String(new Date().getMonth() + 1).padStart(2, '0'),
        endYear: String(new Date().getFullYear())
    });

    useEffect(() => {
        const loadGlobalReports = async () => {
            if (district) {
                try {
                    const allChurches = await backend.getChurches();
                    const churches = allChurches.filter(c => c.districtId === district.id);
                    const allReportsList = await backend.getReports();
                    const allGPs = await backend.getGPs();

                    const reportsData: ChurchGPReport[] = [];

                    // Build date range
                    const startDate = new Date(`${filters.startYear}-${filters.startMonth}-01`);
                    const endDate = new Date(`${filters.endYear}-${filters.endMonth}-01`);
                    endDate.setMonth(endDate.getMonth() + 1); // End of the month

                    churches.forEach(church => {
                        const gps = allGPs.filter(g => g.churchId === church.id);

                        gps.forEach(gp => {
                            const allGPReports = allReportsList.filter(r => r.gpId === gp.id);

                            // Filter reports by date range
                            const reports = allGPReports.filter(r => {
                                const reportDate = new Date(r.date);
                                return reportDate >= startDate && reportDate < endDate;
                            });

                            // Aggregate data from filtered reports for this GP
                            const attendance = reports.reduce((sum, r) => sum + (r.summary?.totalAttendance || 0), 0);
                            const studies = reports.reduce((sum, r) => sum + (r.summary?.totalStudies || 0), 0);
                            const guests = reports.reduce((sum, r) => sum + (r.summary?.totalGuests || 0), 0);
                            const baptisms = reports.reduce((sum, r) => sum + (r.summary?.baptisms || 0), 0);

                            reportsData.push({
                                churchId: church.id,
                                churchName: church.name,
                                gpId: gp.id,
                                gpName: gp.name,
                                attendance,
                                studies,
                                guests,
                                baptisms,
                                status: reports.length > 0 ? 'Activo' : 'Inactivo'
                            });
                        });
                    });

                    setReportData(reportsData);
                } catch (error) { console.error(error); }
            }
        };
        loadGlobalReports();
    }, [district, filters, backend]);

    const months = [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
    ];

    const years = Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => 2024 + i);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <BarChart className="text-primary" size={32} />
                    <h2 className="text-2xl font-bold text-gray-800">Reportes Globales por Iglesias</h2>
                </div>
            </div>

            {/* Date Filters */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Desde:</label>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 border border-gray-300 rounded-md p-2"
                                value={filters.startMonth}
                                onChange={(e) => setFilters({ ...filters, startMonth: e.target.value })}
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <select
                                className="w-24 border border-gray-300 rounded-md p-2"
                                value={filters.startYear}
                                onChange={(e) => setFilters({ ...filters, startYear: e.target.value })}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hasta:</label>
                        <div className="flex gap-2">
                            <select
                                className="flex-1 border border-gray-300 rounded-md p-2"
                                value={filters.endMonth}
                                onChange={(e) => setFilters({ ...filters, endMonth: e.target.value })}
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <select
                                className="w-24 border border-gray-300 rounded-md p-2"
                                value={filters.endYear}
                                onChange={(e) => setFilters({ ...filters, endYear: e.target.value })}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {reportData.length > 0 ? (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Iglesia</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GP</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Estudios</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Visitas</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bautismos</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportData.map((row, idx) => (
                                    <tr key={`${row.churchId}-${row.gpId}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.churchName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.gpName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.attendance}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.studies}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.guests}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.baptisms}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.status === 'Activo'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-10 text-center">
                    <p className="text-gray-500">No hay reportes disponibles para mostrar.</p>
                    <p className="text-sm text-gray-400 mt-2">Los grupos pequeños aún no han enviado reportes semanales.</p>
                </div>
            )}
        </div>
    );
};

export default PastorGlobalReportsView;
