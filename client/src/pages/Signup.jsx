import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signup as signupAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, GraduationCap, Building, AlertCircle } from 'lucide-react';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', studentId: '', department: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await signupAPI({
                name: form.name,
                email: form.email,
                password: form.password,
                studentId: form.studentId,
                department: form.department
            });
            loginUser(res.data.token, res.data.user);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Signup failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass" style={{ maxWidth: 480 }}>
                <div className="auth-logo">
                    <div className="logo-icon" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'white', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>✓</div>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>FixIt</span>
                </div>
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join the campus complaint portal</p>

                {error && (
                    <div className="error-message">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><User size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Full Name <span className="required">*</span></label>
                        <input type="text" name="name" className="form-input" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label><Mail size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Email <span className="required">*</span></label>
                        <input type="email" name="email" className="form-input" placeholder="your.email@college.edu" value={form.email} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><GraduationCap size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Student ID</label>
                            <input type="text" name="studentId" className="form-input" placeholder="e.g. CS2024001" value={form.studentId} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label><Building size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Department</label>
                            <input type="text" name="department" className="form-input" placeholder="e.g. Computer Science" value={form.department} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Password <span className="required">*</span></label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                className="form-input"
                                placeholder="Minimum 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Confirm Password <span className="required">*</span></label>
                        <input type="password" name="confirmPassword" className="form-input" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><UserPlus size={18} /> Create Account</>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
