import { create } from 'zustand';

export interface TranscriptMessage {
  role: 'AI Agent' | 'Representative';
  content: string;
  timestamp: string;
  isInfoRequest?: boolean;
  requestId?: string;
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
  
  // Actions
  startCall: (phoneNumber: string, instructions: string) => void;
  updateCallStatus: (status: CallRecord['status']) => void;
  addTranscriptMessage: (message: TranscriptMessage) => void;
  completeCall: (summary?: string) => void;
  addInfoRequest: (requestId: string) => void;
  resolveInfoRequest: (requestId: string) => void;
  addScheduledTask: (task: Omit<ScheduledTask, 'id'>) => void;
  markTaskCompleted: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  clearCurrentCall: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  // Initial state
  currentCall: null,
  isCallActive: false,
  isLoading: false,
  callHistory: [],
  scheduledTasks: [],
  pendingInfoRequests: new Set(),

  // Actions
  startCall: (phoneNumber: string, instructions: string) => {
    const newCall: CallRecord = {
      id: `call_${Date.now()}`,
      phoneNumber,
      instructions,
      startTime: new Date(),
      status: 'connecting',
      transcript: [],
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

  completeCall: (summary?: string) => {
    const { currentCall, callHistory } = get();
    if (currentCall) {
      const completedCall: CallRecord = {
        ...currentCall,
        status: 'completed',
        endTime: new Date(),
        summary,
      };

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
    set({
      currentCall: null,
      isCallActive: false,
      isLoading: false,
      pendingInfoRequests: new Set(),
    });
  },
}));