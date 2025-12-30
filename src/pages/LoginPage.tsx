import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User as UserIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await login(username, password);
        if (success) {
            // Redirect based on role
            const user = JSON.parse(localStorage.getItem('current_user') || '{}');
            switch (user.role) {
                case 'LIDER_GP': navigate('/leader'); break;
                case 'DIRECTOR_MP': navigate('/director'); break;
                case 'PASTOR': navigate('/pastor'); break;
                case 'DIRECTOR_ZONA': navigate('/zone'); break;
                case 'ASOCIACION': navigate('/association'); break;
                case 'UNION': navigate('/union'); break;
                case 'ADMIN': navigate('/admin'); break;
                default: navigate('/');
            }
        } else {
            setError('Usuario o contraseña incorrectos');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: 'url("/fondo_inicio_sesion.png")' }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Welcome text on the blue/left side */}
            <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 -translate-y-1/2 z-0 hidden md:block">
                <h2 className="text-white font-bold uppercase text-2xl lg:text-3xl xl:text-4xl leading-tight max-w-md drop-shadow-2xl">
                    BIENVENIDOS AL SISTEMA<br />
                    DE GESTIÓN DE GRUPOS PEQUEÑOS.
                    <br /><br />
                    CONECTA, CRECE Y COMPARTE.
                </h2>
            </div>

            <div className="max-w-md w-full space-y-8 p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl relative z-10 border border-white/20">
                <div className="text-center">
                    <img src="/logo_gp_transparent.png" alt="Logo" className="mx-auto h-24 mb-6" />
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                        AppGP
                    </h2>
                    <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-widest">
                        Iglesia Adventista del Séptimo Día
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full px-4 py-3 pl-12 border border-gray-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#3e8391] focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900"
                                placeholder="Usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full px-4 py-3 pl-12 border border-gray-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#3e8391] focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-900"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl text-center animate-shake">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-[#3e8391] hover:bg-[#336d7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3e8391] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#3e839140]"
                        >
                            Iniciar Sesión
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="text-xs font-bold text-gray-400 hover:text-[#3e8391] transition-colors uppercase tracking-widest"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
