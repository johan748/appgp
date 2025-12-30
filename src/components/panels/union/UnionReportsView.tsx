import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Union, Association, District } from '../../../types';
import { mockBackend } from '../../../services/mockBackend';
import { Users, Activity, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

const UnionReportsView: React.FC = () => {
    const { union } = useOutletContext<{ union: Union }>();
    const [reportData, setReportData] = useState<any[]>([]);
    const [totals, setTotals] = useState({ attendance: 0, studies: 0, baptisms: 0 });
    const [filters, setFilters] = useState({
        startMonth: '01',
        startYear: '2024',
        endMonth: String(new Date().getMonth() + 1).padStart(2, '0'),
        endYear: String(new Date().getFullYear())
    });
    const [expandedAssociations, setExpandedAssociations] = useState<Set<string>>(new Set());

    const months = [
        { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' }, { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
    ];

    const years = Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => 2024 + i);

    useEffect(() => {
        if (union) {
            calculateReports();
        }
    }, [union, filters]);

    const toggleAssociation = (assocId: string) => {
        const newExpanded = new Set(expandedAssociations);
        if (newExpanded.has(assocId)) {
            newExpanded.delete(assocId);
        } else {
            newExpanded.add(assocId);
        }
        setExpandedAssociations(newExpanded);
    };

    const calculateReports = () => {
        // 1. Get Associations in Union
        const assocs = mockBackend.getAssociations().filter(a => a.unionId === union.id);

        // 2. Walk down to reports
        // Since mockBackend doesn't have an easy "getReportsByAssociation", we have to do the heavy lifting here
        // or iterate nicely.
        // Hierarchy: Assoc -> Zone -> District -> Church -> GP -> Reports

        const allZones = mockBackend.getZones();
        const allDistricts = mockBackend.getDistricts();
        const allChurches = mockBackend.getChurches();
        const allGPs = mockBackend.getGPs();
        const allReports = mockBackend.getReports();

        // Build date range
        const startDate = new Date(`${filters.startYear}-${filters.startMonth}-01`);
        const endDate = new Date(`${filters.endYear}-${filters.endMonth}-01`);
        endDate.setMonth(endDate.getMonth() + 1);

        const data = assocs.map(assoc => {
            // Find related zones
            const zones = allZones.filter(z => z.associationId === assoc.id);
            const districtIds = allDistricts.filter(d => zones.some(z => z.id === d.zoneId)).map(d => d.id);
            const churchIds = allChurches.filter(c => districtIds.includes(c.districtId)).map(c => c.id);
            const gps = allGPs.filter(g => churchIds.includes(g.churchId)); // Note: GP has churchId
            const gpIds = gps.map(g => g.id);

            // Filter reports for these GPs and date range
            const assocReports = allReports.filter(r => {
                if (!gpIds.includes(r.gpId)) return false;
                const reportDate = new Date(r.date);
                return reportDate >= startDate && reportDate < endDate;
            });

            // Get districts for this association
            const assocDistricts = allDistricts.filter(d => zones.some(z => z.id === d.zoneId));

            const districts = assocDistricts.map(district => {
                const districtChurches = allChurches.filter(c => c.districtId === district.id);
                const districtGPs = allGPs.filter(g => districtChurches.some(c => c.id === g.churchId));
                const districtReports = allReports.filter(r => {
                    if (!districtGPs.some(g => g.id === r.gpId)) return false;
                    const reportDate = new Date(r.date);
                    return reportDate >= startDate && reportDate < endDate;
                });

                return {
                    id: district.id,
                    name: district.name,
                    attendance: districtReports.reduce((s, r) => s + (r.summary?.totalAttendance || 0), 0),
                    studies: districtReports.reduce((s, r) => s + (r.summary?.totalStudies || 0), 0),
                    baptisms: districtReports.reduce((s, r) => s + (r.summary?.baptisms || 0), 0)
                };
            });

            // Calculate association totals by summing district totals
            const associationAttendance = districts.reduce((sum, d) => sum + d.attendance, 0);
            const associationStudies = districts.reduce((sum, d) => sum + d.studies, 0);
            const associationBaptisms = districts.reduce((sum, d) => sum + d.baptisms, 0);

            return {
                id: assoc.id,
                name: assoc.name,
                attendance: associationAttendance,
                studies: associationStudies,
                baptisms: associationBaptisms,
                districts
            };
        });

        setReportData(data);
        setTotals({
            attendance: data.reduce((s, d) => s + d.attendance, 0),
            studies: data.reduce((s, d) => s + d.studies, 0),
            baptisms: data.reduce((s, d) => s + d.baptisms, 0)
        });
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Reportes Globales de la Unión</h2>

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

            {/* Hierarchical Structure */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Estructura Jerárquica por Asociación</h3>
                    <p className="text-sm text-gray-600">Haz clic en los nombres de las asociaciones para expandir y ver sus distritos</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {reportData.map(assoc => {
                        const isExpanded = expandedAssociations.has(assoc.id);

                        return (
                            <div key={assoc.id} className="border-b border-gray-200">
                                {/* Association Row */}
                                <div
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer bg-blue-50"
                                    onClick={() => toggleAssociation(assoc.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">Asociación: {assoc.name}</h4>
                                            <p className="text-sm text-gray-600">{assoc.districts.length} Distritos</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <span>Asistencia: {assoc.attendance}</span>
                                            <span>Estudios: {assoc.studies}</span>
                                            <span>Bautismos: {assoc.baptisms}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Districts */}
                                {isExpanded && assoc.districts.map((district: any) => (
                                    <div key={district.id} className="ml-6 border-l-2 border-green-200">
                                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 bg-green-50">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-4"></div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Distrito: {district.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="grid grid-cols-3 gap-4 text-xs">
                                                    <span>Asist: {district.attendance}</span>
                                                    <span>Est: {district.studies}</span>
                                                    <span>Baut: {district.baptisms}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UnionReportsView;
