import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getMe } from './features/auth/authSlice';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROLES, DASHBOARD_ROUTES } from './constants/roles';
import { Toaster } from 'react-hot-toast';

import InstitutionManagement from './features/admin/InstitutionManagement';
import CourseManagement from './features/admin/CourseManagement';
import NormsIntakeManagement from './features/admin/NormsIntakeManagement';

// Dashboard Components
import AdminDashboard from './features/admin/AdminDashboard';
import UserManagement from './features/admin/UserManagement';
import AddUser from './features/admin/AddUser';
import PrincipalDashboard from './features/principal/PrincipalDashboard';
import FacultyManagement from './features/principal/FacultyManagement';
import RODashboard from './features/ro/RODashboard';
import CandidateDashboard from './features/candidate/CandidateDashboard';
import AIQueryAssistant from './features/admin/AIQueryAssistant';
import VacancyManagement from './features/principal/VacancyManagement';
import AdGenerationDashboard from './features/admin/AdGenerationDashboard';
import SelectionManagement from './features/principal/SelectionManagement';
import PublicAdView from './pages/PublicAdView';
import LecturerDashboard from './features/faculty/LecturerDashboard';
import FacultyTimetable from './features/faculty/FacultyTimetable';
import FacultyWorkLogs from './features/faculty/FacultyWorkLogs';
import AdminBillingDashboard from './features/admin/AdminBillingDashboard';
import PrincipalBillingDashboard from './features/principal/PrincipalBillingDashboard';
import ROBillingDashboard from './features/ro/ROBillingDashboard';
import TreasuryBillingDashboard from './features/treasury/TreasuryBillingDashboard';
import PrincipalWorkLogs from './features/principal/PrincipalWorkLogs';
import PrincipalAppointmentManagement from './features/principal/PrincipalAppointmentManagement';
import ApplicationManagement from './features/admin/ApplicationManagement';
import MyApplications from './features/candidate/MyApplications';
import MISReportsDashboard from './features/admin/MISReportsDashboard';
import AcademicCalendar from './features/admin/AcademicCalendar';
import CandidateAdsPage from './features/candidate/CandidateAdsPage';
import CandidateOffers from './features/candidate/CandidateOffers';
import ManageTimetable from './features/principal/ManageTimetable';
import TimetableManagement from './features/principal/TimetableManagement';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, role, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      console.log('App: Token found, verifying session...');
      dispatch(getMe());
    } else {
      console.log('App: No token found, user is guest');
    }
  }, [dispatch, token]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/ads/public/:token" element={<PublicAdView />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirect base path to correct dashboard based on role */}
        <Route
          index
          element={
            isAuthenticated ? (
              <Navigate to={DASHBOARD_ROUTES[role?.toUpperCase()] || "/"} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users/add"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route path="admin/principals" element={<div className="p-8 font-bold">Principals Management UI</div>} />

        <Route 
          path="admin/ads" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <div className="p-6">
                <AdGenerationDashboard />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/ai-assistant" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <div className="p-6">
                <AIQueryAssistant />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/reports" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <div className="p-6">
                <MISReportsDashboard />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="ro/billing" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.RO]}>
              <div className="p-6">
                <ROBillingDashboard />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="treasury/billing" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.TREASURY]}>
              <div className="p-6">
                <TreasuryBillingDashboard />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/calendar" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <div className="p-6">
                <AcademicCalendar />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="admin/billing" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <div className="p-6">
                <AdminBillingDashboard />
              </div>
            </ProtectedRoute>
          } 
        />


        {/* Principal Routes */}
        <Route
          path="principal/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <PrincipalDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="principal/institute" element={<div className="p-8 font-bold">Institute Profile UI</div>} />
        <Route path="principal/intake" element={<div className="p-8 font-bold">Intake Management UI</div>} />
        <Route 
          path="principal/faculty" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <FacultyManagement />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="principal/timetable" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <TimetableManagement />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="principal/calendar" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <AcademicCalendar />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="principal/work-logs" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <PrincipalWorkLogs />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="principal/vacancies" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <VacancyManagement />
              </div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="principal/selection" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <SelectionManagement />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="principal/appointments" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <PrincipalAppointmentManagement />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="principal/applications" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <ApplicationManagement />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="principal/billing" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <PrincipalBillingDashboard />
              </div>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="principal/timetable" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
              <div className="p-6">
                <ManageTimetable />
              </div>
            </ProtectedRoute>
          } 
        />

        {/* RO Routes */}
        <Route
          path="ro/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RO]}>
              <RODashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="ro/institutes"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RO]}>
              <div className="p-6">
                <InstitutionManagement />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="ro/courses"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RO]}>
              <div className="p-6">
                <CourseManagement />
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="ro/billing"
          element={
            <ProtectedRoute allowedRoles={[ROLES.RO]}>
              <div className="p-6">
                <ROBillingDashboard />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Treasury Routes */}
        <Route
          path="treasury/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TREASURY]}>
              <div className="p-6">
                <TreasuryBillingDashboard />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Candidate Routes */}
        <Route
          path="candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CANDIDATE]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="candidate/ads" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CANDIDATE]}>
              <CandidateAdsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="candidate/offers" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CANDIDATE]}>
              <CandidateOffers />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="candidate/applications" 
          element={
            <ProtectedRoute allowedRoles={[ROLES.CANDIDATE]}>
              <div className="p-6">
                <MyApplications />
              </div>
            </ProtectedRoute>
          } 
        />
        
        {/* Faculty / Lecturer Routes */}
        <Route
          path="faculty/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACULTY]}>
              <LecturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty/timetable"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACULTY]}>
              <FacultyTimetable />
            </ProtectedRoute>
          }
        />
        <Route
          path="faculty/work-logs"
          element={
            <ProtectedRoute allowedRoles={[ROLES.FACULTY]}>
              <FacultyWorkLogs />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
