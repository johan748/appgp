import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, Member } from '../../../types';
import { Check } from 'lucide-react';

const LeadershipView: React.FC = () => {
    const { gp } = useOutletContext<{ gp: SmallGroup }>();
    const { backend } = useBackend();
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        const loadMembers = async () => {
            if (gp) {
                try {
                    // Filter baptized members
                    const allMembers = await backend.getMembersByGP(gp.id);
                    setMembers(allMembers.filter(m => m.isBaptized));
                } catch (error) { console.error(error) }
            }
        };
        loadMembers();
    }, [gp, backend]);

    const handleProgressChange = async (memberId: string, field: keyof NonNullable<Member['leadershipProgress']>, checked: boolean) => {
        const memberToUpdate = members.find(m => m.id === memberId);
        if (memberToUpdate) {
            const newProgress = { ...memberToUpdate.leadershipProgress };
            if (checked) {
                newProgress[field] = new Date().toISOString().split('T')[0];
            } else {
                delete newProgress[field];
            }
            const updatedMember = { ...memberToUpdate, leadershipProgress: newProgress };

            try {
                await backend.updateMember(updatedMember);
                setMembers(members.map(m => m.id === memberId ? updatedMember : m));
            } catch (error) {
                console.error("Error updating leadership progress:", error);
            }
        }
    };

    const handleDateChange = async (memberId: string, field: keyof NonNullable<Member['leadershipProgress']>, date: string) => {
        const memberToUpdate = members.find(m => m.id === memberId);
        if (memberToUpdate) {
            const newProgress = { ...memberToUpdate.leadershipProgress, [field]: date };
            const updatedMember = { ...memberToUpdate, leadershipProgress: newProgress };

            try {
                await backend.updateMember(updatedMember);
                setMembers(members.map(m => m.id === memberId ? updatedMember : m));
            } catch (error) {
                console.error("Error updating leadership date:", error);
            }
        }
    };

    const steps = [
        { key: 'member', label: 'Miembro' }, // Base state, always true for this list
        { key: 'liderEnFormacionDate', label: 'Líder en Formación' },
        { key: 'secretarioDate', label: 'Secretario' },
        { key: 'liderGpDate', label: 'Líder GP' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Desarrollo de Liderazgo</h2>

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
                            {members.map(member => (
                                <tr key={member.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                                        <div className="text-xs text-gray-500">{member.cedula}</div>
                                    </td>

                                    {/* Member Column (Always Checked) */}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                                    </td>

                                    {/* Dynamic Columns */}
                                    {steps.slice(1).map(step => {
                                        const date = member.leadershipProgress?.[step.key as keyof typeof member.leadershipProgress];
                                        return (
                                            <td key={step.key} className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex flex-col items-center space-y-1">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 rounded"
                                                        checked={!!date}
                                                        onChange={e => handleProgressChange(member.id, step.key as any, e.target.checked)}
                                                    />
                                                    {date && (
                                                        <input
                                                            type="date"
                                                            className="text-xs border rounded p-1 w-24"
                                                            value={date}
                                                            onChange={e => handleDateChange(member.id, step.key as any, e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeadershipView;
