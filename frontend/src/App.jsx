import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// ─── Lazy-loaded Public Pages ───────────────────────────────────────────────
const PublicLayout          = React.lazy(() => import('./layouts/PublicLayout'));
const HomePage              = React.lazy(() => import('./pages/public/HomePage'));
const AboutPage             = React.lazy(() => import('./pages/public/AboutPage'));
const StateAdministrationPage = React.lazy(() => import('./pages/public/StateAdministrationPage'));
const DistrictDirectoryPage = React.lazy(() => import('./pages/public/DistrictDirectoryPage'));
const DistrictDetailsPage   = React.lazy(() => import('./pages/public/DistrictDetailsPage'));
const OfficeBearersPage     = React.lazy(() => import('./pages/public/OfficeBearersPage'));
const MembershipPage        = React.lazy(() => import('./pages/public/MembershipPage'));
const WhatsAppGroupsPage    = React.lazy(() => import('./pages/public/WhatsAppGroupsPage'));
const NewsPage              = React.lazy(() => import('./pages/public/NewsPage'));
const NewsDetailPage        = React.lazy(() => import('./pages/public/NewsDetailPage'));
const EventsPage            = React.lazy(() => import('./pages/public/EventsPage'));
const EventDetailPage       = React.lazy(() => import('./pages/public/EventDetailPage'));
const GalleryPage           = React.lazy(() => import('./pages/public/GalleryPage'));
const ContactPage           = React.lazy(() => import('./pages/public/ContactPage'));

// ─── Lazy-loaded Admin Pages ─────────────────────────────────────────────────
const AdminLayout           = React.lazy(() => import('./layouts/AdminLayout'));
const AdminLoginPage        = React.lazy(() => import('./pages/admin/AdminLoginPage'));
const DashboardPage         = React.lazy(() => import('./pages/admin/DashboardPage'));
const ManageDistrictsPage   = React.lazy(() => import('./pages/admin/ManageDistrictsPage'));
const ManageMembersPage     = React.lazy(() => import('./pages/admin/ManageMembersPage'));
const ManageStateAdminsPage = React.lazy(() => import('./pages/admin/ManageStateAdminsPage'));
const ManageDistrictAdminsPage = React.lazy(() => import('./pages/admin/ManageDistrictAdminsPage'));
const ManageOfficeBearersPage  = React.lazy(() => import('./pages/admin/ManageOfficeBearersPage'));
const ManageNewsPage        = React.lazy(() => import('./pages/admin/ManageNewsPage'));
const ManageEventsPage      = React.lazy(() => import('./pages/admin/ManageEventsPage'));
const ManageGalleryPage     = React.lazy(() => import('./pages/admin/ManageGalleryPage'));
const ManageWhatsAppPage    = React.lazy(() => import('./pages/admin/ManageWhatsAppPage'));
const ManageTranslationsPage = React.lazy(() => import('./pages/admin/ManageTranslationsPage'));

// ─── Loading Fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/"                      element={<HomePage />} />
            <Route path="/about"                 element={<AboutPage />} />
            <Route path="/state-administration"  element={<StateAdministrationPage />} />
            <Route path="/districts"             element={<DistrictDirectoryPage />} />
            <Route path="/districts/:slug"       element={<DistrictDetailsPage />} />
            <Route path="/office-bearers"        element={<OfficeBearersPage />} />
            <Route path="/membership"            element={<MembershipPage />} />
            <Route path="/whatsapp-groups"       element={<WhatsAppGroupsPage />} />
            <Route path="/news"                  element={<NewsPage />} />
            <Route path="/news/:id"              element={<NewsDetailPage />} />
            <Route path="/events"                element={<EventsPage />} />
            <Route path="/events/:id"            element={<EventDetailPage />} />
            <Route path="/gallery"               element={<GalleryPage />} />
            <Route path="/contact"               element={<ContactPage />} />
          </Route>

          {/* Admin Login (no auth required) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"           element={<DashboardPage />} />
            <Route path="districts"           element={<ManageDistrictsPage />} />
            <Route path="members"             element={<ManageMembersPage />} />
            <Route path="state-admins"        element={<ManageStateAdminsPage />} />
            <Route path="district-admins"     element={<ManageDistrictAdminsPage />} />
            <Route path="office-bearers-admin" element={<ManageOfficeBearersPage />} />
            <Route path="news"                element={<ManageNewsPage />} />
            <Route path="events"              element={<ManageEventsPage />} />
            <Route path="gallery"             element={<ManageGalleryPage />} />
            <Route path="whatsapp"            element={<ManageWhatsAppPage />} />
            <Route path="translations"        element={<ManageTranslationsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
