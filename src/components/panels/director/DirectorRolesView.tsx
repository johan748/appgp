import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { Church, SmallGroup, Member } from '../../../types';
import { Users, Filter } from 'lucide-react';

const DirectorRolesView: React.FC = () => {
    const { church } = useOutletContext<{ church: Church }>();
    const { showToast } = useToast();
    const { backend } = useBackend();

    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [filterGp, setFilterGp] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!church) return;
            try {
                setLoading(true);
                // 1. Get GPs for this church
                const allGPs = await backend.getGPs();
                const churchGps = allGPs.filter(g => g.churchId === church.id);
                setGps(churchGps);

                // 2. Get Members for these GPs
                // In a perfect world we have getMembersByChurch(churchId)
                // For now, we'll fetch members for each GP or filtered from all members if backend allows.
                // Assuming we have to fetch per GP or get all (expensive) then filter.
                // Let's iterate GPs for now as it's safer with current mock/limited backend interface knowledge.
                let churchMembers: Member[] = [];
                await Promise.all(churchGps.map(async (gp) => {
                    const gpMembers = await backend.getMembersByGP(gp.id);
                    churchMembers = [...churchMembers, ...gpMembers];
                }));

                setMembers(churchMembers);
            } catch (error) {
                console.error("Error loading roles data:", error);
                showToast('Error al cargar datos', 'error');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [church, backend]);

    const filteredMembers = filterGp
        ? members.filter(m => m.gpId === filterGp)
        : members;

    if (!church) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Users className="mr-3 text-primary" />
                Visualización de Roles y Liderazgo
            </h2>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
                <div className="flex-shrink-0 text-gray-500">
                    <Filter size={20} />
                </div>
                <div className="flex-grow max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Grupo Pequeño</label>
                    <select
                        className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={filterGp}
                        onChange={e => setFilterGp(e.target.value)}
                    >
                        <option value="">Todos los Grupos</option>
                        {gps.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Members List */}
            <div className="bg-white shadow overflow-hidden rounded-lg animate-fade-in">
                {loading ? (
                    <div className="text-center py-10">Cargando...</div>
                ) : (
                    <>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="font-bold text-indigo-600">{member.firstName[0]}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                                                    <div className="text-sm text-gray-500">{member.email || 'Sin email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {gps.find(g => g.id === member.gpId)?.name || 'Sin Asignar'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${member.role === 'LIDER' ? 'bg-green-100 text-green-800' :
                                                    member.role === 'SECRETARIO' ? 'bg-blue-100 text-blue-800' :
                                                        member.role === 'ANFITRION' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {member.phone || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredMembers.length === 0 && (
                            <div className="text-center py-10 bg-gray-50">
                                <p className="text-gray-500">No hay miembros para mostrar con los filtros actuales.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DirectorRolesView;
