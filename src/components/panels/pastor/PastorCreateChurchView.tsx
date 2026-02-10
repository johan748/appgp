import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { District, Church, User } from '../../../types';
import { Save } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const PastorCreateChurchView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { backend } = useBackend();

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        directorName: '',
        email: '',
        username: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Create the Church
        const newChurch: Church = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name,
            districtId: district.id,
            address: formData.address
        };

        // 2. Create the User for the Director MP
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            username: formData.username,
            password: formData.password,
            role: 'DIRECTOR_MP',
            relatedEntityId: newChurch.id,
            name: formData.directorName
        };

        try {
            // 3. Save everything
            await backend.addChurch(newChurch);
            // Warning: createUser usually excludes ID in interface, but our local impl might handle it.
            // mockBackendAsync.createUser takes Omit<User, 'id'>.
            // Let's adjust to match interface expectation if strict, or use the one that generates ID.
            // In my IBackendService, createUser takes Omit<User, 'id'> and returns Promise<User>.
            // So we should NOT pass ID.

            const userMetadata = {
                name: formData.directorName,
                role: 'DIRECTOR_MP' as any,
                relatedEntityId: newChurch.id
            };

            const userToCreate: Omit<User, 'id'> = {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                role: userMetadata.role,
                relatedEntityId: newChurch.id,
                name: userMetadata.name
            };

            await backend.createUser(userToCreate);

            // 4. Create account in Supabase Auth
            try {
                await backend.createAuthUser(formData.email, formData.password, userMetadata);
            } catch (authError: any) {
                console.error('Error creating auth account:', authError);
            }

            showToast('Iglesia creada exitosamente', 'success');
            navigate('/pastor/churches');
        } catch (error) {
            console.error(error);
            showToast('Error al crear iglesia', 'error');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nueva Iglesia</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Director MP</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.directorName} onChange={e => setFormData({ ...formData, directorName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email (Acceso)</label>
                            <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="director@iglesia.org" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Usuario (Login)</label>
                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary">
                        <Save className="mr-2" size={18} />
                        Crear Iglesia
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PastorCreateChurchView;
