import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { Zone, District } from '../../../types';
import { Home, Users } from 'lucide-react';

const ZoneDistrictsView: React.FC = () => {
    const { zone } = useOutletContext<{ zone: Zone }>();
    const [districts, setDistricts] = useState<District[]>([]);
    const [stats, setStats] = useState<Record<string, { churches: number, gps: number, members: number }>>({});

    useEffect(() => {
        if (zone) {
            const zoneDistricts = mockBackend.getDistricts().filter(d => d.zoneId === zone.id);
            setDistricts(zoneDistricts);

            const newStats: any = {};
            zoneDistricts.forEach(dist => {
                const churches = mockBackend.getChurches().filter(c => c.districtId === dist.id);
                const gps = mockBackend.getGPs().filter(g => churches.some(c => c.id === g.churchId));
                const members = mockBackend.getMembers().filter(m => gps.some(g => g.id === m.gpId));

                newStats[dist.id] = {
                    churches: churches.length,
                    gps: gps.length,
                    members: members.length
                };
            });
            setStats(newStats);
        }
    }, [zone]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Distritos de la Zona</h2>

            <div className="grid grid-cols-1 gap-6">
                {districts.map(dist => (
                    <div key={dist.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{dist.name}</h3>

                        <div className="grid grid-cols-3 gap-4 border-t pt-4">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-blue-600 mb-1">
                                    <Home size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[dist.id]?.churches || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Iglesias</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-r border-gray-100">
                                <div className="flex items-center text-indigo-600 mb-1">
                                    <Users size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[dist.id]?.gps || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">GPs</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-orange-500 mb-1">
                                    <Users size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[dist.id]?.members || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Miembros</span>
                            </div>
                        </div>
                    </div>
                ))}

                {districts.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No hay Distritos registrados en esta zona.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZoneDistrictsView;
