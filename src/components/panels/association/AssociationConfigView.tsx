import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { Association } from '../../../types';
import { Settings, Save, Lock, User, Target } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const AssociationConfigView: React.FC = () => {
    const { association, refreshAssociation } = useOutletContext<{ association: Association; refreshAssociation: () => void }>();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [unionName, setUnionName] = useState('Unión no encontrada');

    // State initialization
    const [assocName, setAssocName] = useState(association.name);
    const [departmentHead, setDepartmentHead] = useState(association.departmentHead || '');
    const [membershipCount, setMembershipCount] = useState(association.membershipCount || 0);

    const [username, setUsername] = useState(association.config.username);
    const [password, setPassword] = useState(association.config.password);
    const [annualBaptismGoal, setAnnualBaptismGoal] = useState(association.config.annualBaptismGoal || 0);

    // Sync state if association changes (e.g. after refresh)
    // Initialize state only when the association ID changes
    const prevAssocIdRef = React.useRef<string | null>(null);
    React.useEffect(() => {
        if (association.id !== prevAssocIdRef.current) {
            prevAssocIdRef.current = association.id;
            setAssocName(association.name);
            setDepartmentHead(association.departmentHead || '');
            setMembershipCount(association.membershipCount || 0);
            setUsername(association.config.username);
            setPassword(association.config.password);
            setAnnualBaptismGoal(association.config.annualBaptismGoal || 0);
        }
        // Load union name (does not affect form fields)
        const loadUnion = async () => {
            if (association.unionId) {
                try {
                    const union = await backend.getUnionById(association.unionId);
                    if (union) setUnionName(union.name);
                } catch (e) { console.error(e); }
            }
        };
        loadUnion();
    }, [association.id, association.unionId, backend]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const updatedAssoc: Association = {
                ...association,
                name: assocName,
                departmentHead,
                membershipCount,
                config: {
                    username,
                    password,
                    annualBaptismGoal
                }
            };

            await backend.updateAssociation(updatedAssoc);
            refreshAssociation(); // Update parent state
            showToast('Configuración guardada exitosamente. Las credenciales de acceso se han actualizado.', 'success');
        } catch (error: any) {
            showToast('Error al guardar: ' + error.message, 'error');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Settings className="mr-2" /> Configuración General
            </h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 gap-8">

                {/* Organizational Info */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                        <User className="mr-2" size={20} /> Información de la Organización
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre de la Asociación</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={assocName} onChange={e => setAssocName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre de la Unión</label>
                            <p className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-600">
                                {unionName}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Departamental (Dir. MP)</label>
                            <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={departmentHead} onChange={e => setDepartmentHead(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Membresía Total Actual</label>
                            <input type="number" min={0} step={1} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={membershipCount} onChange={e => setMembershipCount(Number(e.target.value))} />
                        </div>
                    </div>
                </div>

                {/* Goals & Settings */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                        <Target className="mr-2" size={20} /> Metas Globales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Meta Anual de Bautismos (Asociación)</label>
                            <input type="number" min={0} step={1} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={annualBaptismGoal} onChange={e => setAnnualBaptismGoal(Number(e.target.value))} />
                            <p className="text-xs text-gray-500 mt-1">Este valor se usará para medir el progreso global.</p>
                        </div>
                    </div>
                </div>

                {/* Account Credentials */}
                <div className="bg-white shadow rounded-lg p-6 border-l-4 border-yellow-500">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                        <Lock className="mr-2" size={20} /> Credenciales de Acceso (Usuario Asociación)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Usuario</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="text" // Visible for easy editing as requested, or password type
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                            <p className="text-xs text-red-500 mt-1">¡Cuidado! Al cambiar esto, deberá usar las nuevas credenciales en el próximo inicio de sesión.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button type="submit" className="btn btn-primary">
                        <Save size={18} className="mr-2" />
                        Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssociationConfigView;
