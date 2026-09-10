import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getIssues } from '../services/api';
import { Search, ArrowLeft } from 'lucide-react';

export default function AdminIssues() {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '', page: 1 });

    useEffect(() => { fetchIssues(); }, [filters]);

    const fetchIssues = async () => {
        setLoading(true);
        try {
            const params = { page: filters.page, limit: 15 };
            if (filters.status) params.status = filters.status;
            if (filters.category) params.category = filters.category;
            if (filters.priority) params.priority = filters.priority;
            if (filters.search) params.search = filters.search;
            const res = await getIssues(params);
            setIssues(res.data.issues);
            setPagination(res.data.pagination);
        } catch { }
        setLoading(false);
    };

    const getStatusClass = (s) => s.toLowerCase().replace(' ', '-');

    return (
        <div className="page">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                    <h1>All Issues</h1>
                    <p>Manage and update all reported campus issues</p>
                </div>
                <Link to="/admin" className="btn btn-ghost btn-sm">
                    <ArrowLeft size={16} /> Dashboard
                </Link>
            </div>

            <div className="filter-bar">
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search issues..."
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
                    <h3>No issues found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            ) : (
                <>
                    <div className="table-container glass">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Reporter</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.map(issue => (
                                    <tr key={issue._id} onClick={() => window.location.href = `/admin/issues/${issue._id}`}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-light)' }}>{issue.issueId}</td>
                                        <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>{issue.reportedBy?.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{issue.reportedBy?.studentId || issue.reportedBy?.email}</div>
                                        </td>
                                        <td>{issue.category}</td>
                                        <td><span className={`priority-badge ${issue.priority.toLowerCase()}`}>{issue.priority}</span></td>
                                        <td><span className={`status-badge ${getStatusClass(issue.status)}`}><span className="status-dot" />{issue.status}</span></td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(issue.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button disabled={pagination.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Prev</button>
                            {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => (
                                <button key={i + 1} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => setFilters({ ...filters, page: i + 1 })}>{i + 1}</button>
                            ))}
                            <button disabled={pagination.page >= pagination.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
