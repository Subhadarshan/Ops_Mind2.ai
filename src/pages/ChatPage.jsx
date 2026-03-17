import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SendIcon, AIStarIcon } from '../components/Icons';
import '../styles/Chat.css';

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// Simple markdown-ish renderer: bold **text**, bullet lists, newlines
function renderAIText(text) {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Render **bold**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
        return <span key={i}>{parts}<br /></span>;
    });
}

export default function ChatPage() {
    const { user, token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [docCount, setDocCount] = useState(0);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch role-based suggestions
    useEffect(() => {
        if (!token) return;
        fetch('/api/chat/suggestions', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => { if (data.success) setSuggestions(data.data); })
            .catch(err => console.error('Could not fetch suggestions', err));
    }, [token]);

    // Fetch document count so we can show KB badge
    useEffect(() => {
        if (!token) return;
        fetch('/api/documents/count', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => { if (data.success) setDocCount(data.count); })
            .catch(() => { /* ignore silently */ });
    }, [token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    async function sendMessage(text) {
        if (!text.trim()) return;
        const userMsg = { role: 'user', text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: text.trim() })
            });
            const data = await res.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'ai', text: data.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: `Error: ${data.message}`, notFound: true }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', text: 'Network error. Is the server running?', notFound: true }]);
        } finally {
            setIsTyping(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    }

    const initials = getInitials(user?.name);

    return (
        <div className="chat-page">
            <header className="chat-page-header">
                <div>
                    <h1 className="chat-page-title">Chat Assistant</h1>
                    <p className="chat-page-subtitle">Ask questions about your internal documents and get AI-powered answers</p>
                </div>
                {docCount > 0 && (
                    <div className="kb-badge" title="Documents loaded from knowledge base">
                        <span className="kb-badge-dot" />
                        📄 {docCount} document{docCount !== 1 ? 's' : ''} in knowledge base
                    </div>
                )}
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
                        <p className="welcome-desc">
                            I am your specialized assistant, ready to help individuals in the <b>{user?.role}</b> role with guidance, policies, and productivity.
                            {docCount > 0 && (
                                <span className="welcome-doc-hint">
                                    {' '}I also have access to <strong>{docCount} company document{docCount !== 1 ? 's' : ''}</strong> — ask me anything from them!
                                </span>
                            )}
                        </p>
                        <div className="quick-prompts">
                            {(suggestions.length > 0 ? suggestions.slice(0, 3) : [
                                'What is our remote work policy?',
                                'How do I request annual leave?',
                                'What are the performance review criteria?'
                            ]).map((suggest, idx) => (
                                <button key={idx} className="quick-prompt" onClick={() => sendMessage(suggest)}>{suggest}</button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`message-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                        <div className="msg-avatar">
                            {msg.role === 'user' ? initials : <AIStarIcon />}
                        </div>
                        <div className="msg-body">
                            <div className={`msg-bubble ${msg.notFound ? 'not-found' : ''}`} style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                {msg.role === 'ai' ? renderAIText(msg.text) : msg.text}
                            </div>
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
                        placeholder={docCount > 0 ? `Ask about policies, documents, or anything…` : 'Ask a question…'}
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
                <p className="input-hint">
                    {docCount > 0
                        ? `OpsMind AI searches ${docCount} indexed document${docCount !== 1 ? 's' : ''} to answer your questions. Always verify critical data.`
                        : 'OpsMind AI may produce inaccurate information. Always verify critical data.'}
                </p>
            </div>
        </div>
    );
}
