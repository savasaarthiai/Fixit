import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardAnalytics } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { FileText, Clock, CheckCircle2, AlertTriangle, Users, Timer, TrendingUp, List } from 'lucide-react';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#f97316', '#64748b'];

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await getDashboardAnalytics();
                setData(res.data);
            } catch { }
            setLoading(false);
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="loading-container" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
    if (!data) return <div className="page"><div className="empty-state glass"><div className="empty-icon">📊</div><h3>Failed to load analytics</h3></div></div>;

    const { overview, categoryBreakdown, priorityBreakdown, monthlyTrend, recentIssues } = data;

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '0.75rem', backdropFilter: 'blur(10px)', fontSize: '0.8rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
                ))}
            </div>
        );
    };

    return (
        <div className="page">
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                    <h1>Admin Dashboard</h1>
                    <p>Campus maintenance analytics and overview</p>
                </div>
                <Link to="/admin/issues" className="btn btn-primary">
                    <List size={18} /> Manage Issues
                </Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass accent">
                    <div className="stat-icon"><FileText size={22} /></div>
                    <div className="stat-value">{overview.totalIssues}</div>
                    <div className="stat-label">Total Issues</div>
                </div>
                <div className="stat-card glass yellow">
                    <div className="stat-icon"><Clock size={22} /></div>
                    <div className="stat-value">{overview.reported}</div>
                    <div className="stat-label">Open / Reported</div>
                </div>
                <div className="stat-card glass cyan">
                    <div className="stat-icon"><AlertTriangle size={22} /></div>
                    <div className="stat-value">{overview.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card glass green">
                    <div className="stat-icon"><CheckCircle2 size={22} /></div>
                    <div className="stat-value">{overview.resolved + overview.closed}</div>
                    <div className="stat-label">Resolved</div>
                </div>
                <div className="stat-card glass red">
                    <div className="stat-icon"><Users size={22} /></div>
                    <div className="stat-value">{overview.totalStudents}</div>
                    <div className="stat-label">Students</div>
                </div>
                <div className="stat-card glass accent">
                    <div className="stat-icon"><Timer size={22} /></div>
                    <div className="stat-value">{overview.avgResolutionHours}h</div>
                    <div className="stat-label">Avg Resolution</div>
                </div>
            </div>

            <div className="charts-grid">
                {/* Monthly Trend */}
                <div className="chart-card glass">
                    <h3><TrendingUp size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Monthly Trend</h3>
                    {monthlyTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="reported" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} name="Reported" />
                                <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Resolved" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="chart-card glass">
                    <h3>Category Breakdown</h3>
                    {categoryBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie data={categoryBreakdown} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {categoryBreakdown.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>
                    )}
                </div>

                {/* Priority Breakdown */}
                <div className="chart-card glass">
                    <h3>Priority Distribution</h3>
                    {priorityBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={priorityBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Issues">
                                    {priorityBreakdown.map((entry, i) => {
                                        const colorMap = { Low: '#22c55e', Medium: '#06b6d4', High: '#f59e0b', Critical: '#ef4444' };
                                        return <Cell key={i} fill={colorMap[entry.name] || COLORS[i]} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No data yet</p>
                    )}
                </div>

                {/* Recent Issues */}
                <div className="chart-card glass">
                    <h3>Recent Issues</h3>
                    {recentIssues && recentIssues.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {recentIssues.map(issue => (
                                <Link key={issue._id} to={`/admin/issues/${issue._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', transition: 'var(--transition)' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-light)', fontFamily: 'monospace', fontWeight: 700 }}>{issue.issueId}</span>
                                            <span style={{ fontSize: '0.85rem', marginLeft: '0.75rem', color: 'var(--text-primary)' }}>{issue.title}</span>
                                        </div>
                                        <span className={`status-badge ${issue.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '0.65rem' }}>
                                            <span className="status-dot" />
                                            {issue.status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No issues yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
