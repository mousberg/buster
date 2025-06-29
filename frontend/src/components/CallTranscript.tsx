import React, { useEffect, useState } from 'react';
import { TranscriptMessage, StatusUpdate } from '@/store/callStore';
import { Calendar, Mail, MessageCircle, CheckCircle } from 'lucide-react';

interface CallTranscriptProps {
  messages: TranscriptMessage[];
  statusUpdates?: StatusUpdate[];
  summary?: string;
  isVisible: boolean;
  isLive?: boolean;
  callId?: string;
  callStatus?: 'connecting' | 'active' | 'completed' | 'failed';
  onInfoProvided?: (requestId: string) => void;
  onEndCall?: () => void;
  activeIntegrations?: Array<{ id: string; name: string; connected: boolean }>;
}

interface IntegrationAction {
  id: string;
  type: 'calendar' | 'email' | 'whatsapp';
  message: string;
  timestamp: string;
  success: boolean;
}

const integrationTriggers = {
  calendar: {
    keywords: ['appointment', 'meeting', 'schedule', 'calendar', 'book', 'time'],
    icon: Calendar,
    color: 'bg-blue-500',
    name: 'Calendar'
  },
  email: {
    keywords: ['email', 'send', 'message', 'notify', 'mail', 'contact'],
    icon: Mail,
    color: 'bg-green-500', 
    name: 'Email'
  },
  whatsapp: {
    keywords: ['whatsapp', 'text', 'message', 'chat', 'sms'],
    icon: MessageCircle,
    color: 'bg-emerald-500',
    name: 'WhatsApp'
  }
};

const CallTranscript: React.FC<CallTranscriptProps> = ({
  messages,
  statusUpdates = [],
  summary,
  isVisible,
  isLive = false,
  callId,
  callStatus,
  onInfoProvided,
  onEndCall,
  activeIntegrations = [],
}) => {
  const [integrationActions, setIntegrationActions] = useState<IntegrationAction[]>([]);

  // Mock integration actions based on keywords in messages
  useEffect(() => {
    if (!isLive || messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    if (latestMessage.role !== 'Representative') return; // Only trigger on user speech

    const content = latestMessage.content.toLowerCase();
    
    // Check each integration type for keyword matches
    Object.entries(integrationTriggers).forEach(([type, config]) => {
      const isActive = activeIntegrations.some(i => i.id === type && i.connected);
      if (!isActive) return;

      const hasKeyword = config.keywords.some(keyword => content.includes(keyword));
      if (!hasKeyword) return;

      // Simulate integration action
      const action: IntegrationAction = {
        id: `${type}_${Date.now()}`,
        type: type as 'calendar' | 'email' | 'whatsapp',
        message: getMockActionMessage(type, content),
        timestamp: new Date().toLocaleTimeString(),
        success: Math.random() > 0.1 // 90% success rate
      };

      setIntegrationActions(prev => [...prev, action]);
    });
  }, [messages, activeIntegrations, isLive]);

  const getMockActionMessage = (type: string, content: string): string => {
    switch (type) {
      case 'calendar':
        return 'Appointment scheduled for next Tuesday at 2 PM';
      case 'email':
        return 'Email sent to contact regarding inquiry';  
      case 'whatsapp':
        return 'WhatsApp message sent to customer';
      default:
        return 'Action completed successfully';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Call Transcript</h3>
          <div className="flex items-center gap-3">
            {callStatus === 'completed' ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Completed</span>
              </div>
            ) : callStatus === 'failed' ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 font-medium">Failed</span>
              </div>
            ) : isLive ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600 font-medium">Live</span>
                </div>
                {onEndCall && (
                  <button
                    onClick={onEndCall}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                  >
                    End Call
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-600 font-medium">Connecting</span>
              </div>
            )}
            {callId && (
              <span className="text-xs text-gray-500">ID: {callId}</span>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.length === 0 && statusUpdates.length === 0 ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                {isLive ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Call in progress...</span>
                  </>
                ) : (
                  <span className="text-sm">Connecting...</span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Transcript and status updates will appear here
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'AI Agent' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'AI Agent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium opacity-75">
                    {message.role}
                  </span>
                  <span className="text-xs opacity-60">
                    {message.timestamp}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
                
                {message.isInfoRequest && message.requestId && onInfoProvided && (
                  <button
                    onClick={() => onInfoProvided(message.requestId!)}
                    className="mt-2 px-3 py-1 bg-white bg-opacity-20 text-xs rounded-md hover:bg-opacity-30 transition-colors"
                  >
                    Mark as Provided
                  </button>
                )}
              </div>
            </div>
              ))}
              
              {integrationActions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Integration Actions</h4>
                  <div className="space-y-2">
                    {integrationActions.map((action) => {
                      const config = integrationTriggers[action.type];
                      const Icon = config.icon;
                      
                      return (
                        <div key={action.id} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className={`p-1.5 rounded-full ${config.color} text-white flex-shrink-0`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                {config.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {action.timestamp}
                              </span>
                              {action.success ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <div className="w-3 h-3 border border-red-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{action.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {statusUpdates.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Status Updates</h4>
                  <div className="space-y-2">
                    {statusUpdates.map((update, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-700">
                              {update.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {update.timestamp}
                            </span>
                          </div>
                          {update.message && (
                            <p className="text-xs text-gray-600">{update.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>


      {summary && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Call Summary</h4>
          <p className="text-sm text-gray-700">{summary}</p>
        </div>
      )}
    </div>
  );
};

export default CallTranscript;