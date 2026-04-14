import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { chatAPI, type ChatSession } from '../../api/chat.api';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentSessionId: string | null;
  onSessionSelect: (id: string | null) => void;
  sessionUpdated: number;
}

const Sidebar = ({ isOpen, onToggle, currentSessionId, onSessionSelect, sessionUpdated }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await chatAPI.getSessions();
        if (res.success) {
          setSessions(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [sessionUpdated]);

  const handleNewChat = () => {
    onSessionSelect(null);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this chat?')) {
      try {
        await chatAPI.deleteSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
          onSessionSelect(null);
        }
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass border-r border-white/5 text-white flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-primary animate-pulse">✨</span>
            <span className="font-black text-xl tracking-tighter uppercase">Sparkle <span className="text-primary">AI</span></span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action Items */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${currentSessionId === null ? 'bg-primary text-secondary shadow-glow-primary font-bold' : 'hover:bg-white/5 text-white/70'
              }`}
          >
            <span className="text-xl">✏️</span>
            <span className="font-medium">New chat</span>
          </button>

          <button
            onClick={() => navigate('/notebook')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group hover:bg-white/5 text-white/70 hover:text-blue-400"
          >
            <span className="text-xl">📘</span>
            <span className="font-medium">Notebook Mode</span>
          </button>

          <button
            onClick={() => navigate('/visualizer')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group hover:bg-white/5 text-white/70 hover:text-purple-400"
          >
            <span className="text-xl">🎨</span>
            <span className="font-medium">Visualizer Mode</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Transmission History</p>
          {loading && sessions.length === 0 ? (
            <div className="p-4 animate-pulse space-y-3">
              <div className="h-8 bg-white/5 rounded-lg w-full"></div>
              <div className="h-8 bg-white/5 rounded-lg w-3/4"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center opacity-20 text-xs italic">
              No previous transmissions
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${currentSessionId === session.id
                  ? 'bg-white/10 text-white'
                  : 'hover:bg-white/5 text-white/50 hover:text-white'
                  }`}
              >
                <span className="text-sm truncate flex-1 text-left">{session.title}</span>
                <span
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                >
                  🗑️
                </span>
              </button>
            ))
          )}
        </div>

        {/* User Profile */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-secondary font-black shadow-glow-primary">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate text-sm">{user?.name}</p>
              <p className="text-xs text-white/30 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-full px-4 py-2.5 hover:bg-white/5 border border-white/5 rounded-xl transition-all text-xs font-bold text-white/70 hover:text-white flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <span>⚙️</span> Settings
          </button>

          <button
            onClick={logout}
            className="w-full px-4 py-2.5 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
