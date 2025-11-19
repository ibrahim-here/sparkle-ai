import { useState, useRef, type KeyboardEvent } from 'react';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-3xl space-y-8">
        {/* Welcome Message */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            What can I help with?
          </h1>
        </div>

        {/* Input Area */}
        <div className="relative">
          <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#B2FF00] transition-colors shadow-sm">
            <div className="flex items-end gap-2 p-4">
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message Sparkle AI..."
                className="flex-1 bg-transparent text-black placeholder-gray-400 resize-none outline-none max-h-48 min-h-[24px]"
                rows={1}
                autoFocus
              />

              {/* Voice Input Button */}
              <button
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-black"
                aria-label="Voice input"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                  message.trim()
                    ? 'bg-[#B2FF00] text-black hover:bg-[#9FE600]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-center text-xs text-gray-500 mt-3">
            Sparkle AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
