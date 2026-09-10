import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import {
    LayoutDashboard, FilePlus, FileText, BarChart3, List,
    Bell, LogOut, ChevronRight, CheckCheck, X
} from 'lucide-react';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showPanel, setShowPanel] = useState(false);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data.notifications);
            setUnreadCount(res.data.unreadCount);
        } catch { }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            fetchNotifications();
        } catch { }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            fetchNotifications();
        } catch { }
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = (now - d) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <>
            <nav className="navbar">
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
                    <div className="logo-icon">✓</div>
                    FixIt
                </Link>

                <div className="navbar-links">
                    {isAdmin ? (
                        <>
                            <Link to="/admin" className={isActive('/admin')}>
                                <LayoutDashboard size={18} /> <span>Dashboard</span>
                            </Link>
                            <Link to="/admin/issues" className={isActive('/admin/issues')}>
                                <List size={18} /> <span>Issues</span>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className={isActive('/dashboard')}>
                                <LayoutDashboard size={18} /> <span>Dashboard</span>
                            </Link>
                            <Link to="/report" className={isActive('/report')}>
                                <FilePlus size={18} /> <span>Report</span>
                            </Link>
                            <Link to="/my-reports" className={isActive('/my-reports')}>
                                <FileText size={18} /> <span>My Reports</span>
                            </Link>
                        </>
                    )}

                    <button className="notification-btn" onClick={() => setShowPanel(true)}>
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                    </button>

                    <div className="user-menu">
                        <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>

                    <button onClick={logout} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            {/* Notification Panel */}
            {showPanel && <div className="notification-overlay" onClick={() => setShowPanel(false)} />}
            <div className={`notification-panel ${showPanel ? 'open' : ''}`}>
                <div className="notification-panel-header">
                    <h3>Notifications</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {unreadCount > 0 && (
                            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
                                <CheckCheck size={14} /> Read all
                            </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowPanel(false)}>
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div className="notification-panel-body">
                    {notifications.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <div className="empty-icon">🔔</div>
                            <h3>No notifications</h3>
                            <p>You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n._id}
                                className={`notification-item ${!n.read ? 'unread' : ''}`}
                                onClick={() => handleMarkRead(n._id)}
                            >
                                <div className="notif-message">{n.message}</div>
                                <div className="notif-time">{formatTime(n.createdAt)}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
