import React from 'react';
import { Zap } from 'lucide-react';

interface IntegrationsButtonProps {
  onClick: () => void;
  hasActiveIntegrations: boolean;
}

const IntegrationsButton: React.FC<IntegrationsButtonProps> = ({ onClick, hasActiveIntegrations }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full transition-all duration-300 ${
        hasActiveIntegrations 
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
      title="Manage Integrations"
    >
      <Zap className="w-5 h-5" />
    </button>
  );
};

export default IntegrationsButton;