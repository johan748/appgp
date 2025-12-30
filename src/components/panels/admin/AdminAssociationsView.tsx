import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../../services/mockBackend';
import { Association, Union } from '../../../types';
import { Building, Plus, User, Save, Trash2, Edit, X } from 'lucide-react';

const AdminAssociationsView: React.FC = () => {
    const [associations, setAssociations] = useState<Association[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        unionId: '',
        departmentHead: '',
        username: '',
        password: ''
    });

    const [unions, setUnions] = useState<Union[]>([]);

    useEffect(() => {
        loadData();
        setUnions(mockBackend.getUnions());
    }, []);

    const loadData = () => {
        // We have to cheat a bit since mockBackend.getAssociation only returns the first one.
        // We'll read raw storage to support multiple for this Admin View.
        const raw = localStorage.getItem('app_association');
        if (raw) {
            setAssociations(JSON.parse(raw));
        } else {
            setAssociations([]);
        }
    };

    const handleCreate = () => {
        setFormData({
            name: '',
            unionId: unions[0]?.id || '',
            departmentHead: '',
            username: '',
            password: ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Create Association
        const newAssoc: Association = {
            id: 'assoc-' + Math.random().toString(36).substr(2, 9),
            name: formData.name,
            unionId: formData.unionId,
            departmentHead: formData.departmentHead,
            membershipCount: 0,
            config: {
                username: formData.username,
                password: formData.password
            }
        };

        // 2. Save Assoc (Push to array)
        mockBackend.save('app_association', [...associations, newAssoc]);

        // 3. Create Assoc User
        if (formData.username && formData.password) {
            try {
                mockBackend.createUser({
                    username: formData.username,
                    password: formData.password,
                    role: 'ASOCIACION',
                    relatedEntityId: newAssoc.id,
                    name: 'Admin ' + formData.name
                });
            } catch (err) {
                console.error("User creation error (might exist)", err);
                // Proceed anyway
            }
        }

        setIsModalOpen(false);
        loadData();
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Eliminar esta asociación y todos sus datos vinculados? (Acción simulada: Solo elimina la entrada de asociación)')) {
            const updated = associations.filter(a => a.id !== id);
            localStorage.setItem('app_association', JSON.stringify(updated));
            loadData();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Asociaciones</h2>
                <button onClick={handleCreate} className="btn btn-primary flex items-center">
                    <Plus size={20} className="mr-2" />
                    Nueva Asociación
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unión</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Director MP</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {associations.map((assoc) => (
                            <tr key={assoc.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{assoc.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                    {unions.find(u => u.id === assoc.unionId)?.name || 'Desconocida'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{assoc.departmentHead}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleDelete(assoc.id)} className="text-red-600 hover:text-red-900 ml-4"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {associations.length === 0 && <p className="p-8 text-center text-gray-500">No hay asociaciones registradas.</p>}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Nueva Asociación</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Asociación</label>
                                <input required type="text" className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Unión</label>
                                <select
                                    required
                                    className="w-full border rounded p-2"
                                    value={formData.unionId}
                                    onChange={e => setFormData({ ...formData, unionId: e.target.value })}
                                >
                                    <option value="">Seleccionar Unión...</option>
                                    {unions.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre Director Departamental</label>
                                <input required type="text" className="w-full border rounded p-2" value={formData.departmentHead} onChange={e => setFormData({ ...formData, departmentHead: e.target.value })} />
                            </div>
                            <div className="bg-gray-50 p-4 rounded border">
                                <h4 className="flex items-center text-sm font-bold text-gray-700 mb-2"><User size={16} className="mr-2" /> Credenciales de Administrador</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Usuario</label>
                                        <input required type="text" className="w-full border rounded p-2" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500">Contraseña</label>
                                        <input required type="password" className="w-full border rounded p-2" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="btn btn-primary">Crear Asociación</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAssociationsView;
