import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { Zone, District, Church, SmallGroup, MissionaryPair, WeeklyReport } from '../../../types';
import { Trophy, Users, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

const ZoneStatsView: React.FC = () => {
    const { zone } = useOutletContext<{ zone: Zone }>();
    const [districts, setDistricts] = useState<District[]>([]);
    const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());
    const [expandedChurches, setExpandedChurches] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (zone) {
            const zoneDistricts = mockBackend.getDistricts().filter(d => d.zoneId === zone.id);
            setDistricts(zoneDistricts);
        }
    }, [zone]);

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

    const getTopMissionaryPairs = (churchId: string) => {
        const churchGPs = mockBackend.getGPs().filter(g => g.churchId === churchId);
        const gpIds = churchGPs.map(g => g.id);
        const pairs = mockBackend.getMissionaryPairs().filter(p => gpIds.includes(p.gpId));
        const allReports = mockBackend.getReports();

        // Calculate total studies from weekly reports for each pair
        const pairsWithStudies = pairs.map(pair => {
            const pairReports = allReports.filter(r => r.missionaryPairsStats.some((stats: { pairId: string; studiesGiven: number }) => stats.pairId === pair.id));
            const totalStudies = pairReports.reduce((sum, r) => {
                const pairStats = r.missionaryPairsStats.find((stats: { pairId: string; studiesGiven: number }) => stats.pairId === pair.id);
                return sum + (pairStats?.studiesGiven || 0);
            }, 0);
            return { ...pair, totalStudies };
        });

        return pairsWithStudies.sort((a, b) => b.totalStudies - a.totalStudies).slice(0, 5); // Top 5
    };

    const getTopGPs = (churchId: string) => {
        const churchGPs = mockBackend.getGPs().filter(g => g.churchId === churchId);
        const reports = mockBackend.getReports();

        const gpStats = churchGPs.map(gp => {
            const gpReports = reports.filter(r => r.gpId === gp.id);
            const totalStudies = gpReports.reduce((sum, r) => sum + (r.summary?.totalStudies || 0), 0);
            return { gp, totalStudies };
        });

        return gpStats.sort((a, b) => b.totalStudies - a.totalStudies).slice(0, 5); // Top 5
    };

    const renderHierarchy = () => {
        return districts.map(district => {
            const districtChurches = mockBackend.getChurches().filter(c => c.districtId === district.id);
            const isDistrictExpanded = expandedDistricts.has(district.id);

            return (
                <div key={district.id} className="border-b border-gray-200">
                    {/* District Row */}
                    <div
                        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer bg-blue-50"
                        onClick={() => toggleDistrict(district.id)}
                    >
                        <div className="flex items-center space-x-3">
                            {isDistrictExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900">Distrito: {district.name}</h4>
                                <p className="text-sm text-gray-600">{districtChurches.length} Iglesias</p>
                            </div>
                        </div>
                    </div>

                    {/* Churches */}
                    {isDistrictExpanded && districtChurches.map(church => {
                        const isChurchExpanded = expandedChurches.has(church.id);
                        const topPairs = getTopMissionaryPairs(church.id);
                        const topGPs = getTopGPs(church.id);

                        return (
                            <div key={church.id} className="ml-6 border-l-2 border-blue-200">
                                {/* Church Row */}
                                <div
                                    className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer bg-green-50"
                                    onClick={() => toggleChurch(church.id)}
                                >
                                    <div className="flex items-center space-x-3">
                                        {isChurchExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        <div>
                                            <h5 className="font-medium text-gray-900">Iglesia: {church.name}</h5>
                                            <p className="text-xs text-gray-600">Top Parejas y GPs</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Stats */}
                                {isChurchExpanded && (
                                    <div className="ml-6 border-l-2 border-green-200 p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Top Missionary Pairs */}
                                            <div>
                                                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <Trophy size={16} className="mr-2 text-yellow-500" />
                                                    Top Parejas Misioneras
                                                </h6>
                                                <div className="space-y-2">
                                                    {topPairs.map((pair, idx) => {
                                                        const member1 = mockBackend.getMembers().find(m => m.id === pair.member1Id);
                                                        const member2 = mockBackend.getMembers().find(m => m.id === pair.member2Id);
                                                        return (
                                                            <div key={pair.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                                                <span className="text-sm">
                                                                    {idx + 1}. {member1?.firstName} {member1?.lastName} & {member2?.firstName} {member2?.lastName}
                                                                </span>
                                                                <span className="text-xs font-medium text-blue-600">{pair.totalStudies} estudios</span>
                                                            </div>
                                                        );
                                                    })}
                                                    {topPairs.length === 0 && (
                                                        <p className="text-xs text-gray-500">No hay parejas registradas</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Top GPs */}
                                            <div>
                                                <h6 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                    <Users size={16} className="mr-2 text-green-500" />
                                                    Top Grupos Pequeños
                                                </h6>
                                                <div className="space-y-2">
                                                    {topGPs.map((item, idx) => (
                                                        <div key={item.gp.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                                            <span className="text-sm">{idx + 1}. {item.gp.name}</span>
                                                            <span className="text-xs font-medium text-green-600">{item.totalStudies} estudios</span>
                                                        </div>
                                                    ))}
                                                    {topGPs.length === 0 && (
                                                        <p className="text-xs text-gray-500">No hay GPs con reportes</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            );
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Estadísticas</h2>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Top de Parejas Misioneras y Grupos Pequeños por Distrito e Iglesia</h3>
                    <p className="text-sm text-gray-600">Haz clic en los nombres para expandir/colapsar niveles</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {renderHierarchy()}
                </div>
            </div>
        </div>
    );
};

export default ZoneStatsView;
