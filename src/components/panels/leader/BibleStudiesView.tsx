import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, UserPlus, ListChecks, Settings } from 'lucide-react';
import StudentsListTab from './StudentsListTab';
import ReportsTab from './ReportsTab';
import RegistrationTab from './RegistrationTab';
import LessonReportingTab from './LessonReportingTab';
import BibleStudiesConfigTab from './BibleStudiesConfigTab';

const BibleStudiesView: React.FC = () => {
    const context = useOutletContext<any>();
    const gp = context?.gp;
    const district = context?.district;

    // Default to 'students' as now all roles can see it
    const [activeTab, setActiveTab] = useState<'students' | 'reports' | 'register' | 'report_lesson' | 'configuration'>('students');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRegistrationComplete = () => {
        setRefreshKey(prev => prev + 1); // Force refresh
        setActiveTab('students');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-[#3e839110] p-3 rounded-xl text-[#3e8391]">
                    <BookOpen size={28} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Estudios Bíblicos</h2>
                    <p className="text-gray-500 text-sm">Gestión de estudiantes y progreso de lecciones</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
                <TabButton
                    active={activeTab === 'students'}
                    onClick={() => setActiveTab('students')}
                    icon={<Users size={18} />}
                    label="Estudiantes"
                />
                <TabButton
                    active={activeTab === 'reports'}
                    onClick={() => setActiveTab('reports')}
                    icon={<ListChecks size={18} />}
                    label="Matriz de Reportes"
                />
                <TabButton
                    active={activeTab === 'report_lesson'}
                    onClick={() => setActiveTab('report_lesson')}
                    icon={<ClipboardList size={18} />}
                    label="Reportar Lección"
                />
                <TabButton
                    active={activeTab === 'register'}
                    onClick={() => setActiveTab('register')}
                    icon={<UserPlus size={18} />}
                    label="Nuevo Estudiante"
                />
                {district && (
                    <TabButton
                        active={activeTab === 'configuration'}
                        onClick={() => setActiveTab('configuration')}
                        icon={<Settings size={18} />}
                        label="Configuración"
                    />
                )}
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                {activeTab === 'students' && <StudentsListTab key={refreshKey} />}
                {activeTab === 'reports' && <ReportsTab key={refreshKey} />}
                {activeTab === 'report_lesson' && <LessonReportingTab />}
                {activeTab === 'register' && <RegistrationTab onComplete={handleRegistrationComplete} />}
                {activeTab === 'configuration' && <BibleStudiesConfigTab />}
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${active
            ? 'bg-white text-[#3e8391] border-b-2 border-[#3e8391] shadow-sm'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default BibleStudiesView;

