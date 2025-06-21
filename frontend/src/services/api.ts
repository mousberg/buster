// API service for Twilio and ElevenLabs integration

interface TranscriptMessage {
  role: 'AI Agent' | 'Representative';
  content: string;
  timestamp: string;
  isInfoRequest?: boolean;
  requestId?: string;
}

interface TranscriptResponse {
  messages: TranscriptMessage[];
  summary: string;
}

interface AgentRequest {
  task: string;
  phone_number?: string;
  call_id: string;
}

interface StatusUpdate {
  timestamp: string;
  status: string;
  message?: string;
}

// Configuration - these will come from environment variables
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api';
// Use proxy endpoints to avoid CORS issues
const ORCHESTRATOR_ENDPOINT = '/api/orchestrator';
const STATUS_CHECKER_ENDPOINT = '/api/status';

// Function to initiate a call via orchestrator
export const makeCall = async (
  phoneNumber: string, 
  instructions: string,
  callId: string
): Promise<string> => {
  console.log("🚀 Initiating call with orchestrator:", { 
    phoneNumber, 
    instructions, 
    callId,
    endpoint: `${ORCHESTRATOR_ENDPOINT}/run-agent`
  });
  
  try {
    const agentRequest: AgentRequest = {
      task: instructions,
      phone_number: phoneNumber.trim() || undefined,
      call_id: callId
    };

    console.log("📤 Sending request:", agentRequest);

    const response = await fetch(ORCHESTRATOR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentRequest),
    });

    console.log("📡 Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Orchestrator error response:", errorText);
      throw new Error(`Orchestrator request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Orchestrator response:", data);
    
    return callId;
  } catch (error) {
    console.error("❌ Error calling orchestrator:", error);
    throw error;
  }
};

// Function to get status updates from status checker
export const getCallStatus = async (callId: string): Promise<StatusUpdate[]> => {
  try {
    const statusUrl = `${STATUS_CHECKER_ENDPOINT}/${callId}`;
    console.log("📊 Checking status for call:", callId, "at", statusUrl);
    
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("📊 Status response:", response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 404) {
        console.log("📊 No status updates yet for call:", callId);
        return [];
      }
      const errorText = await response.text();
      console.error("❌ Status checker error:", errorText);
      // Don't throw error - just log it and return empty array to keep polling working
      return [];
    }

    const statusUpdates = await response.json();
    console.log("📊 Status updates received:", statusUpdates);
    
    // Handle status checker errors gracefully
    if (statusUpdates && statusUpdates.detail && statusUpdates.detail.includes("Collection")) {
      console.warn("⚠️ Status checker has a database issue, continuing without status updates");
      return [];
    }
    
    // Ensure we return an array
    return Array.isArray(statusUpdates) ? statusUpdates : [];
  } catch (error) {
    console.error("❌ Error fetching call status:", error);
    return [];
  }
};

// Function to get call transcript
export const getCallTranscript = async (
  callId: string
): Promise<TranscriptResponse> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/transcript/${callId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.statusText}`);
    }

    const data: TranscriptResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    // Return error in transcript format
    return {
      messages: [{
        role: 'AI Agent',
        content: `Error retrieving transcript: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }],
      summary: 'Error occurred while retrieving call transcript.'
    };
  }
};

// Function to send information to an ongoing call
export const sendInfoToCall = async (
  callId: string, 
  information: string
): Promise<boolean> => {
  console.log("Sending information to call:", { callId, information });
  
  try {
    const response = await fetch(`${API_ENDPOINT}/call/${callId}/info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ information }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send information');
    }
    
    return true;
  } catch (error) {
    console.error("Error sending information to call:", error);
    throw error;
  }
};

// Function to schedule a follow-up task
export const scheduleTask = async (
  callId: string,
  task: {
    type: 'callback' | 'email' | 'sms';
    scheduledFor: Date;
    details: string;
  }
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callId,
        ...task,
        scheduledFor: task.scheduledFor.toISOString()
      }),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to schedule task');
    }
    
    return true;
  } catch (error) {
    console.error("Error scheduling task:", error);
    throw error;
  }
};

// Mock function for development
export const generateMockTranscript = (instructions: string): TranscriptResponse => {
  const mockTranscript: TranscriptMessage[] = [
    {
      role: 'AI Agent',
      content: `Hello, I'm calling regarding: ${instructions}`,
      timestamp: '00:00:05'
    },
    {
      role: 'Representative',
      content: 'Hello! How can I help you today?',
      timestamp: '00:00:10'
    },
    {
      role: 'AI Agent',
      content: 'I need assistance with the request I mentioned.',
      timestamp: '00:00:15'
    },
    {
      role: 'Representative',
      content: 'I understand. Let me help you with that.',
      timestamp: '00:00:20'
    },
    {
      role: 'AI Agent',
      content: 'Thank you for your assistance.',
      timestamp: '00:00:30'
    },
    {
      role: 'Representative',
      content: 'You\'re welcome! Is there anything else I can help you with?',
      timestamp: '00:00:35'
    },
    {
      role: 'AI Agent',
      content: 'No, that\'s all. Have a great day!',
      timestamp: '00:00:40'
    }
  ];

  return {
    messages: mockTranscript,
    summary: `Successfully completed call regarding: ${instructions.substring(0, 50)}...`
  };
};