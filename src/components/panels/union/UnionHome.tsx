import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Union, Association } from '../../../types';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { Union, Association } from '../../../types';
import { Building, Users, Activity, FileText, UserCheck } from 'lucide-react';

const UnionHome: React.FC = () => {
    const { union } = useOutletContext<{ union: Union }>();
    const { backend } = useBackend();
    const [stats, setStats] = useState({
        associations: 0,
        totalMembers: 0,
        totalSmallGroups: 0,
        totalBaptisms: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            if (union) {
                try {
                    const assocs = await backend.getAssociations();
                    const unionAssocs = assocs.filter(a => a.unionId === union.id);

                    const [allZones, allDistricts, allChurches, allGPs] = await Promise.all([
                        backend.getZones(),
                        backend.getDistricts(),
                        backend.getChurches(),
                        backend.getGPs()
                    ]);

                    // Filter down
                    const zones = allZones.filter(z => unionAssocs.some(a => a.id === z.associationId));
                    const districts = allDistricts.filter(d => zones.some(z => z.id === d.zoneId));
                    const churches = allChurches.filter(c => districts.some(d => d.id === c.districtId));
                    const gps = allGPs.filter(g => churches.some(c => c.id === g.churchId));

                    setStats({
                        associations: unionAssocs.length,
                        totalMembers: unionAssocs.reduce((sum, a) => sum + (a.membershipCount || 0), 0),
                        totalSmallGroups: gps.length,
                        totalBaptisms: 0
                    });
                } catch (e) { console.error(e); }
            }
        };
        loadStats();
    }, [union, backend]);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-[#3e8391] rounded-xl shadow-lg p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Bienvenido, {union.evangelismDepartmentHead}</h1>
                    <p className="text-white/90 text-lg">Panel de Administración de la Unión</p>
                </div>
                {/* Subtle background decoration */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Asociaciones</h3>
                        <Building className="text-[#3e8391]" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.associations}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Membresía Total</h3>
                        <Users className="text-[#3e8391]" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalMembers}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Grupos Pequeños</h3>
                        <UserCheck className="text-[#3e8391]" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalSmallGroups}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider">Actividad</h3>
                        <Activity className="text-[#3e8391]" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">100%</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 text-indigo-600">
                        <Building size={20} />
                        <span>Ver Asociaciones</span>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2 text-indigo-600">
                        <FileText size={20} />
                        <span>Ver Reportes Globales</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnionHome;
