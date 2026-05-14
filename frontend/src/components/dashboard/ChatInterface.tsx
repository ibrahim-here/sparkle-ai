import { useState, useRef, useEffect, useCallback } from 'react';
import { chatAPI, type ChatMessage } from '../../api/chat.api';
import { useAuth } from '../../context/AuthContext';
import VisualizerInterface from './VisualizerInterface';
import MarkdownRenderer from '../ui/MarkdownRenderer';

interface ChatInterfaceProps {
    sessionId: string | null;
    onSessionCreated: (id: string) => void;
}

// ── Agent metadata ─────────────────────────────────────────────
const AGENT_META: Record<string, { icon: string; label: string; color: string; tagline: string }> = {
    explainer: { icon: '🧠', label: 'In-Depth Explainer', color: 'text-blue-400', tagline: 'Deep knowledge, clearly structured' },
    analogy: { icon: '🎨', label: 'Analogy Master', color: 'text-orange-400', tagline: 'Concepts through vivid real-life stories' },
    visualizer: { icon: '🎬', label: 'Visualizer Agent', color: 'text-purple-400', tagline: 'Interactive visual learning' },
    auto: { icon: '⚡', label: 'Auto', color: 'text-primary', tagline: 'AI-matched to your learning style' },
};

// ── Follow-up quick chips ──────────────────────────────────────
const FOLLOWUP_CHIPS = [
    { id: 'simpler', label: '🔄 Simpler please', prompt: 'Explain that more simply, like I\'m a complete beginner' },
    { id: 'examples', label: '💻 More examples', prompt: 'Give me 2-3 more practical code examples with explanations' },
    { id: 'quiz', label: '🧪 Quiz me', prompt: 'Quiz me on what I just learned with 3 questions' },
    { id: 'analogy', label: '🎨 Try an analogy', prompt: 'Explain the same concept using a real-life analogy' },

];

// ── Typing dots ────────────────────────────────────────────────
const TypingIndicator = ({ agentKey }: { agentKey: string }) => {
    const meta = AGENT_META[agentKey] || AGENT_META.explainer;
    return (
        <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                {meta.icon}
            </div>
            <div className="glass border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4">
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${meta.color}`}>{meta.label}</p>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-white/30 text-xs font-medium">Synthesizing response...</span>
                </div>
            </div>
        </div>
    );
};

// ── Message bubble ─────────────────────────────────────────────
interface MessageBubbleProps {
    msg: ChatMessage;
    agentKey: string;
    isLast: boolean;
    onFollowUp: (prompt: string) => void;
}

const MessageBubble = ({ msg, agentKey, isLast, onFollowUp }: MessageBubbleProps) => {
    const meta = AGENT_META[agentKey] || AGENT_META.explainer;
    const [showChips, setShowChips] = useState(isLast);

    // Show chips when this becomes the last message
    useEffect(() => {
        setShowChips(isLast);
    }, [isLast]);

    // Don't show follow-ups if the intent is casual or out_of_scope
    const isFollowupAllowed = msg.intent !== 'casual' && msg.intent !== 'out_of_scope';

    if (msg.role === 'user') {
        return (
            <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
                <div className="max-w-[75%] bg-primary/90 text-white rounded-2xl rounded-br-sm px-5 py-3.5 shadow-lg shadow-primary/20 border border-white/10">
                    <p className="text-[15px] font-medium leading-relaxed">{msg.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
            {/* Agent avatar */}
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                {meta.icon}
            </div>

            <div className="flex-1 min-w-0">
                {/* Agent badge */}
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${meta.color}`}>
                        {meta.label}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-white/30 text-xs">{meta.tagline}</span>
                </div>

                {/* Content bubble */}
                <div className="glass border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 backdrop-blur-xl shadow-2xl">
                    <MarkdownRenderer content={msg.content} />
                </div>

                {/* Follow-up chips — only on the last assistant message */}
                {showChips && isLast && isFollowupAllowed && (
                    <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-1 duration-500 delay-300">
                        <p className="w-full text-white/25 text-xs font-medium uppercase tracking-widest mb-0.5">
                            Quick follow-ups ↓
                        </p>
                        {FOLLOWUP_CHIPS.map(chip => (
                            <button
                                key={chip.id}
                                onClick={() => onFollowUp(chip.prompt)}
                                className="
                                    px-3 py-1.5 rounded-xl text-xs font-semibold
                                    bg-white/[0.03] border border-white/10 text-white/50
                                    hover:bg-primary/10 hover:border-primary/30 hover:text-white/90
                                    transition-all duration-200 hover:scale-105
                                "
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Empty state ────────────────────────────────────────────────
const EmptyState = ({ agentKey, onPrompt }: { agentKey: string; onPrompt: (p: string) => void }) => {
    const meta = AGENT_META[agentKey] || AGENT_META.explainer;

    const STARTER_PROMPTS: Record<string, string[]> = {
        explainer: [
            'Explain how loops work in C++',
            'What is the difference between while and for loops?',
            'How do arrays work in memory?',
        ],
        analogy: [
            'Explain arrays using a real-life analogy',
            'Help me understand functions with an analogy',
            'What is a loop? Explain it like a story',
        ],
        visualizer: [],
        auto: [
            'Teach me about loops in C++',
            'Explain functions for a beginner',
            'How do if-else statements work?',
        ],
    };

    const prompts = STARTER_PROMPTS[agentKey] || STARTER_PROMPTS.auto;

    return (
        <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
            <div className="text-center">
                <div className="text-5xl mb-3">{meta.icon}</div>
                <h2 className={`text-xl font-black uppercase tracking-widest mb-1 ${meta.color}`}>
                    {meta.label}
                </h2>
                <p className="text-white/30 text-sm font-medium">{meta.tagline}</p>
            </div>

            {prompts.length > 0 && (
                <div className="w-full max-w-md">
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest text-center mb-3">
                        Try asking...
                    </p>
                    <div className="flex flex-col gap-2">
                        {prompts.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => onPrompt(p)}
                                className="
                                    w-full text-left px-4 py-3 rounded-xl
                                    bg-white/[0.03] border border-white/8 text-white/60
                                    hover:bg-primary/8 hover:border-primary/25 hover:text-white/90
                                    transition-all duration-200 text-sm font-medium
                                    group
                                "
                            >
                                <span className="text-primary/50 group-hover:text-primary mr-2 transition-colors">▸</span>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────
const ChatInterface = ({ sessionId, onSessionCreated }: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingMessages, setFetchingMessages] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<string>('auto');
    const { user } = useAuth();
    const abortControllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get recommended agent based on learning style scores
    const getRecommendedAgent = () => {
        if (user?.manualLearningStyle && user.manualLearningStyle !== 'none' && user.manualLearningStyle !== 'mixed') {
            if (user.manualLearningStyle === 'visual') return 'visualizer';
            if (user.manualLearningStyle === 'kinesthetic') return 'analogy';
            if (user.manualLearningStyle === 'reading') return 'explainer';
        }
        if (!user?.learningStyle) return 'explainer';
        const { reading = 0, visual = 0, kinesthetic = 0 } = user.learningStyle;
        const max = Math.max(visual, reading, kinesthetic);
        if (max === visual) return 'visualizer';
        if (max === kinesthetic) return 'analogy';
        return 'explainer';
    };

    const recommended = getRecommendedAgent();

    useEffect(() => {
        if (user && selectedAgent === 'auto') {
            setSelectedAgent(recommended);
        }
    }, [user, recommended]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        if (sessionId) {
            const loadMessages = async () => {
                setFetchingMessages(true);
                try {
                    const res = await chatAPI.getSessionMessages(sessionId);
                    if (res.success) setMessages(res.data);
                } catch (err) {
                    console.error('Failed to load messages:', err);
                } finally {
                    setFetchingMessages(false);
                }
            };
            loadMessages();
        } else {
            setMessages([]);
        }
    }, [sessionId]);

    const handleSend = useCallback(async (overrideInput?: string, isFollowup: boolean = false) => {
        const messageText = overrideInput ?? input;
        if (!messageText.trim() || loading) return;

        setMessages(prev => [...prev, { role: 'user', content: messageText }]);
        setInput('');
        setLoading(true);
        abortControllerRef.current = new AbortController();

        try {
            const manualStyle = selectedAgent === 'auto' ? undefined : selectedAgent;
            const response = await chatAPI.sendQuery(
                messageText,
                sessionId || undefined,
                abortControllerRef.current.signal,
                manualStyle,
                isFollowup  // ← tells backend to skip classifier + validator
            );

            if (response.success) {
                if (!sessionId && response.data.sessionId) {
                    onSessionCreated(response.data.sessionId);
                }
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.response,
                    intent: response.data.intent
                }]);
            }
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') {
                setMessages(prev => [...prev, { role: 'assistant', content: '_Generation stopped._' }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `**Error:** ${error.response?.data?.message || 'Failed to get response. Please try again.'}`
                }]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [input, loading, selectedAgent, sessionId, onSessionCreated]);

    const handleStop = () => {
        abortControllerRef.current?.abort();
        setLoading(false);
    };

    // Follow-up chips always bypass scope validation (is_followup=true)
    const handleFollowUp = useCallback((prompt: string) => {
        handleSend(prompt, true);
    }, [handleSend]);

    const handleStarterPrompt = useCallback((prompt: string) => {
        setInput(prompt);
        setTimeout(() => handleSend(prompt), 50);
    }, [handleSend]);

    const effectiveAgent = selectedAgent === 'auto' ? recommended : selectedAgent;
    const agentMeta = AGENT_META[effectiveAgent] || AGENT_META.explainer;

    // Find the last assistant message index
    const lastAssistantIdx = [...messages].reverse().findIndex(m => m.role === 'assistant');
    const lastAssistantAbsIdx = lastAssistantIdx >= 0 ? messages.length - 1 - lastAssistantIdx : -1;

    return (
        <div className="flex-1 flex flex-col bg-secondary relative overflow-hidden cyber-grid">

            {/* Agent Content Area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {effectiveAgent === 'visualizer' ? (
                    <VisualizerInterface key={sessionId ?? 'new'} />
                ) : fetchingMessages && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse p-6">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Retrieving History...</p>
                    </div>
                ) : (
                    <div className="p-6 flex flex-col gap-5">
                        {messages.length === 0 && !loading ? (
                            <EmptyState agentKey={effectiveAgent} onPrompt={handleStarterPrompt} />
                        ) : (
                            messages.map((msg, i) => (
                                <MessageBubble
                                    key={i}
                                    msg={msg}
                                    agentKey={effectiveAgent}
                                    isLast={msg.role === 'assistant' && i === lastAssistantAbsIdx}
                                    onFollowUp={handleFollowUp}
                                />
                            ))
                        )}

                        {loading && <TypingIndicator agentKey={effectiveAgent} />}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* ── Input Bar ─────────────────────────────────── */}
            <div className="p-4 pt-0 relative z-10">
                <div className="glass border border-white/8 rounded-2xl p-3 flex items-center gap-3">

                    {/* Agent selector */}
                    <div className="relative flex-shrink-0">
                        <select
                            value={selectedAgent}
                            onChange={e => setSelectedAgent(e.target.value)}
                            className="
                                appearance-none bg-white/5 border border-white/10
                                rounded-xl pl-3 pr-7 py-2.5
                                text-xs font-bold uppercase tracking-wider text-white/60
                                focus:outline-none focus:border-primary/40
                                hover:bg-white/8 transition-all cursor-pointer
                            "
                            disabled={loading}
                        >
                            <option value="auto" className="bg-[#0F172A] text-white">⚡ Auto</option>
                            <option value="explainer" className="bg-[#0F172A] text-white">
                                {recommended === 'explainer' ? '⭐ 🧠 Explainer' : '🧠 Explainer'}
                            </option>
                            <option value="analogy" className="bg-[#0F172A] text-white">
                                {recommended === 'analogy' ? '⭐ 🎨 Analogy' : '🎨 Analogy'}
                            </option>
                            <option value="visualizer" className="bg-[#0F172A] text-white">
                                {recommended === 'visualizer' ? '⭐ 🎬 Visualizer' : '🎬 Visualizer'}
                            </option>
                        </select>
                        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">▼</div>
                    </div>

                    {/* Input field */}
                    {effectiveAgent !== 'visualizer' && (
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            className="
                                flex-1 bg-transparent text-white text-[15px] font-medium
                                placeholder:text-white/20 focus:outline-none
                                min-w-0
                            "
                            placeholder={
                                loading
                                    ? `${agentMeta.icon} Synthesizing...`
                                    : sessionId
                                        ? `Ask ${agentMeta.label}...`
                                        : `What do you want to learn today?`
                            }
                            disabled={loading || fetchingMessages}
                        />
                    )}

                    {/* Send / Stop */}
                    {effectiveAgent !== 'visualizer' && (
                        !loading ? (
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || fetchingMessages}
                                className="
                                    flex-shrink-0 flex items-center gap-2
                                    bg-primary text-white px-5 py-2.5 rounded-xl
                                    font-bold text-sm uppercase tracking-wider
                                    hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]
                                    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                                    transition-all duration-200
                                "
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Send
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                className="
                                    flex-shrink-0 flex items-center gap-2
                                    bg-red-500/10 text-red-400 border border-red-500/20
                                    px-5 py-2.5 rounded-xl font-bold text-sm uppercase tracking-wider
                                    hover:bg-red-500/20 transition-all duration-200
                                "
                            >
                                <span className="w-2.5 h-2.5 bg-red-400 rounded-sm animate-pulse" />
                                Stop
                            </button>
                        )
                    )}
                </div>

                {/* Character hint */}
                {input.length > 10 && (
                    <p className="text-white/15 text-xs text-right mt-1 pr-1">
                        Press Enter to send
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
