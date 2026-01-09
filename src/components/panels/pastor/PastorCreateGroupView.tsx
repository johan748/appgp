import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { District, SmallGroup, User, Church } from '../../../types';
import { Save } from 'lucide-react';

const PastorCreateGroupView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [churches, setChurches] = useState<Church[]>([]);

    const [formData, setFormData] = useState({
        churchId: '',
        name: '',
        leaderFirstName: '',
        leaderLastName: '',
        leaderCedula: '',
        leaderPhone: '',
        username: '',
        email: '',
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
            if (!district) return;

            try {
                // Load churches for this district
                const allChurches = await backend.getChurches();
                const districtChurches = allChurches.filter(c => c.districtId === district.id);
                setChurches(districtChurches);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        loadData();
    }, [district, backend]);

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

        if (!formData.churchId) {
            showToast('Por favor seleccione una iglesia', 'warning');
            return;
        }

        try {
            // 1. Generate a GP ID upfront
            const gpId = `gp-${Math.random().toString(36).substr(2, 9)}`;
            const leaderName = `${formData.leaderFirstName} ${formData.leaderLastName}`;

            // 2. Create the User for the Leader
            const newUserData: Omit<User, 'id'> = {
                username: formData.username,
                password: formData.password,
                role: 'LIDER_GP',
                relatedEntityId: gpId,
                name: leaderName,
                email: formData.email,
                isActive: true
            };

            const createdUser = await backend.createUser(newUserData);

            // 3. Create Auth User (Supabase Auth)
            try {
                const userMetadata = {
                    name: leaderName,
                    role: 'LIDER_GP',
                    relatedEntityId: gpId
                };
                await backend.createAuthUser(formData.email, formData.password, userMetadata);
            } catch (authError) {
                console.error("Error creating auth user", authError);
            }

            // 4. Create the GP
            const newGp: SmallGroup = {
                id: gpId,
                name: formData.name,
                motto: 'Lema por definir', // Default
                verse: 'Versículo por definir', // Default
                meetingDay: 'Viernes', // Default
                meetingTime: '19:00', // Default
                churchId: formData.churchId,
                leaderId: createdUser.id, // Supabase UUID
                goals: formData.goals
            };

            const createdGp = await backend.createGP(newGp);

            // 5. Create the Member record for the leader
            const newMember = {
                firstName: formData.leaderFirstName,
                lastName: formData.leaderLastName,
                cedula: formData.leaderCedula,
                phone: formData.leaderPhone,
                email: formData.email,
                id: `mem-${Math.random().toString(36).substr(2, 9)}`,
                gpId: createdGp.id,
                role: 'LIDER',
                churchId: formData.churchId,
                isBaptized: true, // Assuming leader is baptized
                gender: 'M',
                address: '',
                birthDate: ''
            };
            await backend.addMember(newMember);


            showToast('Grupo Pequeño creado exitosamente', 'success');
            navigate('/pastor/churches');
        } catch (error: any) {
            console.error("Error creating GP:", error);
            showToast(`Error al crear grupo: ${error.message || 'Error desconocido'}`, 'error');
        }
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
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Nombre del Grupo</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    {/* Leader Details */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Líder</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.leaderFirstName} onChange={e => setFormData({ ...formData, leaderFirstName: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Apellido del Líder</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.leaderLastName} onChange={e => setFormData({ ...formData, leaderLastName: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cédula</label>
                        <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.leaderCedula} onChange={e => setFormData({ ...formData, leaderCedula: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input type="tel" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.leaderPhone} onChange={e => setFormData({ ...formData, leaderPhone: e.target.value })} />
                    </div>

                    {/* Credentials */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email (Acceso)</label>
                        <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="lider@ejemplo.com" />
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
                    <button type="submit" className="btn btn-primary">
                        <Save className="mr-2 inline" size={18} />
                        Crear Grupo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PastorCreateGroupView;
