import { useState, useRef } from 'react';
import '../styles/Upload.css';

const INITIAL_DOCS = [
    { name: 'HR_Remote_Work_Policy_2025.pdf', date: '2026-02-28', status: 'indexed' },
    { name: 'Employee_Benefits_Handbook.pdf', date: '2026-02-25', status: 'indexed' },
    { name: 'Onboarding_Checklist_2025.pdf', date: '2026-02-22', status: 'indexed' },
    { name: 'Travel_Expense_Policy.pdf', date: '2026-02-20', status: 'indexed' },
    { name: 'Performance_Management_Guide.pdf', date: '2026-02-18', status: 'indexed' },
    { name: 'IT_Security_Procedures_Q1.pdf', date: '2026-03-01', status: 'processing' },
];

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UploadPage() {
    const [docs, setDocs] = useState(INITIAL_DOCS);
    const [dragover, setDragover] = useState(false);
    const [uploading, setUploading] = useState(null); // { name, progress }
    const fileRef = useRef(null);

    function simulateUpload(file) {
        const fileName = file.name || 'Document.pdf';
        setUploading({ name: fileName, progress: 0 });
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    setUploading(null);
                    setDocs(prev => [
                        { name: fileName, date: new Date().toISOString().split('T')[0], status: 'processing' },
                        ...prev
                    ]);
                }, 400);
            }
            setUploading({ name: fileName, progress });
        }, 300);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragover(false);
        if (e.dataTransfer.files.length) simulateUpload(e.dataTransfer.files[0]);
    }

    function handleFileSelect(e) {
        if (e.target.files.length) simulateUpload(e.target.files[0]);
        e.target.value = '';
    }

    return (
        <div className="upload-page">
            <header className="upload-page-header">
                <div>
                    <h1 className="upload-page-title">Upload Documents</h1>
                    <p className="upload-page-subtitle">Add PDF documents to your organization's knowledge base</p>
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
                    <input ref={fileRef} type="file" accept=".pdf" multiple hidden onChange={handleFileSelect} />
                </div>

                {/* Upload Progress */}
                {uploading && (
                    <div className="upload-progress-card">
                        <div className="progress-header">
                            <span className="progress-filename">{uploading.name}</span>
                            <span className="progress-percent">{uploading.progress}%</span>
                        </div>
                        <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${uploading.progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="table-card">
                    <div className="table-card-header">
                        <h2 className="table-card-title">Uploaded Documents</h2>
                        <span className="doc-count">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="table-wrapper">
                        <table className="data-table" id="doc-table">
                            <thead>
                                <tr><th>File Name</th><th>Upload Date</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {docs.map((doc, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 500 }}>{doc.name}</td>
                                        <td>{formatDate(doc.date)}</td>
                                        <td>
                                            <span className={`status-pill ${doc.status}`}>
                                                <span className="status-pill-dot" />
                                                {doc.status === 'indexed' ? 'Indexed' : 'Processing'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
