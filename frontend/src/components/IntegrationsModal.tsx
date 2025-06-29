import React from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface Integration {
  id: string;
  name: string;
  connected: boolean;
}

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrations: Integration[];
  onToggleIntegration: (id: string) => void;
  initialSelectedIntegration?: string | null;
}

const hackathonIntegrations = [
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Schedule appointments and meetings',
    icon: <Image src="/google-calendar-icon.svg" alt="Calendar" width={20} height={20} />,
    color: 'bg-blue-500',
    keywords: ['appointment', 'meeting', 'schedule', 'calendar', 'book', 'time']
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Send emails and notifications', 
    icon: <Image src="/gmail-icon.svg" alt="Email" width={20} height={20} />,
    color: 'bg-green-500',
    keywords: ['email', 'send', 'message', 'notify', 'mail', 'contact']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Send WhatsApp messages',
    icon: <Image src="/whatsapp-icon.svg" alt="WhatsApp" width={20} height={20} />,
    color: 'bg-emerald-500',
    keywords: ['whatsapp', 'text', 'message', 'chat', 'sms']
  }
];

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ 
  isOpen, 
  onClose, 
  integrations,
  onToggleIntegration
}) => {
  if (!isOpen) return null;

  const isConnected = (id: string) => {
    return integrations.some(i => i.id === id && i.connected);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium">Voice Actions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6 text-center">
            Enable voice-triggered actions during calls
          </p>
          
          <div className="space-y-4">
            {hackathonIntegrations.map((integration) => {
              const connected = isConnected(integration.id);
              
              return (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${integration.color} text-white flex items-center justify-center`}>
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-500">{integration.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {integration.keywords.slice(0, 3).map(keyword => (
                          <span key={keyword} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            "{keyword}"
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onToggleIntegration(integration.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      connected ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        connected ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              When enabled, say trigger words during calls to activate integrations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsModal;