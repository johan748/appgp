import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { District, Member, Church, SmallGroup } from '../../../types';
import { Shield } from 'lucide-react';

const PastorRolesView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [churches, setChurches] = useState<Church[]>([]);
    const [selectedChurchId, setSelectedChurchId] = useState('');
    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [filterGp, setFilterGp] = useState('');

    useEffect(() => {
        const loadChurches = async () => {
            if (district) {
                try {
                    const allChurches = await backend.getChurches();
                    setChurches(allChurches.filter(c => c.districtId === district.id));
                } catch (e) { console.error(e); }
            }
        };
        loadChurches();
    }, [district.id, backend]);

    useEffect(() => {
        const loadGpsAndMembers = async () => {
            if (selectedChurchId) {
                try {
                    const allGPs = await backend.getGPs();
                    const churchGps = allGPs.filter(g => g.churchId === selectedChurchId);
                    setGps(churchGps);

                    // Get members from all GPs in this church
                    // In a real backend we might query members by ChurchID if supported, or loop efficiently.
                    // Assuming we have getMembersByGP or getMembers() and filter
                    // If getMembersByGP is cheap:
                    let churchMembers: Member[] = [];
                    await Promise.all(churchGps.map(async (gp) => {
                        const gpMembers = await backend.getMembersByGP(gp.id);
                        churchMembers = [...churchMembers, ...gpMembers];
                    }));

                    setMembers(churchMembers);
                } catch (e) { console.error(e); }
            } else {
                setGps([]);
                setMembers([]);
            }
        };
        loadGpsAndMembers();
    }, [selectedChurchId, backend]);

    const handleRoleChange = async (memberId: string, newRole: string) => {
        const member = members.find(m => m.id === memberId);
        if (member) {
            const updatedMember = { ...member, role: newRole as any };
            try {
                await backend.updateMember(updatedMember);
                // Refresh local state
                setMembers(prev => prev.map(m => m.id === memberId ? updatedMember : m));
                showToast(`Rol de ${member.firstName} actualizado a ${newRole}`, 'info');
            } catch (error) {
                console.error(error);
                showToast('Error al actualizar rol', 'error');
            }
        }
    };

    const roles = ['LIDER', 'SECRETARIO', 'ANFITRION', 'MIEMBRO'];

    const filteredMembers = filterGp
        ? members.filter(m => m.gpId === filterGp)
        : members;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Roles y Liderazgo</h2>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Seleccionar Iglesia</label>
                    <select
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={selectedChurchId}
                        onChange={e => { setSelectedChurchId(e.target.value); setFilterGp(''); }}
                    >
                        <option value="">Seleccionar Iglesia...</option>
                        {churches.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Filtrar por Grupo (Opcional)</label>
                    <select
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={filterGp}
                        onChange={e => setFilterGp(e.target.value)}
                        disabled={!selectedChurchId}
                    >
                        <option value="">Todos los Grupos</option>
                        {gps.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedChurchId ? (
                <div className="bg-white shadow overflow-hidden rounded-lg animate-fade-in">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol Actual</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.map((member) => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                <span className="font-bold text-indigo-600">{member.firstName[0]}</span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                                                <div className="text-sm text-gray-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {gps.find(g => g.id === member.gpId)?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${member.role === 'LIDER' ? 'bg-green-100 text-green-800' :
                                                member.role === 'SECRETARIO' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <select
                                            className="border border-gray-300 rounded text-sm p-1"
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                        >
                                            {roles.map(r => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredMembers.length === 0 && (
                        <div className="text-center py-6 text-gray-500">No hay miembros para mostrar.</div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">Seleccione una iglesia para ver los roles.</p>
                </div>
            )}
        </div>
    );
};

export default PastorRolesView;
