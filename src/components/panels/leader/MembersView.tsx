import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { SmallGroup, Member } from '../../../types';
import { Check, X, Edit, Trash2 } from 'lucide-react';

const MembersView: React.FC = () => {
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const [members, setMembers] = useState<Member[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (gp) {
            loadMembers();
        }
    }, [gp]);

    const loadMembers = () => {
        const allMembers = mockBackend.getMembersByGP(gp.id);
        // Sort: Leader -> Secretary -> Others
        const sorted = [...allMembers].sort((a, b) => {
            const roleOrder = { 'LIDER': 1, 'SECRETARIO': 2, 'LIDER_EN_FORMACION': 3, 'MIEMBRO': 4 };
            return (roleOrder[a.role as keyof typeof roleOrder] || 99) - (roleOrder[b.role as keyof typeof roleOrder] || 99);
        });
        setMembers(sorted);
    };

    const handleDelete = (memberId: string) => {
        if (confirm('¿Estás seguro de eliminar este miembro?')) {
            const allMembers = mockBackend.getMembers();
            const filtered = allMembers.filter(m => m.id !== memberId);
            localStorage.setItem('app_members', JSON.stringify(filtered));
            loadMembers();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Miembros del GP</h2>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bautizado</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {member.cedula}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {member.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${member.role === 'LIDER' ? 'bg-green-100 text-green-800' :
                                                member.role === 'SECRETARIO' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {member.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {member.isBaptized ?
                                            <Check className="h-5 w-5 text-green-500 mx-auto" /> :
                                            <X className="h-5 w-5 text-red-400 mx-auto" />
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => navigate(`/leader/edit-member/${member.id}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar miembro"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar miembro"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MembersView;
