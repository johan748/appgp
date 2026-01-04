import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { Union, Association } from '../../../types';
import { Plus, Edit, Trash2, Save, X, Building } from 'lucide-react';

const UnionAssociationsView: React.FC = () => {
    const { union } = useOutletContext<{ union: Union }>();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [associations, setAssociations] = useState<Association[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAssoc, setCurrentAssoc] = useState<Partial<Association>>({});

    useEffect(() => {
        if (union) {
            loadAssociations();
        }
    }, [union, backend]);

    const loadAssociations = async () => {
        try {
            const all = await backend.getAssociations();
            setAssociations(all.filter(a => a.unionId === union.id));
        } catch (e) { console.error(e); }
    };

    const handleEdit = (assoc: Association) => {
        setCurrentAssoc(assoc);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentAssoc({
            name: '',
            departmentHead: '',
            membershipCount: 0,
            unionId: union.id,
            config: { username: '', password: '' }
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!currentAssoc.name || !currentAssoc.config?.username) {
            showToast('Complete los campos requeridos', 'warning');
            return;
        }

        const assocToSave = { ...currentAssoc, unionId: union.id } as Association;

        try {
            if (currentAssoc.id) {
                await backend.updateAssociation(assocToSave);
            } else {
                // Generate ID if new
                const newId = 'assoc-' + Math.random().toString(36).substr(2, 9);
                await backend.addAssociation({ ...assocToSave, id: newId });
            }
            setIsEditing(false);
            loadAssociations();
            showToast('Asociación guardada', 'success');
        } catch (error: any) {
            showToast('Error al guardar: ' + error.message, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Eliminar asoc?')) {
            try {
                await backend.deleteAssociation(id);
                loadAssociations();
                showToast('Asociación eliminada', 'success');
            } catch (error: any) {
                showToast('Error al eliminar', 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestionar Asociaciones</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    <span>Nueva Asociación</span>
                </button>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded shadow border border-indigo-100 mb-6">
                    <h3 className="font-bold mb-4">{currentAssoc.id ? 'Editar' : 'Nueva'} Asociación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600">Nombre</label>
                            <input className="w-full border p-2 rounded" value={currentAssoc.name || ''} onChange={e => setCurrentAssoc({ ...currentAssoc, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Departamental (Líder)</label>
                            <input className="w-full border p-2 rounded" value={currentAssoc.departmentHead || ''} onChange={e => setCurrentAssoc({ ...currentAssoc, departmentHead: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Usuario Login</label>
                            <input className="w-full border p-2 rounded" value={currentAssoc.config?.username || ''} onChange={e => setCurrentAssoc({ ...currentAssoc, config: { ...currentAssoc.config!, username: e.target.value } })} />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Contraseña</label>
                            <input className="w-full border p-2 rounded" value={currentAssoc.config?.password || ''} onChange={e => setCurrentAssoc({ ...currentAssoc, config: { ...currentAssoc.config!, password: e.target.value } })} />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">Cancelar</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded">Guardar</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {associations.map(assoc => (
                    <div key={assoc.id} className="bg-white p-6 rounded shadow border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{assoc.name}</h3>
                                <p className="text-sm text-gray-500">{assoc.departmentHead}</p>
                            </div>
                            <div className="flex space-x-1">
                                <button onClick={() => handleEdit(assoc)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(assoc.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18} /></button>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-400">
                            ID: {assoc.id}
                        </div>
                    </div>
                ))}
                {associations.length === 0 && <p className="col-span-3 text-center text-gray-500 py-10">No hay asociaciones registradas en esta Unión.</p>}
            </div>
        </div>
    );
};

export default UnionAssociationsView;
