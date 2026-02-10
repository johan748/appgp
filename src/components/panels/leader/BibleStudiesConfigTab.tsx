import React, { useState, useEffect } from 'react';
import { useBackend } from '../../../context/BackendContext';
import { BibleCourse } from '../../../types';
import { Plus, Edit2, Trash2, Save, X, BookOpen, AlertCircle } from 'lucide-react';

const BibleStudiesConfigTab: React.FC = () => {
    const { backend } = useBackend();
    const [courses, setCourses] = useState<BibleCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<BibleCourse | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        totalLessons: 20
    });

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const data = await backend.getCourses();
            setCourses(data);
        } catch (err: any) {
            console.error('Error loading courses:', err);
            setError('Error al cargar los cursos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (course?: BibleCourse) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                name: course.name,
                description: course.description || '',
                totalLessons: course.totalLessons
            });
        } else {
            setEditingCourse(null);
            setFormData({
                name: '',
                description: '',
                totalLessons: 20
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCourse(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingCourse) {
                await backend.updateCourse({
                    ...editingCourse,
                    ...formData
                });
            } else {
                await backend.addCourse({
                    ...formData,
                    isActive: true
                });
            }
            await loadCourses();
            handleCloseModal();
        } catch (err: any) {
            console.error('Error saving course:', err);
            setError('Error al guardar el curso');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este curso?')) return;
        try {
            await backend.deleteCourse(id);
            await loadCourses();
        } catch (err: any) {
            console.error('Error deleting course:', err);
            setError('Error al eliminar el curso');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <BookOpen className="mr-2 text-[#3e8391]" />
                        Cursos Bíblicos
                    </h3>
                    <p className="text-sm text-gray-500">Gestione los cursos disponibles para los estudiantes</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#3e8391] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#2c6a7a] transition-colors"
                >
                    <Plus size={18} />
                    <span>Nuevo Curso</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center mb-4">
                    <AlertCircle size={20} className="mr-2" />
                    {error}
                </div>
            )}

            {loading && !showModal ? (
                <div className="text-center py-8 text-gray-500">Cargando cursos...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all relative group">
                            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(course)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(course.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h4 className="font-bold text-lg text-gray-800 mb-1">{course.name}</h4>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[40px]">
                                {course.description || 'Sin descripción'}
                            </p>

                            <div className="flex items-center text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full w-fit">
                                <BookOpen size={14} className="mr-1.5 text-[#3e8391]" />
                                {course.totalLessons} Lecciones
                            </div>
                        </div>
                    ))}

                    {courses.length === 0 && (
                        <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No hay cursos registrados.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-[#3e8391] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">
                                {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
                            </h3>
                            <button onClick={handleCloseModal} className="hover:bg-white/20 p-1 rounded-full text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Curso</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3e8391] focus:border-transparent outline-none transition-all"
                                    placeholder="Ej: La Fe de Jesús"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3e8391] focus:border-transparent outline-none transition-all"
                                    rows={3}
                                    placeholder="Breve descripción del curso..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total de Lecciones</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="100"
                                    value={formData.totalLessons}
                                    onChange={e => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 0 })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3e8391] focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#3e8391] text-white rounded-lg hover:bg-[#2c6a7a] transition-colors font-medium flex items-center shadow-lg shadow-[#3e8391]/20"
                                >
                                    <Save size={18} className="mr-2" />
                                    {loading ? 'Guardando...' : 'Guardar Curso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BibleStudiesConfigTab;
