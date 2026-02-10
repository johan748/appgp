import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, Student, BibleStudyLesson, Member, MissionaryPair } from '../../../types';
import { Search, Save, CheckCircle } from 'lucide-react';

const LessonReportingTab: React.FC = () => {
    // Context is optional now (might be null in public view)
    const context = useOutletContext<{ gp: SmallGroup } | null>();
    const gp = context?.gp;

    const { backend } = useBackend();

    // Search State
    const [searchCedula, setSearchCedula] = useState('');
    const [foundPair, setFoundPair] = useState<MissionaryPair | null>(null);
    const [foundStudents, setFoundStudents] = useState<Student[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    // Data State
    const [lessons, setLessons] = useState<BibleStudyLesson[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    // Form State
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const loadBaseData = async () => {
            // Load all members/lessons to support global search if needed
            // In a real backend, we wouldn't load ALL members, but for mock/prototype this is fine
            const allMembers = await backend.getMembers();
            setMembers(allMembers);

            const allLessons = await backend.getLessons();
            setLessons(allLessons);
        };
        loadBaseData();
    }, [backend]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchError('');
        setFoundPair(null);
        setFoundStudents([]);

        if (!searchCedula.trim()) return;

        try {
            // Find member by cedula (Global search)
            const member = members.find(m => m.cedula === searchCedula.trim());
            if (!member) {
                setSearchError('No se encontró ningún miembro con esa Cédula.');
                return;
            }

            // Find pair where this member is part of
            const allPairs = await backend.getMissionaryPairs();
            const pair = allPairs.find(p => p.member1Id === member.id || p.member2Id === member.id);

            if (!pair) {
                setSearchError(`${member.firstName} ${member.lastName} no pertenece a ninguna Pareja Misionera activa.`);
                return;
            }

            // If we are in Leader View (gp exists), verify the pair belongs to this GP
            if (gp && pair.gpId !== gp.id) {
                setSearchError(`Este miembro pertenece a una Pareja Misionera de otro GP.`);
                return;
            }

            setFoundPair(pair);

            // Find students for this pair
            const allStudents = await backend.getStudents(); // Need global student access
            const pairStudents = allStudents.filter(s => s.missionaryPairId === pair.id);
            setFoundStudents(pairStudents);

        } catch (error) {
            console.error(error);
            setSearchError('Error al buscar.');
        }
    };

    const isLessonCompleted = (studentId: string, lessonNum: number) => {
        return lessons.some(l => l.studentId === studentId && l.lessonNumber === lessonNum);
    };

    const getCompletionDate = (studentId: string, lessonNum: number) => {
        const lesson = lessons.find(l => l.studentId === studentId && l.lessonNumber === lessonNum);
        return lesson ? lesson.completionDate : null;
    };

    const toggleLesson = async (studentId: string, lessonNum: number) => {
        if (isLessonCompleted(studentId, lessonNum)) return;

        try {
            const newLesson: BibleStudyLesson = {
                studentId,
                lessonNumber: lessonNum,
                completionDate: reportDate
            };

            await backend.saveLesson(newLesson);

            // Update local state
            setLessons(prev => {
                const idx = prev.findIndex(l => l.studentId === studentId && l.lessonNumber === lessonNum);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = newLesson;
                    return updated;
                }
                return [...prev, newLesson];
            });

        } catch (error) {
            console.error(error);
            alert('Error al guardar la lección');
        }
    };

    const getPairName = () => {
        if (!foundPair) return '';
        const m1 = members.find(m => m.id === foundPair.member1Id);
        const m2 = members.find(m => m.id === foundPair.member2Id);
        return `PM ${m1?.firstName || '?'} y ${m2?.firstName || '?'}`;
    };

    const lessonRange = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow w-full">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Cédula del Instructor</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchCedula}
                                onChange={e => setSearchCedula(e.target.value)}
                                placeholder="Ingrese C.I."
                                className="block w-full rounded-lg border-gray-300 pl-10 h-10 shadow-sm focus:border-[#3e8391] focus:ring-[#3e8391]"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Fecha del Reporte</label>
                        <input
                            type="date"
                            value={reportDate}
                            onChange={e => setReportDate(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 h-10 shadow-sm min-w-[150px]"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary h-10 flex items-center w-full md:w-auto justify-center">
                        <Search size={18} className="mr-2" />
                        Buscar
                    </button>
                </form>
                {searchError && <p className="text-red-500 text-sm mt-3 font-medium flex items-center"><span className="mr-2">⚠️</span>{searchError}</p>}
            </div>

            {foundPair && (
                <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-[#3e8391]">{getPairName()}</h3>
                        <span className="text-sm text-gray-500">{foundStudents.length} Estudiantes encontrados</span>
                    </div>

                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r min-w-[200px]">Estudiante</th>
                                    {lessonRange.map(num => (
                                        <th key={num} className="px-2 py-3 text-center text-xs font-medium text-gray-500 min-w-[40px] border-r border-gray-100">{num}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {foundStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-800 sticky left-0 bg-white z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            {student.firstName} {student.lastName}
                                        </td>
                                        {lessonRange.map(num => {
                                            const completed = isLessonCompleted(student.id, num);
                                            const date = getCompletionDate(student.id, num);
                                            let shortDate = '';
                                            if (date) {
                                                const [year, month, day] = date.split('-');
                                                shortDate = `${day}/${month}`;
                                            }

                                            return (
                                                <td key={num} className="px-1 py-3 whitespace-nowrap text-center border-r border-gray-50">
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <input
                                                            type="checkbox"
                                                            checked={completed}
                                                            onChange={() => toggleLesson(student.id, num)}
                                                            disabled={completed}
                                                            className={`h-4 w-4 rounded border-gray-300 text-[#3e8391] focus:ring-[#3e8391] mb-1 ${completed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                        />
                                                        {completed && (
                                                            <span className="text-[9px] text-gray-400 font-mono leading-none block">{shortDate}</span>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {foundStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={31} className="px-6 py-10 text-center text-gray-500 italic">
                                            Esta pareja misionera no tiene estudiantes registrados aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonReportingTab;
