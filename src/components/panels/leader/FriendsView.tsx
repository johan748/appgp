import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, Member } from '../../../types';
import { Check } from 'lucide-react';

const FriendsView: React.FC = () => {
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const { backend } = useBackend();
    const [friends, setFriends] = useState<Member[]>([]);
    const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

    useEffect(() => {
        const loadFriends = async () => {
            if (gp) {
                try {
                    // Filter non-baptized members
                    const allMembers = await backend.getMembersByGP(gp.id);
                    setFriends(allMembers.filter(m => !m.isBaptized));
                } catch (error) {
                    console.error("Error loading friends:", error);
                }
            }
        };
        loadFriends();
    }, [gp, backend]);

    const handleProgressChange = async (memberId: string, field: keyof NonNullable<Member['friendProgress']>, checked: boolean) => {
        const friendToUpdate = friends.find(m => m.id === memberId);
        if (friendToUpdate) {
            const newProgress = { ...friendToUpdate.friendProgress };
            if (checked) {
                newProgress[field] = new Date().toISOString().split('T')[0];
            } else {
                delete newProgress[field];
            }
            const updatedMember = { ...friendToUpdate, friendProgress: newProgress };

            try {
                await backend.updateMember(updatedMember);
                // Optimistic update
                setFriends(friends.map(m => m.id === memberId ? updatedMember : m));
            } catch (error) {
                console.error("Error updating friend progress:", error);
            }
        }
    };

    const handleDateChange = async (memberId: string, field: keyof NonNullable<Member['friendProgress']>, date: string) => {
        const friendToUpdate = friends.find(m => m.id === memberId);
        if (friendToUpdate) {
            const newProgress = { ...friendToUpdate.friendProgress, [field]: date };
            const updatedMember = { ...friendToUpdate, friendProgress: newProgress };

            try {
                await backend.updateMember(updatedMember);
                setFriends(friends.map(m => m.id === memberId ? updatedMember : m));
            } catch (error) {
                console.error("Error updating friend date:", error);
            }
        }
    };

    const steps = [
        { key: 'invitedDate', label: 'Invitado' },
        { key: 'regularAttenderDate', label: 'Asistente Regular' },
        { key: 'studentDate', label: 'Estudiante' },
        { key: 'baptizedDate', label: 'Bautizado' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex space-x-4 border-b border-gray-200">
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'view' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('view')}
                >
                    Amigos GP
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'edit' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('edit')}
                >
                    Editar Amigos
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                {steps.map(step => (
                                    <th key={step.key} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {step.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {friends.map(friend => (
                                <tr key={friend.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{friend.firstName} {friend.lastName}</div>
                                        <div className="text-xs text-gray-500">{friend.cedula}</div>
                                    </td>
                                    {steps.map(step => {
                                        const date = friend.friendProgress?.[step.key as keyof typeof friend.friendProgress];
                                        return (
                                            <td key={step.key} className="px-6 py-4 whitespace-nowrap text-center">
                                                {activeTab === 'view' ? (
                                                    date ? (
                                                        <div className="flex flex-col items-center">
                                                            <Check className="h-5 w-5 text-green-500" />
                                                            <span className="text-xs text-gray-500">{date}</span>
                                                        </div>
                                                    ) : <span className="text-gray-300">-</span>
                                                ) : (
                                                    <div className="flex flex-col items-center space-y-1">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 text-blue-600 rounded"
                                                            checked={!!date}
                                                            onChange={e => handleProgressChange(friend.id, step.key as any, e.target.checked)}
                                                        />
                                                        {date && (
                                                            <input
                                                                type="date"
                                                                className="text-xs border rounded p-1 w-24"
                                                                value={date}
                                                                onChange={e => handleDateChange(friend.id, step.key as any, e.target.value)}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {friends.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        No hay amigos registrados en este GP.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FriendsView;
