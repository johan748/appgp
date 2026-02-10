import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBackend } from '../../../context/BackendContext';
import { SmallGroup, MissionaryPair, Member, Student } from '../../../types';
import { Save, UserPlus, Search, CheckCircle, AlertCircle } from 'lucide-react';

interface RegistrationTabProps {
    onComplete: () => void;
}

const RegistrationTab: React.FC<RegistrationTabProps> = ({ onComplete }) => {
    // Context might be null if used in public view, handle accordingly
    const outletContext = useOutletContext<{ gp: SmallGroup } | null>();
    const gp = outletContext?.gp;

    const { backend } = useBackend();

    // Data
    const [members, setMembers] = useState<Member[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    // Search State
    const [searchCedula, setSearchCedula] = useState('');
    const [foundPair, setFoundPair] = useState<MissionaryPair | null>(null);
    const [searchMessage, setSearchMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        cedula: '',
        birthDate: '',
        email: '',
        phone: '',
        address: '',
        courseName: '', // Will be set by effect
        totalLessons: 20
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [allMembers, allCourses] = await Promise.all([
                    backend.getMembers(),
                    backend.getCourses()
                ]);
                setMembers(allMembers);
                setCourses(allCourses);

                // Set default course if available
                if (allCourses.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        courseName: allCourses[0].name,
                        totalLessons: allCourses[0].totalLessons
                    }));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, [backend]);

    const handleSearchPair = async () => {
        setSearchMessage(null);
        setFoundPair(null);

        if (!searchCedula.trim()) {
            setSearchMessage({ type: 'error', text: 'Ingrese una Cédula.' });
            return;
        }

        try {
            // Find member
            const member = members.find(m => m.cedula === searchCedula.trim());
            if (!member) {
                setSearchMessage({ type: 'error', text: 'No se encontró miembro con esta cédula.' });
                return;
            }

            // Find pair
            const allPairs = await backend.getMissionaryPairs();
            const pair = allPairs.find(p => p.member1Id === member.id || p.member2Id === member.id);

            if (pair) {
                setFoundPair(pair);
                setSearchMessage({ type: 'success', text: 'Pareja Misionera encontrada.' });
            } else {
                setSearchMessage({ type: 'error', text: 'El miembro no pertenece a una Pareja Misionera activa.' });
            }
        } catch (error) {
            console.error(error);
            setSearchMessage({ type: 'error', text: 'Error al buscar pareja.' });
        }
    };

    const getPairName = (pair: MissionaryPair) => {
        const m1 = members.find(m => m.id === pair.member1Id);
        const m2 = members.find(m => m.id === pair.member2Id);
        return `PM ${m1?.firstName || '?'} y ${m2?.firstName || '?'}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!foundPair) {
            setError('Debe identificar una Pareja Misionera responsable.');
            setLoading(false);
            return;
        }

        try {
            const newStudent: Student = {
                id: Math.random().toString(36).substr(2, 9),
                missionaryPairId: foundPair.id,
                ...formData,
                registrationDate: new Date().toISOString(),
                status: 'ESTUDIANDO'
            };

            await backend.addStudent(newStudent);

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                cedula: '',
                birthDate: '',
                email: '',
                phone: '',
                address: '',
                courseName: 'La Fe de Jesús',
                totalLessons: 30
            });
            setFoundPair(null);
            setSearchCedula('');
            setSearchMessage({ type: 'success', text: 'Estudiante registrado correctamente.' });

            if (onComplete) onComplete();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al registrar estudiante');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="bg-[#3e8391]/10 p-2 rounded-lg mr-3">
                    <UserPlus className="text-[#3e8391]" size={24} />
                </div>
                Registro de Nuevo Estudiante
            </h3>

            {/* Pair Lookup Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#3e8391]"></div>
                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Identificar Pareja Misionera Responsable</label>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-grow w-full sm:max-w-xs relative bg-gray-50 rounded-xl transition-all focus-within:ring-2 focus-within:ring-[#3e8391]/20 focus-within:bg-white">
                        <label className="text-[10px] uppercase font-bold text-gray-400 absolute top-2 left-10">Cédula de un miembro</label>
                        <input
                            type="text"
                            value={searchCedula}
                            onChange={e => setSearchCedula(e.target.value)}
                            placeholder="Ej: 12345678"
                            className="block w-full bg-transparent border-none rounded-xl py-3 pl-10 pr-4 text-gray-800 font-medium placeholder-gray-400 focus:ring-0 mt-2"
                            onKeyDown={e => e.key === 'Enter' && handleSearchPair()}
                        />
                        <Search size={18} className="absolute left-3 top-5 text-[#3e8391]" />
                    </div>

                    <button
                        type="button"
                        onClick={handleSearchPair}
                        className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 bg-[#3e8391] text-white rounded-xl hover:bg-[#2c6a7a] transition-all shadow-lg shadow-[#3e8391]/20 font-medium flex items-center justify-center"
                    >
                        <Search size={18} className="mr-2" />
                        Buscar
                    </button>

                    {/* Result Display */}
                    <div className="w-full sm:w-auto mt-2 sm:mt-0 flex-grow">
                        {searchMessage && (
                            <div className={`flex items-center p-3 rounded-xl border ${searchMessage.type === 'success'
                                    ? 'bg-green-50 border-green-100 text-green-700'
                                    : 'bg-red-50 border-red-100 text-red-700'
                                } animate-fade-in`}>
                                {searchMessage.type === 'success' ?
                                    <CheckCircle size={20} className="mr-3 flex-shrink-0" /> :
                                    <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                                }
                                <span className="text-sm font-medium">{searchMessage.text}</span>
                            </div>
                        )}
                        {foundPair && (
                            <div className="mt-3 sm:mt-0 sm:ml-4 text-[#3e8391] font-bold text-lg bg-[#3e8391]/5 px-4 py-2 rounded-xl border border-[#3e8391]/20 inline-flex items-center animate-fade-in shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-[#3e8391] mr-2"></span>
                                {getPairName(foundPair)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Registration Form - Only visible if pair found */}
            <div className={`transition-all duration-500 ease-in-out ${foundPair ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none grayscale'}`}>
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Personal Data */}
                        <div className="space-y-5">
                            <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center">
                                <span className="bg-gray-100 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                                Datos Personales
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombres</label>
                                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#3e8391]/20 focus:border-[#3e8391] outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Apellidos</label>
                                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#3e8391]/20 focus:border-[#3e8391] outline-none transition-all" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cédula</label>
                                <input type="text" name="cedula" required value={formData.cedula} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#3e8391]/20 focus:border-[#3e8391] outline-none transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fecha de Nacimiento</label>
                                <input type="date" name="birthDate" required value={formData.birthDate} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#3e8391]/20 focus:border-[#3e8391] outline-none transition-all" />
                            </div>
                        </div>

                        {/* Contact & Course Data */}
                        <div className="space-y-5">
                            <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center">
                                <span className="bg-gray-100 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                                Contacto y Curso
                            </h4>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email <span className="text-gray-300 font-normal normal-case">(Opcional)</span></label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#3e8391]/20 focus:border-[#3e8391] outline-none transition-all" placeholder="ejemplo@correo.com" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Teléfono / WhatsApp</label>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#3e8391]/20 focus:border-[#3e8391] outline-none transition-all" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dirección</label>
                                <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-[#3e8391]/20 focus:border-[#3e8391] outline-none transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-[#3e8391] uppercase mb-1">Curso Bíblico</label>
                                    <div className="relative">
                                        <select
                                            name="courseName"
                                            required
                                            value={formData.courseName}
                                            onChange={(e) => {
                                                const selectedCourse = courses.find(c => c.name === e.target.value);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    courseName: e.target.value,
                                                    totalLessons: selectedCourse ? selectedCourse.totalLessons : prev.totalLessons
                                                }));
                                            }}
                                            className="w-full bg-white border border-[#3e8391]/30 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#3e8391]/20 focus:border-[#3e8391] outline-none transition-all appearance-none font-medium text-gray-700 cursor-pointer"
                                        >
                                            <option value="">Seleccione...</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.name}>
                                                    {course.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[#3e8391]">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Total Lecciones</label>
                                    <input
                                        type="number"
                                        name="totalLessons"
                                        required
                                        value={formData.totalLessons}
                                        onChange={handleChange}
                                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-500 font-mono text-center font-bold"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 animate-slide-in">
                            <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <h5 className="font-bold text-sm">Error en el registro</h5>
                                <p className="text-sm mt-1 opacity-90">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-6 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading || !foundPair}
                            className="flex items-center space-x-2 bg-[#3e8391] text-white px-8 py-4 rounded-xl hover:bg-[#2c6a7a] transition-all shadow-lg hover:shadow-xl shadow-[#3e8391]/20 disabled:opacity-50 disabled:shadow-none font-bold text-lg transform hover:-translate-y-0.5"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={22} />
                                    <span>Registrar Estudiante</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationTab;
