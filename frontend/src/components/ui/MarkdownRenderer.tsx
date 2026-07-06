import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ── Copy Button ──────────────────────────────────────────────
const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
        transition-all duration-200
        ${copied
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/70'
        }
      `}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
};

// ── Code Block with Header ──────────────────────────────────
const CodeBlock = ({ language, children }: { language: string; children: string }) => {
  const langLabel = language || 'code';

  const langColors: Record<string, string> = {
    cpp: 'text-[#22D3EE]',
    c: 'text-[#22D3EE]',
    python: 'text-yellow-400',
    javascript: 'text-yellow-300',
    js: 'text-yellow-300',
    typescript: 'text-blue-400',
    ts: 'text-blue-400',
    bash: 'text-green-400',
    sh: 'text-green-400',
  };

  const color = langColors[langLabel.toLowerCase()] || 'text-[#8B5CF6]';

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0D0D1A] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>
            {langLabel}
          </span>
        </div>
        <CopyButton text={children} />
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={langLabel}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#0A0A14',
          padding: '1.25rem',
          fontSize: '0.875rem',
          lineHeight: '1.6',
        }}
        codeTagProps={{ style: { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

// ── Main Renderer ─────────────────────────────────────────────
interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`sparkle-markdown ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ── Headings ─────────────────────────────────────
          h1: ({ children }) => (
            <h1 className="text-2xl font-black mb-4 mt-6 first:mt-0 gradient-text leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 mt-6 first:mt-0 text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full inline-block flex-shrink-0" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold mb-2 mt-4 text-white/90">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-bold mb-2 mt-3 text-primary/90 uppercase tracking-wide">
              {children}
            </h4>
          ),

          // ── Paragraphs ────────────────────────────────────
          p: ({ children }) => (
            <p className="text-white/80 leading-relaxed mb-3 text-[15px]">
              {children}
            </p>
          ),

          // ── Code ─────────────────────────────────────────
          code: ({ node, className, children, ...props }) => {
            const isInline = !className;
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!isInline && (className || codeString.includes('\n'))) {
              return <CodeBlock language={lang || 'text'}>{codeString}</CodeBlock>;
            }

            return (
              <code
                className="bg-primary/15 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md text-[0.83em] font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },

          // ── Blockquote ────────────────────────────────────
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-4 pr-3 py-3 border-l-4 border-primary/70 bg-primary/5 rounded-r-xl text-white/75 italic text-[15px] leading-relaxed">
              {children}
            </blockquote>
          ),

          // ── Lists ─────────────────────────────────────────
          ul: ({ children }) => (
            <ul className="my-3 space-y-1.5 text-[15px] text-white/80">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 space-y-1.5 text-[15px] text-white/80 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 leading-relaxed">
              <span className="text-primary mt-1.5 flex-shrink-0 text-xs">▸</span>
              <span>{children}</span>
            </li>
          ),

          // ── Table ─────────────────────────────────────────
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-white/10 shadow-xl">
              <table className="w-full text-[14px] text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-primary/10 border-b border-white/10">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/5">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.02] transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-bold text-primary/90 uppercase tracking-wider text-xs">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-white/75">
              {children}
            </td>
          ),

          // ── Horizontal Rule ───────────────────────────────
          hr: () => (
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-white/20 text-xs">✦</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          ),

          // ── Strong / Em ───────────────────────────────────
          strong: ({ children }) => (
            <strong className="font-bold text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-white/90">
              {children}
            </em>
          ),

          // ── Links ─────────────────────────────────────────
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:text-accent transition-colors"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
