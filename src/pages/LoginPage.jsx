import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from '../components/Icons';
import '../styles/Auth.css';

// Returns the home route for a given role
function roleHomeRoute(role) {
    if (role === 'admin') return '/analytics';
    if (role === 'hr') return '/upload';
    return '/chat'; // employee default
}

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const justRegistered = searchParams.get('registered') === 'true';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Please fill in all fields.'); return; }
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);
        if (!result.success) {
            setError(result.message);
        } else {
            // Redirect to the dashboard page specific to the user's role
            navigate(roleHomeRoute(result.role), { replace: true });
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
                        <h1 className="auth-card-title">Sign in to OpsMind AI</h1>
                        <p className="auth-card-subtitle">Enter your corporate credentials to continue</p>
                    </div>

                    {/* Success banner shown after account creation */}
                    {justRegistered && (
                        <div className="auth-success">
                            ✅ Account created successfully! Please sign in.
                        </div>
                    )}

                    {error && <div className="auth-error">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email address</label>
                            <input
                                id="login-email"
                                className="form-input"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                className="form-input"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
