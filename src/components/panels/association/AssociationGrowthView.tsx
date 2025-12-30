import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { Association } from '../../../types';
import { TrendingUp } from 'lucide-react';

const AssociationGrowthView: React.FC = () => {
    const { association } = useOutletContext<{ association: Association }>();
    const [growthData, setGrowthData] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        startMonth: '01',
        startYear: '2024',
        endMonth: String(new Date().getMonth() + 1).padStart(2, '0'),
        endYear: String(new Date().getFullYear())
    });

    useEffect(() => {
        if (association) {
            const assocZones = mockBackend.getZones().filter(z => z.associationId === association.id);
            const allDistricts = mockBackend.getDistricts().filter(d => assocZones.some(z => z.id === d.zoneId));

            // Build date range
            const startDate = new Date(`${filters.startYear}-${filters.startMonth}-01`);
            const endDate = new Date(`${filters.endYear}-${filters.endMonth}-01`);
            endDate.setMonth(endDate.getMonth() + 1);

            const data = allDistricts.map(d => {
                const zoneName = assocZones.find(z => z.id === d.zoneId)?.name;

                // Get all churches and GPs in this district
                const churches = mockBackend.getChurches().filter(c => c.districtId === d.id);
                const gps = mockBackend.getGPs().filter(g => churches.some(c => c.id === g.churchId));
                const allReports = mockBackend.getReports();

                // Filter reports by date range and district GPs
                const reports = allReports.filter(r => {
                    if (!gps.some(g => g.id === r.gpId)) return false;
                    const reportDate = new Date(r.date);
                    return reportDate >= startDate && reportDate < endDate;
                });

                // Calculate actuals from reports
                const actualBaptisms = reports.reduce((sum, r) => sum + (r.summary?.baptisms || 0), 0);
                const actualStudies = reports.reduce((sum, r) => sum + (r.summary?.totalStudies || 0), 0);
                const actualGuests = reports.reduce((sum, r) => sum + (r.summary?.totalGuests || 0), 0);

                // Get missionary pairs count (filtered by creation date)
                const allPairs = mockBackend.getMissionaryPairs().filter(p => {
                    if (!gps.some(g => g.id === p.gpId)) return false;
                    if (!p.createdAt) return true; // Include if no date (backward compatibility)
                    const createdDate = new Date(p.createdAt);
                    return createdDate >= startDate && createdDate < endDate;
                });

                // Goals from district
                const goalBaptisms = d.goals?.baptisms?.target || 0;
                const goalStudies = d.goals?.bibleStudies?.target || 0;
                const goalPairs = d.goals?.missionaryPairs?.target || 0;
                const goalFriends = d.goals?.friends?.target || 0;

                // Calculate progress percentage
                const progressPct = goalBaptisms > 0 ? Math.round((actualBaptisms / goalBaptisms) * 100) : 0;

                return {
                    id: d.id,
                    districtName: d.name,
                    zoneName,
                    progress: progressPct,
                    studies: { goal: goalStudies, actual: actualStudies },
                    pairs: { goal: goalPairs, actual: allPairs.length },
                    friends: { goal: goalFriends, actual: actualGuests },
                    baptisms: { goal: goalBaptisms, actual: actualBaptisms }
                };
            });

            setGrowthData(data);
        }
    }, [association, filters]);

    const getProgressColor = (actual: number, goal: number) => {
        if (goal === 0) return 'text-gray-400';
        const pct = (actual / goal) * 100;
        if (pct >= 100) return 'text-green-600';
        if (pct >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const months = [
        { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' }, { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
    ];

    const years = Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => 2024 + i);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="mr-2 text-primary" /> Crecimiento y Metas
            </h2>

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

            {/* Growth Table */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distrito / Zona</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Progreso</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estudios Bíblicos</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Parejas Mis.</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Amigos</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bautismos</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {growthData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{item.districtName}</div>
                                    <div className="text-xs text-gray-500">{item.zoneName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className={`text-2xl font-bold ${item.progress >= 100 ? 'text-green-600' : item.progress >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {item.progress}%
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm">
                                        <div className={`font-bold ${getProgressColor(item.studies.actual, item.studies.goal)}`}>
                                            {item.studies.actual}
                                        </div>
                                        <div className="text-xs text-gray-400">Meta: {item.studies.goal}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm">
                                        <div className={`font-bold ${getProgressColor(item.pairs.actual, item.pairs.goal)}`}>
                                            {item.pairs.actual}
                                        </div>
                                        <div className="text-xs text-gray-400">Meta: {item.pairs.goal}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm">
                                        <div className={`font-bold ${getProgressColor(item.friends.actual, item.friends.goal)}`}>
                                            {item.friends.actual}
                                        </div>
                                        <div className="text-xs text-gray-400">Meta: {item.friends.goal}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="text-sm">
                                        <div className={`font-bold ${getProgressColor(item.baptisms.actual, item.baptisms.goal)}`}>
                                            {item.baptisms.actual}
                                        </div>
                                        <div className="text-xs text-gray-400">Meta: {item.baptisms.goal}</div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {growthData.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No hay datos de crecimiento disponibles.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssociationGrowthView;
