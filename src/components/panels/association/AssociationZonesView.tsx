import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { Association, Zone } from '../../../types';
import { MapPin, Users, Plus, Edit, Trash2, X, Save, User } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const AssociationZonesView: React.FC = () => {
    const { association } = useOutletContext<{ association: Association }>();
    const { showToast } = useToast();
    const [zones, setZones] = useState<Zone[]>([]);
    const [stats, setStats] = useState<Record<string, { districts: number, churches: number }>>({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        directorName: '',
        username: '',
        password: ''
    });

    useEffect(() => {
        mockBackend.cleanupDuplicates();
        loadData();
    }, [association]);

    const loadData = () => {
        if (association) {
            // Robustly filter zones: must match association AND have a valid ID
            const assocZones = mockBackend.getZones()
                .filter(z => z && z.id && z.associationId === association.id);
            setZones(assocZones);

            const newStats: any = {};
            assocZones.forEach(zone => {
                const districts = mockBackend.getDistricts().filter(d => d.zoneId === zone.id);
                const allChurches = mockBackend.getChurches();
                const zoneChurches = allChurches.filter(c => districts.some(d => d.id === c.districtId));

                newStats[zone.id] = {
                    districts: districts.length,
                    churches: zoneChurches.length
                };
            });
            setStats(newStats);
        }
    };

    const handleCreate = () => {
        setEditingZone(null);
        setFormData({ name: '', directorName: '', username: '', password: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (zone: Zone) => {
        setEditingZone(zone);

        // Find existing director user
        const users = mockBackend.getUsers();
        const directorUser = users.find(u => u.relatedEntityId === zone.id && u.role === 'DIRECTOR_ZONA');

        setFormData({
            name: zone.name,
            directorName: directorUser ? directorUser.name : '',
            username: directorUser ? directorUser.username : '',
            password: '' // Keep empty for security unless changing
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingZone) {
                // Update Zone
                const updatedZone = { ...editingZone, name: formData.name };
                mockBackend.updateZone(updatedZone);

                // Update Director User
                if (formData.username) {
                    const users = mockBackend.getUsers();
                    const directorUser = users.find(u => u.relatedEntityId === updatedZone.id && u.role === 'DIRECTOR_ZONA');

                    if (directorUser) {
                        const updatedUser = { ...directorUser, name: formData.directorName, username: formData.username };
                        if (formData.password) updatedUser.password = formData.password;
                        mockBackend.updateUser(updatedUser);
                    } else {
                        // Create if missing (e.g. was deleted manually or data inconsistency)
                        try {
                            mockBackend.createUser({
                                username: formData.username,
                                password: formData.password || 'password',
                                role: 'DIRECTOR_ZONA',
                                relatedEntityId: updatedZone.id,
                                name: formData.directorName
                            });
                        } catch (e) {
                            console.error("Error updating/creating user for zone", e);
                            // It might exist but not linked correctly? Ignore for now or alert?
                        }
                    }
                }

            } else {
                // Create Zone

                // 1a. Validate Zone Name uniqueness
                const existingName = zones.find(z => z.name.toLowerCase() === formData.name.toLowerCase());
                if (existingName) {
                    throw new Error(`Ya existe una zona con el nombre "${formData.name}".`);
                }

                // 1b. Validate Username uniqueness first to avoid partial state
                if (formData.username) {
                    const existingUser = mockBackend.getUsers().find(u => u.username === formData.username);
                    if (existingUser) {
                        throw new Error(`El nombre de usuario "${formData.username}" ya está en uso. Por favor elija otro.`);
                    }
                }

                const zoneId = 'zone-' + Math.random().toString(36).substr(2, 9);

                // 2. Create Director User FIRST (so we can get the ID)
                let directorUserId = 'pending';
                if (formData.username && formData.password) {
                    try {
                        const newUser = mockBackend.createUser({
                            username: formData.username,
                            password: formData.password,
                            role: 'DIRECTOR_ZONA',
                            relatedEntityId: zoneId,
                            name: formData.directorName
                        });
                        directorUserId = newUser.id;
                    } catch (userError: any) {
                        throw new Error('Error al crear el usuario del director: ' + userError.message);
                    }
                }

                // 3. Save Zone with the correct directorId
                const newZone: Zone = {
                    id: zoneId,
                    name: formData.name,
                    associationId: association.id,
                    directorId: directorUserId,
                    goals: {}
                };

                try {
                    mockBackend.addZone(newZone);
                } catch (zoneError: any) {
                    // Rollback: Delete the user if zone creation fails
                    if (directorUserId !== 'pending') {
                        const users = mockBackend.getUsers().filter(u => u.id !== directorUserId);
                        localStorage.setItem('app_users', JSON.stringify(users));
                    }
                    throw new Error('Error al crear la zona: ' + zoneError.message);
                }
            }

            setIsModalOpen(false);
            loadData();
            showToast(editingZone ? 'Zona actualizada exitosamente' : 'Zona guardada exitosamente', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Está seguro de eliminar esta zona? Esta acción no se puede deshacer.')) {
            try {
                mockBackend.deleteZone(id);
                loadData();
                showToast('Zona eliminada correctamente', 'success');
            } catch (e: any) {
                showToast('Error al eliminar la zona: ' + e.message, 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Zonas de la Asociación</h2>
                <button onClick={handleCreate} className="btn btn-primary flex items-center">
                    <Plus size={20} className="mr-2" />
                    Nueva Zona
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {zones.map(zone => (
                    <div key={zone.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(zone)} className="text-blue-500 hover:text-blue-700 p-1">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(zone.id)} className="text-red-500 hover:text-red-700 p-1">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-blue-600 mb-1">
                                    <MapPin size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[zone.id]?.districts || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Distritos</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-gray-100">
                                <div className="flex items-center text-teal-600 mb-1">
                                    <Users size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[zone.id]?.churches || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Iglesias</span>
                            </div>
                        </div>
                    </div>
                ))}

                {zones.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No hay Zonas registradas en esta asociación.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{editingZone ? 'Editar Zona' : 'Crear Nueva Zona'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Zona</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded p-2"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Zona Norte"
                                />
                            </div>

                            {/* Director Credentials */}
                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-3">
                                <div className="flex items-center text-sm font-semibold text-gray-500 uppercase border-b pb-2">
                                    <User size={16} className="mr-2" /> Credenciales Director de Zona
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Director</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.directorName}
                                        onChange={e => setFormData({ ...formData, directorName: e.target.value })}
                                        placeholder="Ej. Pr. Carlos Director"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                        placeholder="usuario.director"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                    <input
                                        type="password"
                                        required={!editingZone}
                                        className="w-full border border-gray-300 rounded p-2"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingZone ? '(Dejar en blanco para no cambiar)' : '******'}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
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

export default AssociationZonesView;
