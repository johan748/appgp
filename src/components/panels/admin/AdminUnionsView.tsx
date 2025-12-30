import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { mockBackend } from '../../../services/mockBackend';
import { Union } from '../../../types';
import { Plus, Edit, Trash2, Save, X, Building } from 'lucide-react';

const AdminUnionsView: React.FC = () => {
    const { showToast } = useToast();
    const [unions, setUnions] = useState<Union[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUnion, setCurrentUnion] = useState<Partial<Union>>({});

    useEffect(() => {
        loadUnions();
    }, []);

    const loadUnions = () => {
        setUnions(mockBackend.getUnions());
    };

    const handleEdit = (union: Union) => {
        setCurrentUnion(union);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta Unión? Esto podría afectar a las asociaciones vinculadas.')) {
            mockBackend.deleteUnion(id);
            loadUnions();
        }
    };

    const handleCreate = () => {
        setCurrentUnion({
            name: '',
            evangelismDepartmentHead: '',
            config: { username: '', password: '' }
        });
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!currentUnion.name || !currentUnion.evangelismDepartmentHead) {
            showToast('Por favor complete los campos obligatorios', 'warning');
            return;
        }

        if (currentUnion.id) {
            mockBackend.updateUnion(currentUnion as Union);
        } else {
            const newUnion = {
                ...currentUnion,
                id: 'union-' + Math.random().toString(36).substr(2, 9),
            } as Union;
            mockBackend.addUnion(newUnion);
        }
        setIsEditing(false);
        loadUnions();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestionar Uniones</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    <span>Nueva Unión</span>
                </button>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-lg shadow-lg border border-indigo-100 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">{currentUnion.id ? 'Editar Unión' : 'Nueva Unión'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Unión</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={currentUnion.name || ''}
                                onChange={e => setCurrentUnion({ ...currentUnion, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Departamental de Evangelismo</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={currentUnion.evangelismDepartmentHead || ''}
                                onChange={e => setCurrentUnion({ ...currentUnion, evangelismDepartmentHead: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario Admin</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={currentUnion.config?.username || ''}
                                onChange={e => setCurrentUnion({
                                    ...currentUnion,
                                    config: { ...currentUnion.config!, username: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={currentUnion.config?.password || ''}
                                onChange={e => setCurrentUnion({
                                    ...currentUnion,
                                    config: { ...currentUnion.config!, password: e.target.value }
                                })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 btn btn-primary flex items-center"
                        >
                            <Save size={18} className="mr-2" />
                            Guardar
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unions.map(union => (
                    <div key={union.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Building className="text-indigo-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{union.name}</h3>
                                    <p className="text-sm text-gray-500">{union.evangelismDepartmentHead}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(union)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(union.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            <p><span className="font-semibold">User:</span> {union.config?.username}</p>
                            <p><span className="font-semibold">Pass:</span> ••••••••</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminUnionsView;
