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

    const data = await response.json();
    console.log("📊 Raw status data received:", data);
    
    // Handle status checker errors gracefully
    if (data && data.detail) {
      if (data.detail.includes("Collection") || data.detail.includes("Cursor")) {
        console.warn("⚠️ Status checker has a database issue:", data.detail);
        console.warn("⚠️ Backend needs to fix the find() cursor handling");
        return []; // Return empty array when backend has issues
      }
    }
    
    // If backend returns a single status object, wrap it in an array
    if (data && !Array.isArray(data) && data.status) {
      console.log("📊 Single status document received, converting to array");
      return [{
        timestamp: data.timestamp || new Date().toISOString(),
        status: data.status,
        message: data.message || data.metadata?.message || `Status: ${data.status}`
      }];
    }
    
    // If backend returns an array of status documents
    if (Array.isArray(data)) {
      console.log(`📊 Received ${data.length} status documents`);
      // Transform each document to our StatusUpdate format
      return data.map(doc => ({
        timestamp: doc.timestamp || new Date().toISOString(),
        status: doc.status || 'unknown',
        message: doc.message || doc.metadata?.message || `Status: ${doc.status || 'unknown'}`
      }));
    }
    
    // Default: ensure we return an array
    return [];
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

// Function to convert status updates to transcript-like messages
export const convertStatusToTranscript = (statusUpdates: StatusUpdate[]): TranscriptMessage[] => {
  return statusUpdates.map((update, index) => ({
    role: 'AI Agent' as const,
    content: `${update.status}: ${update.message || 'Processing...'}`,
    timestamp: new Date(update.timestamp).toLocaleTimeString(),
    isInfoRequest: false
  }));
};