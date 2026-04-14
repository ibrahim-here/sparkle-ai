import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Loader2, BookOpen, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- API Client ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Citation Component ---
interface Citation {
    id: number;
    source: string;
    text: string;
}

interface CitationTooltipProps {
    citation: Citation;
}

const CitationTooltip = ({ citation }: CitationTooltipProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <span className="relative inline-block">
            <sup
                className="text-primary cursor-pointer hover:underline font-bold mx-0.5"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                [{citation.id}]
            </sup>
            {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 p-3 bg-gray-900 border border-primary/30 rounded-lg shadow-2xl z-50 text-xs">
                    <div className="text-primary font-bold mb-1 text-[10px] uppercase tracking-wider">
                        Source {citation.id}: {citation.source}
                    </div>
                    <div className="text-white/80 leading-relaxed">
                        {citation.text}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-gray-900 border-r border-b border-primary/30 transform rotate-45"></div>
                    </div>
                </div>
            )}
        </span>
    );
};

// --- Message Renderer with Citations ---
interface MessageWithCitationsProps {
    content: string;
    citations: Citation[];
}

const MessageWithCitations = ({ content, citations }: MessageWithCitationsProps) => {
    // Parse content and replace [1], [2], etc. with citation components
    const renderContentWithCitations = () => {
        const parts = [];
        let lastIndex = 0;
        const regex = /\[(\d+)\]/g;
        let match;

        while ((match = regex.exec(content)) !== null) {
            // Add text before citation
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }

            // Add citation component
            const citationId = parseInt(match[1]);
            const citation = citations.find(c => c.id === citationId);
            if (citation) {
                parts.push(<CitationTooltip key={`cite-${match.index}`} citation={citation} />);
            } else {
                parts.push(match[0]); // Keep original if citation not found
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    return <div className="whitespace-pre-wrap">{renderContentWithCitations()}</div>;
};

// --- Components ---

const NotebookPage = () => {
    interface Message {
        role: string;
        content: string;
        citations?: Citation[];
    }

    interface NotebookSession {
        id: string;
        title: string;
        uploaded_files: string[];
        updatedAt: string;
    }

    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<NotebookSession[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Init session on mount
        const initSession = async () => {
            const storedSession = localStorage.getItem('notebook_session_id');

            if (storedSession) {
                // Validate that this session still exists in the database
                try {
                    await api.get(`/api/chat/sessions/${storedSession}`);
                    setSessionId(storedSession);
                    return; // Session is valid, use it
                } catch (error) {
                    // Session doesn't exist, clear it and create new one
                    console.log('Cached session invalid, creating new one');
                    localStorage.removeItem('notebook_session_id');
                }
            }

            // Create a new session in the database
            try {
                const response = await api.post('/api/chat/sessions', {
                    title: 'Notebook Research Session',
                    session_type: 'notebook'
                });
                if (response.data.success) {
                    const newId = response.data.data.id;
                    setSessionId(newId);
                    localStorage.setItem('notebook_session_id', newId);
                }
            } catch (error) {
                console.error('Failed to create session:', error);
            }
        };
        initSession();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load all notebook sessions
    const loadSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const response = await api.get('/api/notebook/sessions');
            if (response.data.success) {
                setSessions(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    // Load sessions on mount and when sessionId changes
    useEffect(() => {
        if (sessionId) {
            loadSessions();
        }
    }, [sessionId]);

    // Load session data (messages and files)
    const loadSessionData = async (sid: string) => {
        try {
            const response = await api.get(`/api/notebook/sessions/${sid}`);
            if (response.data.success) {
                const data = response.data.data;
                setMessages(data.messages || []);
                setUploadedFiles(data.uploaded_files || []);
            }
        } catch (error) {
            console.error('Failed to load session data:', error);
        }
    };

    // Handle switching to a different session
    const handleSessionSwitch = async (sid: string) => {
        setSessionId(sid);
        localStorage.setItem('notebook_session_id', sid);
        await loadSessionData(sid);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/api/notebook/upload/${sessionId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadedFiles(prev => [...prev, file.name]);
            setMessages(prev => [...prev, {
                role: 'system',
                content: `✅ Successfully indexed ${file.name}`
            }]);
        } catch (error) {
            console.error('Upload failed:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: `❌ Error uploading ${file.name}. Please try again.`
            }]);
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await api.post('/api/notebook/chat', {
                query: userMsg.content,
                sessionId: sessionId
            });

            const aiMsg = {
                role: 'assistant',
                content: response.data.data.response,
                citations: response.data.data.citations || []
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: "⚠️ Error getting response. Please check if backend is running."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewSession = async () => {
        try {
            const response = await api.post('/api/chat/sessions', {
                title: 'Notebook Research Session',
                session_type: 'notebook'
            });
            if (response.data.success) {
                const newId = response.data.data.id;
                setSessionId(newId);
                localStorage.setItem('notebook_session_id', newId);
                setMessages([]);
                setUploadedFiles([]);
            }
        } catch (error) {
            console.error('Failed to create new session:', error);
        }
    };

    return (
        <div className="flex h-screen bg-secondary text-white font-outfit overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 glass border-r border-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                        <h1 className="text-xl font-black uppercase tracking-tighter">
                            Notebook <span className="text-primary">Mode</span>
                        </h1>
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Research Assistant</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                    <div className="space-y-2">
                        <h2 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Active Sources</h2>

                        {uploadedFiles.length === 0 ? (
                            <div className="text-xs text-white/20 italic px-2 py-4 text-center border border-white/5 rounded-xl">
                                No sources loaded
                            </div>
                        ) : (
                            uploadedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl glass border border-white/5 text-sm text-white/70 hover:border-primary/20 transition-all">
                                    <FileText className="w-4 h-4 text-primary shrink-0" />
                                    <span className="truncate font-medium">{file}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 space-y-3">
                    <label className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-secondary rounded-xl cursor-pointer transition-all text-xs font-black uppercase tracking-widest hover:shadow-glow-primary">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? "Indexing..." : "Upload PDF"}
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            className="hidden"
                        />
                    </label>

                    <button
                        onClick={handleNewSession}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 text-white/70 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear Context
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 text-white/70 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Chat
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-secondary relative cyber-grid">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 pr-2">
                    {messages.length === 0 && (
                        <div className="text-center text-white/20 mt-20 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-2xl">📘</div>
                            <p className="font-bold tracking-widest uppercase text-xs">Upload a PDF to Begin Research</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-2xl max-w-[85%] leading-relaxed transition-all animate-in fade-in slide-in-from-bottom-2 shadow-2xl ${msg.role === 'user'
                                ? 'bg-primary/90 text-white self-end ml-auto font-bold shadow-glow-primary border border-white/10'
                                : msg.role === 'system'
                                    ? 'glass border border-white/5 text-white/50 text-sm backdrop-blur-xl'
                                    : 'glass border border-white/5 text-white/90 backdrop-blur-xl'
                                }`}
                        >
                            {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 ? (
                                <MessageWithCitations content={msg.content} citations={msg.citations} />
                            ) : (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="p-4 rounded-2xl max-w-[85%] glass border border-white/5 text-white/90 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                                <span className="text-sm font-bold tracking-widest uppercase opacity-60">Analyzing Sources...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 relative z-10">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Query your sources..."
                            disabled={isLoading}
                            className="flex-1 p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="bg-primary text-secondary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-glow-primary transition-all disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-white/20 mt-3 uppercase tracking-widest font-bold">
                        Strictly Grounded Responses
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotebookPage;
