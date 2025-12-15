import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { District, Church } from '../../../types';
import { Users, Heart, Home } from 'lucide-react';

const PastorChurchesView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const [churches, setChurches] = useState<Church[]>([]);
    const [stats, setStats] = useState<Record<string, { gps: number, members: number, pairs: number }>>({});

    useEffect(() => {
        if (district) {
            const districtChurches = mockBackend.getChurches().filter(c => c.districtId === district.id);
            setChurches(districtChurches);

            const newStats: any = {};
            districtChurches.forEach(church => {
                const gps = mockBackend.getGPs().filter(g => g.churchId === church.id);
                const members = mockBackend.getMembers().filter(m => gps.some(g => g.id === m.gpId));
                const pairs = (mockBackend.getMissionaryPairs?.() || []).filter(p => gps.some(g => g.id === p.gpId));

                newStats[church.id] = {
                    gps: gps.length,
                    members: members.length,
                    pairs: pairs.length
                };
            });
            setStats(newStats);
        }
    }, [district]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Iglesias del Distrito</h2>

            <div className="grid grid-cols-1 gap-6">
                {churches.map(church => (
                    <div key={church.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{church.name}</h3>
                                <p className="text-gray-600 text-sm mt-1">Dirección: {church.address}</p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-blue-600 mb-1">
                                    <Home size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[church.id]?.gps || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Grupos Pequeños</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-r border-gray-100">
                                <div className="flex items-center text-orange-500 mb-1">
                                    <Users size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[church.id]?.members || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Miembros</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-red-500 mb-1">
                                    <Heart size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[church.id]?.pairs || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Parejas Mis.</span>
                            </div>
                        </div>
                    </div>
                ))}

                {churches.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No hay Iglesias registradas en este distrito.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastorChurchesView;
