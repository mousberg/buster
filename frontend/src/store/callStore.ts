import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TranscriptMessage {
  role: 'AI Agent' | 'Representative';
  content: string;
  timestamp: string;
  isInfoRequest?: boolean;
  requestId?: string;
}

export interface StatusUpdate {
  timestamp: string;
  status: string;
  message?: string;
}

export interface CallRecord {
  id: string;
  phoneNumber: string;
  instructions: string;
  startTime: Date;
  endTime?: Date;
  status: 'connecting' | 'active' | 'completed' | 'failed';
  transcript: TranscriptMessage[];
  summary?: string;
  statusUpdates: StatusUpdate[];
}

export interface ScheduledTask {
  id: string;
  callId: string;
  type: 'callback' | 'email' | 'sms';
  scheduledFor: Date;
  details: string;
  completed: boolean;
}

interface CallState {
  // Current call state
  currentCall: CallRecord | null;
  isCallActive: boolean;
  isLoading: boolean;
  
  // Call history
  callHistory: CallRecord[];
  
  // Scheduled tasks
  scheduledTasks: ScheduledTask[];
  
  // Information requests
  pendingInfoRequests: Set<string>;
  
  // Status polling
  statusPollingInterval: NodeJS.Timeout | null;
  
  // Actions
  startCall: (phoneNumber: string, instructions: string) => void;
  updateCallStatus: (status: CallRecord['status']) => void;
  addTranscriptMessage: (message: TranscriptMessage) => void;
  addStatusUpdates: (updates: StatusUpdate[]) => void;
  completeCall: (summary?: string) => void;
  addInfoRequest: (requestId: string) => void;
  resolveInfoRequest: (requestId: string) => void;
  addScheduledTask: (task: Omit<ScheduledTask, 'id'>) => void;
  markTaskCompleted: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  clearCurrentCall: () => void;
  startStatusPolling: (callId: string) => void;
  stopStatusPolling: () => void;
}

export const useCallStore = create<CallState>()(
  persist(
    (set, get) => ({
  // Initial state
  currentCall: null,
  isCallActive: false,
  isLoading: false,
  callHistory: [],
  scheduledTasks: [],
  pendingInfoRequests: new Set(),
  statusPollingInterval: null,

  // Actions
  startCall: (phoneNumber: string, instructions: string) => {
    const newCall: CallRecord = {
      id: `call_${Date.now()}`,
      phoneNumber,
      instructions,
      startTime: new Date(),
      status: 'connecting',
      transcript: [],
      statusUpdates: [],
    };

    set({
      currentCall: newCall,
      isCallActive: true,
      isLoading: true,
      pendingInfoRequests: new Set(),
    });
  },

  updateCallStatus: (status: CallRecord['status']) => {
    const { currentCall } = get();
    if (currentCall) {
      set({
        currentCall: { ...currentCall, status },
        isLoading: status === 'connecting',
      });
    }
  },

  addTranscriptMessage: (message: TranscriptMessage) => {
    const { currentCall } = get();
    if (currentCall) {
      const updatedTranscript = [...currentCall.transcript, message];
      set({
        currentCall: { ...currentCall, transcript: updatedTranscript },
      });

      // If it's an info request, add to pending requests
      if (message.isInfoRequest && message.requestId) {
        const { pendingInfoRequests } = get();
        set({
          pendingInfoRequests: new Set([...pendingInfoRequests, message.requestId]),
        });
      }
    }
  },

  addStatusUpdates: (updates: StatusUpdate[]) => {
    const { currentCall } = get();
    if (currentCall && updates.length > 0) {
      // Convert status updates to transcript messages
      const statusMessages: TranscriptMessage[] = updates.map((update, index) => ({
        role: 'AI Agent' as const,
        content: `${update.status}: ${update.message || 'Processing...'}`,
        timestamp: new Date(update.timestamp).toLocaleTimeString(),
        isInfoRequest: false
      }));

      // Check if call should be marked as completed based on status
      const isCompleted = updates.some(update => 
        update.status.includes('completed') || 
        update.status.includes('finished') || 
        update.status.includes('done')
      );

      set({
        currentCall: { 
          ...currentCall, 
          statusUpdates: updates,
          transcript: statusMessages, // Replace transcript with status-based messages
          status: isCompleted ? 'completed' : currentCall.status
        },
      });

      // Auto-complete call if status indicates completion
      if (isCompleted) {
        const { completeCall } = get();
        setTimeout(() => {
          const latestUpdate = updates[updates.length - 1];
          completeCall(latestUpdate?.message || 'Call completed successfully');
        }, 2000); // Small delay to show final status
      }
    }
  },

  completeCall: (summary?: string) => {
    const { currentCall, callHistory, stopStatusPolling } = get();
    if (currentCall) {
      const completedCall: CallRecord = {
        ...currentCall,
        status: 'completed',
        endTime: new Date(),
        summary,
      };

      stopStatusPolling();
      set({
        currentCall: null,
        isCallActive: false,
        isLoading: false,
        callHistory: [completedCall, ...callHistory],
        pendingInfoRequests: new Set(),
      });
    }
  },

  addInfoRequest: (requestId: string) => {
    const { pendingInfoRequests } = get();
    set({
      pendingInfoRequests: new Set([...pendingInfoRequests, requestId]),
    });
  },

  resolveInfoRequest: (requestId: string) => {
    const { pendingInfoRequests, currentCall } = get();
    const newPendingRequests = new Set(pendingInfoRequests);
    newPendingRequests.delete(requestId);

    // Update the transcript message to mark it as resolved
    if (currentCall) {
      const updatedTranscript = currentCall.transcript.map((msg) => {
        if (msg.requestId === requestId) {
          return {
            ...msg,
            isInfoRequest: false,
            content: `${msg.content} (✓ Information provided)`,
          };
        }
        return msg;
      });

      set({
        currentCall: { ...currentCall, transcript: updatedTranscript },
        pendingInfoRequests: newPendingRequests,
      });
    } else {
      set({
        pendingInfoRequests: newPendingRequests,
      });
    }
  },

  addScheduledTask: (task: Omit<ScheduledTask, 'id'>) => {
    const { scheduledTasks } = get();
    const newTask: ScheduledTask = {
      ...task,
      id: `task_${Date.now()}`,
    };

    set({
      scheduledTasks: [...scheduledTasks, newTask],
    });
  },

  markTaskCompleted: (taskId: string) => {
    const { scheduledTasks } = get();
    const updatedTasks = scheduledTasks.map((task) =>
      task.id === taskId ? { ...task, completed: true } : task
    );

    set({
      scheduledTasks: updatedTasks,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  clearCurrentCall: () => {
    const { stopStatusPolling } = get();
    stopStatusPolling();
    set({
      currentCall: null,
      isCallActive: false,
      isLoading: false,
      pendingInfoRequests: new Set(),
    });
  },

  startStatusPolling: (callId: string) => {
    const { stopStatusPolling } = get();
    
    // Stop any existing polling
    stopStatusPolling();
    
    // Import the API function dynamically to avoid circular dependency
    const pollStatus = async () => {
      try {
        const { getCallStatus } = await import('@/services/api');
        const statusUpdates = await getCallStatus(callId);
        
        const { currentCall, addStatusUpdates } = get();
        if (currentCall && currentCall.id === callId) {
          addStatusUpdates(statusUpdates);
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    };
    
    // Poll immediately and then every 3 seconds
    pollStatus();
    const interval = setInterval(pollStatus, 3000);
    
    set({ statusPollingInterval: interval });
  },

  stopStatusPolling: () => {
    const { statusPollingInterval } = get();
    if (statusPollingInterval) {
      clearInterval(statusPollingInterval);
      set({ statusPollingInterval: null });
    }
  },
    }),
    {
      name: 'call-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        callHistory: state.callHistory // Only persist call history
      }),
    }
  )
);