import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { createIssue } from '../services/api';
import toast from 'react-hot-toast';
import {
    Droplets, Trash2, ShowerHead, School, Footprints, Zap, Armchair, HelpCircle,
    Camera, MapPin, ChevronLeft, ChevronRight, Send, CheckCircle, X, Upload, Locate, FileText
} from 'lucide-react';

const CATEGORIES = [
    { name: 'Water/Leakage', icon: '💧', desc: 'Leaking taps, pipes, water logging' },
    { name: 'Garbage', icon: '🗑️', desc: 'Overflowing bins, litter, waste' },
    { name: 'Washroom', icon: '🚿', desc: 'Unclean washrooms, broken fixtures' },
    { name: 'Classroom', icon: '🏫', desc: 'Dirty classrooms, broken equipment' },
    { name: 'Corridor', icon: '🚶', desc: 'Hallway cleanliness, obstructions' },
    { name: 'Electrical', icon: '⚡', desc: 'Broken lights, wiring issues' },
    { name: 'Furniture', icon: '🪑', desc: 'Broken desks, chairs, fixtures' },
    { name: 'Other', icon: '📋', desc: 'Any other maintenance issue' }
];

const STEPS = ['Category', 'Details', 'Photos', 'Location', 'Review'];

export default function ReportIssue() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState({
        category: '', title: '', description: '', priority: 'Medium',
        building: '', floor: '', room: ''
    });
    const [photos, setPhotos] = useState([]);
    const [location, setLocation] = useState(null);
    const [locLoading, setLocLoading] = useState(false);

    const onDrop = useCallback((accepted) => {
        const newPhotos = accepted.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
        setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
        maxFiles: 5, maxSize: 10 * 1024 * 1024
    });

    const removePhoto = (idx) => {
        setPhotos(prev => prev.filter((_, i) => i !== idx));
    };

    const captureLocation = async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocLoading(false);
                toast.success('Location captured!');
            },
            (err) => {
                toast.error('Location access denied');
                setLocLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const canProceed = () => {
        switch (step) {
            case 0: return !!form.category;
            case 1: return form.title.length >= 5 && form.description.length >= 10;
            case 2: return true; // photos optional
            case 3: return true; // location optional
            case 4: return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('category', form.category);
            formData.append('priority', form.priority);
            formData.append('building', form.building);
            formData.append('floor', form.floor);
            formData.append('room', form.room);
            if (location) {
                formData.append('latitude', location.lat);
                formData.append('longitude', location.lng);
            }
            photos.forEach(photo => formData.append('photos', photo));

            const res = await createIssue(formData);
            setSuccess(res.data.issue);
            toast.success('Issue reported successfully!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="success-overlay">
                <div className="success-modal glass">
                    <div className="success-icon"><CheckCircle size={32} /></div>
                    <h2>Issue Reported!</h2>
                    <div className="issue-code">{success.issueId}</div>
                    <p>Your complaint has been submitted successfully. You can track it from your reports page.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={() => navigate('/my-reports')}>
                            <FileText size={16} /> My Reports
                        </button>
                        <button className="btn btn-primary" onClick={() => { setSuccess(null); setStep(0); setForm({ category: '', title: '', description: '', priority: 'Medium', building: '', floor: '', room: '' }); setPhotos([]); setLocation(null); }}>
                            Report Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="page-header">
                <h1>Report an Issue</h1>
                <p>Help keep your campus clean by reporting maintenance issues</p>
            </div>

            {/* Step Indicator */}
            <div className="form-steps">
                {STEPS.map((s, i) => (
                    <div key={s} style={{ display: 'contents' }}>
                        <div className={`form-step ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}>
                            <div className="step-number">{i < step ? '✓' : i + 1}</div>
                            <span className="step-label">{s}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`step-divider ${i < step ? 'completed' : ''}`} />}
                    </div>
                ))}
            </div>

            <div className="glass" style={{ padding: 0 }}>
                <div className="form-step-content">
                    {/* Step 0: Category */}
                    {step === 0 && (
                        <>
                            <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}>Select Category</h3>
                            <div className="category-grid">
                                {CATEGORIES.map(cat => (
                                    <div
                                        key={cat.name}
                                        className={`category-card ${form.category === cat.name ? 'selected' : ''}`}
                                        onClick={() => setForm({ ...form, category: cat.name })}
                                    >
                                        <div className="cat-icon">{cat.icon}</div>
                                        <div className="cat-name">{cat.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{cat.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Step 1: Details */}
                    {step === 1 && (
                        <>
                            <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}>Issue Details</h3>
                            <div className="form-group">
                                <label>Title <span className="required">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Brief title for the issue (min 5 chars)"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    maxLength={200}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description <span className="required">*</span></label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Describe the issue in detail (min 10 chars)"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    maxLength={2000}
                                    rows={4}
                                />
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {['Low', 'Medium', 'High', 'Critical'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            className={`status-option ${form.priority === p ? 'selected' : ''}`}
                                            style={form.priority === p ? {
                                                background: p === 'Low' ? 'var(--green-glow)' : p === 'Medium' ? 'rgba(6,182,212,0.12)' : p === 'High' ? 'var(--yellow-glow)' : 'var(--red-glow)',
                                                borderColor: p === 'Low' ? 'var(--green)' : p === 'Medium' ? 'var(--cyan)' : p === 'High' ? 'var(--yellow)' : 'var(--red)',
                                                color: p === 'Low' ? 'var(--green)' : p === 'Medium' ? 'var(--cyan)' : p === 'High' ? 'var(--yellow)' : 'var(--red)',
                                            } : {}}
                                            onClick={() => setForm({ ...form, priority: p })}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 2: Photos */}
                    {step === 2 && (
                        <>
                            <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}>Capture or Upload Photos</h3>

                            {/* Camera Capture Button */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <label className="btn btn-primary" style={{ cursor: 'pointer', flex: 1, minWidth: 180 }}>
                                    <Camera size={18} /> Take Photo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const photoFile = Object.assign(file, { preview: URL.createObjectURL(file) });
                                                setPhotos(prev => [...prev, photoFile].slice(0, 5));
                                            }
                                            e.target.value = '';
                                        }}
                                        disabled={photos.length >= 5}
                                    />
                                </label>
                                <label className="btn btn-secondary" style={{ cursor: 'pointer', flex: 1, minWidth: 180 }}>
                                    <Upload size={18} /> Choose from Gallery
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        multiple
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            const newPhotos = files.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
                                            setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
                                            e.target.value = '';
                                        }}
                                        disabled={photos.length >= 5}
                                    />
                                </label>
                            </div>

                            {/* Drag & Drop Zone */}
                            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                                <input {...getInputProps()} />
                                <div className="dropzone-icon"><Upload size={36} /></div>
                                <div className="dropzone-text">
                                    Or <strong>drag and drop</strong> photos here
                                </div>
                                <div className="dropzone-hint">JPEG, PNG, WebP, GIF up to 10MB • {5 - photos.length} slots remaining</div>
                            </div>
                            {photos.length > 0 && (
                                <div className="photo-previews">
                                    {photos.map((photo, i) => (
                                        <div key={i} className="photo-preview">
                                            <img src={photo.preview} alt={`Preview ${i + 1}`} />
                                            <button className="remove-photo" onClick={() => removePhoto(i)}>
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                📸 {photos.length}/5 photos added. All photos will be stored with your complaint.
                            </div>
                        </>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <>
                            <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}>Location Details</h3>
                            <div className="location-capture">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>GPS Location</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Capture your current location for precise tracking</div>
                                    </div>
                                    <button className="btn btn-secondary btn-sm" onClick={captureLocation} disabled={locLoading}>
                                        {locLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><Locate size={16} /> {location ? 'Recapture' : 'Capture'}</>}
                                    </button>
                                </div>
                                {location && (
                                    <div className="location-coords" style={{ marginTop: '0.75rem' }}>
                                        <div className="location-status"><MapPin size={14} /> Location captured</div>
                                        <span className="coord">Lat: {location.lat.toFixed(6)}</span>
                                        <span className="coord">Lng: {location.lng.toFixed(6)}</span>
                                    </div>
                                )}
                            </div>
                            <div className="form-row" style={{ marginTop: '1.25rem' }}>
                                <div className="form-group">
                                    <label>Building</label>
                                    <input type="text" className="form-input" placeholder="e.g. Main Block" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Floor</label>
                                    <input type="text" className="form-input" placeholder="e.g. 2nd Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Room / Area</label>
                                <input type="text" className="form-input" placeholder="e.g. Room 204, Corridor near Lab" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
                            </div>
                        </>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <>
                            <h3 style={{ marginBottom: '1.25rem', fontWeight: 700, fontSize: '1.1rem' }}>Review & Submit</h3>
                            <div className="glass" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
                                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Category</span>
                                    <span style={{ fontWeight: 600 }}>{form.category}</span>
                                </div>
                                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Title</span>
                                    <span style={{ fontWeight: 600 }}>{form.title}</span>
                                </div>
                                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Priority</span>
                                    <span className={`priority-badge ${form.priority.toLowerCase()}`}>{form.priority}</span>
                                </div>
                                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Photos</span>
                                    <span style={{ fontWeight: 600 }}>{photos.length} attached</span>
                                </div>
                                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Location</span>
                                    <span style={{ fontWeight: 600 }}>{location ? '📍 Captured' : 'Not set'}</span>
                                </div>
                                {(form.building || form.floor || form.room) && (
                                    <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Place</span>
                                        <span style={{ fontWeight: 600 }}>{[form.building, form.floor, form.room].filter(Boolean).join(', ')}</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <strong>Description:</strong> {form.description}
                            </div>
                            {photos.length > 0 && (
                                <div className="photo-previews" style={{ marginTop: '1rem' }}>
                                    {photos.map((photo, i) => (
                                        <div key={i} className="photo-preview">
                                            <img src={photo.preview} alt={`Preview ${i + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Navigation */}
                <div className="form-actions" style={{ padding: '0 2rem 2rem' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 0}
                    >
                        <ChevronLeft size={16} /> Back
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canProceed()}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={loading}>
                            {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : <><Send size={18} /> Submit Report</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
