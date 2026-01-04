import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { Zone, District, Church, SmallGroup, Member } from '../../../types';
import { Users, ChevronDown, ChevronRight, Check, UserCheck, UserPlus } from 'lucide-react';

const ZoneLeadershipView: React.FC = () => {
    const { zone } = useOutletContext<{ zone: Zone }>();
    const { backend } = useBackend();
    const [districts, setDistricts] = useState<District[]>([]);
    const [churches, setChurches] = useState<Church[]>([]);
    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set());
    const [expandedChurches, setExpandedChurches] = useState<Set<string>>(new Set());
    const [expandedGPs, setExpandedGPs] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadData = async () => {
            if (zone) {
                try {
                    const allDistricts = await backend.getDistricts();
                    const zoneDistricts = allDistricts.filter(d => d.zoneId === zone.id);
                    setDistricts(zoneDistricts);

                    const [allChurches, allGPs, allMembers] = await Promise.all([
                        backend.getChurches(),
                        backend.getGPs(),
                        backend.getMembers()
                    ]);

                    // Filter relevant data
                    const relevantChurches = allChurches.filter(c => zoneDistricts.some(d => d.id === c.districtId));
                    const relevantGPs = allGPs.filter(g => relevantChurches.some(c => c.id === g.churchId));
                    // We'll keep all members or filter by relevant GPs. Filtering is safer for performance.
                    const relevantMembers = allMembers.filter(m => relevantGPs.some(g => g.id === m.gpId));

                    setChurches(relevantChurches);
                    setGps(relevantGPs);
                    setMembers(relevantMembers);

                } catch (e) { console.error(e); }
            }
        };
        loadData();
    }, [zone, backend]);

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

    const toggleGP = (gpId: string) => {
        const newExpanded = new Set(expandedGPs);
        if (newExpanded.has(gpId)) {
            newExpanded.delete(gpId);
        } else {
            newExpanded.add(gpId);
        }
        setExpandedGPs(newExpanded);
    };

    const getLeadershipMembers = (gpId: string): Member[] => {
        const gpMembers = members.filter(m => m.gpId === gpId);
        return gpMembers.filter(m => m.isBaptized);
    };

    const getLeadershipStatus = (member: Member) => {
        const progress = member.leadershipProgress || {};
        const hasLiderEnFormacion = !!progress.liderEnFormacionDate;
        const hasSecretario = !!progress.secretarioDate;
        const hasLiderGP = !!progress.liderGpDate;

        return {
            hasLiderEnFormacion,
            hasSecretario,
            hasLiderGP,
            currentRole: hasLiderGP ? 'Líder GP' : hasSecretario ? 'Secretario' : hasLiderEnFormacion ? 'Líder en Formación' : 'Miembro'
        };
    };

    const getLeadershipIcon = (role: string) => {
        switch (role) {
            case 'Líder GP': return <UserCheck size={16} className="text-green-600" />;
            case 'Secretario': return <UserCheck size={16} className="text-blue-600" />;
            case 'Líder en Formación': return <UserPlus size={16} className="text-yellow-600" />;
            default: return <Check size={16} className="text-gray-400" />;
        }
    };

    const renderHierarchy = () => {
        return districts.map(district => {
            const districtChurches = churches.filter(c => c.districtId === district.id);
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
                        const churchGPs = gps.filter(g => g.churchId === church.id);
                        const isChurchExpanded = expandedChurches.has(church.id);

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
                                            <p className="text-xs text-gray-600">{churchGPs.length} Grupos Pequeños</p>
                                        </div>
                                    </div>
                                </div>

                                {/* GPs */}
                                {isChurchExpanded && churchGPs.map(gp => {
                                    const leader = members.find(m => m.id === gp.leaderId);
                                    const leadershipMembers = getLeadershipMembers(gp.id);
                                    const isGPExpanded = expandedGPs.has(gp.id);

                                    return (
                                        <div key={gp.id} className="ml-6 border-l-2 border-green-200">
                                            {/* GP Row */}
                                            <div
                                                className="flex items-center justify-between p-2 hover:bg-gray-50 bg-gray-50 cursor-pointer"
                                                onClick={() => toggleGP(gp.id)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {isGPExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                    <div>
                                                        <p className="font-medium text-gray-900">GP: {gp.name}</p>
                                                        <p className="text-xs text-gray-600">
                                                            Líder: {leader ? `${leader.firstName} ${leader.lastName}` : 'No asignado'}
                                                        </p>
                                                        <p className="text-xs text-gray-600">Verso: {gp.verse}</p>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {leadershipMembers.length} miembros en desarrollo
                                                </div>
                                            </div>

                                            {/* Leadership Members */}
                                            {isGPExpanded && leadershipMembers.length > 0 && (
                                                <div className="ml-6 border-l-2 border-gray-200">
                                                    <div className="bg-white p-2">
                                                        <p className="text-xs font-semibold text-gray-700 mb-2">Miembros en Desarrollo de Liderazgo:</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {leadershipMembers.map(member => {
                                                                const status = getLeadershipStatus(member);
                                                                return (
                                                                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                                                        <div className="flex items-center space-x-2">
                                                                            {getLeadershipIcon(status.currentRole)}
                                                                            <div>
                                                                                <p className="text-sm font-medium text-gray-900">
                                                                                    {member.firstName} {member.lastName}
                                                                                </p>
                                                                                <p className="text-xs text-gray-600">{status.currentRole}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {member.cedula}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* No members message */}
                                            {isGPExpanded && leadershipMembers.length === 0 && (
                                                <div className="ml-6 border-l-2 border-gray-200">
                                                    <div className="bg-white p-2">
                                                        <p className="text-xs text-gray-500">No hay miembros en desarrollo de liderazgo en este GP</p>
                                                    </div>
                                                </div>
                                            )}
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
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Desarrollo de Liderazgo</h2>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Líderes de Grupos Pequeños por Distrito e Iglesia</h3>
                    <p className="text-sm text-gray-600">Haz clic en los nombres para expandir/colapsar niveles y ver el desarrollo de liderazgo</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {renderHierarchy()}
                </div>
            </div>
        </div>
    );
};

export default ZoneLeadershipView;
