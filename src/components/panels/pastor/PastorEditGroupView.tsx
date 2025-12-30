import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { mockBackend } from '../../../services/mockBackend';
import { District, SmallGroup, Church } from '../../../types';
import { Save } from 'lucide-react';

const PastorEditGroupView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [churches, setChurches] = useState<Church[]>([]);
    const [selectedChurchId, setSelectedChurchId] = useState('');
    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [selectedGpId, setSelectedGpId] = useState('');

    const [formData, setFormData] = useState<SmallGroup | null>(null);

    useEffect(() => {
        // Load churches
        const allChurches = mockBackend.getChurches();
        setChurches(allChurches.filter(c => c.districtId === district.id));
    }, [district.id]);

    useEffect(() => {
        if (selectedChurchId) {
            setGps(mockBackend.getGPs().filter(g => g.churchId === selectedChurchId));
            setSelectedGpId(''); // Reset selection
            setFormData(null);
        } else {
            setGps([]);
            setFormData(null);
        }
    }, [selectedChurchId]);

    const handleGpSelect = (id: string) => {
        setSelectedGpId(id);
        const gp = gps.find(g => g.id === id);
        if (gp) {
            setFormData(JSON.parse(JSON.stringify(gp))); // Deep copy
        }
    };

    const handleGoalChange = (goal: string, field: 'target' | 'period', value: any) => {
        if (formData) {
            setFormData(prev => ({
                ...prev!,
                goals: {
                    ...prev!.goals,
                    [goal]: {
                        ...(prev!.goals as any)[goal],
                        [field]: field === 'target' ? Number(value) : value
                    }
                }
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            mockBackend.updateGP(formData);
            showToast('Grupo actualizado exitosamente', 'success');
            // navigate('/pastor/groups'); // Optional redirect
        }
    };

    const periods = ['Anual', 'Semestral', 'Trimestral', 'Bimensual', 'Mensual', 'Quincenal', 'Semanal'];

    return (
        <div className="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Grupo Pequeño</h2>

            {/* Church & Group Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Seleccionar Iglesia</label>
                    <select
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={selectedChurchId}
                        onChange={e => setSelectedChurchId(e.target.value)}
                    >
                        <option value="">Seleccione una Iglesia...</option>
                        {churches.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Seleccionar Grupo</label>
                    <select
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={selectedGpId}
                        onChange={e => handleGpSelect(e.target.value)}
                        disabled={!selectedChurchId}
                    >
                        <option value="">Seleccione un GP...</option>
                        {gps.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {formData && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre del Grupo</label>
                            <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.name} onChange={e => setFormData({ ...formData!, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lema</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={formData.motto} onChange={e => setFormData({ ...formData!, motto: e.target.value })} />
                        </div>
                    </div>

                    {/* Goals */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Metas</h3>
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
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PastorEditGroupView;
