import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { District, Church } from '../../../types';
import { Save } from 'lucide-react';

const PastorEditChurchView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const navigate = useNavigate();
    const [churches, setChurches] = useState<Church[]>([]);
    const [selectedChurchId, setSelectedChurchId] = useState('');
    const [formData, setFormData] = useState<Church | null>(null);

    useEffect(() => {
        if (district) {
            setChurches(mockBackend.getChurches().filter(c => c.districtId === district.id));
        }
    }, [district]);

    const handleSelect = (id: string) => {
        setSelectedChurchId(id);
        const church = churches.find(c => c.id === id);
        if (church) {
            setFormData({ ...church });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            // Update in backend (mock)
            const allChurches = mockBackend.getChurches();
            const index = allChurches.findIndex(c => c.id === formData.id);
            if (index !== -1) {
                allChurches[index] = formData;
                localStorage.setItem('app_churches', JSON.stringify(allChurches));
                alert('Iglesia actualizada exitosamente');
                navigate('/pastor/churches');
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
