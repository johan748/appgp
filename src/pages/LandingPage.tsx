import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Globe, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary text-white p-2 rounded-lg">
                            <Users size={24} />
                        </div>
                        <span className="text-xl font-bold text-gray-900">Sistema GP</span>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 text-primary font-medium hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-grow flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                        Gestión Integral de <br />
                        <span className="text-primary">Grupos Pequeños</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Una plataforma unificada para Líderes, Directores y Pastores.
                        Administra miembros, reportes y el crecimiento de tu comunidad.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                    >
                        Ingresar al Sistema <ArrowRight className="ml-2 inline" />
                    </button>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<Users size={40} className="text-blue-500" />}
                            title="Gestión de Miembros"
                            description="Mantén actualizada la información de tu grupo, asistencia y progreso de liderazgo."
                        />
                        <FeatureCard
                            icon={<Heart size={40} className="text-red-500" />}
                            title="Parejas Misioneras"
                            description="Organiza y monitorea el trabajo misionero y estudios bíblicos."
                        />
                        <FeatureCard
                            icon={<Globe size={40} className="text-green-500" />}
                            title="Reportes en Tiempo Real"
                            description="Visualiza el avance de tu distrito y zona con estadísticas actualizadas."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-400">© 2024 Sistema de Gestión de Grupos Pequeños. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default LandingPage;
