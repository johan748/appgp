import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { Association, Zone } from '../../../types';
import { BarChart, Users, BookOpen, Activity } from 'lucide-react';

const AssociationGlobalReportsView: React.FC = () => {
    const { association } = useOutletContext<{ association: Association }>();
    const [zones, setZones] = useState<Zone[]>([]);
    const [globalStats, setGlobalStats] = useState({
        totalAttendance: 0,
        totalStudies: 0,
        totalGuests: 0,
        totalBaptisms: 0
    });
    const [filters, setFilters] = useState({
        startMonth: '01',
        startYear: '2024',
        endMonth: String(new Date().getMonth() + 1).padStart(2, '0'),
        endYear: String(new Date().getFullYear())
    });

    // Breakdown by Zone
    const [zoneStats, setZoneStats] = useState<any[]>([]);

    useEffect(() => {
        if (association) {
            const assocZones = mockBackend.getZones().filter(z => z.associationId === association.id);
            setZones(assocZones);

            // Calculate Global Stats from Reports
            const allReports = mockBackend.getReports();
            // TODO: In a real app, filtering reports by association requires walking down the tree: 
            // Association -> Zones -> Districts -> Churches -> GPs -> Reports
            // For mock, we can assume reports belong to GPs, and GPs belong to Churches...

            // 1. Get all GPs in this Association
            const allDistricts = mockBackend.getDistricts();
            const allChurches = mockBackend.getChurches();
            const allGPs = mockBackend.getGPs();

            const assocDistricts = allDistricts.filter(d => assocZones.some(z => z.id === d.zoneId));
            const assocChurches = allChurches.filter(c => assocDistricts.some(d => d.id === c.districtId));
            const assocGPs = allGPs.filter(g => assocChurches.some(c => c.id === g.churchId));
            const assocGpIds = assocGPs.map(g => g.id);

            // Build date range
            const startDate = new Date(`${filters.startYear}-${filters.startMonth}-01`);
            const endDate = new Date(`${filters.endYear}-${filters.endMonth}-01`);
            endDate.setMonth(endDate.getMonth() + 1); // End of the month

            // Filter reports by GP and date range
            const assocReports = allReports.filter(r => {
                if (!assocGpIds.includes(r.gpId)) return false;
                const reportDate = new Date(r.date);
                return reportDate >= startDate && reportDate < endDate;
            });

            // Aggregate
            const totalAttendance = assocReports.reduce((sum, r) => sum + (r.summary?.totalAttendance || 0), 0);
            const totalStudies = assocReports.reduce((sum, r) => sum + (r.summary?.totalStudies || 0), 0);
            const totalGuests = assocReports.reduce((sum, r) => sum + (r.summary?.totalGuests || 0), 0);
            const totalBaptisms = assocReports.reduce((sum, r) => sum + (r.summary?.baptisms || 0), 0);

            setGlobalStats({ totalAttendance, totalStudies, totalGuests, totalBaptisms });

            // Stats by Zone
            const statsByZone = assocZones.map(zone => {
                const zDistricts = assocDistricts.filter(d => d.zoneId === zone.id);
                const zChurches = assocChurches.filter(c => zDistricts.some(d => d.id === c.districtId));
                const zGPs = assocGPs.filter(g => zChurches.some(c => c.id === g.churchId));
                const zReports = assocReports.filter(r => zGPs.some(g => g.id === r.gpId));

                return {
                    id: zone.id,
                    name: zone.name,
                    attendance: zReports.reduce((sum, r) => sum + (r.summary?.totalAttendance || 0), 0),
                    studies: zReports.reduce((sum, r) => sum + (r.summary?.totalStudies || 0), 0),
                    guests: zReports.reduce((sum, r) => sum + (r.summary?.totalGuests || 0), 0)
                };
            });
            setZoneStats(statsByZone);
        }
    }, [association, filters]);

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
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Reportes Globales de la Asociación</h2>

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

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow border-b-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Asistencia Total</h3>
                        <Users className="text-blue-500" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{globalStats.totalAttendance}</p>
                    <p className="text-xs text-green-500 mt-1 flex items-center">
                        <Activity size={12} className="mr-1" /> Actividad reciente
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-b-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Estudios Bíblicos</h3>
                        <BookOpen className="text-green-500" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{globalStats.totalStudies}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-b-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Amigos/Visitas</h3>
                        <Users className="text-purple-500" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{globalStats.totalGuests}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border-b-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 text-sm font-medium">Bautismos</h3>
                        <Activity className="text-red-500" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{globalStats.totalBaptisms}</p>
                    <p className="text-xs text-gray-400 mt-1">Acumulado anual</p>
                </div>
            </div>

            {/* Zone Comparison Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Desempeño por Zonas</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Asistencia</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Estudios</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Visitas</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {zoneStats.map((z) => (
                            <tr key={z.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{z.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{z.attendance}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{z.studies}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{z.guests}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Activo
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssociationGlobalReportsView;
