import { useBackend } from '../../../context/BackendContext';
import { useToast } from '../../../context/ToastContext';
import { Association, Union } from '../../../types';
import { Building, Plus, User, Save, Trash2, Edit, X } from 'lucide-react';

const AdminAssociationsView: React.FC = () => {
    const { backend } = useBackend();
    const { showToast } = useToast();
    const [associations, setAssociations] = useState<Association[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssoc, setEditingAssoc] = useState<Association | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        unionId: '',
        departmentHead: '',
        username: '',
        password: '',
        email: ''
    });
    const [userEmail, setUserEmail] = useState('');
    const [userName, setUserName] = useState('');

    const [unions, setUnions] = useState<Union[]>([]);

    useEffect(() => {
        loadData();
    }, [backend]);

    const loadData = async () => {
        try {
            const [assocs, u] = await Promise.all([
                backend.getAssociations(),
                backend.getUnions()
            ]);
            setAssociations(assocs);
            setUnions(u);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = () => {
        setEditingAssoc(null);
        setFormData({
            name: '',
            unionId: unions[0]?.id || '',
            departmentHead: '',
            username: '',
            password: '',
            email: ''
        });
        setUserEmail('');
        setUserName('');
        setIsModalOpen(true);
    };

    const handleEdit = async (assoc: Association) => {
        setEditingAssoc(assoc);
        setFormData({
            name: assoc.name,
            unionId: assoc.unionId,
            departmentHead: assoc.departmentHead,
            username: assoc.config?.username || '',
            password: assoc.config?.password || '',
            email: ''
        });

        // Fetch linked user
        try {
            const allUsers = await backend.getUsers();
            const linkedUser = allUsers.find(u => u.relatedEntityId === assoc.id);
            if (linkedUser) {
                setUserEmail(linkedUser.email || '');
                setUserName(linkedUser.name);
                setFormData(prev => ({ ...prev, email: linkedUser.email || '' }));
            } else {
                setUserEmail('');
                setUserName('');
            }
        } catch (e) { console.error(e); }

        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingAssoc) {
                // Update
                const updated: Association = {
                    ...editingAssoc,
                    name: formData.name,
                    unionId: formData.unionId,
                    departmentHead: formData.departmentHead,
                    config: {
                        username: formData.username,
                        password: formData.password
                    }
                };
                await backend.updateAssociation(updated);

                // Update User
                try {
                    const allUsers = await backend.getUsers();
                    const existingUser = allUsers.find(u => u.relatedEntityId === editingAssoc.id);
                    if (existingUser) {
                        await backend.updateUser({
                            ...existingUser,
                            username: formData.username,
                            email: userEmail || formData.email,
                            name: userName || formData.name,
                            password: formData.password
                        });
                    }
                } catch (userErr) { console.error(userErr); }

                showToast('Asociación actualizada', 'success');
            } else {
                // Create
                const assocId = 'assoc-' + Math.random().toString(36).substr(2, 9);
                const newAssoc: Association = {
                    id: assocId,
                    name: formData.name,
                    unionId: formData.unionId,
                    departmentHead: formData.departmentHead,
                    membershipCount: 0,
                    config: {
                        username: formData.username,
                        password: formData.password
                    }
                };

                await backend.addAssociation(newAssoc);

                // Create User
                if (formData.username && formData.password && (userEmail || formData.email)) {
                    const email = userEmail || formData.email;
                    const metadata = {
                        name: userName || formData.name,
                        role: 'ASOCIACION' as any,
                        relatedEntityId: assocId
                    };

                    await backend.createUser({
                        username: formData.username,
                        email: email,
                        name: metadata.name,
                        role: metadata.role,
                        relatedEntityId: assocId,
                        password: formData.password,
                        isActive: true
                    });

                    try {
                        await backend.createAuthUser(email, formData.password, metadata);
                    } catch (authErr) { console.error(authErr); }
                }

                showToast('Asociación creada exitosamente', 'success');
            }

            setIsModalOpen(false);
            loadData();
        } catch (err) {
            console.error(err);
            showToast('Error al guardar asociación', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta asociación?')) {
            try {
                await backend.deleteAssociation(id);
                loadData();
                showToast('Asociación eliminada', 'success');
            } catch (e) {
                showToast('Error al eliminar', 'error');
            }
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credenciales</th>
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
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                    <div>U: {assoc.config?.username}</div>
                                    <div>P: {assoc.config?.password ? '••••' : 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(assoc)} className="text-blue-600 hover:text-blue-900 mx-2"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(assoc.id)} className="text-red-600 hover:text-red-900 mx-2"><Trash2 size={18} /></button>
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
                            <h3 className="text-xl font-bold">{editingAssoc ? 'Editar Asociación' : 'Nueva Asociación'}</h3>
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
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Email (Acceso)</label>
                                    <input required type="email" className="w-full border rounded p-2" value={userEmail || formData.email} onChange={e => { setUserEmail(e.target.value); setFormData({ ...formData, email: e.target.value }) }} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500">Nombre Completo Usuario</label>
                                    <input type="text" className="w-full border rounded p-2" value={userName || formData.departmentHead} onChange={e => setUserName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Usuario</label>
                                    <input required type="text" className="w-full border rounded p-2" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Contraseña</label>
                                    <input required type="text" className="w-full border rounded p-2" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn btn-primary">{editingAssoc ? 'Actualizar Asociación' : 'Crear Asociación'}</button>
                    </div>
                </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default AdminAssociationsView;
