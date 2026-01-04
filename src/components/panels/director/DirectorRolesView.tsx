import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { Church } from '../../../types';
import { Save, Users } from 'lucide-react';

const DirectorRolesView: React.FC = () => {
    const { church } = useOutletContext<{ church: Church }>();
    const { showToast } = useToast();
    const [rolesList, setRolesList] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        cedula: '',
        birthDate: '',
        phone: '',
        email: '',
        address: '',
        isBaptized: 'Sí',
        gender: 'M',
        role: 'LIDER'
    });

    useEffect(() => {
        loadRoles();
    }, [church]);

    const loadRoles = () => {
        const personnel = JSON.parse(localStorage.getItem('app_personnel') || '[]');
        // Filter by this church only
        const churchPersonnel = personnel.filter((p: any) => p.churchId === church.id);
        setRolesList(churchPersonnel);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In this context, "Roles" creates a Member that is not yet assigned to a GP, 
        // or potentially a User. The prompt implies these are people available to be assigned.
        // We'll create them as Members with a placeholder GP ID or null, but our type requires gpId.
        // For now, we'll store them in a separate "pool" or just add them with a special flag.
        // However, to keep it simple with the current backend, we might just add them to a "Unassigned" list
        // or just save them to localStorage as 'available_personnel'.

        // Let's assume we add them to the members list but with a null gpId (need to update type or handle it).
        // Or better, just save to a new collection 'personnel' which CreateGroup reads from.

        const newPerson = {
            ...formData,
            id: Math.random().toString(36).substr(2, 9),
            isBaptized: formData.isBaptized === 'Sí',
            churchId: church.id // Tag them with church
        };

        const personnel = JSON.parse(localStorage.getItem('app_personnel') || '[]');
        personnel.push(newPerson);
        localStorage.setItem('app_personnel', JSON.stringify(personnel));

        showToast('Persona registrada exitosamente', 'success');
        setFormData({
            firstName: '', lastName: '', cedula: '', birthDate: '', phone: '', email: '',
            address: '', isBaptized: 'Sí', gender: 'M', role: 'LIDER'
        });
        loadRoles(); // Refresh the list
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Registro de Roles (Personal)</h2>

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
                        <label className="block text-sm font-medium text-gray-700">Rol a Desempeñar</label>
                        <select name="role" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.role} onChange={handleChange}>
                            <option value="LIDER">Líder</option>
                            <option value="LIDER_EN_FORMACION">Líder en formación</option>
                            <option value="SECRETARIO">Secretario</option>
                            <option value="MIEMBRO">Miembro</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary w-full md:w-auto">
                        <Save className="mr-2" size={18} />
                        Guardar Personal
                    </button>
                </div>
            </form>

            {/* Personnel List */}
            <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Users className="mr-2 text-primary" size={20} />
                    Personal Registrado ({rolesList.length})
                </h3>

                {rolesList.length > 0 ? (
                    <div className="bg-white shadow overflow-hidden rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rolesList.map((person: any) => (
                                    <tr key={person.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {person.firstName} {person.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {person.cedula}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {person.role === 'LIDER' ? 'Líder' :
                                                    person.role === 'LIDER_EN_FORMACION' ? 'Líder en formación' :
                                                        person.role === 'SECRETARIO' ? 'Secretario' : 'Miembro'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {person.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {person.email || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No hay personal registrado aún.</p>
                        <p className="text-sm text-gray-400 mt-1">Usa el formulario de arriba para registrar nuevo personal.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectorRolesView;
