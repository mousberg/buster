import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface InstructionsInputProps {
  value: string;
  onChange: (value: string) => void;
}

const InstructionsInput: React.FC<InstructionsInputProps> = ({ value, onChange }) => {
  return (
    <Textarea
      className="min-h-[120px] p-6 border-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base shadow-none outline-none rounded-[28px]"
      placeholder="Ask anything"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default InstructionsInput;