import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoIcon, ChatIcon, CalendarIcon, UploadIcon, AnalyticsIcon, LogoutIcon } from '../components/Icons';
import '../styles/Dashboard.css';

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    // Role-based nav items
    const navItems = [
        { to: '/chat', label: 'Chat Assistant', icon: <ChatIcon />, roles: ['employee', 'hr', 'admin'] },
        { to: '/leave', label: 'Leave Management', icon: <CalendarIcon />, roles: ['employee', 'hr', 'admin'] },
        { to: '/upload', label: 'Upload Documents', icon: <UploadIcon />, roles: ['hr', 'admin'] },
        { to: '/analytics', label: 'Admin Analytics', icon: <AnalyticsIcon />, roles: ['admin'] },
    ];

    const visibleNav = navItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="dashboard-shell">
            {/* ── SIDEBAR ── */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <LogoIcon size={28} />
                    <div className="logo-text">
                        <span className="logo-name">OpsMind</span>
                        <span className="logo-suffix">AI</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {visibleNav.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{getInitials(user.name)}</div>
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{user.name}</span>
                            <span className="sidebar-user-role">{user.role}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div className="main-area">
                {/* Top header */}
                <header className="top-header">
                    <div className="header-user-info">
                        <span className="header-user-name">{user.name}</span>
                        <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </div>
                    <div className="ai-status">
                        <span className="ai-status-dot" />
                        AI Online
                    </div>
                    <div className="header-divider" />
                    <button className="logout-btn" onClick={handleLogout} id="logout-btn">
                        <LogoutIcon />
                        Logout
                    </button>
                </header>

                {/* Content */}
                <div className="content-area">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
