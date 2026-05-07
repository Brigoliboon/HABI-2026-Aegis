"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AISummaryMarkdownProps {
  content: string;
}

export const AISummaryMarkdown: React.FC<AISummaryMarkdownProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ node, ...props }) => <h2 className="text-base font-semibold text-gray-900 mt-4 mb-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2 text-xs text-gray-700" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2 text-xs text-gray-700" {...props} />,
        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
        p: ({ node, ...props }) => <p className="my-2 text-xs text-gray-700 leading-relaxed" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};