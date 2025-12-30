import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { mockBackend } from '../../../services/mockBackend';
import { Association } from '../../../types';
import { ArrowLeft } from 'lucide-react';

const AssociationLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [association, setAssociation] = useState<Association | null>(null);

    useEffect(() => {
        // Association user usually doesn't have a relatedEntityId pointing to the association directly in the same way,
        // or it might. In mockBackend seed, user 'asociacion' has relatedEntityId: 'assoc-1'.
        if (user && user.relatedEntityId) {
            const assocData = mockBackend.getAssociationById(user.relatedEntityId);
            if (assocData) {
                setAssociation(assocData);
            }
        } else if (user?.role === 'ASOCIACION') {
            // Fallback: This user is ASOCIACION but missing relatedEntityId?
            // Try to find an association that has config matching this user's username
            const allAssocs = mockBackend.getAssociations();
            const match = allAssocs.find(a => a.config.username === user.username);
            if (match) setAssociation(match);
            else setAssociation(allAssocs[0]); // Last resort or error
        }
    }, [user]);

    const getWelcomeMessage = () => {
        // Prioritize the department head name from the association setting if available
        if (association?.departmentHead) return `Bienvenido Pr. ${association.departmentHead}`;
        return `Bienvenido Pr. ${user?.name}`;
    };

    if (!association) return <div className="p-4">Cargando información...</div>;

    const isHome = location.pathname === '/association' || location.pathname === '/association/';

    const refreshAssociation = () => {
        if (user && user.relatedEntityId) {
            const assocData = mockBackend.getAssociationById(user.relatedEntityId);
            if (assocData) setAssociation(assocData);
        } else if (user?.role === 'ASOCIACION') {
            const allAssocs = mockBackend.getAssociations();
            const match = allAssocs.find(a => a.config.username === user.username);
            if (match) setAssociation(match);
            else setAssociation(allAssocs[0]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Top Navigation / Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            {!isHome && (
                                <button onClick={() => navigate('/association')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-[#3e8391]">{association.name}</h1>
                                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">
                                    {mockBackend.getUnionById(association.unionId)?.name || 'Unión'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="font-bold text-gray-800 text-sm">{getWelcomeMessage()}</p>
                                <button onClick={() => { logout(); navigate('/login'); }} className="text-xs font-semibold text-red-500 hover:text-red-700">Cerrar Sesión</button>
                            </div>
                            <div className="h-10 w-10 bg-[#3e8391] text-white rounded-full flex items-center justify-center font-bold text-lg">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                <Outlet context={{ association, refreshAssociation }} />
            </main>
        </div>
    );
};

export default AssociationLayout;
