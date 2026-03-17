import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Upload.css';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBytes(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function UploadPage() {
    const { token } = useAuth();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dragover, setDragover] = useState(false);
    const [uploading, setUploading] = useState(null); // { name, progress }
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
    const [deletingId, setDeletingId] = useState(null);
    const fileRef = useRef(null);

    // ── Fetch document list ──
    const fetchDocs = useCallback(async () => {
        try {
            const res = await fetch('/api/documents', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setDocs(data.data);
        } catch (e) {
            showToast('error', 'Failed to load documents.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDocs();
    }, [fetchDocs]);

    function showToast(type, message) {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    }

    // ── Real upload via FormData ──
    async function handleUpload(file) {
        if (!file) return;

        // Validate client-side
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            return showToast('error', 'Only PDF files are supported.');
        }
        if (file.size > 50 * 1024 * 1024) {
            return showToast('error', 'File exceeds the 50 MB limit.');
        }

        setUploading({ name: file.name, progress: 0 });

        // Simulate indeterminate progress while XHR runs
        let prog = 0;
        const ticker = setInterval(() => {
            prog = Math.min(prog + Math.random() * 12, 85);
            setUploading(u => u ? { ...u, progress: Math.floor(prog) } : null);
        }, 300);

        try {
            const formData = new FormData();
            formData.append('document', file);

            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            clearInterval(ticker);
            setUploading(u => u ? { ...u, progress: 100 } : null);

            const data = await res.json();

            setTimeout(() => {
                setUploading(null);
                if (data.success) {
                    showToast('success', data.message || 'Document indexed successfully!');
                    fetchDocs(); // refresh list
                } else {
                    showToast('error', data.message || 'Upload failed.');
                }
            }, 500);
        } catch (err) {
            clearInterval(ticker);
            setUploading(null);
            showToast('error', 'Network error during upload.');
        }
    }

    // ── Delete handler ──
    async function deleteDoc(id, name) {
        if (!window.confirm(`Delete "${name}"?`)) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                showToast('success', data.message);
                setDocs(prev => prev.filter(d => d._id !== id));
            } else {
                showToast('error', data.message);
            }
        } catch {
            showToast('error', 'Failed to delete document.');
        } finally {
            setDeletingId(null);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragover(false);
        if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files[0]);
    }

    function handleFileSelect(e) {
        if (e.target.files.length) handleUpload(e.target.files[0]);
        e.target.value = '';
    }

    return (
        <div className="upload-page">
            {/* Toast */}
            {toast && (
                <div className={`upload-toast upload-toast--${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}

            <header className="upload-page-header">
                <div>
                    <h1 className="upload-page-title">Upload Documents</h1>
                    <p className="upload-page-subtitle">
                        Add PDF documents to the knowledge base — employees can instantly query them via the chatbot
                    </p>
                </div>
            </header>

            <div className="upload-content">
                {/* Drop zone */}
                <div
                    className={`drop-zone ${dragover ? 'dragover' : ''}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragover(true); }}
                    onDragLeave={() => setDragover(false)}
                    onDrop={handleDrop}
                    id="drop-zone"
                >
                    <div className="drop-zone-inner">
                        <div className="drop-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <p className="drop-text">Drag &amp; drop PDF files here</p>
                        <p className="drop-subtext">or click to browse files</p>
                        <span className="drop-formats">Supported: PDF — Max 50 MB per file</span>
                    </div>
                    <input ref={fileRef} type="file" accept=".pdf" hidden onChange={handleFileSelect} />
                </div>

                {/* Upload Progress */}
                {uploading && (
                    <div className="upload-progress-card">
                        <div className="progress-header">
                            <span className="progress-filename">📄 {uploading.name}</span>
                            <span className="progress-percent">{uploading.progress}%</span>
                        </div>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${uploading.progress}%` }} />
                        </div>
                        <p className="progress-label">
                            {uploading.progress < 90 ? 'Uploading & extracting text…' : 'Indexing document…'}
                        </p>
                    </div>
                )}

                {/* Table */}
                <div className="table-card">
                    <div className="table-card-header">
                        <h2 className="table-card-title">Knowledge Base Documents</h2>
                        <span className="doc-count">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
                    </div>

                    {loading ? (
                        <div className="docs-loading">Loading documents…</div>
                    ) : docs.length === 0 ? (
                        <div className="docs-empty">
                            <span>📭</span>
                            <p>No documents yet. Upload a PDF to get started.</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table" id="doc-table">
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Size</th>
                                        <th>Upload Date</th>
                                        <th>Status</th>
                                        <th>Uploaded By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docs.map(doc => (
                                        <tr key={doc._id}>
                                            <td style={{ fontWeight: 500 }}>📄 {doc.name}</td>
                                            <td>{formatBytes(doc.size)}</td>
                                            <td>{formatDate(doc.createdAt)}</td>
                                            <td>
                                                <span className={`status-pill ${doc.status}`}>
                                                    <span className="status-pill-dot" />
                                                    {doc.status === 'indexed' ? 'Indexed' : 'Processing'}
                                                </span>
                                            </td>
                                            <td>{doc.uploadedBy?.name || '—'}</td>
                                            <td>
                                                <button
                                                    className="delete-doc-btn"
                                                    onClick={() => deleteDoc(doc._id, doc.name)}
                                                    disabled={deletingId === doc._id}
                                                    title="Delete document"
                                                >
                                                    {deletingId === doc._id ? '…' : '🗑️'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info banner */}
                <div className="upload-info-banner">
                    <span className="banner-icon">💡</span>
                    <p>
                        Once a PDF is indexed, employees can ask questions about its content directly in the{' '}
                        <strong>Chat Assistant</strong>. The AI will automatically reference the relevant documents.
                    </p>
                </div>
            </div>
        </div>
    );
}
