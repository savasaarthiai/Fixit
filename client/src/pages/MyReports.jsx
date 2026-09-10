import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getIssues } from '../services/api';
import { Search, Filter, FilePlus } from 'lucide-react';

export default function MyReports() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '', page: 1 });

    useEffect(() => {
        fetchIssues();
    }, [filters]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.category) params.category = filters.category;
            if (filters.priority) params.priority = filters.priority;
            if (filters.search) params.search = filters.search;
            params.page = filters.page;
            params.limit = 10;

            const res = await getIssues(params);
            setIssues(res.data.issues);
            setPagination(res.data.pagination);
        } catch { }
        setLoading(false);
    };

    const getStatusClass = (s) => s.toLowerCase().replace(' ', '-');
    const getCategoryEmoji = (cat) => {
        const map = { 'Water/Leakage': '💧', 'Garbage': '🗑️', 'Washroom': '🚿', 'Classroom': '🏫', 'Corridor': '🚶', 'Electrical': '⚡', 'Furniture': '🪑', 'Other': '📋' };
        return map[cat] || '📋';
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>My Reports</h1>
                <p>Track all your reported issues and their current status</p>
            </div>

            <div className="filter-bar">
                <div className="search-input" style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by title or ID..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
                <select className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} style={{ width: 150 }}>
                    <option value="">All Status</option>
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                </select>
                <select className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })} style={{ width: 160 }}>
                    <option value="">All Categories</option>
                    <option value="Water/Leakage">Water/Leakage</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Washroom">Washroom</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Corridor">Corridor</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Other">Other</option>
                </select>
                <select className="form-select" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })} style={{ width: 140 }}>
                    <option value="">All Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-container"><div className="spinner" /></div>
            ) : issues.length === 0 ? (
                <div className="empty-state glass">
                    <div className="empty-icon">📋</div>
                    <h3>No reports found</h3>
                    <p>{filters.search || filters.status || filters.category || filters.priority ? 'Try adjusting your filters' : "You haven't reported any issues yet"}</p>
                    <Link to="/report" className="btn btn-primary">
                        <FilePlus size={18} /> Report Issue
                    </Link>
                </div>
            ) : (
                <>
                    <div className="issues-grid">
                        {issues.map(issue => (
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
                                            {issue.location?.building && <><span>•</span><span>{issue.location.building}</span></>}
                                        </div>
                                    </div>
                                    <div className="issue-badges">
                                        <span className={`priority-badge ${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button disabled={pagination.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
                                Prev
                            </button>
                            {Array.from({ length: pagination.pages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={pagination.page === i + 1 ? 'active' : ''}
                                    onClick={() => setFilters({ ...filters, page: i + 1 })}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button disabled={pagination.page >= pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
