import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { SmallGroup, Member, MissionaryPair } from '../../../types';
import { Plus, Trash2, Users } from 'lucide-react';

const MissionaryPairsView: React.FC = () => {
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const [pairs, setPairs] = useState<MissionaryPair[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedMember1, setSelectedMember1] = useState('');
    const [selectedMember2, setSelectedMember2] = useState('');

    useEffect(() => {
        if (gp) {
            // Load members first
            const gpMembers = mockBackend.getMembersByGP(gp.id);
            setMembers(gpMembers);

            // Then load pairs
            const gpPairs = mockBackend.getMissionaryPairs().filter(p => p.gpId === gp.id);
            setPairs(gpPairs);
        }
    }, [gp]);

    const handleDeletePair = (pairId: string) => {
        if (confirm('¿Estás seguro de eliminar esta pareja misionera?')) {
            const allPairs = mockBackend.getMissionaryPairs();
            const filtered = allPairs.filter(p => p.id !== pairId);
            localStorage.setItem('app_pairs', JSON.stringify(filtered));
            setPairs(pairs.filter(p => p.id !== pairId));
        }
    };

    const handleCreatePair = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMember1 && selectedMember2 && selectedMember1 !== selectedMember2) {
            const newPair: MissionaryPair = {
                id: Math.random().toString(36).substr(2, 9),
                gpId: gp.id,
                member1Id: selectedMember1,
                member2Id: selectedMember2,
                studiesGiven: 0,
                createdAt: new Date().toISOString()
            };

            const currentPairs = mockBackend.getMissionaryPairs();
            currentPairs.push(newPair);
            localStorage.setItem('app_pairs', JSON.stringify(currentPairs));

            setPairs([...pairs, newPair]);
            setIsCreating(false);
            setSelectedMember1('');
            setSelectedMember2('');
        }
    };

    const getMemberName = (id: string) => {
        const m = members.find(mem => mem.id === id);
        return m ? `${m.firstName} ${m.lastName}` : 'Desconocido';
    };

    const getStudiesGiven = (pairId: string) => {
        const reports = mockBackend.getReports().filter(r => r.gpId === gp.id);
        return reports.reduce((total, report) => {
            const pairStat = report.missionaryPairsStats.find((stat: { pairId: string; studiesGiven: number }) => stat.pairId === pairId);
            return total + (pairStat ? pairStat.studiesGiven : 0);
        }, 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Parejas Misioneras</h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="btn btn-primary space-x-2"
                >
                    <Plus size={20} />
                    <span>Nueva Pareja</span>
                </button>
            </div>

            {isCreating && (
                <div className="card animate-fade-in border-l-4 border-green-500">
                    <h3 className="font-bold mb-4">Crear Nueva Pareja</h3>
                    <form onSubmit={handleCreatePair} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Miembro 1</label>
                                <select
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={selectedMember1}
                                    onChange={e => setSelectedMember1(e.target.value)}
                                >
                                    <option value="">Seleccionar...</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Miembro 2</label>
                                <select
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    value={selectedMember2}
                                    onChange={e => setSelectedMember2(e.target.value)}
                                >
                                    <option value="">Seleccionar...</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id} disabled={m.id === selectedMember1}>
                                            {m.firstName} {m.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setIsCreating(false)} className="btn bg-gray-200 text-gray-800">Cancelar</button>
                            <button type="submit" className="btn btn-primary">Crear Pareja</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pairs.map(pair => (
                    <div key={pair.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-3 rounded-full text-primary">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{getMemberName(pair.member1Id)}</p>
                                    <p className="font-bold text-gray-800">{getMemberName(pair.member2Id)}</p>
                                    <p className="text-sm text-gray-500 mt-1">Estudios dados: {getStudiesGiven(pair.id)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeletePair(pair.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Eliminar pareja"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {pairs.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No hay parejas misioneras registradas.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MissionaryPairsView;
