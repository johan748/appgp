import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { Association, District, Zone } from '../../../types';
import { MapPin, Plus, Edit, Trash2, X, Save, User } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const AssociationDistrictsView: React.FC = () => {
    const { association } = useOutletContext<{ association: Association }>();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [districts, setDistricts] = useState<District[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        zoneId: '',
        pastorName: '',
        email: '',
        username: '',
        password: '',
        goals: {
            baptisms: { target: 0, period: 'Anual' },
            weeklyAttendanceMembers: { target: 0, period: 'Semanal' },
            weeklyAttendanceGp: { target: 0, period: 'Semanal' },
            missionaryPairs: { target: 0, period: 'Anual' },
            friends: { target: 0, period: 'Trimestral' },
            bibleStudies: { target: 0, period: 'Semestral' }
        }
    });

    useEffect(() => {
        const loadData = async () => {
            if (association) {
                try {
                    const allZones = await backend.getZones();
                    const assocZones = allZones.filter(z => z && z.id && z.associationId === association.id);
                    setZones(assocZones);

                    // Get all districts for these zones
                    const allDistricts = await backend.getDistricts();
                    const assocDistricts = allDistricts.filter(d => d && d.id && assocZones.some(z => z.id === d.zoneId));
                    setDistricts(assocDistricts);
                } catch (e) {
                    console.error(e);
                }
            }
        };
        loadData();
    }, [association, backend]);

    const handleCreate = () => {
        setEditingDistrict(null);
        setFormData({
            name: '',
            zoneId: '',
            pastorName: '',
            email: '',
            username: '',
            password: '',
            goals: {
                baptisms: { target: 0, period: 'Anual' },
                weeklyAttendanceMembers: { target: 0, period: 'Semanal' },
                weeklyAttendanceGp: { target: 0, period: 'Semanal' },
                missionaryPairs: { target: 0, period: 'Anual' },
                friends: { target: 0, period: 'Trimestral' },
                bibleStudies: { target: 0, period: 'Semestral' }
            }
        });
        setIsModalOpen(true);
    };

    const handleEdit = async (district: District) => {
        setEditingDistrict(district);
        // Find existing pastor user if possible
        try {
            const users = await backend.getUsers();
            const pastorUser = users.find(u => u.relatedEntityId === district.id && u.role === 'PASTOR');

            setFormData({
                name: district.name,
                zoneId: district.zoneId,
                pastorName: pastorUser ? pastorUser.name : '',
                email: pastorUser ? pastorUser.email || '' : '',
                username: pastorUser ? pastorUser.username : '',
                password: '',
                goals: district.goals || {
                    baptisms: { target: 0, period: 'Anual' },
                    weeklyAttendanceMembers: { target: 0, period: 'Semanal' },
                    weeklyAttendanceGp: { target: 0, period: 'Semanal' },
                    missionaryPairs: { target: 0, period: 'Anual' },
                    friends: { target: 0, period: 'Trimestral' },
                    bibleStudies: { target: 0, period: 'Semestral' }
                }
            });
            setIsModalOpen(true);
        } catch (e) { console.error(e); }
    };

    const handleGoalChange = (goal: string, field: 'target' | 'period', value: any) => {
        setFormData(prev => ({
            ...prev,
            goals: {
                ...prev.goals,
                [goal]: {
                    ...(prev.goals as any)[goal],
                    [field]: field === 'target' ? Number(value) : value
                }
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.zoneId) {
            showToast('Debe seleccionar una Zona', 'warning');
            return;
        }

        try {
            if (editingDistrict) {
                // Update District
                const updatedDistrict = {
                    ...editingDistrict,
                    name: formData.name,
                    zoneId: formData.zoneId,
                    goals: formData.goals
                };

                await backend.updateDistrict(updatedDistrict);

                // Update Pastor User
                if (formData.username) {
                    const users = await backend.getUsers();
                    const pastorUser = users.find(u => u.relatedEntityId === updatedDistrict.id && u.role === 'PASTOR');
                    if (pastorUser) {
                        const updatedUser = {
                            ...pastorUser,
                            name: formData.pastorName,
                            username: formData.username,
                            email: formData.email,
                            password: formData.password || pastorUser.password // Keep existing password if not provided
                        };
                        await backend.updateUser(updatedUser);
                    } else {
                        // Create if missing
                        try {
                            await backend.createUser({
                                email: formData.email,
                                username: formData.username,
                                password: formData.password || 'password',
                                role: 'PASTOR' as any,
                                relatedEntityId: updatedDistrict.id,
                                name: formData.pastorName,
                                isActive: true
                            });
                        } catch (e) {
                            console.error("Error creating missing pastor user for district", e);
                        }
                    }
                }

            } else {
                // Create District

                // 1. Validation
                const existingName = districts.find(d => d.name.toLowerCase() === formData.name.toLowerCase());
                if (existingName) throw new Error(`Ya existe un distrito con el nombre "${formData.name}".`);

                if (formData.username) {
                    const users = await backend.getUsers();
                    const existingUser = users.find(u => u.username === formData.username);
                    if (existingUser) throw new Error(`El nombre de usuario "${formData.username}" ya está en uso.`);
                }

                const districtId = 'dist-' + Math.random().toString(36).substr(2, 9);
                const newDistrict: District = {
                    id: districtId,
                    name: formData.name,
                    zoneId: formData.zoneId,
                    pastorId: null,
                    goals: formData.goals
                };

                // 2. Save District
                await backend.addDistrict(newDistrict);

                // 3. Create Pastor User with Rollback (simulated via try/catch)
                if (formData.username && formData.password && formData.email) {
                    try {
                        const userMetadata = {
                            name: formData.pastorName,
                            role: 'PASTOR' as any,
                            relatedEntityId: districtId
                        };

                        // A. Create record in public.users
                        await backend.createUser({
                            username: formData.username,
                            password: formData.password,
                            email: formData.email,
                            role: userMetadata.role,
                            relatedEntityId: districtId,
                            name: userMetadata.name
                        });

                        // B. Create account in Supabase Auth
                        try {
                            await backend.createAuthUser(formData.email, formData.password, userMetadata);
                        } catch (authError: any) {
                            console.error('Error creating auth account:', authError);
                        }

                    } catch (userError: any) {
                        await backend.deleteDistrict(districtId);
                        throw new Error('Error al crear el usuario del pastor: ' + userError.message + '. Operación cancelada.');
                    }
                } else if (!formData.email && formData.username) {
                    throw new Error('El correo electrónico es obligatorio para crear la cuenta de acceso.');
                }
            }

            setIsModalOpen(false);
            // Refresh data
            const allZones = await backend.getZones();
            const assocZones = allZones.filter(z => z && z.id && z.associationId === association.id);
            const allDistricts = await backend.getDistricts();
            setDistricts(allDistricts.filter(d => d && d.id && assocZones.some(z => z.id === d.zoneId)));

            showToast(editingDistrict ? 'Distrito actualizado exitosamente' : 'Distrito guardado exitosamente', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Está seguro de eliminar este distrito?')) {
            try {
                await backend.deleteDistrict(id);
                // Refresh data
                const allZones = await backend.getZones();
                const assocZones = allZones.filter(z => z && z.id && z.associationId === association.id);
                const allDistricts = await backend.getDistricts();
                setDistricts(allDistricts.filter(d => d && d.id && assocZones.some(z => z.id === d.zoneId)));
                showToast('Distrito eliminado correctamente', 'success');
            } catch (e: any) {
                showToast('Error al eliminar: ' + e.message, 'error');
            }
        }
    };

    const getZoneName = (zoneId: string) => zones.find(z => z.id === zoneId)?.name || 'Desconocida';
    const periods = ['Anual', 'Semestral', 'Trimestral', 'Bimensual', 'Mensual', 'Quincenal', 'Semanal'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Distritos de la Asociación</h2>
                <button onClick={handleCreate} className="btn btn-primary flex items-center">
                    <Plus size={20} className="mr-2" />
                    Nuevo Distrito
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meta Bautismos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {districts.map((district) => (
                            <tr key={district.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{district.name}</div>
                                            <div className="text-xs text-gray-500">ID: {district.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getZoneName(district.zoneId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {district.goals?.baptisms?.target || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleEdit(district)} className="text-blue-600 hover:text-blue-900">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(district.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {districts.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No hay distritos registrados.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{editingDistrict ? 'Editar Distrito' : 'Crear Nuevo Distrito'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* District Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                                <div className="md:col-span-2 text-sm font-semibold text-gray-500 uppercase">Información del Distrito</div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Distrito</label>
                                    <input
                                        type="text" required
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ej. Distrito Central"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zona Pertenece</label>
                                    <select
                                        required
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.zoneId}
                                        onChange={e => setFormData({ ...formData, zoneId: e.target.value })}
                                    >
                                        <option value="">Seleccionar Zona...</option>
                                        {zones.map(z => (
                                            <option key={z.id} value={z.id}>{z.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Pastor Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 bg-gray-50 p-4 rounded-md">
                                <div className="md:col-span-2 flex items-center text-sm font-semibold text-gray-500 uppercase">
                                    <User size={16} className="mr-2" /> Credenciales del Pastor
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                        type="text" required
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.pastorName}
                                        onChange={e => setFormData({ ...formData, pastorName: e.target.value })}
                                        placeholder="Ej. Pr. Juan Pérez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Acceso)</label>
                                    <input
                                        type="email"
                                        required={!editingDistrict}
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="pastor@iglesia.org"
                                    />
                                </div>
                                <div className="hidden md:block"></div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                                    <input
                                        type="text" required
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="usuario.pastor"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                    <input
                                        type="password"
                                        required={!editingDistrict}
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingDistrict ? '(Dejar en blanco para no cambiar)' : '******'}
                                    />
                                </div>
                            </div>

                            {/* Goals Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Definir Metas del Distrito</h3>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {[
                                        { key: 'baptisms', label: 'Bautismos (Número)' },
                                        { key: 'weeklyAttendanceMembers', label: 'Asistencia Semanal Miembros (%)' },
                                        { key: 'weeklyAttendanceGp', label: 'Asistencia Semanal GP (%)' },
                                        { key: 'missionaryPairs', label: 'Parejas Misioneras (Número)' },
                                        { key: 'friends', label: 'Amigos (Número)' },
                                        { key: 'bibleStudies', label: 'Estudios Bíblicos (Número)' },
                                    ].map((goal) => (
                                        <div key={goal.key} className="flex items-center space-x-4">
                                            <div className="w-1/3">
                                                <label className="block text-sm font-medium text-gray-700">{goal.label}</label>
                                            </div>
                                            <div className="w-1/3">
                                                <input type="number" min="0" className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    value={(formData.goals as any)[goal.key].target}
                                                    onChange={e => handleGoalChange(goal.key, 'target', e.target.value)} />
                                            </div>
                                            <div className="w-1/3">
                                                <select className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    value={(formData.goals as any)[goal.key].period}
                                                    onChange={e => handleGoalChange(goal.key, 'period', e.target.value)}>
                                                    {periods.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-4 py-2 btn btn-primary flex items-center">
                                    <Save size={18} className="mr-2" />
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssociationDistrictsView;
