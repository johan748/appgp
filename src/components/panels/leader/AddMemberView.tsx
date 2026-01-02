import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { backend } from '../../../services';
import { useToast } from '../../../context/ToastContext';
import { SmallGroup, Member } from '../../../types';
import { Save } from 'lucide-react';

const AddMemberView: React.FC = () => {
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        cedula: '',
        birthDate: '',
        phone: '',
        email: '',
        address: '',
        isBaptized: 'No',
        gender: 'M',
        role: 'MIEMBRO'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (gp) {
            try {
                const newMember: any = {
                    ...formData,
                    isBaptized: formData.isBaptized === 'Sí',
                    gpId: gp.id, // gp.id ya es UUID en Supabase
                    // Initialize progress trackers
                    leadershipProgress: {},
                    friendProgress: {}
                };

                const currentBackend = await backend();
                await currentBackend.addMember(newMember);
                showToast('Miembro agregado exitosamente', 'success');
                navigate('/leader/members');
            } catch (error) {
                console.error('Error adding member:', error);
                showToast('Error al agregar miembro', 'error');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registrar Nuevo Miembro</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input type="text" required name="firstName" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.firstName} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Apellido</label>
                        <input type="text" required name="lastName" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.lastName} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula</label>
                        <input type="text" required name="cedula" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.cedula} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                        <input type="date" required name="birthDate" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.birthDate} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input type="tel" required name="phone" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.phone} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" required name="address" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.address} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bautizado</label>
                        <select name="isBaptized" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.isBaptized} onChange={handleChange}>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sexo</label>
                        <select name="gender" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.gender} onChange={handleChange}>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Rol</label>
                        <select name="role" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.role} onChange={handleChange}>
                            <option value="MIEMBRO">Miembro</option>
                            <option value="LIDER_EN_FORMACION">Líder en formación</option>
                            <option value="SECRETARIO">Secretario</option>
                            <option value="LIDER">Líder</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary w-full md:w-auto">
                        <Save className="mr-2" size={18} />
                        Guardar Miembro
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMemberView;
