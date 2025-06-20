import React from 'react';
import { Phone } from "lucide-react";

interface CallButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const CallButton: React.FC<CallButtonProps> = ({ onClick, isLoading = false, disabled = false }) => {
  return (
    <button 
      className={`rounded-full p-2.5 ${disabled ? 'bg-gray-500 hover:bg-gray-600' : 'bg-black hover:bg-gray-800'} text-white disabled:opacity-50 flex items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
      ) : (
        <Phone size={20} />
      )}
    </button>
  );
};

export default CallButton;