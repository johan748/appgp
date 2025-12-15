import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { District, Church, User } from '../../../types';
import { Save } from 'lucide-react';

const PastorCreateChurchView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        directorName: '',
        username: '',
        password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
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

        // 3. Save everything
        const churches = mockBackend.getChurches();
        churches.push(newChurch);
        localStorage.setItem('app_churches', JSON.stringify(churches));

        const users = mockBackend.getUsers();
        users.push(newUser);
        localStorage.setItem('app_users', JSON.stringify(users));

        alert('Iglesia creada exitosamente');
        navigate('/pastor/churches');
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
