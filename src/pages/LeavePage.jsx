import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Leave.css';
import '../styles/Auth.css'; // Reuse form styles
import '../styles/Upload.css'; // Reuse table styles

const INITIAL_LEAVES = [
    { id: 1, user: 'Alex Carter', email: 'employee@opsmind.ai', type: 'Annual Leave', startDate: '2026-03-10', endDate: '2026-03-14', status: 'approved' },
    { id: 2, user: 'Jordan Park', email: 'admin@opsmind.ai', type: 'Sick Leave', startDate: '2026-02-15', endDate: '2026-02-16', status: 'approved' },
    { id: 3, user: 'Alex Carter', email: 'employee@opsmind.ai', type: 'Personal', startDate: '2026-04-01', endDate: '2026-04-02', status: 'pending' },
];

export default function LeavePage() {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState(() => {
        const saved = localStorage.getItem('opsmind_leaves');
        return saved ? JSON.parse(saved) : INITIAL_LEAVES;
    });

    useEffect(() => {
        localStorage.setItem('opsmind_leaves', JSON.stringify(leaves));
    }, [leaves]);

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ type: 'Annual Leave', startDate: '', endDate: '', attachment: null });

    // Filter leaves based on role
    const isAdminOrHR = user.role === 'admin' || user.role === 'hr';
    const visibleLeaves = isAdminOrHR ? leaves : leaves.filter(l => l.email === user.email);

    // Stats
    const userLeaves = leaves.filter(l => l.email === user.email);
    const approvedTotal = userLeaves.filter(l => l.status === 'approved').length;
    const pendingTotal = userLeaves.filter(l => l.status === 'pending').length;

    function handleRequestLeave(e) {
        e.preventDefault();
        if (!form.startDate || !form.endDate) return;

        const newLeave = {
            id: Date.now(),
            user: user.name,
            email: user.email,
            type: form.type,
            startDate: form.startDate,
            endDate: form.endDate,
            attachment: form.attachment ? form.attachment.name : null,
            status: 'pending'
        };

        setLeaves([newLeave, ...leaves]);
        setShowModal(false);
        setForm({ type: 'Annual Leave', startDate: '', endDate: '', attachment: null });
    }

    function handleStatusChange(id, newStatus) {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    }

    return (
        <div className="leave-page">
            <header className="leave-page-header">
                <div>
                    <h1 className="leave-page-title">Leave Management</h1>
                    <p className="leave-page-subtitle">
                        {isAdminOrHR ? 'Manage team leave requests' : 'Manage your time off requests'}
                    </p>
                </div>
                {!isAdminOrHR && (
                    <button className="leave-btn" onClick={() => setShowModal(true)}>
                        + Request Leave
                    </button>
                )}
            </header>

            <div className="leave-content">
                {/* Metric Cards */}
                {!isAdminOrHR && (
                    <div className="leave-cards">
                        <div className="leave-card">
                            <div className="leave-card-title">Available Annual Leave</div>
                            <div className="leave-card-value">18 Days</div>
                        </div>
                        <div className="leave-card">
                            <div className="leave-card-title">Approved Requests</div>
                            <div className="leave-card-value">{approvedTotal}</div>
                        </div>
                        <div className="leave-card">
                            <div className="leave-card-title">Pending Requests</div>
                            <div className="leave-card-value">{pendingTotal}</div>
                        </div>
                    </div>
                )}

                {isAdminOrHR && (
                    <div className="leave-cards">
                        <div className="leave-card">
                            <div className="leave-card-title">Total Requests</div>
                            <div className="leave-card-value">{leaves.length}</div>
                        </div>
                        <div className="leave-card">
                            <div className="leave-card-title">Pending Approval</div>
                            <div className="leave-card-value">{leaves.filter(l => l.status === 'pending').length}</div>
                        </div>
                    </div>
                )}

                {/* Leaves Table */}
                <div className="table-card leave-table-card">
                    <div className="table-card-header">
                        <span className="table-card-title">{isAdminOrHR ? 'All Team Requests' : 'Your Leave History'}</span>
                    </div>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {isAdminOrHR && <th>Employee</th>}
                                    <th>Type</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Attachment</th>
                                    <th>Status</th>
                                    {isAdminOrHR && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {visibleLeaves.map(leave => (
                                    <tr key={leave.id}>
                                        {isAdminOrHR && <td style={{ fontWeight: 500 }}>{leave.user}</td>}
                                        <td>{leave.type}</td>
                                        <td>{leave.startDate}</td>
                                        <td>{leave.endDate}</td>
                                        <td>
                                            {leave.attachment ? (
                                                <span onClick={() => alert('Simulating downloading certificate: ' + leave.attachment)} style={{ fontSize: 12, color: 'var(--indigo-500)', cursor: 'pointer', textDecoration: 'underline' }} title="View Document">{leave.attachment}</span>
                                            ) : (
                                                <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>None</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-pill ${leave.status}`}>
                                                <span className="status-pill-dot" />
                                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                            </span>
                                        </td>
                                        {isAdminOrHR && (
                                            <td>
                                                {leave.status === 'pending' ? (
                                                    <div style={{ display: 'flex', gap: 6 }}>
                                                        <button onClick={() => handleStatusChange(leave.id, 'approved')} style={{ background: 'var(--green-100)', color: 'var(--green-800)', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Approve</button>
                                                        <button onClick={() => handleStatusChange(leave.id, 'rejected')} style={{ background: 'var(--red-100)', color: 'var(--red-800)', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Processed</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visibleLeaves.length === 0 && (
                            <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-500)', fontSize: 14 }}>
                                No leave requests found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for new request */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-header">Request Time Off</h2>
                        <form onSubmit={handleRequestLeave} className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Leave Type</label>
                                <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option>Annual Leave</option>
                                    <option>Sick Leave</option>
                                    <option>Personal</option>
                                    <option>Unpaid</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input type="date" className="form-input" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date</label>
                                <input type="date" className="form-input" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Attachment (Optional)</label>
                                <input type="file" className="form-input" onChange={e => setForm({ ...form, attachment: e.target.files[0] })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="modal-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="leave-btn">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
