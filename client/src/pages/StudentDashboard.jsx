import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIssues } from '../services/api';
import { FilePlus, FileText, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, reported: 0, inProgress: 0, resolved: 0 });
    const [recentIssues, setRecentIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getIssues({ limit: 5 });
                const issues = res.data.issues;
                setRecentIssues(issues);
                setStats({
                    total: res.data.pagination.total,
                    reported: issues.filter(i => i.status === 'Reported').length,
                    inProgress: issues.filter(i => i.status === 'In Progress').length,
                    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length
                });
            } catch { }
            setLoading(false);
        };
        fetchData();
    }, []);

    const getStatusClass = (s) => s.toLowerCase().replace(' ', '-');

    const getCategoryEmoji = (cat) => {
        const map = { 'Water/Leakage': '💧', 'Garbage': '🗑️', 'Washroom': '🚿', 'Classroom': '🏫', 'Corridor': '🚶', 'Electrical': '⚡', 'Furniture': '🪑', 'Other': '📋' };
        return map[cat] || '📋';
    };

    if (loading) return <div className="loading-container"><div className="spinner" /></div>;

    return (
        <div className="page">
            <div className="welcome-section glass">
                <h2>Welcome, {user?.name}! 👋</h2>
                <p>Report campus cleanliness issues and track their resolution. Your voice matters in keeping the campus clean.</p>
                <Link to="/report" className="btn btn-primary btn-lg">
                    <FilePlus size={20} /> Report New Issue
                </Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass accent">
                    <div className="stat-icon"><FileText size={22} /></div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Reports</div>
                </div>
                <div className="stat-card glass yellow">
                    <div className="stat-icon"><Clock size={22} /></div>
                    <div className="stat-value">{stats.reported}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card glass cyan">
                    <div className="stat-icon"><AlertTriangle size={22} /></div>
                    <div className="stat-value">{stats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card glass green">
                    <div className="stat-icon"><CheckCircle2 size={22} /></div>
                    <div className="stat-value">{stats.resolved}</div>
                    <div className="stat-label">Resolved</div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Reports</h2>
                <Link to="/my-reports" className="btn btn-ghost btn-sm">
                    View All <ArrowRight size={14} />
                </Link>
            </div>

            {recentIssues.length === 0 ? (
                <div className="empty-state glass">
                    <div className="empty-icon">📋</div>
                    <h3>No reports yet</h3>
                    <p>You haven't reported any issues. Start by reporting a campus cleanliness issue.</p>
                    <Link to="/report" className="btn btn-primary">
                        <FilePlus size={18} /> Report Issue
                    </Link>
                </div>
            ) : (
                <div className="issues-grid">
                    {recentIssues.map(issue => (
                        <Link key={issue._id} to={`/issues/${issue._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="issue-card glass">
                                <div className="issue-icon">{getCategoryEmoji(issue.category)}</div>
                                <div className="issue-content">
                                    <div className="issue-header">
                                        <span className="issue-id">{issue.issueId}</span>
                                        <span className={`status-badge ${getStatusClass(issue.status)}`}>
                                            <span className="status-dot" />
                                            {issue.status}
                                        </span>
                                    </div>
                                    <div className="issue-title">{issue.title}</div>
                                    <div className="issue-desc">{issue.description}</div>
                                    <div className="issue-meta">
                                        <span>{issue.category}</span>
                                        <span>•</span>
                                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="issue-badges">
                                    <span className={`priority-badge ${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
