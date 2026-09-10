import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import ReportIssue from './pages/ReportIssue';
import MyReports from './pages/MyReports';
import IssueDetail from './pages/IssueDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminIssues from './pages/AdminIssues';
import AdminIssueDetail from './pages/AdminIssueDetail';

export default function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-container" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <>
            {user && <Navbar />}
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
                <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />

                {/* Student Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
                <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                <Route path="/issues/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/issues" element={<ProtectedRoute adminOnly><AdminIssues /></ProtectedRoute>} />
                <Route path="/admin/issues/:id" element={<ProtectedRoute adminOnly><AdminIssueDetail /></ProtectedRoute>} />

                {/* Default */}
                <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}
