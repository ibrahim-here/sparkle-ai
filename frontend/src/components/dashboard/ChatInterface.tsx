import { useState, useRef, useEffect } from 'react';
import { chatAPI, type ChatMessage } from '../../api/chat.api';

interface ChatInterfaceProps {
    sessionId: string | null;
    onSessionCreated: (id: string) => void;
}

const ChatInterface = ({ sessionId, onSessionCreated }: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingMessages, setFetchingMessages] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Load messages when sessionId changes
    useEffect(() => {
        if (sessionId) {
            const loadMessages = async () => {
                setFetchingMessages(true);
                try {
                    const res = await chatAPI.getSessionMessages(sessionId);
                    if (res.success) {
                        setMessages(res.data);
                    }
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

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        try {
            const response = await chatAPI.sendQuery(userMessage, sessionId || undefined, abortControllerRef.current.signal);

            if (response.success) {
                // If it was a new session, notify parent
                if (!sessionId && response.data.sessionId) {
                    onSessionCreated(response.data.sessionId);
                }

                // Add assistant response
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.response
                }]);
            }
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') {
                console.log('Request aborted');
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Generation stopped by user.'
                }]);
            } else {
                console.error('Chat error:', error);
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Error: ${error.response?.data?.message || 'Failed to get response. Please try again.'}`
                }]);
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 bg-secondary relative overflow-hidden cyber-grid">
            <div className="flex-1 overflow-y-auto space-y-6 mb-6 scrollbar-thin scrollbar-thumb-white/10 pr-2">
                {fetchingMessages && messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 animate-pulse">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black uppercase tracking-widest">Retrieving History...</p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-4 rounded-2xl max-w-[85%] leading-relaxed transition-all animate-in fade-in slide-in-from-bottom-2 ${msg.role === 'user'
                                    ? 'bg-primary text-secondary self-end ml-auto font-bold shadow-glow-primary'
                                    : 'glass border border-white/5 text-white/90'
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="p-4 rounded-2xl max-w-[85%] glass border border-white/5 text-white/90 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                    <span className="text-sm font-bold tracking-widest uppercase opacity-60">Synthesizing...</span>
                                </div>
                            </div>
                        )}
                        {messages.length === 0 && !loading && (
                            <div className="text-center text-white/20 mt-20 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl">⚡</div>
                                <p className="font-bold tracking-widest uppercase text-xs">Initialize Transmission...</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
            <div className="flex gap-3 relative z-10">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder={sessionId ? "Continue conversation..." : "Input objective..."}
                    disabled={loading || fetchingMessages}
                />
                {!loading ? (
                    <button
                        onClick={handleSend}
                        className="bg-primary text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-glow-primary transition-all disabled:opacity-50"
                        disabled={loading || fetchingMessages || !input.trim()}
                    >
                        Send
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        className="bg-red-500/10 text-red-400 border border-red-500/20 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-black transition-all"
                    >
                        <div className="h-3 w-3 bg-red-400 animate-pulse rounded-sm"></div>
                        Stop
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;
