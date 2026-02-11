import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { District, Church } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { Users, Heart, Home, Edit, Trash2 } from 'lucide-react';

const PastorChurchesView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const { backend } = useBackend();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [churches, setChurches] = useState<Church[]>([]);
    const [stats, setStats] = useState<Record<string, { gps: number, members: number, pairs: number }>>({});
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (churchId: string, churchName: string) => {
        // First confirmation
        const firstConfirm = window.confirm(`¿Estás seguro de que deseas eliminar la iglesia "${churchName}"?`);
        if (!firstConfirm) return;

        // Second confirmation
        const secondConfirm = window.confirm(`¡ADVERTENCIA! Esta acción es irreversible. Se perderá toda la información asociada a esta iglesia. ¿Realmente deseas proceder con la eliminación?`);
        if (!secondConfirm) return;

        try {
            setIsDeleting(churchId);
            await backend.deleteChurch(churchId);
            setChurches(prev => prev.filter(c => c.id !== churchId));
            showToast('Iglesia eliminada exitosamente', 'success');
        } catch (error) {
            console.error("Error deleting church:", error);
            showToast('Error al eliminar la iglesia', 'error');
        } finally {
            setIsDeleting(null);
        }
    };

    useEffect(() => {
        const loadChurchesData = async () => {
            if (district) {
                try {
                    const allChurches = await backend.getChurches();
                    const districtChurches = allChurches.filter(c => c.districtId === district.id);
                    setChurches(districtChurches);

                    const newStats: any = {};

                    const allGPs = await backend.getGPs();
                    const allMembers = await backend.getMembers();
                    const allPairs = await backend.getMissionaryPairs();

                    districtChurches.forEach(church => {
                        const gps = allGPs.filter(g => g.churchId === church.id);
                        const members = allMembers.filter(m => gps.some(g => g.id === m.gpId));
                        const pairs = allPairs.filter(p => gps.some(g => g.id === p.gpId));

                        newStats[church.id] = {
                            gps: gps.length,
                            members: members.length,
                            pairs: pairs.length
                        };
                    });
                    setStats(newStats);
                } catch (error) {
                    console.error("Error loading churches data:", error);
                }
            }
        };
        loadChurchesData();
    }, [district, backend]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Iglesias del Distrito</h2>

            <div className="grid grid-cols-1 gap-6">
                {churches.map(church => (
                    <div key={church.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{church.name}</h3>
                                <p className="text-gray-600 text-sm mt-1">Dirección: {church.address}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => navigate(`/pastor/edit-church/${church.id}`)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="Editar Iglesia"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(church.id, church.name)}
                                    disabled={isDeleting === church.id}
                                    className={`p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ${isDeleting === church.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Borrar Iglesia"
                                >
                                    {isDeleting === church.id ? (
                                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Trash2 size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-blue-600 mb-1">
                                    <Home size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[church.id]?.gps || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Grupos Pequeños</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-r border-gray-100">
                                <div className="flex items-center text-orange-500 mb-1">
                                    <Users size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[church.id]?.members || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Miembros</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="flex items-center text-red-500 mb-1">
                                    <Heart size={20} className="mr-1" />
                                    <span className="font-bold text-lg">{stats[church.id]?.pairs || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500">Parejas Mis.</span>
                            </div>
                        </div>
                    </div>
                ))}

                {churches.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No hay Iglesias registradas en este distrito.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastorChurchesView;
