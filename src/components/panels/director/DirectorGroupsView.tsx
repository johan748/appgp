import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { Church, SmallGroup } from '../../../types';
import { Users, Heart, UserCheck } from 'lucide-react';

const DirectorGroupsView: React.FC = () => {
    const { church } = useOutletContext<{ church: Church }>();
    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [stats, setStats] = useState<Record<string, { baptized: number, nonBaptized: number, pairs: number }>>({});

    useEffect(() => {
        if (church) {
            const churchGps = mockBackend.getGPs().filter(g => g.churchId === church.id);
            setGps(churchGps);

            const newStats: any = {};
            churchGps.forEach(gp => {
                const members = mockBackend.getMembersByGP(gp.id);
                const pairs = mockBackend.getMissionaryPairs().filter(p => p.gpId === gp.id);

                newStats[gp.id] = {
                    baptized: members.filter(m => m.isBaptized).length,
                    nonBaptized: members.filter(m => !m.isBaptized).length,
                    pairs: pairs.length
                };
            });
            setStats(newStats);
        }
    }, [church]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Grupos Pequeños</h2>

            <div className="grid grid-cols-1 gap-6">
                {gps.map(gp => (
                    <div key={gp.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{gp.name}</h3>
                                <p className="text-gray-600 italic">"{gp.motto}"</p>
                                <p className="text-sm text-gray-500 mt-1">{gp.verse}</p>
                            </div>
                            <div className="text-right">
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                                    {gp.meetingDay} - {gp.meetingTime}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-green-600 mb-1">
                                    <UserCheck size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[gp.id]?.baptized || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Bautizados</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-r border-gray-100">
                                <div className="flex items-center text-orange-500 mb-1">
                                    <Users size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[gp.id]?.nonBaptized || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">No Bautizados</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-red-500 mb-1">
                                    <Heart size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[gp.id]?.pairs || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Parejas Mis.</span>
                            </div>
                        </div>
                    </div>
                ))}

                {gps.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No hay Grupos Pequeños registrados en esta iglesia.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectorGroupsView;
