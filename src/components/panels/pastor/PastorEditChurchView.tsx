import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { District, Church } from '../../../types';
import { Save } from 'lucide-react';

const PastorEditChurchView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [churches, setChurches] = useState<Church[]>([]);
    const [selectedChurchId, setSelectedChurchId] = useState('');
    const [formData, setFormData] = useState<Church | null>(null);
    const [directorData, setDirectorData] = useState({
        name: '',
        email: '',
        username: '',
        password: ''
    });

    useEffect(() => {
        const loadChurches = async () => {
            if (district) {
                try {
                    const allChurches = await backend.getChurches();
                    setChurches(allChurches.filter(c => c.districtId === district.id));
                } catch (e) { console.error(e); }
            }
        };
        loadChurches();
    }, [district, backend]);

    const handleSelect = async (id: string) => {
        setSelectedChurchId(id);
        const church = churches.find(c => c.id === id);
        if (church) {
            setFormData({ ...church });
            // Fetch linked director user
            try {
                const users = await backend.getUsers();
                const directorUser = users.find(u => u.relatedEntityId === church.id && u.role === 'DIRECTOR_MP');
                if (directorUser) {
                    setDirectorData({
                        name: directorUser.name,
                        email: directorUser.email || '',
                        username: directorUser.username,
                        password: '' // Don't show password
                    });
                } else {
                    setDirectorData({ name: '', email: '', username: '', password: '' });
                }
            } catch (e) { console.error("Error fetching director:", e); }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            try {
                // 1. Update Church
                await backend.updateChurch(formData);

                // 2. Update Director User
                if (directorData.username) {
                    const users = await backend.getUsers();
                    const directorUser = users.find(u => u.relatedEntityId === formData.id && u.role === 'DIRECTOR_MP');
                    if (directorUser) {
                        const updatedUser = {
                            ...directorUser,
                            name: directorData.name,
                            username: directorData.username,
                            email: directorData.email,
                            password: directorData.password || directorUser.password
                        };
                        await backend.updateUser(updatedUser);
                    } else {
                        // Create if missing
                        await backend.createUser({
                            username: directorData.username,
                            password: directorData.password || 'password',
                            email: directorData.email,
                            role: 'DIRECTOR_MP' as any,
                            relatedEntityId: formData.id,
                            name: directorData.name,
                            isActive: true
                        });
                    }
                }

                showToast('Iglesia y director actualizados exitosamente', 'success');
                navigate('/pastor/churches');
            } catch (error) {
                console.error("Error updating church/director:", error);
                showToast('Error al actualizar datos', 'error');
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Iglesia</h2>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Seleccionar Iglesia</label>
                <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={selectedChurchId}
                    onChange={e => handleSelect(e.target.value)}
                >
                    <option value="">Seleccione una Iglesia...</option>
                    {churches.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {formData && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Iglesia</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Credenciales del Director MP</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={directorData.name} onChange={e => setDirectorData({ ...directorData, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Acceso)</label>
                            <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={directorData.email} onChange={e => setDirectorData({ ...directorData, email: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={directorData.username} onChange={e => setDirectorData({ ...directorData, username: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                                <input type="password" underline className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="Dejar en blanco para no cambiar"
                                    value={directorData.password} onChange={e => setDirectorData({ ...directorData, password: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn btn-primary">
                            <Save className="mr-2" size={18} />
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PastorEditChurchView;
