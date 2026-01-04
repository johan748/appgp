import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { Church, District, SmallGroup } from '../../../types';
import { Settings, ArrowLeft } from 'lucide-react';

const DirectorLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const navigate = useNavigate();
    const location = useLocation();
    const [church, setChurch] = useState<Church | null>(null);
    const [district, setDistrict] = useState<District | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [selectedGpId, setSelectedGpId] = useState('');

    // Config Form State
    const [configForm, setConfigForm] = useState({
        name: '', motto: '', verse: '', meetingDay: '', meetingTime: ''
    });

    useEffect(() => {
        const loadDirectorData = async () => {
            if (user && user.relatedEntityId) {
                try {
                    const allChurches = await backend.getChurches();
                    const churchData = allChurches.find(c => c.id === user.relatedEntityId);

                    if (churchData) {
                        setChurch(churchData);

                        const allDistricts = await backend.getDistricts();
                        const districtData = allDistricts.find(d => d.id === churchData.districtId);
                        setDistrict(districtData || null);

                        // Load GPs for config
                        const allGPs = await backend.getGPs();
                        const churchGps = allGPs.filter(g => g.churchId === churchData.id);
                        setGps(churchGps);
                    }
                } catch (error) {
                    console.error("Error loading director data:", error);
                }
            }
        };
        loadDirectorData();
    }, [user, backend]);

    const handleGpSelect = (gpId: string) => {
        setSelectedGpId(gpId);
        const gp = gps.find(g => g.id === gpId);
        if (gp) {
            setConfigForm({
                name: gp.name,
                motto: gp.motto,
                verse: gp.verse,
                meetingDay: gp.meetingDay,
                meetingTime: gp.meetingTime
            });
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGpId) {
            const gp = gps.find(g => g.id === selectedGpId);
            if (gp) {
                const updatedGp = { ...gp, ...configForm };
                try {
                    await backend.updateGP(updatedGp);
                    // Update local state
                    setGps(gps.map(g => g.id === selectedGpId ? updatedGp : g));
                    showToast('Configuración del GP actualizada', 'success');
                    setIsConfigOpen(false);
                } catch (error) {
                    console.error("Error updating GP config:", error);
                    showToast('Error al actualizar configuración', 'error');
                }
            }
        }
    };

    const getWelcomeMessage = () => {
        // Assuming Director name is in user.name or we fetch the member profile
        // For simplicity using user.name which we set in mockBackend
        return `Bienvenido Director ${user?.name}`;
    };

    if (!church) return <div className="p-4">Cargando información...</div>;

    const isHome = location.pathname === '/director' || location.pathname === '/director/';

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Top Navigation / Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {!isHome && (
                                <button onClick={() => navigate('/director')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-[#3e8391]">{church.name}</h1>
                                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{district?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="font-bold text-gray-800 text-sm">{getWelcomeMessage()}</p>
                                <button onClick={() => { logout(); navigate('/login'); }} className="text-xs font-semibold text-red-500 hover:text-red-700">Cerrar Sesión</button>
                            </div>
                            <div className="h-10 w-10 bg-[#3e8391] text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>

                    {/* Config Toggle */}
                    <div className="mt-2 text-right">
                        <button
                            onClick={() => setIsConfigOpen(!isConfigOpen)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-gray-500 hover:text-[#3e8391] transition-colors"
                        >
                            <Settings size={14} />
                            <span>Configuración de GPs</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Config Section (Toggle) */}
            {isConfigOpen && (
                <div className="container mx-auto px-4 py-4">
                    <div className="card animate-fade-in border-l-4 border-primary">
                        <h3 className="text-lg font-bold mb-4">Editar Información de Grupos Pequeños</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Seleccionar GP</label>
                            <select
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                value={selectedGpId}
                                onChange={e => handleGpSelect(e.target.value)}
                            >
                                <option value="">Seleccione un GP...</option>
                                {gps.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedGpId && (
                            <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre del GP</label>
                                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={configForm.name} onChange={e => setConfigForm({ ...configForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lema</label>
                                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={configForm.motto} onChange={e => setConfigForm({ ...configForm, motto: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Versículo</label>
                                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                        value={configForm.verse} onChange={e => setConfigForm({ ...configForm, verse: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Día</label>
                                        <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            value={configForm.meetingDay} onChange={e => setConfigForm({ ...configForm, meetingDay: e.target.value })}>
                                            {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hora</label>
                                        <input type="time" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            value={configForm.meetingTime} onChange={e => setConfigForm({ ...configForm, meetingTime: e.target.value })} />
                                    </div>
                                </div>
                                <div className="md:col-span-2 text-right">
                                    <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <main className="container mx-auto px-4 py-6">
                <Outlet context={{ church }} />
            </main>
        </div>
    );
};

export default DirectorLayout;
