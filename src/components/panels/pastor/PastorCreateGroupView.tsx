import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { District, SmallGroup, User, Church } from '../../../types';
import { Save } from 'lucide-react';

const PastorCreateGroupView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const navigate = useNavigate();
    const [personnel, setPersonnel] = useState<any[]>([]);
    const [churches, setChurches] = useState<Church[]>([]);

    const [formData, setFormData] = useState({
        churchId: '',
        name: '',
        leaderId: '',
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
        // Load available personnel (roles)
        const storedPersonnel = JSON.parse(localStorage.getItem('app_personnel') || '[]');
        setPersonnel(storedPersonnel);

        // Load churches for this district
        const allChurches = mockBackend.getChurches();
        const districtChurches = allChurches.filter(c => c.districtId === district.id);
        setChurches(districtChurches);
    }, [district.id]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.churchId) {
            alert('Por favor seleccione una iglesia');
            return;
        }

        // 1. Create the GP
        const newGp: SmallGroup = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name,
            motto: 'Lema por definir', // Default
            verse: 'Versículo por definir', // Default
            meetingDay: 'Viernes', // Default
            meetingTime: '19:00', // Default
            churchId: formData.churchId,
            leaderId: formData.leaderId, // This is the ID from the personnel list
            goals: formData.goals
        };

        // 2. Create the User for the Leader
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            username: formData.username,
            password: formData.password,
            role: 'LIDER_GP',
            relatedEntityId: newGp.id,
            name: personnel.find(p => p.id === formData.leaderId)?.firstName || 'Líder'
        };

        // 3. Save everything
        // Save GP
        const gps = mockBackend.getGPs();
        gps.push(newGp);
        localStorage.setItem('app_gps', JSON.stringify(gps));

        // Save User
        const users = mockBackend.getUsers();
        users.push(newUser);
        localStorage.setItem('app_users', JSON.stringify(users));

        // Move personnel to Member (if not already handled by backend logic, but here we simulate it)
        const selectedPerson = personnel.find(p => p.id === formData.leaderId);
        if (selectedPerson) {
            const newMember = {
                ...selectedPerson,
                gpId: newGp.id,
                role: 'LIDER'
            };
            mockBackend.addMember(newMember);
        }

        alert('Grupo Pequeño creado exitosamente');
        navigate('/pastor/churches'); // Redirect to churches list or groups list
    };

    const periods = ['Anual', 'Semestral', 'Trimestral', 'Bimensual', 'Mensual', 'Quincenal', 'Semanal'];

    return (
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Grupo Pequeño</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Church Selection */}
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                    <label className="block text-sm font-medium text-gray-700">Iglesia *</label>
                    <select required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={formData.churchId} onChange={e => setFormData({ ...formData, churchId: e.target.value })}>
                        <option value="">Seleccionar Iglesia...</option>
                        {churches.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Debe seleccionar la iglesia a la que pertenecerá el grupo.</p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Grupo</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Líder del Grupo</label>
                        <select required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.leaderId} onChange={e => setFormData({ ...formData, leaderId: e.target.value })}>
                            <option value="">Seleccionar Líder...</option>
                            {personnel.filter(p => {
                                // Filter by Role AND Church
                                // 1. Check direct churchId if exists
                                if (p.churchId === formData.churchId) return true;

                                // 2. Check via GP if member is already in a group in this church
                                const memberGp = mockBackend.getGPs().find(g => g.id === p.gpId);
                                if (memberGp && memberGp.churchId === formData.churchId) return true;

                                return false; // Not in this church
                            }).map(p => (
                                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                            ))}
                        </select>
                    </div>
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

                {/* Goals */}
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Metas del Grupo</h3>
                    <div className="space-y-4">
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

                <div className="flex justify-end pt-4">
                    <button type="submit" className="btn btn-primary bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700">
                        <Save className="mr-2 inline" size={18} />
                        Crear Grupo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PastorCreateGroupView;
