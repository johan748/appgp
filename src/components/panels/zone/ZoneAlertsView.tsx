import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { Zone, District, SmallGroup, WeeklyReport } from '../../../types';
import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const ZoneAlertsView: React.FC = () => {
    const { zone } = useOutletContext<{ zone: Zone }>();
    const { backend } = useBackend();
    const [alerts, setAlerts] = useState<{ gp: SmallGroup, type: 'critical' | 'warning' | 'success', message: string, district: string }[]>([]);

    useEffect(() => {
        const loadAlerts = async () => {
            if (zone) {
                try {
                    // Get all districts in this zone
                    const allDistricts = await backend.getDistricts();
                    const zoneDistricts = allDistricts.filter(d => d.zoneId === zone.id);

                    // Fetch all data once
                    const [allChurches, allGPs, allReports, allMembers] = await Promise.all([
                        backend.getChurches(),
                        backend.getGPs(),
                        backend.getReports(),
                        backend.getMembers()
                    ]);

                    const newAlerts: typeof alerts = [];

                    zoneDistricts.forEach(district => {
                        const churches = allChurches.filter(c => c.districtId === district.id);
                        const gps = allGPs.filter(g => churches.some(c => c.id === g.churchId));

                        gps.forEach(gp => {
                            const gpReports = allReports.filter(r => r.gpId === gp.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                            // Check 1: No reports registered (Critical)
                            if (gpReports.length === 0) {
                                newAlerts.push({
                                    gp,
                                    type: 'critical',
                                    message: 'No se han registrado reportes.',
                                    district: district.name
                                });
                            } else {
                                const lastReport = gpReports[0];
                                const members = allMembers.filter(m => m.gpId === gp.id);
                                const attendanceCount = lastReport.attendance.filter(a => a.present).length;

                                // Check 2: Low Attendance (Warning)
                                if (members.length > 0 && (attendanceCount / members.length) < 0.5) {
                                    newAlerts.push({
                                        gp,
                                        type: 'warning',
                                        message: `Baja asistencia (${attendanceCount}/${members.length}) en el último reporte.`,
                                        district: district.name
                                    });
                                }

                                // Check 3: High Attendance (Success)
                                if (members.length > 0 && (attendanceCount / members.length) >= 0.8) {
                                    newAlerts.push({
                                        gp,
                                        type: 'success',
                                        message: `¡Excelente asistencia! (${attendanceCount}/${members.length}) en el último reporte.`,
                                        district: district.name
                                    });
                                }

                                // Check 4: Good Bible Studies (Success)
                                if (lastReport.summary?.totalStudies && lastReport.summary.totalStudies >= 5) {
                                    newAlerts.push({
                                        gp,
                                        type: 'success',
                                        message: `¡Gran cantidad de estudios bíblicos! (${lastReport.summary.totalStudies} estudios)`,
                                        district: district.name
                                    });
                                }

                                // Check 5: Baptisms (Success)
                                if (lastReport.baptisms && lastReport.baptisms > 0) {
                                    newAlerts.push({
                                        gp,
                                        type: 'success',
                                        message: `¡Bautismos registrados! (${lastReport.baptisms} bautismos)`,
                                        district: district.name
                                    });
                                }

                                // Check 6: Regular Reporting (Success)
                                if (gpReports.length >= 4) {
                                    newAlerts.push({
                                        gp,
                                        type: 'success',
                                        message: `¡Reportes consistentes! (${gpReports.length} reportes registrados)`,
                                        district: district.name
                                    });
                                }
                            }
                        });
                    });

                    setAlerts(newAlerts);
                } catch (e) { console.error(e); }
            }
        };
        loadAlerts();
    }, [zone, backend]);

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertCircle size={24} className="text-red-500" />;
            case 'warning':
                return <AlertTriangle size={24} className="text-yellow-600" />;
            case 'success':
                return <CheckCircle size={24} className="text-green-500" />;
            default:
                return <AlertCircle size={24} className="text-gray-500" />;
        }
    };

    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'critical':
                return 'bg-red-50 border-red-500';
            case 'warning':
                return 'bg-yellow-50 border-yellow-500';
            case 'success':
                return 'bg-green-50 border-green-500';
            default:
                return 'bg-gray-50 border-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Alertas de la Zona</h2>
            <p className="text-gray-600">Todas las alertas (buenas y malas) de todos los distritos en la zona</p>

            <div className="space-y-4">
                {alerts.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 shadow-sm flex items-start ${getAlertStyles(alert.type)}`}>
                        <div className="mr-3">
                            {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-gray-900">{alert.gp.name}</h3>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                    Distrito: {alert.district}
                                </span>
                            </div>
                            <p className="text-gray-700">{alert.message}</p>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-green-600 font-medium">No hay alertas activas en la zona.</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center">
                        <AlertCircle size={20} className="text-red-500 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-red-800">Críticas</p>
                            <p className="text-lg font-bold text-red-600">
                                {alerts.filter((a: { type: string }) => a.type === 'critical').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                        <AlertTriangle size={20} className="text-yellow-600 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Advertencias</p>
                            <p className="text-lg font-bold text-yellow-600">
                                {alerts.filter((a: { type: string }) => a.type === 'warning').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                        <CheckCircle size={20} className="text-green-500 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-green-800">Éxitos</p>
                            <p className="text-lg font-bold text-green-600">
                                {alerts.filter((a: { type: string }) => a.type === 'success').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                        <TrendingUp size={20} className="text-blue-500 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-blue-800">Total</p>
                            <p className="text-lg font-bold text-blue-600">
                                {alerts.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZoneAlertsView;
