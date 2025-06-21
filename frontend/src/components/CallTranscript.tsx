import React from 'react';
import { TranscriptMessage, StatusUpdate } from '@/store/callStore';

interface CallTranscriptProps {
  messages: TranscriptMessage[];
  statusUpdates?: StatusUpdate[];
  summary?: string;
  isVisible: boolean;
  isLive?: boolean;
  callId?: string;
  onInfoProvided?: (requestId: string) => void;
}

const CallTranscript: React.FC<CallTranscriptProps> = ({
  messages,
  statusUpdates = [],
  summary,
  isVisible,
  isLive = false,
  callId,
  onInfoProvided,
}) => {
  if (!isVisible || (messages.length === 0 && statusUpdates.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Call Transcript</h3>
          {isLive && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">Live</span>
            </div>
          )}
          {callId && (
            <span className="text-xs text-gray-500">ID: {callId}</span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-4">
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
        </div>
      </div>

      {statusUpdates.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
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
                      {new Date(update.timestamp).toLocaleTimeString()}
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