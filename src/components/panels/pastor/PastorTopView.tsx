import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { District, SmallGroup, MissionaryPair } from '../../../types';
import { Trophy, TrendingUp } from 'lucide-react';

const PastorTopView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const { backend } = useBackend();
    const [topPairs, setTopPairs] = useState<{ pair: MissionaryPair, names: string, studies: number, churchName: string }[]>([]);
    const [topGps, setTopGps] = useState<{ gp: SmallGroup, score: number, details: any, churchName: string }[]>([]);

    useEffect(() => {
        const loadTopData = async () => {
            if (district) {
                try {
                    const allChurches = await backend.getChurches();
                    const districtChurches = allChurches.filter(c => c.districtId === district.id);
                    const districtChurchIds = districtChurches.map(c => c.id);

                    const allGPs = await backend.getGPs();
                    const districtGps = allGPs.filter(g => districtChurchIds.includes(g.churchId));

                    const allPairs = await backend.getMissionaryPairs();
                    const districtPairs = allPairs.filter(p => districtGps.some(g => g.id === p.gpId));

                    const allMembers = await backend.getMembers();
                    const allReports = await backend.getReports();

                    // Helper to get church name
                    const getChurchName = (gpId: string) => {
                        const gp = districtGps.find(g => g.id === gpId);
                        const church = districtChurches.find(c => c.id === gp?.churchId);
                        return church?.name || 'Desconocida';
                    };

                    // 1. Top Pairs (by studies given)
                    const pairsWithData = districtPairs.map(pair => {
                        const m1 = allMembers.find(m => m.id === pair.member1Id);
                        const m2 = allMembers.find(m => m.id === pair.member2Id);
                        const names = `${m1?.firstName || 'N/A'} ${m1?.lastName || ''} & ${m2?.firstName || 'N/A'} ${m2?.lastName || ''}`;

                        // Calculate total studies from weekly reports
                        const pairReports = allReports.filter(r => r.missionaryPairsStats && r.missionaryPairsStats.some((stats: { pairId: string; studiesGiven: number }) => stats.pairId === pair.id));
                        const totalStudies = pairReports.reduce((sum, r) => {
                            const pairStats = r.missionaryPairsStats.find((stats: { pairId: string; studiesGiven: number }) => stats.pairId === pair.id);
                            return sum + (pairStats?.studiesGiven || 0);
                        }, 0);

                        return { pair, names, studies: totalStudies, churchName: getChurchName(pair.gpId) };
                    });

                    setTopPairs(pairsWithData.sort((a, b) => b.studies - a.studies).slice(0, 5));

                    // 2. Top GPs (Score based on attendance, friends, studies)
                    const gpsWithScore = districtGps.map(gp => {
                        const gpReports = allReports.filter(r => r.gpId === gp.id);

                        const totalAttendance = gpReports.reduce((sum, r) => sum + r.summary.totalAttendance, 0);
                        const totalGuests = gpReports.reduce((sum, r) => sum + r.summary.totalGuests, 0);
                        const totalStudies = gpReports.reduce((sum, r) => sum + r.summary.totalStudies, 0);

                        // Simple scoring algorithm
                        const score = totalAttendance + (totalGuests * 2) + (totalStudies * 3);

                        // Get church name
                        const church = districtChurches.find(c => c.id === gp.churchId);

                        return {
                            gp,
                            score,
                            details: { totalAttendance, totalGuests, totalStudies },
                            churchName: church?.name || 'Desconocida'
                        };
                    });

                    setTopGps(gpsWithScore.sort((a, b) => b.score - a.score).slice(0, 5));
                } catch (error) {
                    console.error("Error loading top data:", error);
                }
            }
        };
        loadTopData();
    }, [district, backend]);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Rankings y Top Desempeño (Distrito)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Pairs */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex items-center">
                        <Trophy className="text-yellow-600 mr-2" />
                        <h3 className="text-lg font-bold text-yellow-800">Top Parejas Misioneras</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {topPairs.map((item, idx) => (
                            <div key={item.pair.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 
                    ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            idx === 1 ? 'bg-gray-100 text-gray-700' :
                                                idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <div className="font-medium text-gray-800">{item.names}</div>
                                        <div className="text-xs text-gray-500">{item.churchName}</div>
                                    </div>
                                </div>
                                <span className="font-bold text-primary">{item.studies} Estudios</span>
                            </div>
                        ))}
                        {topPairs.length === 0 && <div className="p-4 text-gray-500 text-center">No hay datos suficientes.</div>}
                    </div>
                </div>

                {/* Top GPs */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center">
                        <TrendingUp className="text-blue-600 mr-2" />
                        <h3 className="text-lg font-bold text-blue-800">Top Grupos Pequeños</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {topGps.map((item, idx) => (
                            <div key={item.gp.id} className="p-4 hover:bg-gray-50">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 
                      ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500'}`}>
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <div className="font-medium text-gray-800">{item.gp.name}</div>
                                            <div className="text-xs text-gray-500">{item.churchName}</div>
                                        </div>
                                    </div>
                                    <span className="font-bold text-green-600">{item.score} Pts</span>
                                </div>
                                <div className="pl-11 text-xs text-gray-500 flex space-x-3">
                                    <span>Asist: {item.details.totalAttendance}</span>
                                    <span>Inv: {item.details.totalGuests}</span>
                                    <span>Est: {item.details.totalStudies}</span>
                                </div>
                            </div>
                        ))}
                        {topGps.length === 0 && <div className="p-4 text-gray-500 text-center">No hay datos suficientes.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PastorTopView;
