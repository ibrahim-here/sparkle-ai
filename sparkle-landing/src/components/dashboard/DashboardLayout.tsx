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

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded text-black"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-black font-bold text-lg">Sparkle AI</span>
        </header>

        {/* Chat Interface */}
        <ChatInterface />
      </div>
    </div>
  );
};

export default DashboardLayout;
