import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { Union, Association } from '../../../types';
import { Plus, Edit, Trash2, Save, X, Building } from 'lucide-react';
import ConfirmationModal from '../../ui/ConfirmationModal';

const UnionAssociationsView: React.FC = () => {
    const { union } = useOutletContext<{ union: Union }>();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [associations, setAssociations] = useState<Association[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAssoc, setCurrentAssoc] = useState<Partial<Association>>({});
    const [userEmail, setUserEmail] = useState('');   // State for user email
    const [userName, setUserName] = useState('');     // State for user full name
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

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

    const handleEdit = async (assoc: Association) => {
        setCurrentAssoc(assoc);
        setIsEditing(true);

        // Fetch linked user data
        try {
            const allUsers = await backend.getUsers();
            const linkedUser = allUsers.find(u => u.relatedEntityId === assoc.id);
            if (linkedUser) {
                setUserEmail(linkedUser.email || '');
                setUserName(linkedUser.name);
                // Ensure config reflects current username/password from user table if possible
                // but usually assoc.config also has it.
            } else {
                setUserEmail('');
                setUserName(assoc.name);
            }
        } catch (e) {
            console.error('Error fetching linked user:', e);
        }
    };

    const handleCreate = () => {
        setCurrentAssoc({
            name: '',
            departmentHead: '',
            membershipCount: 0,
            unionId: union.id,
            config: { username: '', password: '' }
        });
        setUserEmail('');
        setUserName('');
        setIsEditing(true);
    };

    const handleSave = async () => {
        const isNew = !currentAssoc.id;
        const password = currentAssoc.config?.password;

        if (!currentAssoc.name || !currentAssoc.config?.username || !userEmail || (isNew && !password)) {
            showToast('Complete los campos requeridos (Nombre, Usuario, Email' + (isNew ? ' y Contraseña' : '') + ')', 'warning');
            return;
        }

        const assocToSave = { ...currentAssoc, unionId: union.id } as Association;

        try {
            if (currentAssoc.id) {
                const assocId = currentAssoc.id;
                await backend.updateAssociation(assocToSave);

                // Update Linked User
                if (currentAssoc.config?.username) {
                    const allUsers = await backend.getUsers();
                    const existingUser = allUsers.find(u => u.relatedEntityId === assocId);

                    if (existingUser) {
                        await backend.updateUser({
                            ...existingUser,
                            username: currentAssoc.config.username,
                            email: userEmail,
                            name: userName || currentAssoc.name!,
                            password: currentAssoc.config.password
                        });
                    } else {
                        await backend.createUser({
                            username: currentAssoc.config.username,
                            email: userEmail,
                            name: userName || currentAssoc.name!,
                            role: 'ASOCIACION' as any,
                            relatedEntityId: assocId,
                            isActive: true,
                            password: currentAssoc.config.password
                        });
                    }
                }
                showToast('Asociación y cuenta actualizadas', 'success');
            } else {
                // Generate ID if new
                const newId = 'assoc-' + Math.random().toString(36).substr(2, 9);
                await backend.addAssociation({ ...assocToSave, id: newId });

                // Create User for Association
                const userMetadata = {
                    name: userName || currentAssoc.name || 'Asociación',
                    role: 'ASOCIACION' as any,
                    relatedEntityId: newId
                };

                // A. Create record in public.users
                await backend.createUser({
                    username: currentAssoc.config!.username!,
                    email: userEmail,
                    name: userMetadata.name,
                    role: userMetadata.role,
                    relatedEntityId: newId,
                    isActive: true,
                    password: currentAssoc.config!.password!
                });

                // B. Create account in Supabase Auth
                await backend.createAuthUser(userEmail, currentAssoc.config!.password!, userMetadata);

                showToast('Asociación y cuenta de acceso creadas con éxito', 'success');
            }
            setIsEditing(false);
            loadAssociations();
        } catch (error: any) {
            showToast('Error al guardar: ' + error.message, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await backend.deleteAssociation(deleteId);
            loadAssociations();
            showToast('Asociación eliminada', 'success');
        } catch (error: any) {
            showToast('Error al eliminar', 'error');
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
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
                        <div className="col-span-2">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase">Datos Asociación</h4>
                            <hr className="mb-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Nombre Asociación</label>
                            <input className="w-full border p-2 rounded"
                                value={currentAssoc.name || ''}
                                onChange={e => {
                                    setCurrentAssoc({ ...currentAssoc, name: e.target.value });
                                    if (!currentAssoc.id) setUserName(e.target.value);
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Departamental (Líder)</label>
                            <input className="w-full border p-2 rounded" value={currentAssoc.departmentHead || ''} onChange={e => setCurrentAssoc({ ...currentAssoc, departmentHead: e.target.value })} />
                        </div>

                        <div className="col-span-2 mt-4">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase">Datos Cuenta de Usuario</h4>
                            <hr className="mb-2" />
                            {!currentAssoc.id && <p className="text-xs text-blue-500 mb-2">Se creará un usuario para ingresar al sistema.</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600">Usuario Login</label>
                            <input className="w-full border p-2 rounded"
                                placeholder="ej. asoc.central"
                                value={currentAssoc.config?.username || ''}
                                onChange={e => setCurrentAssoc({ ...currentAssoc, config: { ...currentAssoc.config!, username: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Email (Acceso)</label>
                            <input className="w-full border p-2 rounded"
                                type="email"
                                placeholder="admin@asoc.org"
                                value={userEmail}
                                onChange={e => setUserEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Nombre Completo Usuario</label>
                            <input className="w-full border p-2 rounded"
                                value={userName}
                                onChange={e => setUserName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600">Contraseña</label>
                            <input className="w-full border p-2 rounded"
                                value={currentAssoc.config?.password || ''}
                                onChange={e => setCurrentAssoc({ ...currentAssoc, config: { ...currentAssoc.config!, password: e.target.value } })}
                            />
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
                            <p>User: {assoc.config?.username}</p>
                            <p>Pass: {assoc.config?.password ? '••••••' : 'N/A'}</p>
                        </div>
                    </div>
                ))}
                {associations.length === 0 && <p className="col-span-3 text-center text-gray-500 py-10">No hay asociaciones registradas en esta Unión.</p>}
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                title="¿Eliminar Asociación?"
                message="¿Estás seguro de que deseas eliminar esta asociación? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default UnionAssociationsView;
