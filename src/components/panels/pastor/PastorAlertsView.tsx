import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { District, SmallGroup, WeeklyReport, Church, Member } from '../../../types';
import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const PastorAlertsView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const { backend } = useBackend();
    const [alerts, setAlerts] = useState<{ gp: SmallGroup, type: 'critical' | 'warning' | 'success', message: string, church: string }[]>([]);

    useEffect(() => {
        const loadAlerts = async () => {
            if (district) {
                try {
                    // Fetch all data once
                    const [allChurches, allGPs, allReports, allMembers] = await Promise.all([
                        backend.getChurches(),
                        backend.getGPs(),
                        backend.getReports(),
                        backend.getMembers()
                    ]);

                    const districtChurches = allChurches.filter(c => c.districtId === district.id);
                    const newAlerts: typeof alerts = [];

                    districtChurches.forEach(church => {
                        const gps = allGPs.filter(g => g.churchId === church.id);

                        gps.forEach(gp => {
                            const gpReports = allReports.filter(r => r.gpId === gp.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                            // Check 1: No reports registered (Critical)
                            if (gpReports.length === 0) {
                                newAlerts.push({
                                    gp,
                                    type: 'critical',
                                    message: 'No se han registrado reportes.',
                                    church: church.name
                                });
                            } else {
                                const lastReport = gpReports[0];
                                const members = allMembers.filter(m => m.gpId === gp.id);
                                const attendanceCount = lastReport.attendance ? lastReport.attendance.filter(a => a.present).length : 0;

                                // Check 2: Low Attendance (Warning)
                                if (members.length > 0 && (attendanceCount / members.length) < 0.5) {
                                    newAlerts.push({
                                        gp,
                                        type: 'warning',
                                        message: `Baja asistencia (${attendanceCount}/${members.length}) en el último reporte.`,
                                        church: church.name
                                    });
                                }

                                // Check 3: High Attendance (Success)
                                if (members.length > 0 && (attendanceCount / members.length) >= 0.8) {
                                    newAlerts.push({
                                        gp,
                                        type: 'success',
                                        message: `¡Excelente asistencia! (${attendanceCount}/${members.length}) en el último reporte.`,
                                        church: church.name
                                    });
                                }

                                // Check 4: Good Bible Studies (Success)
                                if (lastReport.summary?.totalStudies && lastReport.summary.totalStudies >= 3) {
                                    newAlerts.push({
                                        gp,
                                        type: 'success',
                                        message: `¡Buen avance en estudios bíblicos! (${lastReport.summary.totalStudies} estudios)`,
                                        church: church.name
                                    });
                                }

                                // Check 5: Baptisms (Success)
                                if (lastReport.baptisms && lastReport.baptisms > 0) {
                                    newAlerts.push({
                                        gp,
                                        type: 'success',
                                        message: `¡Bautismos registrados! (${lastReport.baptisms} bautismos)`,
                                        church: church.name
                                    });
                                }

                                // Check 6: Regular Reporting (Success)
                                if (gpReports.length >= 4) {
                                    newAlerts.push({
                                        gp,
                                        type: 'success',
                                        message: `¡Reportes consistentes! (${gpReports.length} semanas seguidas)`,
                                        church: church.name
                                    });
                                }
                            }
                        });
                    });

                    setAlerts(newAlerts);
                } catch (e) {
                    console.error("Error loading alerts:", e);
                }
            }
        };
        loadAlerts();
    }, [district, backend]);

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical': return <AlertCircle size={24} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={24} className="text-yellow-600" />;
            case 'success': return <CheckCircle size={24} className="text-green-500" />;
            default: return <AlertCircle size={24} className="text-gray-500" />;
        }
    };

    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'critical': return 'bg-red-50 border-red-500';
            case 'warning': return 'bg-yellow-50 border-yellow-500';
            case 'success': return 'bg-green-50 border-green-500';
            default: return 'bg-gray-50 border-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Alertas del Distrito</h2>
                <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                    {district.name}
                </div>
            </div>

            <p className="text-gray-600">Monitoreo en tiempo real de la salud de tus Grupos Pequeños.</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Críticas</p>
                    <p className="text-2xl font-bold text-red-700">{alerts.filter(a => a.type === 'critical').length}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-1">Alertas</p>
                    <p className="text-2xl font-bold text-yellow-700">{alerts.filter(a => a.type === 'warning').length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Logros</p>
                    <p className="text-2xl font-bold text-green-700">{alerts.filter(a => a.type === 'success').length}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-bold text-blue-700">{alerts.length}</p>
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-l-4 shadow-sm flex items-start transition-all hover:translate-x-1 ${getAlertStyles(alert.type)}`}>
                        <div className="mr-3 mt-0.5">
                            {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-gray-900">{alert.gp.name}</h3>
                                <span className="text-[10px] font-black uppercase text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                                    {alert.church}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700">{alert.message}</p>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4 opacity-20" />
                        <p className="text-gray-500 font-medium italic">No hay alertas activas en el distrito.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastorAlertsView;
