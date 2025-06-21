import React, { useEffect } from 'react';

interface InstructionsInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeywordsDetected?: (keywords: string[]) => void;
}

const BRAIN_KEYWORDS = [
  'pizza', 'dominos', 'delivery', 'order', 'food',
  'doctor', 'appointment', 'medical', 'dentist',
  'hotel', 'booking', 'reservation', 'restaurant',
  'call', 'phone', 'contact', 'schedule', 'cancel'
];

const InstructionsInput: React.FC<InstructionsInputProps> = ({ 
  value, 
  onChange, 
  onKeywordsDetected 
}) => {

  useEffect(() => {
    // Detect keywords in the input
    const keywords = BRAIN_KEYWORDS.filter(keyword =>
      value.toLowerCase().includes(keyword.toLowerCase())
    );
    
    onKeywordsDetected?.(keywords);
  }, [value, onKeywordsDetected]);


  return (
    <textarea
      className="min-h-[120px] p-6 border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base shadow-none outline-none rounded-[28px] w-full bg-transparent"
      placeholder="Ask anything"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default InstructionsInput;