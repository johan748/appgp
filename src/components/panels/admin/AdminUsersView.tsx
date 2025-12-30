import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { mockBackend } from '../../../services/mockBackend';
import { User, Role } from '../../../types';
import { Users, Search, RefreshCw } from 'lucide-react';

const AdminUsersView: React.FC = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>(mockBackend.getUsers());
    const [searchTerm, setSearchTerm] = useState('');

    const refresh = () => setUsers([...mockBackend.getUsers()]);

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: Role) => {
        const colors: Record<string, string> = {
            'ADMIN': 'bg-red-100 text-red-800',
            'ASOCIACION': 'bg-purple-100 text-purple-800',
            'DIRECTOR_ZONA': 'bg-blue-100 text-blue-800',
            'PASTOR': 'bg-indigo-100 text-indigo-800',
            'DIRECTOR_MP': 'bg-green-100 text-green-800',
            'LIDER_GP': 'bg-yellow-100 text-yellow-800'
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[role] || 'bg-gray-100'}`}>{role}</span>;
    };

    const handleResetPassword = (u: User) => {
        const newPass = prompt(`Ingrese nueva contraseña para ${u.username}:`);
        if (newPass) {
            const updated = { ...u, password: newPass };
            mockBackend.updateUser(updated); // We added this method!
            showToast('Contraseña actualizada', 'success');
            refresh();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Users className="mr-2" /> Usuarios del Sistema
            </h2>

            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
                <div className="relative w-64">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar usuario..."
                        className="pl-10 pr-4 py-2 border rounded-full w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={refresh} className="flex items-center text-gray-600 hover:text-blue-600">
                    <RefreshCw size={18} className="mr-1" /> Refrescar
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(u.role)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleResetPassword(u)} className="text-blue-600 hover:text-blue-900">Reset Pass</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="px-6 py-3 border-t text-xs text-gray-500">
                    Total: {filteredUsers.length} usuarios
                </div>
            </div>
        </div>
    );
};

export default AdminUsersView;
