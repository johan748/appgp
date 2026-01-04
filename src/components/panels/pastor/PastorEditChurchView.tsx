import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { useBackend } from '../../../context/BackendContext';
import { District, Church } from '../../../types';
import { Save } from 'lucide-react';

const PastorEditChurchView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { backend } = useBackend();
    const [churches, setChurches] = useState<Church[]>([]);
    const [selectedChurchId, setSelectedChurchId] = useState('');
    const [formData, setFormData] = useState<Church | null>(null);

    useEffect(() => {
        const loadChurches = async () => {
            if (district) {
                try {
                    const allChurches = await backend.getChurches();
                    setChurches(allChurches.filter(c => c.districtId === district.id));
                } catch (e) { console.error(e); }
            }
        };
        loadChurches();
    }, [district, backend]);

    const handleSelect = (id: string) => {
        setSelectedChurchId(id);
        const church = churches.find(c => c.id === id);
        if (church) {
            setFormData({ ...church });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            try {
                await backend.updateChurch(formData);
                showToast('Iglesia actualizada exitosamente', 'success');
                navigate('/pastor/churches');
            } catch (error) {
                console.error("Error updating church:", error);
                showToast('Error al actualizar iglesia', 'error');
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Iglesia</h2>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Seleccionar Iglesia</label>
                <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    value={selectedChurchId}
                    onChange={e => handleSelect(e.target.value)}
                >
                    <option value="">Seleccione una Iglesia...</option>
                    {churches.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {formData && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Iglesia</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dirección</label>
                        <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="btn btn-primary">
                            <Save className="mr-2" size={18} />
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PastorEditChurchView;
