import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SendIcon, AIStarIcon } from '../components/Icons';
import '../styles/Chat.css';

// ── Knowledge base ──
const knowledgeBase = [
    {
        keywords: ['remote work', 'work from home', 'wfh', 'remote'],
        answer: 'Our remote work policy allows eligible employees to work from home up to 3 days per week. Employees must maintain core hours between 10:00 AM and 3:00 PM and ensure a stable internet connection. Manager approval is required for fully remote arrangements exceeding 2 consecutive weeks.',
        source: 'HR_Remote_Work_Policy_2025.pdf',
        page: 4
    },
    {
        keywords: ['annual leave', 'leave', 'vacation', 'pto', 'paid time off', 'time off'],
        answer: 'To request annual leave, navigate to the HR Self-Service Portal > Time Off > New Request. Submit your request at least 5 business days in advance. Annual leave accrues at 1.67 days per month (20 days/year) for employees with less than 5 years of tenure, and 2.08 days per month (25 days/year) for 5+ years.',
        source: 'Employee_Benefits_Handbook.pdf',
        page: 12
    },
    {
        keywords: ['onboarding', 'checklist', 'new hire', 'new employee', 'orientation'],
        answer: 'The onboarding checklist includes: (1) Complete I-9 and W-4 forms by Day 1, (2) Attend IT orientation for equipment setup on Day 1, (3) Complete compliance training modules by end of Week 1, (4) Meet with assigned buddy and direct manager, (5) Review department-specific SOPs by end of Week 2, and (6) Submit 30-day check-in feedback form.',
        source: 'Onboarding_Checklist_2025.pdf',
        page: 1
    },
    {
        keywords: ['expense', 'reimbursement', 'travel'],
        answer: 'Expense reports must be submitted within 30 days of the expense date through Concur. Receipts are required for all expenses over $25. Domestic travel per-diem rates follow GSA guidelines. International travel requires pre-approval from VP-level and above. Reimbursement processing takes 5–7 business days after manager approval.',
        source: 'Travel_Expense_Policy.pdf',
        page: 7
    },
    {
        keywords: ['performance review', 'review', 'performance', 'evaluation'],
        answer: 'Performance reviews are conducted bi-annually in June and December. Self-assessments must be completed by the 15th of the review month. Managers submit final evaluations by the 25th. Ratings follow a 5-point scale: Exceeds Expectations, Meets Expectations, Developing, Below Expectations, and Unsatisfactory.',
        source: 'Performance_Management_Guide.pdf',
        page: 9
    },
    {
        keywords: ['security', 'password', 'it security', 'cyber'],
        answer: 'All employees must use multi-factor authentication (MFA) for accessing company systems. Passwords must be at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols. Password rotation is required every 90 days. Report suspicious emails to security@company.com immediately.',
        source: 'IT_Security_Procedures_Q1.pdf',
        page: 3
    }
];

function findAnswer(question) {
    const q = question.toLowerCase();
    for (const item of knowledgeBase) {
        if (item.keywords.some(kw => q.includes(kw))) return item;
    }
    return null;
}

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    function sendMessage(text) {
        if (!text.trim()) return;
        const userMsg = { role: 'user', text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const result = findAnswer(text);
            const aiMsg = result
                ? { role: 'ai', text: result.answer, source: result.source, page: result.page }
                : { role: 'ai', text: "I don't know based on available documents.", notFound: true };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 600);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    function handleDownload(source) {
        // Create a dummy PDF blob to simulate download
        const blob = new Blob(['Simulated PDF content for ' + source], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = source;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const initials = getInitials(user.name);

    return (
        <div className="chat-page">
            <header className="chat-page-header">
                <div>
                    <h1 className="chat-page-title">Chat Assistant</h1>
                    <p className="chat-page-subtitle">Ask questions about your internal documents</p>
                </div>
            </header>

            <div className="chat-messages">
                {messages.length === 0 && !isTyping && (
                    <div className="chat-welcome">
                        <div className="welcome-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="14" fill="url(#wG)" />
                                <path d="M14 24L20 18L26 24L34 16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14 32L20 26L26 32L34 24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                                <defs><linearGradient id="wG" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#818cf8" /></linearGradient></defs>
                            </svg>
                        </div>
                        <h2 className="welcome-title">Welcome to OpsMind AI</h2>
                        <p className="welcome-desc">I can help you find answers from your organization's internal documents, policies, and procedures.</p>
                        <div className="quick-prompts">
                            <button className="quick-prompt" onClick={() => sendMessage('What is our remote work policy?')}>What is our remote work policy?</button>
                            <button className="quick-prompt" onClick={() => sendMessage('How do I request annual leave?')}>How do I request annual leave?</button>
                            <button className="quick-prompt" onClick={() => sendMessage('Summarize onboarding checklist')}>Summarize onboarding checklist</button>
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`message-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                        <div className="msg-avatar">
                            {msg.role === 'user' ? initials : <AIStarIcon />}
                        </div>
                        <div className="msg-body">
                            <div className={`msg-bubble ${msg.notFound ? 'not-found' : ''}`}>{msg.text}</div>
                            {msg.source && (
                                <div className="citation-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        <span className="citation-file">{msg.source}</span>
                                        <span className="citation-page">· Page {msg.page}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(msg.source)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--indigo-500)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        title="Download PDF"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message-row ai">
                        <div className="msg-avatar"><AIStarIcon /></div>
                        <div className="msg-body">
                            <div className="typing-indicator">
                                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <div className="chat-input-wrapper">
                    <input
                        ref={inputRef}
                        className="chat-input"
                        type="text"
                        placeholder="Ask a question about internal documents…"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        id="chat-input"
                    />
                    <button className="send-btn" onClick={() => sendMessage(input)} id="send-btn">
                        <SendIcon />
                    </button>
                </div>
                <p className="input-hint">OpsMind AI may produce inaccurate information. Always verify critical data.</p>
            </div>
        </div>
    );
}
