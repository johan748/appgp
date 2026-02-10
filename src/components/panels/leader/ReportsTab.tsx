import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, Student, BibleStudyLesson, MissionaryPair, User as AppUser } from '../../../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FileText, FileSpreadsheet } from 'lucide-react';

const ReportsTab: React.FC = () => {
    const context = useOutletContext<any>();
    const gp = context?.gp;
    const church = context?.church;
    const district = context?.district;

    const { backend } = useBackend();
    const [students, setStudents] = useState<Student[]>([]);
    const [lessons, setLessons] = useState<BibleStudyLesson[]>([]);
    const [allPairs, setAllPairs] = useState<MissionaryPair[]>([]);
    const [allGps, setAllGps] = useState<SmallGroup[]>([]);
    const [allChurches, setAllChurches] = useState<any[]>([]);
    const [pastorName, setPastorName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [studentsData, lessonsData, pairsData, gpsData, churchesData, usersData] = await Promise.all([
                    backend.getStudents(),
                    backend.getLessons(),
                    backend.getMissionaryPairs(),
                    backend.getGPs(),
                    backend.getChurches(),
                    backend.getUsers()
                ]);

                setAllPairs(pairsData);
                setAllGps(gpsData);
                setAllChurches(churchesData);

                // Find Pastor Name if district context
                if (district) {
                    const pastor = usersData.find(u => u.relatedEntityId === district.id && u.role === 'PASTOR');
                    setPastorName(pastor?.name || '');
                }

                let filteredStudents: Student[] = [];

                if (gp) {
                    const gpPairs = pairsData.filter(p => p.gpId === gp.id);
                    filteredStudents = studentsData.filter(s => gpPairs.some(p => p.id === s.missionaryPairId));
                } else if (church) {
                    const churchGpIds = gpsData.filter(g => g.churchId === church.id).map(g => g.id);
                    const churchPairs = pairsData.filter(p => churchGpIds.includes(p.gpId));
                    filteredStudents = studentsData.filter(s => churchPairs.some(p => p.id === s.missionaryPairId));
                } else if (district) {
                    const districtChurchIds = churchesData.filter(c => c.districtId === district.id).map(c => c.id);
                    const districtGpIds = gpsData.filter(g => districtChurchIds.includes(g.churchId)).map(g => g.id);
                    const districtPairs = pairsData.filter(p => districtGpIds.includes(p.gpId));
                    filteredStudents = studentsData.filter(s => districtPairs.some(p => p.id === s.missionaryPairId));
                }

                setStudents(filteredStudents);
                setLessons(lessonsData);
            } catch (error) {
                console.error("Error loading reports data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [gp, church, district, backend]);

    const getLessonDate = (studentId: string, lessonNum: number) => {
        const lesson = lessons.find(l => l.studentId === studentId && l.lessonNumber === lessonNum);
        if (!lesson || !lesson.completionDate) return null;

        try {
            const [year, month, day] = lesson.completionDate.split('-');
            return `${day}/${month}/${year.slice(-2)}`;
        } catch {
            return 'Invalid Date';
        }
    };

    const getStudentContext = (student: Student) => {
        const pair = allPairs.find(p => p.id === student.missionaryPairId);
        const targetGp = allGps.find(g => g.id === pair?.gpId);
        const targetChurch = allChurches.find(c => c.id === targetGp?.churchId);

        return {
            churchName: targetChurch?.name || 'Sin Iglesia',
            gpName: targetGp?.name || 'Sin GP',
            pairName: 'PM'
        };
    };

    const getProcessedData = () => {
        const processed = students.map(student => {
            const ctx = getStudentContext(student);
            return {
                ...student,
                ...ctx
            };
        });

        return processed.sort((a, b) => {
            if (a.churchName !== b.churchName) return a.churchName.localeCompare(b.churchName);
            if (a.gpName !== b.gpName) return a.gpName.localeCompare(b.gpName);
            return a.firstName.localeCompare(b.firstName);
        });
    };

    const lessonRange = Array.from({ length: 30 }, (_, i) => i + 1);

    const handleExportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a3'); // Landscape A3 for many columns
        const data = getProcessedData();

        doc.setFontSize(16);
        doc.text('Reporte General de Lecciones', 14, 15);
        doc.setFontSize(10);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

        let yPos = 22;

        if (church) {
            // Already have church context if needed, but requirements say District + Pastor for PDF/Excel. 
            // If church view, we might not show District/Pastor, or we show Church name.
            // Following requirements: "Debajo del nombre del distrito coloca el nombre del pastor..."
            // Assuming this is primarily for District view or general Context.
            // I'll stick to the logic used in Students:
        }

        if (district) {
            yPos += 6;
            doc.text(`Distrito: ${district.name}`, 14, yPos);
            yPos += 6;
            if (pastorName) {
                doc.text(`Pastor: ${pastorName}`, 14, yPos);
            }
        }

        const tableColumn = ["Estudiante", "Iglesia / GP", ...lessonRange.map(String)];

        const tableRows = data.map(item => {
            const row = [
                `${item.firstName} ${item.lastName}`,
                `${item.churchName} - ${item.gpName}`,
            ];
            lessonRange.forEach(num => {
                row.push(getLessonDate(item.id, num) || '');
            });
            return row;
        });

        autoTable(doc, {
            startY: yPos + 6,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 6, cellPadding: 1 }, // Tiny font for matrix
            headStyles: { fillColor: [62, 131, 145] },
            columnStyles: {
                0: { cellWidth: 40 }, // Name
                1: { cellWidth: 40 }, // Context
                // others auto
            }
        });

        doc.save('reporte_lecciones.pdf');
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);

        const headerRows = [
            ["Reporte General de Lecciones"],
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

        const data = getProcessedData();
        const exportData = data.map(item => {
            const row: any = {
                'Iglesia': item.churchName,
                'Grupo Pequeño': item.gpName,
                'Estudiante': `${item.firstName} ${item.lastName}`,
            };
            lessonRange.forEach(num => {
                row[`L${num}`] = getLessonDate(item.id, num) || '';
            });
            return row;
        });

        const startRow = headerRows.length + 1;
        XLSX.utils.sheet_add_json(ws, exportData, { origin: `A${startRow}` });

        XLSX.utils.book_append_sheet(wb, ws, "Matriz Lecciones");
        XLSX.writeFile(wb, "reporte_lecciones.xlsx");
    };

    if (loading) return <div>Cargando reportes...</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                <h3 className="text-lg font-bold text-gray-800">Reporte General de Lecciones</h3>

                <div className="flex gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 font-medium text-sm"
                        title="Exportar a PDF"
                    >
                        <FileText size={18} />
                        <span>PDF</span>
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100 font-medium text-sm"
                        title="Exportar a Excel"
                    >
                        <FileSpreadsheet size={18} />
                        <span>Excel</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-200 min-w-[200px]">
                                    Nombre y Apellido
                                </th>
                                {lessonRange.map(num => (
                                    <th key={num} scope="col" className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[50px] border-r border-gray-100">
                                        {num}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                                        <div>
                                            {student.firstName} {student.lastName}
                                            {(church || district) && (
                                                <div className="text-[10px] text-gray-400 font-normal uppercase mt-0.5">
                                                    {(() => {
                                                        const pair = allPairs.find(p => p.id === student.missionaryPairId);
                                                        const targetGp = allGps.find(g => g.id === pair?.gpId);
                                                        const targetChurch = allChurches.find(c => c.id === targetGp?.churchId);
                                                        return targetGp ? `${targetGp.name}${targetChurch ? ` | ${targetChurch.name}` : ''}` : '';
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    {lessonRange.map(num => (
                                        <td key={num} className="px-1 py-3 whitespace-nowrap text-[10px] text-center text-gray-500 border-r border-gray-50">
                                            {getLessonDate(student.id, num) || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={31} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No hay estudiantes registrados.
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

export default ReportsTab;
