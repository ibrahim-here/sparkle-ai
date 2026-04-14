import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatInterface from './ChatInterface';

interface User {
  id: string;
  email: string;
  name: string;
  profilePicture: string | null;
  authProvider: string;
}

interface DashboardLayoutProps {
  user: User;
}

const DashboardLayout = (_props: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionUpdated, setSessionUpdated] = useState(0);

  const handleSessionChange = (id: string | null) => {
    setCurrentSessionId(id);
    setSidebarOpen(false); // Close sidebar on mobile when switching
  };

  const notifyUpdate = () => setSessionUpdated(prev => prev + 1);

  return (
    <div className="flex h-screen bg-secondary font-outfit overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        currentSessionId={currentSessionId}
        onSessionSelect={handleSessionChange}
        sessionUpdated={sessionUpdated}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Header */}
        <header className="lg:hidden glass border-b border-white/5 p-4 flex items-center gap-3 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/5 rounded-xl text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-black uppercase tracking-tighter text-lg">Sparkle <span className="text-primary italic">AI</span></span>
        </header>

        {/* Chat Interface */}
        <ChatInterface
          sessionId={currentSessionId}
          onSessionCreated={(id) => {
            setCurrentSessionId(id);
            notifyUpdate();
          }}
        />
      </div>
    </div>
  );
};

export default DashboardLayout;
