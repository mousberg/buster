import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Settings } from 'lucide-react';
import Image from 'next/image';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  color: string;
}

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
  initialSelectedIntegration?: string | null;
}

const availableIntegrations: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Manage your calendar events',
    icon: <Image src="/google-calendar-icon.svg" alt="Google Calendar" width={20} height={20} />,
    connected: false,
    color: 'blue'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Send and receive messages',
    icon: <Image src="/whatsapp-icon.svg" alt="WhatsApp" width={20} height={20} />,
    connected: false,
    color: 'green'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Access your email',
    icon: <Image src="/gmail-icon.svg" alt="Gmail" width={20} height={20} />,
    connected: false,
    color: 'red'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Connect to your workspace',
    icon: <Image src="/notion-icon.svg" alt="Notion" width={20} height={20} />,
    connected: false,
    color: 'gray'
  }
];

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' }
  };
  return colors[color] || colors.gray;
};

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ 
  isOpen, 
  onClose, 
  integrations,
  onToggleIntegration,
  initialSelectedIntegration 
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialSelectedIntegration) {
      setSelectedIntegration(initialSelectedIntegration);
    } else if (!isOpen) {
      setSelectedIntegration(null);
    }
  }, [isOpen, initialSelectedIntegration]);

  if (!isOpen) return null;

  const mergedIntegrations = availableIntegrations.map(integration => ({
    ...integration,
    connected: integrations.some(i => i.id === integration.id && i.connected)
  }));

  const handleIntegrationClick = (id: string) => {
    if (selectedIntegration === id) {
      setSelectedIntegration(null);
    } else {
      setSelectedIntegration(id);
    }
  };

  const selectedIntegrationData = mergedIntegrations.find(i => i.id === selectedIntegration);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium">Integrations</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(80vh-88px)]">
          {/* Integrations List */}
          <div className={`${selectedIntegration ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto border-r border-gray-200`}>
            <p className="text-sm text-gray-500 mb-6">
              Connect your favorite tools to enhance your assistant's capabilities
            </p>
            
            <div className="space-y-3">
              {mergedIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedIntegration === integration.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleIntegrationClick(integration.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getColorClasses(integration.color).bg} ${getColorClasses(integration.color).text}`}>
                        {integration.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-500">{integration.description}</p>
                      </div>
                    </div>
                    
                    {integration.connected && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Connected</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Details */}
          {selectedIntegration && selectedIntegrationData && (
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${getColorClasses(selectedIntegrationData.color).bg} ${getColorClasses(selectedIntegrationData.color).text}`}>
                  {selectedIntegrationData.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedIntegrationData.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedIntegrationData.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Connection Button */}
                <button
                  onClick={() => onToggleIntegration(selectedIntegration)}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                    selectedIntegrationData.connected
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedIntegrationData.connected ? 'Disconnect' : 'Connect'}
                </button>

                {/* Integration Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                    <p className="text-sm text-gray-600">
                      {selectedIntegrationData.description}. This integration allows your assistant to access and interact with your {selectedIntegrationData.name} data.
                    </p>
                  </div>

                  {selectedIntegrationData.connected && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Read access to your data</li>
                        <li>• Send messages on your behalf</li>
                        <li>• Create and update items</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Settings Button (if connected) */}
                {selectedIntegrationData.connected && (
                  <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <Settings className="w-4 h-4" />
                    Advanced Settings
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsModal;