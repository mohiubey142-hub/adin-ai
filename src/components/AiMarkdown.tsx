import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";

interface AiMarkdownProps {
  content: string;
}

export function AiMarkdown({ content }: AiMarkdownProps) {
  return (
    <div className="prose prose-invert prose-zinc max-w-none text-zinc-100/95 leading-relaxed text-base">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold tracking-tight text-white mt-5 mb-3 border-b border-white/5 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-medium tracking-tight text-white mt-4 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium tracking-tight text-zinc-200 mt-3 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-[15px] text-zinc-200/90 leading-relaxed font-sans">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1.5 text-[15px] text-zinc-200/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1.5 text-[15px] text-zinc-200/90">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-violet-500 pl-4 italic text-zinc-400 my-4 bg-white/[0.01] py-2 pr-2 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ inline, className, children }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const codeString = String(children).replace(/\n$/, "");

            if (!inline) {
              return <PreBlock language={language} code={codeString} />;
            }

            return (
              <code className="px-1.5 py-0.5 rounded bg-white/10 text-violet-300 font-mono text-[13px] border border-white/5">
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function PreBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-2xl overflow-hidden border border-white/5 bg-[#08080c] shadow-lg font-mono">
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/[0.02] border-b border-white/5">
        <span className="text-xs text-zinc-500 font-medium tracking-wider uppercase select-none">
          {language || "code"}
        </span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/5 duration-200"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 overflow-x-auto text-[13.5px] text-zinc-300/90 leading-relaxed max-h-[480px]">
        <code className="block whitespace-pre">{code}</code>
      </div>
    </div>
  );
}