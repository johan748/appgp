import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardList, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import LessonReportingTab from '../components/panels/leader/LessonReportingTab';
import RegistrationTab from '../components/panels/leader/RegistrationTab';

const PublicBibleStudiesPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'report_lesson' | 'register'>('report_lesson');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleRegistrationComplete = () => {
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            setActiveTab('report_lesson');
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-[#3e8391] p-2 rounded-lg text-white">
                            <BookOpen size={24} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-800">Estudios Bíblicos</h1>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 font-medium transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Volver al Inicio</span>
                    </button>
                </div>
            </header>

            {/* Success Message */}
            {showSuccess && (
                <div className="max-w-7xl mx-auto w-full px-4 pt-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-fade-in">
                        <CheckCircle className="text-green-600" size={24} />
                        <div>
                            <p className="text-green-800 font-bold">¡Estudiante registrado exitosamente!</p>
                            <p className="text-green-600 text-sm">El estudiante ha sido agregado al sistema.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('report_lesson')}
                            className={`flex-1 py-4 text-sm font-bold text-center flex items-center justify-center space-x-2 transition-colors ${activeTab === 'report_lesson'
                                ? 'bg-white text-[#3e8391] border-b-2 border-[#3e8391]'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <ClipboardList size={18} />
                            <span>Reportar Lección</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('register')}
                            className={`flex-1 py-4 text-sm font-bold text-center flex items-center justify-center space-x-2 transition-colors ${activeTab === 'register'
                                ? 'bg-white text-[#3e8391] border-b-2 border-[#3e8391]'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <UserPlus size={18} />
                            <span>Nuevo Estudiante</span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6 md:p-8 min-h-[500px]">
                        {activeTab === 'report_lesson' && (
                            <div className="animate-fade-in">
                                <div className="mb-6 text-center text-gray-500 max-w-lg mx-auto">
                                    <p>Ingrese la <strong>Cédula</strong> de un miembro de la pareja misionera para buscar sus estudiantes y registrar el progreso de las lecciones.</p>
                                </div>
                                <LessonReportingTab />
                            </div>
                        )}
                        {activeTab === 'register' && (
                            <div className="animate-fade-in">
                                <div className="mb-6 text-center text-gray-500 max-w-lg mx-auto">
                                    <p>Para registrar un nuevo estudiante, primero debe identificar la <strong>Pareja Misionera</strong> responsable mediante la cédula de uno de sus miembros.</p>
                                </div>
                                <RegistrationTab onComplete={handleRegistrationComplete} />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PublicBibleStudiesPage;
