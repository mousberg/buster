import React from 'react';
import Image from 'next/image';

interface Integration {
  id: string;
  name: string;
  connected: boolean;
}

interface IntegrationIndicatorsProps {
  integrations: Integration[];
  onIntegrationClick?: (integrationId: string) => void;
}

const integrationIcons: Record<string, React.ReactNode> = {
  'calendar': <Image src="/google-calendar-icon.svg" alt="Calendar" width={18} height={18} />,
  'email': <Image src="/gmail-icon.svg" alt="Email" width={18} height={18} />,
  'whatsapp': <Image src="/whatsapp-icon.svg" alt="WhatsApp" width={18} height={18} />
};

// Unused for now but kept for future styling options
// const integrationColors: Record<string, string> = {
//   'google-calendar': 'bg-blue-100 text-blue-600',
//   'whatsapp': 'bg-green-100 text-green-600',
//   'gmail': 'bg-red-100 text-red-600',
//   'notion': 'bg-gray-100 text-gray-600'
// };

const IntegrationIndicators: React.FC<IntegrationIndicatorsProps> = ({ integrations, onIntegrationClick }) => {
  if (integrations.length === 0) return null;

  const handleIntegrationClick = (id: string) => {
    if (onIntegrationClick) {
      onIntegrationClick(id);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-2xl px-4 py-3 shadow-lg">
      <div className="flex items-center justify-center gap-1">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="relative group cursor-pointer"
            onClick={() => handleIntegrationClick(integration.id)}
          >
            <div className="relative">
              <div
                className="relative w-8 h-8 rounded-lg bg-white border border-gray-300 shadow-sm transition-all duration-300 group-hover:scale-110 flex items-center justify-center"
                style={{
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                }}
                title={integration.name}
              >
                {integrationIcons[integration.id]}
              </div>
              <div className="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationIndicators;