import React from 'react';

interface KeywordHighlighterProps {
  text: string;
  keywords: string[];
  className?: string;
}

const KeywordHighlighter: React.FC<KeywordHighlighterProps> = ({
  text,
  keywords,
  className = ''
}) => {
  if (!keywords.length) {
    return <span className={className}>{text}</span>;
  }

  // Create a regex pattern for all keywords
  const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  
  // Split text by keywords while preserving the keywords
  const parts = text.split(pattern);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isKeyword = keywords.some(keyword => 
          keyword.toLowerCase() === part.toLowerCase()
        );
        
        if (isKeyword) {
          return (
            <span
              key={index}
              className="font-bold text-blue-600"
            >
              {part}
            </span>
          );
        }
        
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default KeywordHighlighter;