import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { Union } from '../../../types';
import { Plus, Edit, Trash2, Save, Building } from 'lucide-react';
import ConfirmationModal from '../../ui/ConfirmationModal';

const AdminUnionsView: React.FC = () => {
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [unions, setUnions] = useState<Union[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUnion, setCurrentUnion] = useState<Partial<Union>>({});
    const [userEmail, setUserEmail] = useState(''); // State for user email
    const [userName, setUserName] = useState('');   // State for user full name
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadUnions();
    }, [backend]);

    const loadUnions = async () => {
        try {
            const u = await backend.getUnions();
            setUnions(u);
        } catch (e) { console.error(e); }
    };

    const handleEdit = async (union: Union) => {
        setCurrentUnion(union);
        setIsEditing(true);

        // Fetch linked user data
        try {
            const allUsers = await backend.getUsers();
            const linkedUser = allUsers.find(u => u.relatedEntityId === union.id);
            if (linkedUser) {
                setUserEmail(linkedUser.email || '');
                setUserName(linkedUser.name);
                // We keep the config from union for username/password as reference
            } else {
                setUserEmail('');
                setUserName(union.name);
            }
        } catch (e) {
            console.error('Error fetching linked user:', e);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await backend.deleteUnion(deleteId);
            loadUnions();
            showToast('Unión eliminada', 'success');
        } catch (e) {
            showToast('Error al eliminar', 'error');
        } finally {
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    };

    const handleCreate = () => {
        setCurrentUnion({
            name: '',
            evangelismDepartmentHead: '',
            config: { username: '', password: '' }
        });
        setUserEmail('');
        setUserName('');
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!currentUnion.name || !currentUnion.evangelismDepartmentHead) {
            showToast('Por favor complete los campos obligatorios de la Unión', 'warning');
            return;
        }

        try {
            let unionId = currentUnion.id;

            if (unionId) {
                await backend.updateUnion(currentUnion as Union);

                // Also update User if credentials provided
                if (currentUnion.config?.username) {
                    try {
                        const allUsers = await backend.getUsers();
                        const existingUser = allUsers.find(u => u.relatedEntityId === unionId);

                        if (existingUser) {
                            await backend.updateUser({
                                ...existingUser,
                                username: currentUnion.config.username,
                                email: userEmail,
                                name: userName || currentUnion.name!,
                                password: currentUnion.config.password // Store password in DB as requested
                            });
                        }
                    } catch (userErr) {
                        console.error('Error updating linked user:', userErr);
                    }
                }

                showToast('Unión actualizada', 'success');
            } else {
                // 1. Create Union
                const newUnionData = {
                    ...currentUnion,
                    id: 'union-' + Math.random().toString(36).substr(2, 9),
                } as Union;
                const createdUnion = await backend.addUnion(newUnionData);
                unionId = createdUnion.id;

                // 2. Create Linked User (Only on creation)
                if (currentUnion.config?.username && userEmail) {
                    try {
                        const userMetadata = {
                            name: userName || currentUnion.name!,
                            role: 'UNION' as any,
                            relatedEntityId: unionId
                        };

                        // A. Create record in public.users
                        await backend.createUser({
                            username: currentUnion.config.username,
                            email: userEmail,
                            name: userMetadata.name,
                            role: userMetadata.role,
                            relatedEntityId: unionId,
                            isActive: true,
                            password: currentUnion.config.password
                        });

                        // B. Create account in Supabase Auth (Automated via Vercel Function)
                        try {
                            await backend.createAuthUser(userEmail, currentUnion.config.password, userMetadata);
                            showToast('Usuario de sistema y cuenta de acceso creados exitosamente', 'success');
                        } catch (authError: any) {
                            console.error('Error creating auth account:', authError);
                            showToast(`Usuario creado en BD, pero error en Auth: ${authError.message}`, 'warning');
                        }

                    } catch (userError) {
                        console.error('Error creating user:', userError);
                        showToast('Unión creada, pero error al crear usuario', 'warning');
                    }
                }
                showToast('Unión guardada correctamente', 'success');
            }
            setIsEditing(false);
            loadUnions();
        } catch (e) { showToast('Error al guardar', 'error'); }
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
                        <div className="col-span-2">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Datos de la Unión</h4>
                            <hr className="mb-4" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Unión</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={currentUnion.name || ''}
                                onChange={e => {
                                    setCurrentUnion({ ...currentUnion, name: e.target.value });
                                    if (!currentUnion.id) setUserName(e.target.value);
                                }}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
                        <div className="col-span-2">
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Usuario Administrador</h4>
                            <p className="text-xs text-blue-600 mb-2">Datos de acceso al sistema.</p>
                            <hr className="mb-4" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario (Login)</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={currentUnion.config?.username || ''}
                                placeholder="ej. union.norte"
                                onChange={e => setCurrentUnion({
                                    ...currentUnion,
                                    config: { ...currentUnion.config!, username: e.target.value }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Login Supabase)</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded p-2"
                                value={userEmail}
                                placeholder="ej. admin@union.org"
                                onChange={e => setUserEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo del Usuario</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={userName}
                                onChange={e => setUserName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded p-2"
                                value={currentUnion.config?.password || ''}
                                placeholder="Contraseña segura"
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
                            className="px-4 py-2 btn btn-primary flex items-center bg-blue-600 text-white rounded hover:bg-blue-700"
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
                            <p><span className="font-semibold">Pass:</span> {union.config?.password ? '••••••••' : 'N/A'}</p>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={showDeleteModal}
                title="¿Eliminar Unión?"
                message="¿Estás seguro de que deseas eliminar esta Unión? Esto podría afectar a las asociaciones vinculadas. Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    );
};

export default AdminUnionsView;
