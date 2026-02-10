import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { Association, Zone, District, Church, SmallGroup, Report, Member } from '../../../types';
import { BarChart, Users, BookOpen, Activity, ChevronDown, ChevronRight } from 'lucide-react';

const AssociationGlobalReportsView: React.FC = () => {
    const { association } = useOutletContext<{ association: Association }>();
    const { backend } = useBackend();
    const [zones, setZones] = useState<Zone[]>([]);

    // Cached data for hierarchy rendering
    const [allDistricts, setAllDistricts] = useState<District[]>([]);
    const [allChurches, setAllChurches] = useState<Church[]>([]);
    const [allGPs, setAllGPs] = useState<SmallGroup[]>([]);
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [allMembers, setAllMembers] = useState<Member[]>([]);

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
    const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set());
    const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());
    const [expandedChurches, setExpandedChurches] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadData = async () => {
            if (association) {
                try {
                    const loadedZones = await backend.getZones();
                    const assocZones = loadedZones.filter(z => z && z.associationId === association.id);
                    setZones(assocZones);

                    // Fetch all hierarchy data once
                    const [districtsData, churchesData, gpsData, reportsData, membersData] = await Promise.all([
                        backend.getDistricts(),
                        backend.getChurches(),
                        backend.getGPs(),
                        backend.getReports(),
                        backend.getMembers()
                    ]);

                    setAllDistricts(districtsData || []);
                    setAllChurches(churchesData || []);
                    setAllGPs(gpsData || []);
                    setAllReports(reportsData || []);
                    setAllMembers(membersData || []);

                    // Filter down for stats calculation
                    const assocDistricts = (districtsData || []).filter(d => d && assocZones.some(z => z.id === d.zoneId));
                    const assocChurches = (churchesData || []).filter(c => c && assocDistricts.some(d => d.id === c.districtId));
                    const assocGPs = (gpsData || []).filter(g => g && assocChurches.some(c => c.id === g.churchId));
                    const assocGpIds = assocGPs.map(g => g.id);

                    // Build date range
                    const startDate = new Date(`${filters.startYear}-${filters.startMonth}-01`);
                    const endDate = new Date(`${filters.endYear}-${filters.endMonth}-01`);
                    endDate.setMonth(endDate.getMonth() + 1); // End of the month

                    // Filter reports by GP and date range
                    const assocReports = reportsData.filter(r => {
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
                            guests: zReports.reduce((sum, r) => sum + (r.summary?.totalGuests || 0), 0),
                            baptisms: zReports.reduce((sum, r) => sum + (r.summary?.baptisms || 0), 0)
                        };
                    });
                    setZoneStats(statsByZone);
                } catch (e) { console.error(e); }
            }
        };
        loadData();
    }, [association, filters, backend]);

    const toggleZone = (zoneId: string) => {
        const newExpanded = new Set(expandedZones);
        if (newExpanded.has(zoneId)) {
            newExpanded.delete(zoneId);
        } else {
            newExpanded.add(zoneId);
        }
        setExpandedZones(newExpanded);
    };

    const toggleDistrict = (districtId: string) => {
        const newExpanded = new Set(expandedDistricts);
        if (newExpanded.has(districtId)) {
            newExpanded.delete(districtId);
        } else {
            newExpanded.add(districtId);
        }
        setExpandedDistricts(newExpanded);
    };

    const toggleChurch = (churchId: string) => {
        const newExpanded = new Set(expandedChurches);
        if (newExpanded.has(churchId)) {
            newExpanded.delete(churchId);
        } else {
            newExpanded.add(churchId);
        }
        setExpandedChurches(newExpanded);
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

    const renderHierarchy = () => {
        // Build date range
        const startDate = new Date(`${filters.startYear}-${filters.startMonth}-01`);
        const endDate = new Date(`${filters.endYear}-${filters.endMonth}-01`);
        endDate.setMonth(endDate.getMonth() + 1);

        return zones.map(zone => {
            const zoneDistricts = allDistricts.filter(d => d.zoneId === zone.id);
            const isZoneExpanded = expandedZones.has(zone.id);

            return (
                <div key={zone.id} className="border-b border-gray-200">
                    {/* Zone Row */}
                    <div
                        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer bg-blue-50"
                        onClick={() => toggleZone(zone.id)}
                    >
                        <div className="flex items-center space-x-3">
                            {isZoneExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900">Zona: {zone.name}</h4>
                                <p className="text-sm text-gray-600">{zoneDistricts.length} Distritos</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <span>Asistencia: {zoneStats.find(z => z.id === zone.id)?.attendance || 0}</span>
                                <span>Estudios: {zoneStats.find(z => z.id === zone.id)?.studies || 0}</span>
                                <span>Visitas: {zoneStats.find(z => z.id === zone.id)?.guests || 0}</span>
                                <span>Bautismos: {zoneStats.find(z => z.id === zone.id)?.baptisms || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Districts */}
                    {isZoneExpanded && zoneDistricts.map(district => {
                        const districtChurches = allChurches.filter(c => c.districtId === district.id);
                        const isDistrictExpanded = expandedDistricts.has(district.id);

                        // Calculate district stats
                        const districtGPs = allGPs.filter(g => districtChurches.some(c => c.id === g.churchId));
                        const districtReports = allReports.filter(r => {
                            if (!districtGPs.some(g => g.id === r.gpId)) return false;
                            const reportDate = new Date(r.date);
                            return reportDate >= startDate && reportDate < endDate;
                        });
                        const districtStats = {
                            attendance: districtReports.reduce((sum, r) => sum + (r.summary?.totalAttendance || 0), 0),
                            studies: districtReports.reduce((sum, r) => sum + (r.summary?.totalStudies || 0), 0),
                            guests: districtReports.reduce((sum, r) => sum + (r.summary?.totalGuests || 0), 0),
                            baptisms: districtReports.reduce((sum, r) => sum + (r.summary?.baptisms || 0), 0)
                        };

                        return (
                            <div key={district.id} className="ml-6 border-l-2 border-blue-200">
                                {/* District Row */}
                                <div
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer bg-green-50"
                                    onClick={() => toggleDistrict(district.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        {isDistrictExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        <div>
                                            <h5 className="font-medium text-gray-900">Distrito: {district.name}</h5>
                                            <p className="text-xs text-gray-600">{districtChurches.length} Iglesias</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="grid grid-cols-4 gap-4 text-xs">
                                            <span>Asist: {districtStats.attendance}</span>
                                            <span>Est: {districtStats.studies}</span>
                                            <span>Vis: {districtStats.guests}</span>
                                            <span>Baut: {districtStats.baptisms}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Churches */}
                                {isDistrictExpanded && districtChurches.map(church => {
                                    const churchGPs = allGPs.filter(g => g.churchId === church.id);
                                    const isChurchExpanded = expandedChurches.has(church.id);

                                    // Calculate church stats
                                    const churchReports = allReports.filter(r => {
                                        if (!churchGPs.some(g => g.id === r.gpId)) return false;
                                        const reportDate = new Date(r.date);
                                        return reportDate >= startDate && reportDate < endDate;
                                    });
                                    const churchStats = {
                                        attendance: churchReports.reduce((sum, r) => sum + (r.summary?.totalAttendance || 0), 0),
                                        studies: churchReports.reduce((sum, r) => sum + (r.summary?.totalStudies || 0), 0),
                                        guests: churchReports.reduce((sum, r) => sum + (r.summary?.totalGuests || 0), 0),
                                        baptisms: churchReports.reduce((sum, r) => sum + (r.summary?.baptisms || 0), 0)
                                    };

                                    return (
                                        <div key={church.id} className="ml-6 border-l-2 border-green-200">
                                            {/* Church Row */}
                                            <div
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer bg-yellow-50"
                                                onClick={() => toggleChurch(church.id)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {isChurchExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    <div>
                                                        <h6 className="font-medium text-gray-900">Iglesia: {church.name}</h6>
                                                        <p className="text-xs text-gray-600">{churchGPs.length} Grupos Pequeños</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="grid grid-cols-4 gap-4 text-xs">
                                                        <span>Asist: {churchStats.attendance}</span>
                                                        <span>Est: {churchStats.studies}</span>
                                                        <span>Vis: {churchStats.guests}</span>
                                                        <span>Baut: {churchStats.baptisms}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Small Groups */}
                                            {isChurchExpanded && churchGPs.map(gp => {
                                                const gpReports = allReports.filter(r => {
                                                    if (r.gpId !== gp.id) return false;
                                                    const reportDate = new Date(r.date);
                                                    return reportDate >= startDate && reportDate < endDate;
                                                });
                                                const gpStats = {
                                                    attendance: gpReports.reduce((sum, r) => sum + (r.summary?.totalAttendance || 0), 0),
                                                    studies: gpReports.reduce((sum, r) => sum + (r.summary?.totalStudies || 0), 0),
                                                    guests: gpReports.reduce((sum, r) => sum + (r.summary?.totalGuests || 0), 0),
                                                    baptisms: gpReports.reduce((sum, r) => sum + (r.summary?.baptisms || 0), 0)
                                                };

                                                return (
                                                    <div key={gp.id} className="ml-6 border-l-2 border-yellow-200">
                                                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 bg-gray-50">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-4"></div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900">GP: {gp.name}</p>
                                                                    <p className="text-xs text-gray-600">
                                                                        Líder: {gp.leaderId ?
                                                                            (allMembers?.find(m => m.id === gp.leaderId)?.firstName || 'Cargando...') + ' ' +
                                                                            (allMembers?.find(m => m.id === gp.leaderId)?.lastName || '')
                                                                            : 'Sin asignar'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="grid grid-cols-4 gap-4 text-xs">
                                                                    <span>Asist: {gpStats.attendance}</span>
                                                                    <span>Est: {gpStats.studies}</span>
                                                                    <span>Vis: {gpStats.guests}</span>
                                                                    <span>Baut: {gpStats.baptisms}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            );
        });
    };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Asistencia Total</p>
                            <p className="text-3xl font-bold text-gray-900">{globalStats.totalAttendance}</p>
                        </div>
                        <Users className="text-blue-500" size={32} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Estudios Bíblicos</p>
                            <p className="text-3xl font-bold text-gray-900">{globalStats.totalStudies}</p>
                        </div>
                        <BookOpen className="text-green-500" size={32} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Visitas</p>
                            <p className="text-3xl font-bold text-gray-900">{globalStats.totalGuests}</p>
                        </div>
                        <Activity className="text-purple-500" size={32} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Bautismos</p>
                            <p className="text-3xl font-bold text-gray-900">{globalStats.totalBaptisms}</p>
                        </div>
                        <BarChart className="text-orange-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Hierarchical Structure */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Estructura Jerárquica de Reportes</h3>
                    <p className="text-sm text-gray-600">Haz clic en los nombres para expandir/colapsar niveles</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {renderHierarchy()}
                </div>
            </div>
        </div>
    );
};

export default AssociationGlobalReportsView;
