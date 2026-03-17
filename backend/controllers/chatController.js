const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../utils/AppError');
const Document = require('../models/Document');

// ── System prompts by role ──
const systemPrompts = {
    employee: `You are OpsMind AI — an intelligent, friendly, and professional HR & productivity assistant for employees.

Your responsibilities:
• Answer questions about company HR policies (leave, remote work, benefits, onboarding, performance reviews, expense reimbursement, IT security).
• Help employees understand their rights, processes, and next steps.
• Provide productivity tips and best practices for time management, goal setting, and work-life balance.
• Guide employees on how to use internal tools and self-service portals.
• Give transparent answers about company culture, processes, and expectations.
• If asked about sensitive data (salaries of others, confidential HR decisions), politely explain that you cannot share that information and direct them to HR.

Tone: Warm, supportive, clear, and professional. Use bullet points and structured formatting when helpful.
Always end answers with a helpful follow-up suggestion when appropriate.`,

    hr: `You are OpsMind AI — an advanced HR operations assistant for HR professionals.

Your responsibilities:
• Help HR managers draft and refine policies, procedures, and communications.
• Assist with employee engagement strategies, onboarding checklists, and retention analysis.
• Provide insights on leave management, attendance patterns, and workforce planning.
• Help create performance review templates, feedback frameworks, and development plans.
• Suggest best practices for conflict resolution, diversity & inclusion, and compliance.
• Assist in analyzing productivity metrics and creating transparent reporting for leadership.
• Help draft employee communications, announcements, and policy updates.
• Provide data-driven insights for hiring, workforce optimization, and talent management.

Tone: Strategic, data-informed, professional, and action-oriented. Provide structured recommendations with clear action items.
Format responses with headers, bullet points, and numbered steps for clarity.`,

    admin: `You are OpsMind AI — the executive-level strategic advisor for organization leadership.

Your responsibilities:
• Provide high-level organizational insights and workforce analytics recommendations.
• Help analyze department productivity, attrition risk, and resource allocation.
• Suggest strategies for organizational transparency, culture, and operational efficiency.
• Assist with compliance frameworks, audit preparation, and policy governance.
• Provide executive-level summaries and dashboards recommendations.
• Help in strategic workforce planning and talent pipeline analysis.
• Support decision-making with data-driven insights and industry benchmarks.

Tone: Executive, strategic, concise, and data-driven. Focus on actionable insights and ROI.`,
};

// In-memory conversation store (per user)
// In production, store in Redis or MongoDB
const conversations = new Map();

/**
 * Finds the most relevant document snippets for a given query.
 * Simple keyword matching — picks up to 3 docs that contain any word from the query.
 * Returns a combined context string (max ~4000 chars).
 */
async function getDocumentContext(query) {
    try {
        // Tokenise query into meaningful words (length >= 3)
        const words = query
            .split(/\s+/)
            .filter(w => w.length >= 3)
            .map(w => w.replace(/[^a-zA-Z0-9]/g, ''));

        if (!words.length) return '';

        // Build a regex that matches any query word
        const pattern = words.join('|');
        const regex = new RegExp(pattern, 'i');

        // Search across all indexed documents
        const docs = await Document.find({ status: 'indexed' }).select('name extractedText');

        // Score each doc by how many query words appear in it
        const scored = docs
            .map(doc => {
                const text = doc.extractedText;
                const hits = words.filter(w => new RegExp(w, 'i').test(text)).length;
                return { name: doc.name, text, hits };
            })
            .filter(d => d.hits > 0)
            .sort((a, b) => b.hits - a.hits)
            .slice(0, 3); // top 3 relevant docs

        if (!scored.length) return '';

        // For each matching doc, extract the most relevant snippet (~800 chars around first hit)
        const snippets = scored.map(d => {
            const idx = d.text.search(regex);
            const start = Math.max(0, idx - 200);
            const end = Math.min(d.text.length, idx + 600);
            const snippet = d.text.slice(start, end).trim();
            return `[Document: ${d.name}]\n${snippet}`;
        });

        return snippets.join('\n\n---\n\n');
    } catch (err) {
        console.error('Document context fetch error:', err.message);
        return ''; // Fail gracefully — don't break the chat
    }
}

/**
 * POST /api/chat
 * Body: { message: string }
 * Headers: Authorization: Bearer <token>
 */
const sendMessage = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            throw new AppError('Message is required.', 400);
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new AppError('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.', 500);
        }

        const userId = req.user._id.toString();
        const userRole = req.user.role.toLowerCase();
        const userName = req.user.name;

        // Fetch relevant document context for this query
        const docContext = await getDocumentContext(message.trim());

        // Get or create conversation history for this user
        if (!conversations.has(userId)) {
            conversations.set(userId, []);
        }
        const history = conversations.get(userId);

        // Build the system instruction based on role, plus document context if found
        let systemInstruction = `${systemPrompts[userRole] || systemPrompts.employee}

Current User Context:
- Name: ${userName}
- Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}
- Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Important: Personalize your responses for this user. Address them by name when appropriate. Tailor advice to their role level.`;

        if (docContext) {
            systemInstruction += `\n\n---\n## Relevant Company Documents\nThe following content was retrieved from uploaded company documents. Use it to answer the user's question accurately. Always cite the document name when referencing it.\n\n${docContext}\n---`;
        }

        console.log(`[DEBUG] Initializing Gemini. Key length = ${process.env.GEMINI_API_KEY?.length}`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Initialize the Gemini model
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction,
        });

        // Build conversation history for context
        const chatHistory = history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        // Start chat with history
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
                topP: 0.9,
            },
        });

        // Send the message
        const result = await chat.sendMessage(message.trim());
        const response = result.response;
        const aiText = response.text();

        // Save to conversation history (keep last 20 messages for context)
        history.push({ role: 'user', text: message.trim() });
        history.push({ role: 'model', text: aiText });

        // Trim history to last 20 messages
        if (history.length > 20) {
            conversations.set(userId, history.slice(-20));
        }

        res.status(200).json({
            success: true,
            data: {
                reply: aiText,
                role: userRole,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Chat error:', error.message);

        // Handle Gemini-specific errors
        if (error.message?.includes('API_KEY')) {
            return res.status(500).json({
                success: false,
                message: 'Invalid Gemini API key. Please check your configuration.',
            });
        }

        if (error.message?.includes('SAFETY')) {
            return res.status(400).json({
                success: false,
                message: 'Your message was flagged by safety filters. Please rephrase your question.',
            });
        }

        next(error);
    }
};

/**
 * DELETE /api/chat/history
 * Clears conversation history for the current user
 */
const clearHistory = async (req, res) => {
    const userId = req.user._id.toString();
    conversations.delete(userId);

    res.status(200).json({
        success: true,
        message: 'Conversation history cleared.',
    });
};

/**
 * GET /api/chat/suggestions
 * Returns role-based quick suggestions
 */
const getSuggestions = async (req, res) => {
    const userRole = req.user.role.toLowerCase();

    const suggestions = {
        employee: [
            'What is our remote work policy?',
            'How do I request annual leave?',
            'What are the performance review criteria?',
            'How can I improve my productivity?',
            'What benefits am I eligible for?',
            'How do I submit an expense report?',
        ],
        hr: [
            'Draft an onboarding checklist for new hires',
            'Suggest employee engagement strategies',
            'Create a performance review template',
            'Analyze common reasons for employee attrition',
            'Draft a policy update communication',
            'What are best practices for remote team management?',
        ],
        admin: [
            'Provide a workforce productivity analysis framework',
            'Suggest strategies to reduce attrition rate',
            'Create an executive summary template for board meetings',
            'What KPIs should we track for operational efficiency?',
            'Recommend a compliance audit checklist',
            'Analyze department resource allocation',
        ],
    };

    res.status(200).json({
        success: true,
        data: suggestions[userRole] || suggestions.employee,
    });
};

module.exports = { sendMessage, clearHistory, getSuggestions };
