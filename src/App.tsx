import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import LeaderLayout from './components/panels/leader/LeaderLayout';
import LeaderHome from './components/panels/leader/LeaderHome';
import MembersView from './components/panels/leader/MembersView';
import MissionaryPairsView from './components/panels/leader/MissionaryPairsView';
import AttendanceView from './components/panels/leader/AttendanceView';
import ReportsView from './components/panels/leader/ReportsView';
import AddMemberView from './components/panels/leader/AddMemberView';
import EditMemberView from './components/panels/leader/EditMemberView';
import FriendsView from './components/panels/leader/FriendsView';
import LeadershipView from './components/panels/leader/LeadershipView';

// Placeholder Components for Panels
import DirectorLayout from './components/panels/director/DirectorLayout';
import DirectorHome from './components/panels/director/DirectorHome';
import DirectorGroupsView from './components/panels/director/DirectorGroupsView';
import DirectorRolesView from './components/panels/director/DirectorRolesView';
import DirectorCreateGroupView from './components/panels/director/DirectorCreateGroupView';
import DirectorEditGroupView from './components/panels/director/DirectorEditGroupView';
import DirectorReportsView from './components/panels/director/DirectorReportsView';
import DirectorTopView from './components/panels/director/DirectorTopView';

// Placeholder Components for Panels
import PastorLayout from './components/panels/pastor/PastorLayout';
import PastorHome from './components/panels/pastor/PastorHome';
import PastorChurchesView from './components/panels/pastor/PastorChurchesView';
import PastorCreateChurchView from './components/panels/pastor/PastorCreateChurchView';
import PastorEditChurchView from './components/panels/pastor/PastorEditChurchView';
import PastorAlertsView from './components/panels/pastor/PastorAlertsView';
import PastorAutoReportsView from './components/panels/pastor/PastorAutoReportsView';
import PastorCreateGroupView from './components/panels/pastor/PastorCreateGroupView';
import PastorEditGroupView from './components/panels/pastor/PastorEditGroupView';
import PastorRolesView from './components/panels/pastor/PastorRolesView';
import PastorGPReportsView from './components/panels/pastor/PastorGPReportsView';
import PastorTopView from './components/panels/pastor/PastorTopView';
import PastorGlobalReportsView from './components/panels/pastor/PastorGlobalReportsView';

// Reuse Director Views for Pastor (since they are similar or can be adapted, 
// but for simplicity in this prototype we might reuse or re-import if we made them generic.
// However, since we didn't make them fully generic (they use useOutletContext with specific types),
// we should ideally have Pastor versions. 
// For this "Speed" implementation, I will reuse Director views but I need to be careful about context.
// Director views expect { church }. Pastor views have { district }.
// The Director views I made (Groups, Roles, Reports, Top) use `useOutletContext<{ church: Church }>()`.
// If I use them here, they will crash or fail to load data because context is different.
// I should have created Pastor versions or generic ones.
// To fix this quickly without duplicating 5 files:
// I will wrap them or just use the ones I created specific for Pastor (Churches, CreateChurch, Alerts, AutoReports).
// For the missing ones (Groups, Roles, CreateGroup, EditGroup, Reports, Top), I will skip them for now 
// or create simple placeholders to avoid crashes, as I only implemented the "Pastor" specific ones in the plan.
// Wait, the plan said "Reuse/Adapt". I didn't create adaptors.
// I will implement the missing critical ones for Pastor quickly or just point to placeholders.
// Actually, I'll use the ones I built: Churches, CreateChurch, Alerts, AutoReports.
// And I'll add placeholders for the others to keep the app running.

// Zone Panel Components
import ZoneLayout from './components/panels/zone/ZoneLayout';
import ZoneHome from './components/panels/zone/ZoneHome';
import ZoneDistrictsView from './components/panels/zone/ZoneDistrictsView';

// Association Panel Components
import AssociationLayout from './components/panels/association/AssociationLayout';
import AssociationHome from './components/panels/association/AssociationHome';
import AssociationZonesView from './components/panels/association/AssociationZonesView';
import AssociationDistrictsView from './components/panels/association/AssociationDistrictsView';
import AssociationGlobalReportsView from './components/panels/association/AssociationGlobalReportsView';
import AssociationGrowthView from './components/panels/association/AssociationGrowthView';
import AssociationConfigView from './components/panels/association/AssociationConfigView';

// Admin Panel Components
import AdminLayout from './components/panels/admin/AdminLayout';
import AdminHome from './components/panels/admin/AdminHome';
import AdminAssociationsView from './components/panels/admin/AdminAssociationsView';
import AdminUsersView from './components/panels/admin/AdminUsersView';
import AdminDataView from './components/panels/admin/AdminDataView';
import AdminConfigView from './components/panels/admin/AdminConfigView';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Unauthorized
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes */}
                    <Route path="/leader" element={
                        <ProtectedRoute allowedRoles={['LIDER_GP']}>
                            <LeaderLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<LeaderHome />} />
                        <Route path="members" element={<MembersView />} />
                        <Route path="pairs" element={<MissionaryPairsView />} />
                        <Route path="attendance" element={<AttendanceView />} />
                        <Route path="reports" element={<ReportsView />} />
                        <Route path="add-member" element={<AddMemberView />} />
                        <Route path="edit-member/:id" element={<EditMemberView />} />
                        <Route path="friends" element={<FriendsView />} />
                        <Route path="leadership" element={<LeadershipView />} />
                    </Route>

                    <Route path="/director" element={
                        <ProtectedRoute allowedRoles={['DIRECTOR_MP']}>
                            <DirectorLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<DirectorHome />} />
                        <Route path="groups" element={<DirectorGroupsView />} />
                        <Route path="roles" element={<DirectorRolesView />} />
                        <Route path="create-group" element={<DirectorCreateGroupView />} />
                        <Route path="edit-group" element={<DirectorEditGroupView />} />
                        <Route path="reports" element={<DirectorReportsView />} />
                        <Route path="top" element={<DirectorTopView />} />
                    </Route>

                    <Route path="/pastor" element={
                        <ProtectedRoute allowedRoles={['PASTOR']}>
                            <PastorLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<PastorHome />} />
                        <Route path="churches" element={<PastorChurchesView />} />
                        <Route path="create-church" element={<PastorCreateChurchView />} />
                        <Route path="alerts" element={<PastorAlertsView />} />
                        <Route path="auto-reports" element={<PastorAutoReportsView />} />
                        <Route path="create-group" element={<PastorCreateGroupView />} />
                        <Route path="edit-group" element={<PastorEditGroupView />} />
                        <Route path="roles" element={<PastorRolesView />} />
                        <Route path="reports" element={<PastorGPReportsView />} />
                        <Route path="top" element={<PastorTopView />} />
                        <Route path="global-reports" element={<PastorGlobalReportsView />} />
                        <Route path="*" element={<div className="p-4">Función en desarrollo</div>} />
                    </Route>

                    <Route path="/zone" element={
                        <ProtectedRoute allowedRoles={['DIRECTOR_ZONA']}>
                            <ZoneLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<ZoneHome />} />
                        <Route path="districts" element={<ZoneDistrictsView />} />
                        <Route path="*" element={<div className="p-4">Función en desarrollo</div>} />
                    </Route>

                    <Route path="/association" element={
                        <ProtectedRoute allowedRoles={['ASOCIACION']}>
                            <AssociationLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AssociationHome />} />
                        <Route path="zones" element={<AssociationZonesView />} />
                        <Route path="districts" element={<AssociationDistrictsView />} />
                        <Route path="reports" element={<AssociationGlobalReportsView />} />
                        <Route path="growth" element={<AssociationGrowthView />} />
                        <Route path="config" element={<AssociationConfigView />} />
                        <Route path="*" element={<div className="p-4">Función en desarrollo</div>} />
                    </Route>

                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminHome />} />
                        <Route path="associations" element={<AdminAssociationsView />} />
                        <Route path="users" element={<AdminUsersView />} />
                        <Route path="data" element={<AdminDataView />} />
                        <Route path="config" element={<AdminConfigView />} />
                    </Route>

                    {/* Default Redirect */}
                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
