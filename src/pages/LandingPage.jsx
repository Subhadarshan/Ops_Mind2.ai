import { Link } from 'react-router-dom';
import { LogoIcon } from '../components/Icons';
import '../styles/Landing.css';

export default function LandingPage() {
    return (
        <div className="landing-page">

            <nav className="landing-nav">
                <Link to="/" className="landing-brand">
                    <LogoIcon size={32} />
                    <div className="landing-logo-text">
                        OpsMind <span className="landing-logo-badge">AI</span>
                    </div>
                </Link>
                <div className="landing-nav-actions">
                    <Link to="/login" className="btn-login">Log in</Link>
                    <Link to="/signup" className="btn-signup">Sign up</Link>
                </div>
            </nav>

         
            <main className="landing-hero">
                <div className="hero-pill">
                    <span className="hero-pill-dot" />
                    The Future of Internal Support
                </div>

                <h1 className="hero-title">
                    Enterprise <span className="neon-text">Knowledge</span>, <br />Illuminated.
                </h1>

                <p className="hero-subtitle">
                    OpsMind AI connects employees with instantaneous, role-based answers from your organization's internal documents, policies, and procedures. Let AI handle the repetitive questions.
                </p>

                <div className="hero-cta">
                     <Link to="/signup" className="btn-primary">Get Started</Link>
                    <Link to="/login" className="btn-login" style={{ fontSize: 16 }}>View Demo</Link>
                </div>
            </main>
        </div>
    );
}
