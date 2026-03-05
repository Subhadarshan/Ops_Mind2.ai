import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from '../components/Icons';
import '../styles/Auth.css';

const ROLES = [
    { value: 'employee', label: 'Employee' },
    { value: 'hr', label: 'HR' },
    { value: 'admin', label: 'Admin' },
];

export default function SignupPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('employee');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
        if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
        setLoading(true);
        const result = await register(name, email, password, role);
        if (!result.success) {
            setError(result.message);
            setLoading(false);
        } else {
            // Account created — redirect to login with success flag
            navigate('/login?registered=true');
        }
    }

    return (
        <div className="auth-page">
            {/* ── Brand Panel ── */}
            <div className="auth-brand">
                <div className="brand-logo">
                    <LogoIcon size={48} />
                    <div className="brand-logo-text">
                        <span className="brand-logo-name">OpsMind</span>
                        <span className="brand-logo-badge">AI</span>
                    </div>
                </div>
                <p className="brand-tagline">Your corporate knowledge, instantly accessible.</p>
                <p className="brand-desc">AI-powered answers from your internal documents — policies, procedures, and more.</p>
                <div className="brand-features">
                    <div className="brand-feature"><span className="brand-feature-dot" />Instant Answers</div>
                    <div className="brand-feature"><span className="brand-feature-dot" />Document Citations</div>
                    <div className="brand-feature"><span className="brand-feature-dot" />Role-Based Access</div>
                </div>
            </div>

            {/* ── Form Panel ── */}
            <div className="auth-form-panel">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <h1 className="auth-card-title">Create your account</h1>
                        <p className="auth-card-subtitle">Get started with OpsMind AI</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="signup-name">Full name</label>
                            <input id="signup-name" className="form-input" type="text" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} autoFocus />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="signup-email">Email address</label>
                            <input id="signup-email" className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="signup-password">Password</label>
                            <input id="signup-password" className="form-input" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Role</label>
                            <div className="role-selector">
                                {ROLES.map(r => (
                                    <div key={r.value} className={`role-option ${role === r.value ? 'selected' : ''}`} onClick={() => setRole(r.value)}>
                                        <span className="role-option-label">{r.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
