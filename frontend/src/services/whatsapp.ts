// WhatsApp integration service for MCP
interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface WhatsAppContact {
  phoneNumber: string;
  name?: string;
  lastMessage?: Date;
}

const WHATSAPP_API_ENDPOINT = process.env.NEXT_PUBLIC_WHATSAPP_API || '/api/whatsapp';

// Initialize WhatsApp connection
export const initializeWhatsApp = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${WHATSAPP_API_ENDPOINT}/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data.connected || false;
  } catch (error) {
    console.error('Failed to initialize WhatsApp:', error);
    return false;
  }
};

// Send WhatsApp message
export const sendWhatsAppMessage = async (
  to: string,
  message: string
): Promise<WhatsAppMessage | null> => {
  try {
    const response = await fetch(`${WHATSAPP_API_ENDPOINT}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to send WhatsApp message');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return null;
  }
};

// Get WhatsApp conversation history
export const getWhatsAppHistory = async (
  phoneNumber: string
): Promise<WhatsAppMessage[]> => {
  try {
    const response = await fetch(
      `${WHATSAPP_API_ENDPOINT}/history/${encodeURIComponent(phoneNumber)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch WhatsApp history');
    }

    const data = await response.json();
    return data.messages || [];
  } catch (error) {
    console.error('Error fetching WhatsApp history:', error);
    return [];
  }
};

// Get WhatsApp contacts
export const getWhatsAppContacts = async (): Promise<WhatsAppContact[]> => {
  try {
    const response = await fetch(`${WHATSAPP_API_ENDPOINT}/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch WhatsApp contacts');
    }

    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error('Error fetching WhatsApp contacts:', error);
    return [];
  }
};

// Subscribe to WhatsApp messages (using Server-Sent Events)
export const subscribeToWhatsAppMessages = (
  onMessage: (message: WhatsAppMessage) => void
): (() => void) => {
  const eventSource = new EventSource(`${WHATSAPP_API_ENDPOINT}/subscribe`);

  eventSource.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      onMessage(message);
    } catch (error) {
      console.error('Error parsing WhatsApp message:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('WhatsApp SSE connection error:', error);
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
};