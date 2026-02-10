import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, Student, MissionaryPair, Member, BibleStudyLesson, User as AppUser } from '../../../types';
import { User, Phone, MapPin, Calendar, Mail, BookOpen, FileText, FileSpreadsheet, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const StudentsListTab: React.FC = () => {
    const context = useOutletContext<any>();
    const gp = context?.gp;
    const church = context?.church;
    const district = context?.district;

    const { backend } = useBackend();
    const [students, setStudents] = useState<Student[]>([]);
    const [pairs, setPairs] = useState<MissionaryPair[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [gps, setGps] = useState<SmallGroup[]>([]);
    const [churches, setChurches] = useState<any[]>([]);
    const [lessons, setLessons] = useState<BibleStudyLesson[]>([]);
    const [pastorName, setPastorName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setError('');
                setLoading(true);

                const [allStudents, allPairs, allMembers, allGps, allChurches, allLessons, allUsers] = await Promise.all([
                    backend.getStudents(),
                    backend.getMissionaryPairs(),
                    backend.getMembers(),
                    backend.getGPs(),
                    backend.getChurches(),
                    backend.getLessons(),
                    backend.getUsers()
                ]);

                setGps(allGps);
                setChurches(allChurches);
                setLessons(allLessons);

                // Find Pastor Name if district context
                if (district) {
                    const pastor = allUsers.find(u => u.relatedEntityId === district.id && u.role === 'PASTOR');
                    setPastorName(pastor?.name || '');
                }

                let filteredPairs: MissionaryPair[] = [];
                let filteredStudents: Student[] = [];
                let filteredMembers: Member[] = [];

                if (gp) {
                    filteredPairs = allPairs.filter(p => p.gpId === gp.id);
                    filteredStudents = allStudents.filter(s => filteredPairs.some(p => p.id === s.missionaryPairId));
                    filteredMembers = allMembers.filter(m => m.gpId === gp.id);
                } else if (church) {
                    const churchGpIds = allGps.filter(g => g.churchId === church.id).map(g => g.id);
                    filteredPairs = allPairs.filter(p => churchGpIds.includes(p.gpId));
                    filteredStudents = allStudents.filter(s => filteredPairs.some(p => p.id === s.missionaryPairId));
                    filteredMembers = allMembers.filter(m => churchGpIds.includes(m.gpId));
                } else if (district) {
                    const districtChurchIds = allChurches.filter(c => c.districtId === district.id).map(c => c.id);
                    const districtGpIds = allGps.filter(g => districtChurchIds.includes(g.churchId)).map(g => g.id);
                    filteredPairs = allPairs.filter(p => districtGpIds.includes(p.gpId));
                    filteredStudents = allStudents.filter(s => filteredPairs.some(p => p.id === s.missionaryPairId));
                    filteredMembers = allMembers.filter(m => districtGpIds.includes(m.gpId));
                } else {
                    setError('No se pudo identificar el contexto de visualización');
                    setLoading(false);
                    return;
                }

                setStudents(filteredStudents);
                setPairs(filteredPairs);
                setMembers(filteredMembers);
            } catch (err: any) {
                console.error('Error loading students:', err);
                setError(err.message || 'Error al cargar los estudiantes');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [gp, church, district, backend]);

    const getPairName = (pairId: string) => {
        const pair = pairs.find(p => p.id === pairId);
        if (!pair) return 'Pareja Desconocida';
        const m1 = members.find(m => m.id === pair.member1Id);
        const m2 = members.find(m => m.id === pair.member2Id);
        return `PM ${m1?.firstName || '?'} y ${m2?.firstName || '?'}`;
    };

    const getGpInfo = (pair: MissionaryPair) => {
        const targetGp = gps.find(g => g.id === pair.gpId);
        if (!targetGp) return '';

        const targetChurch = churches.find(c => c.id === targetGp.churchId);
        return `${targetGp.name}${targetChurch ? ` - ${targetChurch.name}` : ''}`;
    };

    const getStudentProgress = (student: Student) => {
        const studentLessons = lessons.filter(l => l.studentId === student.id);
        const completedCount = studentLessons.length;
        const total = student.totalLessons || 30; // Default to 30 if not set
        const percentage = Math.round((completedCount / total) * 100);
        return { completedCount, total, percentage };
    };

    // Export Functions
    const getProcessedData = () => {
        const processed = students.map(student => {
            const pair = pairs.find(p => p.id === student.missionaryPairId);
            const member1 = members.find(m => m.id === pair?.member1Id);
            const member2 = members.find(m => m.id === pair?.member2Id);
            const pairName = pair ? `PM ${member1?.firstName || '?'} y ${member2?.firstName || '?'}` : 'Sin Pareja';

            const gpItem = gps.find(g => g.id === pair?.gpId);
            const churchItem = churches.find(c => c.id === gpItem?.churchId);

            const progressInfo = getStudentProgress(student);

            return {
                ...student,
                pairName,
                gpName: gpItem?.name || 'Sin GP',
                churchName: churchItem?.name || 'Sin Iglesia',
                progressText: `${progressInfo.percentage}% (${progressInfo.completedCount}/${progressInfo.total})`,
                progressVal: progressInfo.percentage
            };
        });

        const filtered = searchTerm ? processed.filter(s =>
            s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.cedula.includes(searchTerm)
        ) : processed;

        return filtered.sort((a, b) => {
            if (a.churchName !== b.churchName) return a.churchName.localeCompare(b.churchName);
            if (a.gpName !== b.gpName) return a.gpName.localeCompare(b.gpName);
            if (a.pairName !== b.pairName) return a.pairName.localeCompare(b.pairName);
            return a.firstName.localeCompare(b.firstName);
        });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const data = getProcessedData();

        doc.setFontSize(16);
        doc.text('Lista de Estudiantes - Estudios Bíblicos', 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

        let yPos = 28;
        if (church) {
            doc.text(`Iglesia: ${church.name}`, 14, yPos);
            yPos += 6;
        } else if (district) {
            doc.text(`Distrito: ${district.name}`, 14, yPos);
            yPos += 6;
            if (pastorName) {
                doc.text(`Pastor: ${pastorName}`, 14, yPos);
                yPos += 6;
            }
        }

        const tableColumn = ["Iglesia", "GP", "PM", "Estudiante", "Cédula", "Teléfono", "Progreso"];
        const tableRows = data.map(item => [
            item.churchName,
            item.gpName,
            item.pairName,
            `${item.firstName} ${item.lastName}`,
            item.cedula,
            item.phone,
            item.progressText
        ]);

        autoTable(doc, {
            startY: yPos + 2,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [62, 131, 145] },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 20 },
                2: { cellWidth: 35 },
                3: { cellWidth: 35 },
            }
        });

        doc.save('estudiantes_appgp.pdf');
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);

        const headerRows = [
            ["Lista de Estudiantes - Estudios Bíblicos"],
            [`Fecha: ${new Date().toLocaleDateString()}`],
        ];

        if (district) {
            headerRows.push([`Distrito: ${district.name}`]);
            if (pastorName) {
                headerRows.push([`Pastor: ${pastorName}`]);
            }
        } else if (church) {
            headerRows.push([`Iglesia: ${church.name}`]);
        }

        headerRows.push([]); // Spacer

        XLSX.utils.sheet_add_aoa(ws, headerRows, { origin: "A1" });

        const data = getProcessedData().map(item => ({
            'Iglesia': item.churchName,
            'Grupo Pequeño': item.gpName,
            'Pareja Misionera': item.pairName,
            'Nombre': item.firstName,
            'Apellido': item.lastName,
            'Cédula': item.cedula,
            'Teléfono': item.phone,
            'Dirección': item.address,
            'Curso': item.courseName,
            'Progreso': item.progressText,
            'Estado': item.status
        }));

        const startRow = headerRows.length + 1;
        XLSX.utils.sheet_add_json(ws, data, { origin: `A${startRow}` });

        XLSX.utils.book_append_sheet(wb, ws, "Estudiantes");
        XLSX.writeFile(wb, "estudiantes_appgp.xlsx");
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando estudiantes...</div>;

    if (error) return (
        <div className="p-8 text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 inline-block">
                <p className="text-red-800 font-bold">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        </div>
    );

    const displayStudents = searchTerm
        ? students.filter(s =>
            s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.cedula.includes(searchTerm)
        )
        : students;

    const studentsByPair: Record<string, Student[]> = {};
    const relevantPairs = searchTerm
        ? pairs.filter(p => displayStudents.some(s => s.missionaryPairId === p.id))
        : pairs;

    relevantPairs.forEach(p => {
        studentsByPair[p.id] = displayStudents.filter(s => s.missionaryPairId === p.id);
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar estudiante..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3e8391] focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={handleExportPDF}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors border border-red-100 font-bold text-sm shadow-sm"
                        title="Exportar a PDF"
                    >
                        <FileText size={18} />
                        <span>PDF</span>
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-100 font-bold text-sm shadow-sm"
                        title="Exportar a Excel"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Excel</span>
                    </button>
                </div>
            </div>

            {relevantPairs.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No se encontraron estudiantes.</p>
                </div>
            ) : (
                relevantPairs.map(pair => (
                    <div key={pair.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <div className="bg-[#3e8391]/5 px-6 py-4 border-b border-[#3e8391]/20 flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <h3 className="font-bold text-[#3e8391] text-lg flex items-center">
                                    <User className="mr-2" />
                                    {getPairName(pair.id)}
                                </h3>
                                {(church || district) && (
                                    <p className="text-xs text-gray-500 font-medium mt-1">
                                        {getGpInfo(pair)}
                                    </p>
                                )}
                            </div>
                            <span className="bg-white text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                                {studentsByPair[pair.id]?.length || 0} Estudiantes
                            </span>
                        </div>

                        <div className="p-4 bg-gray-50/50">
                            {studentsByPair[pair.id]?.length > 0 ? (
                                <div className="flex flex-nowrap overflow-x-auto gap-4 pb-4 px-2 scroll-smooth" style={{ display: 'flex', flexWrap: 'nowrap' }}>
                                    {studentsByPair[pair.id].map(student => {
                                        const progress = getStudentProgress(student);
                                        return (
                                            <div key={student.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all w-[350px] min-w-[350px] flex-shrink-0">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 bg-[#3e8391]/10 rounded-full flex items-center justify-center text-[#3e8391] mr-3">
                                                            <User size={20} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{student.firstName} {student.lastName}</h4>
                                                            <div className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                                                                <BookOpen size={10} />
                                                                {student.courseName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-tighter ${student.status === 'ESTUDIANDO' ? 'bg-blue-100 text-blue-800' :
                                                        student.status === 'BAUTIZADO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {student.status}
                                                    </span>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-semibold text-gray-700">Progreso</span>
                                                        <span className="text-[#3e8391] font-bold">{progress.percentage}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#3e8391] transition-all duration-500 rounded-full"
                                                            style={{ width: `${progress.percentage}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 text-right mt-1">
                                                        {progress.completedCount} de {progress.total} lecciones
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        <span className="font-mono text-xs font-bold">C.I: {student.cedula}</span>
                                                        <span className="text-gray-300">|</span>
                                                        <span className="text-xs whitespace-nowrap">Nac: {student.birthDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <Phone size={14} className="text-gray-400" />
                                                        <span className="whitespace-nowrap">{student.phone}</span>
                                                    </div>
                                                    {student.email && (
                                                        <div className="flex items-center gap-1.5 max-w-[150px]">
                                                            <Mail size={14} className="text-gray-400" />
                                                            <span className="truncate text-xs">{student.email}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5 border-l border-gray-100 pl-3">
                                                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="text-xs truncate max-w-[200px]">{student.address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic text-center py-8">No hay estudiantes asignados a esta pareja.</p>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default StudentsListTab;
