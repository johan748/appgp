import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { Member } from '../../../types';
import { Save, ArrowLeft } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const EditMemberView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [member, setMember] = useState<Member | null>(null);

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

    useEffect(() => {
        if (id) {
            const allMembers = mockBackend.getMembers();
            const foundMember = allMembers.find(m => m.id === id);

            if (foundMember) {
                setMember(foundMember);
                setFormData({
                    firstName: foundMember.firstName,
                    lastName: foundMember.lastName,
                    cedula: foundMember.cedula,
                    birthDate: foundMember.birthDate,
                    phone: foundMember.phone,
                    email: foundMember.email || '',
                    address: foundMember.address,
                    isBaptized: foundMember.isBaptized ? 'Sí' : 'No',
                    gender: foundMember.gender,
                    role: foundMember.role
                });
            }
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (member) {
            const updatedMember: Member = {
                ...member,
                ...formData,
                isBaptized: formData.isBaptized === 'Sí',
                gender: formData.gender as 'M' | 'F',
                role: formData.role as 'MIEMBRO' | 'LIDER' | 'LIDER_EN_FORMACION' | 'SECRETARIO'
            };

            mockBackend.updateMember(updatedMember);
            showToast('Miembro actualizado exitosamente', 'success');
            navigate('/leader/members');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!member) {
        return (
            <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
                <p className="text-gray-500">Cargando información del miembro...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/leader/members')}
                    className="mr-4 text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Editar Miembro</h2>
            </div>

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
                        <label className="block text-sm font-medium text-gray-700">Rol en el GP</label>
                        <select name="role" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.role} onChange={handleChange}>
                            <option value="LIDER">Líder</option>
                            <option value="LIDER_EN_FORMACION">Líder en formación</option>
                            <option value="SECRETARIO">Secretario</option>
                            <option value="MIEMBRO">Miembro</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/leader/members')}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                        <Save className="mr-2" size={18} />
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMemberView;
