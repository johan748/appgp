import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { Church, SmallGroup, User } from '../../../types';
import { Save } from 'lucide-react';

const DirectorCreateGroupView: React.FC = () => {
    const { church } = useOutletContext<{ church: Church }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [personnel, setPersonnel] = useState<any[]>([]);

    const [formData, setFormData] = useState({
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

    // We still need to verify if the selected personnel is already in a GP.
    // Ideally, personnel list should come from backend too, but keeping localStorage for now if it's transient.
    // But we need to check GP membership using backend.

    // For filtering effectively in the render, we need the list of all GPs.
    const [allGPs, setAllGPs] = useState<SmallGroup[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!church) {
                console.error('Church context is undefined');
                return;
            }

            // Load available personnel (roles)
            const storedPersonnel = JSON.parse(localStorage.getItem('app_personnel') || '[]');
            setPersonnel(storedPersonnel);

            try {
                const gps = await backend.getGPs();
                setAllGPs(gps);
            } catch (error) {
                console.error("Error loading GPs:", error);
            }
        };
        loadData();
    }, [church, backend]);

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

        if (!church) {
            showToast('Error: No se pudo identificar la iglesia. Por favor intenta nuevamente.', 'error');
            return;
        }

        try {
            // 1. Generate a GP ID upfront
            const gpId = `gp-${Math.random().toString(36).substr(2, 9)}`;

            // 2. Create the User for the Leader FIRST (we need the UUID for leader_id)
            const newUserData: Omit<User, 'id'> = {
                username: formData.username,
                password: formData.password,
                role: 'LIDER_GP',
                relatedEntityId: gpId,
                name: personnel.find(p => p.id === formData.leaderId)?.firstName || 'Líder',
                email: formData.username.includes('@') ? formData.username : `${formData.username}@gp.com`, // Ensure an email exists
                isActive: true
            };

            const createdUser = await backend.createUser(newUserData);

            // 3. Create the GP (using the User's UUID as leaderId)
            const newGpData: SmallGroup = {
                id: gpId,
                name: formData.name,
                motto: 'Lema por definir', // Default
                verse: 'Versículo por definir', // Default
                meetingDay: 'Viernes', // Default
                meetingTime: '19:00', // Default
                churchId: church.id,
                leaderId: createdUser.id, // This is the UUID from Supabase
                goals: formData.goals
            };

            const createdGp = await backend.createGP(newGpData);

            // 4. Move personnel to Member (create member in GP)
            const selectedPerson = personnel.find(p => p.id === formData.leaderId);
            if (selectedPerson) {
                const newMember = {
                    ...selectedPerson,
                    id: `mem-${Math.random().toString(36).substr(2, 9)}`,
                    gpId: createdGp.id,
                    role: 'LIDER'
                };
                await backend.addMember(newMember);
            }

            showToast('Grupo Pequeño creado exitosamente', 'success');
            navigate('/director/groups');
        } catch (error: any) {
            console.error("Error creating GP:", error);
            showToast(`Error al crear grupo: ${error.message || 'Error desconocido'}`, 'error');
        }
    };

    const periods = ['Anual', 'Semestral', 'Trimestral', 'Bimensual', 'Mensual', 'Quincenal', 'Semanal'];

    if (!church) {
        return (
            <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
                <div className="text-center py-10">
                    <p className="text-red-600 font-semibold">Error: No se pudo cargar la información de la iglesia.</p>
                    <p className="text-gray-600 mt-2">Por favor vuelve al listado e intenta nuevamente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Grupo Pequeño</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                                // Filter by role AND church
                                if (p.role !== 'LIDER') return false;

                                // 1. Check direct churchId if exists
                                if (p.churchId === church.id) return true;

                                // 2. Check via GP if member is already in a group in this church
                                const memberGp = allGPs.find(g => g.id === p.gpId);
                                if (memberGp && memberGp.churchId === church.id) return true;

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
                    <button type="submit" className="btn btn-primary">
                        <Save className="mr-2" size={18} />
                        Crear Grupo
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DirectorCreateGroupView;
