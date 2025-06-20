import React from 'react';
import { CallRecord } from '@/store/callStore';
import { Phone, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

interface CallHistoryProps {
  calls: CallRecord[];
  onCallSelect?: (call: CallRecord) => void;
}

const CallHistory: React.FC<CallHistoryProps> = ({ calls, onCallSelect }) => {
  if (calls.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h3>
        <p className="text-gray-500">Your call history will appear here</p>
      </div>
    );
  }

  const getStatusIcon = (status: CallRecord['status']) => {
    switch (status) {
      case 'connecting':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'active':
        return <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: CallRecord['status']) => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return 'Ongoing';
    
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">Call History</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {calls.map((call) => (
            <div
              key={call.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                onCallSelect ? 'cursor-pointer' : ''
              }`}
              onClick={() => onCallSelect?.(call)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {call.phoneNumber}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {call.instructions}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{call.startTime.toLocaleDateString()}</span>
                    <span>{call.startTime.toLocaleTimeString()}</span>
                    <span>Duration: {formatDuration(call.startTime, call.endTime)}</span>
                  </div>
                  
                  {call.summary && (
                    <p className="text-xs text-gray-600 mt-2 truncate">
                      Summary: {call.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {getStatusIcon(call.status)}
                  <span className="text-xs text-gray-600">
                    {getStatusText(call.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CallHistory;