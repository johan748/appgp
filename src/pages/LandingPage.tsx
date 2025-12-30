import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Users2, BarChart3 } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <img src="/logo_gp_transparent.png" alt="Logo GP" className="h-10 w-auto" />
                        <span className="text-xl font-bold text-slate-900 tracking-tight">Sistema GP</span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2.5 text-[#2c7a8c] font-semibold hover:bg-slate-50 rounded-xl transition-all text-sm"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-grow flex items-center py-20 lg:py-28">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Text Content */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                                    Gestión Integral de{' '}
                                    <span className="text-[#2c7a8c]">Grupos Pequeños</span>
                                </h1>
                                <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                                    Una solución premium diseñada para la administración de los miembros, monitoreo del crecimiento y automatización de reportes, en un solo lugar.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#2c7a8c] to-[#3e8391] text-white font-semibold rounded-[20px] shadow-lg shadow-[#2c7a8c]/25 hover:shadow-xl hover:shadow-[#2c7a8c]/30 hover:-translate-y-0.5 transition-all duration-200 text-lg"
                            >
                                Ingresar al Sistema
                            </button>
                        </div>

                        {/* Right: Image with gps.png */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#2c7a8c]/10 to-transparent rounded-[24px] -z-10 blur-2xl transform scale-105"></div>
                            <div className="relative rounded-[24px] overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/50">
                                <img
                                    src="/gps1.png"
                                    alt="Sistema de Gestión"
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
                        <FeatureCard
                            title="Gestión de Miembros"
                            description="Mantén actualizada la información de tu Grupo Pequeño, asistencia y progreso del liderazgo"
                            icon={<Users className="w-8 h-8 text-[#2c7a8c]" />}
                        />
                        <FeatureCard
                            title="Parejas Misioneras"
                            description="Organiza y monitorea el trabajo misionero y estudios bíblicos."
                            icon={<Users2 className="w-8 h-8 text-[#2c7a8c]" />}
                        />
                        <FeatureCard
                            title="Reportes en Tiempo Real"
                            description="Visualiza el avance de los Grupos Pequeños, Iglesias, Distritos, Zonas y Campos con estadísticas actualizadas"
                            icon={<BarChart3 className="w-8 h-8 text-[#2c7a8c]" />}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#1e3a44] text-white py-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col items-center space-y-4">
                        <p className="text-slate-300 text-sm">
                            © 2024 Sistema de Gestión de Grupos Pequeños. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => (
    <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative bg-white p-8 lg:p-10 rounded-[24px] shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 border border-slate-100 h-full">
            <div className="mb-6 w-16 h-16 bg-gradient-to-br from-[#2c7a8c]/10 to-[#3e8391]/5 rounded-2xl flex items-center justify-center">
                {icon}
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-4 tracking-tight">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    </div>
);

export default LandingPage;
