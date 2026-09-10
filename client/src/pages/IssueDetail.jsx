import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getIssue } from '../services/api';
import { ArrowLeft, MapPin, Calendar, User, Tag, AlertTriangle, Clock } from 'lucide-react';

export default function IssueDetail() {
    const { id } = useParams();
    const [issue, setIssue] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIssue = async () => {
            try {
                const res = await getIssue(id);
                setIssue(res.data.issue);
                setUpdates(res.data.updates);
            } catch { }
            setLoading(false);
        };
        fetchIssue();
    }, [id]);

    const getStatusClass = (s) => s.toLowerCase().replace(' ', '-');
    const formatDate = (d) => new Date(d).toLocaleString();

    if (loading) return <div className="loading-container" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
    if (!issue) return <div className="page"><div className="empty-state glass"><div className="empty-icon">🔍</div><h3>Issue not found</h3><p>The requested issue could not be found.</p><Link to="/my-reports" className="btn btn-primary">Back to Reports</Link></div></div>;

    return (
        <div className="page">
            <Link to="/my-reports" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
                <ArrowLeft size={16} /> Back to Reports
            </Link>

            <div className="issue-detail-header">
                <div>
                    <div className="issue-detail-id">{issue.issueId}</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0' }}>{issue.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className={`status-badge ${getStatusClass(issue.status)}`}><span className="status-dot" />{issue.status}</span>
                        <span className={`priority-badge ${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{issue.category}</span>
                    </div>
                </div>
            </div>

            <div className="detail-grid">
                <div className="detail-main">
                    {/* Description */}
                    <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Description</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{issue.description}</p>
                    </div>

                    {/* Photos */}
                    {issue.photos && issue.photos.length > 0 && (
                        <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Photos</h3>
                            <div className="issue-photos">
                                {issue.photos.map((photo, i) => (
                                    <img key={i} src={photo} alt={`Issue photo ${i + 1}`} onClick={() => window.open(photo, '_blank')} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resolution Photo */}
                    {issue.resolutionPhoto && (
                        <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--green)' }}>Resolution Photo</h3>
                            <div className="issue-photos">
                                <img src={issue.resolutionPhoto} alt="Resolution" onClick={() => window.open(issue.resolutionPhoto, '_blank')} />
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Activity Timeline</h3>
                        {updates.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No updates yet</p>
                        ) : (
                            <div className="timeline">
                                {updates.map((update, i) => (
                                    <div key={update._id} className={`timeline-item ${update.toStatus ? getStatusClass(update.toStatus) : ''}`}>
                                        <div className="timeline-header">
                                            {update.fromStatus ? (
                                                <>
                                                    <span className="timeline-status">{update.fromStatus}</span>
                                                    <span className="timeline-arrow">→</span>
                                                    <span className="timeline-status" style={{ color: update.toStatus === 'Resolved' ? 'var(--green)' : update.toStatus === 'In Progress' ? 'var(--yellow)' : 'var(--accent-light)' }}>
                                                        {update.toStatus}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="timeline-status">{update.toStatus || 'Update'}</span>
                                            )}
                                        </div>
                                        <div className="timeline-user">
                                            {update.updatedBy?.name} ({update.updatedBy?.role})
                                        </div>
                                        <div className="timeline-time">{formatDate(update.createdAt)}</div>
                                        {update.note && <div className="timeline-note">{update.note}</div>}
                                        {update.photo && <img className="timeline-photo" src={update.photo} alt="Update" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail-sidebar">
                    <div className="detail-info-card glass">
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Details</h4>
                        <div className="info-row">
                            <span className="info-label"><Tag size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Issue ID</span>
                            <span className="info-value" style={{ fontFamily: 'monospace' }}>{issue.issueId}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label"><Calendar size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Reported</span>
                            <span className="info-value">{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label"><User size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Reporter</span>
                            <span className="info-value">{issue.reportedBy?.name}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label"><AlertTriangle size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Category</span>
                            <span className="info-value">{issue.category}</span>
                        </div>
                        {issue.resolvedAt && (
                            <div className="info-row">
                                <span className="info-label"><Clock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Resolved</span>
                                <span className="info-value" style={{ color: 'var(--green)' }}>{new Date(issue.resolvedAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>

                    {(issue.location?.building || issue.location?.floor || issue.location?.room) && (
                        <div className="detail-info-card glass">
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                <MapPin size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Location
                            </h4>
                            {issue.location.building && (
                                <div className="info-row"><span className="info-label">Building</span><span className="info-value">{issue.location.building}</span></div>
                            )}
                            {issue.location.floor && (
                                <div className="info-row"><span className="info-label">Floor</span><span className="info-value">{issue.location.floor}</span></div>
                            )}
                            {issue.location.room && (
                                <div className="info-row"><span className="info-label">Room</span><span className="info-value">{issue.location.room}</span></div>
                            )}
                            {issue.location.coordinates && issue.location.coordinates[0] !== 0 && (
                                <div className="info-row">
                                    <span className="info-label">GPS</span>
                                    <span className="info-value" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                        {issue.location.coordinates[1].toFixed(4)}, {issue.location.coordinates[0].toFixed(4)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
