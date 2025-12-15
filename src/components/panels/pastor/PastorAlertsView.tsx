import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../../services/mockBackend';
import { District, SmallGroup, WeeklyReport } from '../../../types';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const PastorAlertsView: React.FC = () => {
    const { district } = useOutletContext<{ district: District }>();
    const [alerts, setAlerts] = useState<{ gp: SmallGroup, type: 'critical' | 'warning', message: string }[]>([]);

    useEffect(() => {
        if (district) {
            const churches = mockBackend.getChurches().filter(c => c.districtId === district.id);
            const gps = mockBackend.getGPs().filter(g => churches.some(c => c.id === g.churchId));
            const reports = mockBackend.getReports();

            const newAlerts: typeof alerts = [];

            gps.forEach(gp => {
                const gpReports = reports.filter(r => r.gpId === gp.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                // Check 1: No reports in last 2 weeks (Simulated)
                // In a real app, we'd check dates against today. Here we just check if empty or very old.
                if (gpReports.length === 0) {
                    newAlerts.push({ gp, type: 'critical', message: 'No se han registrado reportes.' });
                } else {
                    // Check 2: Low Attendance (e.g., < 50% of members present in last report)
                    const lastReport = gpReports[0];
                    const members = mockBackend.getMembersByGP(gp.id);
                    const attendanceCount = lastReport.attendance.filter(a => a.present).length;

                    if (members.length > 0 && (attendanceCount / members.length) < 0.5) {
                        newAlerts.push({ gp, type: 'warning', message: `Baja asistencia (${attendanceCount}/${members.length}) en el último reporte.` });
                    }
                }
            });

            setAlerts(newAlerts);
        }
    }, [district]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Alertas Tempranas</h2>

            <div className="space-y-4">
                {alerts.map((alert, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 shadow-sm flex items-start ${alert.type === 'critical' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
                        }`}>
                        <div className={`mr-3 ${alert.type === 'critical' ? 'text-red-500' : 'text-yellow-600'}`}>
                            {alert.type === 'critical' ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{alert.gp.name}</h3>
                            <p className="text-gray-700">{alert.message}</p>
                        </div>
                    </div>
                ))}

                {alerts.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-green-600 font-medium">¡Excelente! No hay alertas activas en el distrito.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PastorAlertsView;
