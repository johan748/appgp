import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { District, Church, SmallGroup } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { Users, Heart, Home, Edit, Trash2, ChevronDown, ChevronUp, FileText, Table } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useAuth } from '../../../context/AuthContext';

interface GPStats {
    id: string;
    name: string;
    motto: string;
    verse: string;
    meetingDay: string;
    meetingTime: string;
    baptizedCount: number;
    unbaptizedCount: number;
    missionaryPairsCount: number;
}

const PastorChurchesView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const { user } = useAuth();
    const { backend } = useBackend();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [churches, setChurches] = useState<Church[]>([]);
    const [associationName, setAssociationName] = useState<string>('');
    // Map churchId -> List of GPs with detailed stats
    const [churchDetails, setChurchDetails] = useState<Record<string, GPStats[]>>({});
    // Map churchId -> Aggregate stats for the card view
    const [aggregateStats, setAggregateStats] = useState<Record<string, { gps: number, members: number, pairs: number }>>({});
    
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [expandedChurchId, setExpandedChurchId] = useState<string | null>(null);

    const toggleExpand = (churchId: string) => {
        setExpandedChurchId(prev => (prev === churchId ? null : churchId));
    };

    const handleDelete = async (churchId: string, churchName: string) => {
        const firstConfirm = window.confirm(`¿Estás seguro de que deseas eliminar la iglesia "${churchName}"?`);
        if (!firstConfirm) return;

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
        const loadData = async () => {
            if (district && user) {
                try {
                    // 1. Fetch Hierarchy for Headers (District -> Zone -> Association)
                    const zones = await backend.getZones();
                    const targetZone = zones.find(z => z.id === district.zoneId);
                    if (targetZone) {
                        const associations = await backend.getAssociations();
                        const targetAssoc = associations.find(a => a.id === targetZone.associationId);
                        if (targetAssoc) {
                            setAssociationName(targetAssoc.name);
                        }
                    }

                    // 2. Fetch Core Data
                    const allChurches = await backend.getChurches();
                    const districtChurches = allChurches.filter(c => c.districtId === district.id);
                    setChurches(districtChurches);

                    const allGPs = await backend.getGPs();
                    const allMembers = await backend.getMembers();
                    const allPairs = await backend.getMissionaryPairs();

                    // 3. Process Data
                    const details: Record<string, GPStats[]> = {};
                    const aggregates: Record<string, { gps: number, members: number, pairs: number }> = {};

                    districtChurches.forEach(church => {
                        const churchGps = allGPs.filter(g => g.churchId === church.id);
                        
                        const gpStatsList: GPStats[] = churchGps.map(gp => {
                            const gpMembers = allMembers.filter(m => m.gpId === gp.id);
                            const gpPairs = allPairs.filter(p => p.gpId === gp.id);
                            
                            return {
                                id: gp.id,
                                name: gp.name,
                                motto: gp.motto,
                                verse: gp.verse,
                                meetingDay: gp.meetingDay,
                                meetingTime: gp.meetingTime,
                                baptizedCount: gpMembers.filter(m => m.isBaptized).length,
                                unbaptizedCount: gpMembers.filter(m => !m.isBaptized).length,
                                missionaryPairsCount: gpPairs.length
                            };
                        });

                        details[church.id] = gpStatsList;

                        // Calculate aggregates for card
                        const totalMembers = gpStatsList.reduce((sum, gp) => sum + gp.baptizedCount + gp.unbaptizedCount, 0);
                        const totalPairs = gpStatsList.reduce((sum, gp) => sum + gp.missionaryPairsCount, 0);

                        aggregates[church.id] = {
                            gps: churchGps.length,
                            members: totalMembers,
                            pairs: totalPairs
                        };
                    });

                    setChurchDetails(details);
                    setAggregateStats(aggregates);

                } catch (error) {
                    console.error("Error loading data:", error);
                    showToast('Error al cargar datos', 'error');
                }
            }
        };
        loadData();
    }, [district, backend, user]);

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(16);
        doc.text(`Asociación: ${associationName}`, 14, 20);
        doc.text(`Distrito: ${district.name}`, 14, 30);
        doc.text(`Pastor: ${user?.name || ''}`, 14, 40);
        doc.setFontSize(12);
        doc.text('Reporte de Iglesias y Grupos Pequeños', 14, 50);

        let yPos = 60;

        churches.forEach(church => {
            const gps = churchDetails[church.id] || [];
            
            // Church Header
            doc.setFontSize(14);
            doc.setTextColor(62, 131, 145); // Teal
            doc.text(`Iglesia: ${church.name}`, 14, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 10;

            if (gps.length > 0) {
                const tableData = gps.map(gp => [
                    gp.name,
                    gp.motto,
                    `Day: ${gp.meetingDay} ${gp.meetingTime}`,
                    gp.baptizedCount,
                    gp.unbaptizedCount,
                    gp.missionaryPairsCount
                ]);

                autoTable(doc, {
                    startY: yPos,
                    head: [['Nombre GP', 'Lema', 'Reunión', 'Baut.', 'No Baut.', 'Parejas']],
                    body: tableData,
                    theme: 'striped',
                    headStyles: { fillColor: [62, 131, 145] },
                    margin: { left: 14 }
                });

                // Update yPos for next church based on table height
                yPos = (doc as any).lastAutoTable.finalY + 15;
            } else {
                doc.setFontSize(10);
                doc.text('(No hay GPs registrados)', 14, yPos);
                yPos += 15;
            }

            // Check page break
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
        });

        doc.save(`Iglesias_Distrito_${district.name}.pdf`);
    };

    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();
        const data: any[] = [];

        // Headers
        data.push(['Asociación:', associationName]);
        data.push(['Distrito:', district.name]);
        data.push(['Pastor:', user?.name]);
        data.push([]); // Spacer

        churches.forEach(church => {
            data.push(['Iglesia:', church.name]);
            data.push(['Dirección:', church.address]);
            data.push([
                'Nombre GP', 
                'Lema', 
                'Versículo', 
                'Día', 
                'Hora', 
                'Miembros Bautizados', 
                'Miembros No Bautizados', 
                'Parejas Misioneras'
            ]);

            const gps = churchDetails[church.id] || [];
            gps.forEach(gp => {
                data.push([
                    gp.name,
                    gp.motto,
                    gp.verse,
                    gp.meetingDay,
                    gp.meetingTime,
                    gp.baptizedCount,
                    gp.unbaptizedCount,
                    gp.missionaryPairsCount
                ]);
            });
            data.push([]); // Spacer
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Iglesias y GPs");
        XLSX.writeFile(wb, `Iglesias_Distrito_${district.name}.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Iglesias del Distrito</h2>
                <div className="flex space-x-2">
                    <button onClick={exportToPDF} className="btn btn-primary flex items-center bg-red-600 hover:bg-red-700">
                        <FileText size={18} className="mr-2" />
                        PDF
                    </button>
                    <button onClick={exportToExcel} className="btn btn-primary flex items-center bg-green-600 hover:bg-green-700">
                        <Table size={18} className="mr-2" />
                        Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {churches.map(church => (
                    <div key={church.id} className="bg-white rounded-lg shadow-md border-l-4 border-[#3e8391] hover:shadow-lg transition-all">
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="cursor-pointer flex-grow" onClick={() => toggleExpand(church.id)}>
                                    <div className="flex items-center">
                                        <h3 className="text-xl font-bold text-gray-900 mr-2">{church.name}</h3>
                                        {expandedChurchId === church.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1">Dirección: {church.address}</p>
                                </div>
                                
                                <div className="flex space-x-2 ml-4">
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

                            {/* Aggregate Stats */}
                            <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100" onClick={() => toggleExpand(church.id)}>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center text-[#3e8391] mb-1">
                                        <Home size={20} className="mr-1" />
                                        <span className="font-bold text-lg">{aggregateStats[church.id]?.gps || 0}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">GPs</span>
                                </div>
                                <div className="flex flex-col items-center border-l border-r border-gray-100">
                                    <div className="flex items-center text-orange-500 mb-1">
                                        <Users size={20} className="mr-1" />
                                        <span className="font-bold text-lg">{aggregateStats[church.id]?.members || 0}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Miembros</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center text-red-500 mb-1">
                                        <Heart size={20} className="mr-1" />
                                        <span className="font-bold text-lg">{aggregateStats[church.id]?.pairs || 0}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">Parejas</span>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content: GP List */}
                        {expandedChurchId === church.id && (
                            <div className="px-6 pb-6 animate-fade-in bg-gray-50 rounded-b-lg border-t border-gray-200">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider py-4">Grupos Pequeños</h4>
                                {churchDetails[church.id] && churchDetails[church.id].length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reunión</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Bautizados</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">No Baut.</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Parejas</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {churchDetails[church.id].map(gp => (
                                                    <tr key={gp.id}>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{gp.name}</div>
                                                            <div className="text-xs text-gray-500 italic">"{gp.motto}"</div>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                                                            {gp.meetingDay} {gp.meetingTime}
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap text-center">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                {gp.baptizedCount}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap text-center">
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                                {gp.unbaptizedCount}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                                                            {gp.missionaryPairsCount}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 text-sm py-4">No hay Grupos Pequeños registrados.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PastorChurchesView;
