// API service for Twilio and ElevenLabs integration
interface CallResponse {
  success: boolean;
  call_id?: string;
  error?: string;
  errorDetails?: any;
  statusCode?: number;
  missingSecrets?: boolean;
}

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

// Configuration - these will come from environment variables
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || '/api';

// Function to initiate a call
export const makeCall = async (
  phoneNumber: string, 
  instructions: string
): Promise<string> => {
  console.log("Initiating call with:", { phoneNumber, instructions });
  
  try {
    const response = await fetch(`${API_ENDPOINT}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        instructions,
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'default-agent'
      }),
    });

    const data: CallResponse = await response.json();
    
    if (!data.success || !data.call_id) {
      throw new Error(data.error || 'Failed to initiate call');
    }
    
    console.log("Call initiated successfully:", data.call_id);
    return data.call_id;
  } catch (error) {
    console.error("Error initiating call:", error);
    throw error;
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